import { Router, type Request, type Response } from "express"
import { StreamChat } from "stream-chat"

export type OfertaTipo = "padrao" | "frete_gratis" | "frete_gratis_desconto" | "desconto_produto"
export type OfertaStatus = "pendente" | "aceita" | "recusada" | "expirada"

interface AnuncioRecord {
  id: string
  vendedorId: string
  titulo: string
  preco: number
}

interface OfertaRecord {
  id: string
  anuncioId: string
  compradorId: string
  vendedorId: string
  tipo: OfertaTipo
  cepDestino: string
  transportadora: string
  valorFrete: number
  valorDesconto: number
  valorTotalComprador: number
  mensagem: string | null
  status: OfertaStatus
  expiraEm: Date | string
  respondidaEm?: Date
  streamChannelId: string
  streamMessageId: string
}

type NovaOferta = Omit<OfertaRecord, "id" | "streamChannelId" | "streamMessageId">
type OfertaUpdate = Partial<Pick<OfertaRecord, "status" | "respondidaEm" | "streamChannelId" | "streamMessageId">>

export interface OfertaDatabase {
  anuncios: { findById(id: string): Promise<AnuncioRecord | null> }
  ofertas: {
    findById(id: string): Promise<OfertaRecord | null>
    findPendentePorCompradorEAnuncio(compradorId: string, anuncioId: string): Promise<OfertaRecord | null>
    create(data: NovaOferta): Promise<{ id: string }>
    update(id: string, data: OfertaUpdate): Promise<void>
    recusarOutrasPendentes(anuncioId: string, exceptOfertaId: string): Promise<void>
  }
}

type AuthenticatedRequest = Request & {
  auth?: { userId?: string }
  user?: { id?: string }
}

let database: OfertaDatabase | null = null
let streamClient: StreamChat | null = null

/** O backend deve injetar o adapter real antes de montar este router. */
export function configureOfertaDatabase(adapter: OfertaDatabase) {
  database = adapter
}

function getAuthenticatedUserId(request: Request): string | null {
  const authenticatedRequest = request as AuthenticatedRequest
  return authenticatedRequest.auth?.userId ?? authenticatedRequest.user?.id ?? null
}

function getDatabase(): OfertaDatabase | null {
  return database
}

function getStreamClient(): StreamChat {
  if (streamClient) return streamClient
  const apiKey = process.env.STREAM_API_KEY
  const apiSecret = process.env.STREAM_API_SECRET
  if (!apiKey || !apiSecret) throw new Error("Stream Chat não está configurado no servidor")
  streamClient = StreamChat.getInstance(apiKey, apiSecret)
  return streamClient
}

function paramString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

function getChannelId(anuncioId: string, compradorId: string) {
  return `oferta-${anuncioId}-${compradorId}`
}

const TIPOS_OFERTA = new Set<OfertaTipo>(["padrao", "frete_gratis", "frete_gratis_desconto", "desconto_produto"])
const HORAS_VALIDADE_OFERTA = 48
const router = Router()

router.post("/anuncios/:anuncioId/ofertas", async (req: Request, res: Response) => {
  const compradorId = getAuthenticatedUserId(req)
  if (!compradorId) return res.status(401).json({ error: "Autenticação necessária" })
  const db = getDatabase()
  if (!db) return res.status(503).json({ error: "Serviço de ofertas indisponível" })

  const anuncioId = paramString(req.params.anuncioId)
  const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {}
  const tipo = body.tipo
  const cepDestino = typeof body.cepDestino === "string" ? body.cepDestino.replace(/\D/g, "") : ""
  const transportadora = typeof body.transportadora === "string" ? body.transportadora.trim() : ""
  const valorFrete = Number(body.valorFrete)
  const valorDesconto = Number(body.valorDesconto ?? 0)
  const mensagem = typeof body.mensagem === "string" ? body.mensagem.trim().slice(0, 500) : ""

  if (!anuncioId || !TIPOS_OFERTA.has(tipo as OfertaTipo) || cepDestino.length !== 8 || !transportadora ||
      !Number.isFinite(valorFrete) || valorFrete < 0 || !Number.isFinite(valorDesconto) || valorDesconto < 0) {
    return res.status(400).json({ error: "Dados da oferta inválidos" })
  }

  try {
    const anuncio = await db.anuncios.findById(anuncioId)
    if (!anuncio) return res.status(404).json({ error: "Anúncio não encontrado" })
    if (compradorId === anuncio.vendedorId) return res.status(400).json({ error: "Você não pode fazer oferta no seu próprio anúncio" })
    if (valorDesconto > anuncio.preco) return res.status(400).json({ error: "O desconto excede o preço do anúncio" })

    const existingOffer = await db.ofertas.findPendentePorCompradorEAnuncio(compradorId, anuncioId)
    if (existingOffer) return res.status(409).json({ error: "Você já tem uma oferta pendente nesse anúncio" })

    const valorTotalComprador = tipo === "frete_gratis"
      ? anuncio.preco
      : tipo === "frete_gratis_desconto"
        ? anuncio.preco - valorDesconto
        : tipo === "desconto_produto"
          ? anuncio.preco - valorDesconto + valorFrete
          : anuncio.preco + valorFrete

    const oferta = await db.ofertas.create({
      anuncioId,
      compradorId,
      vendedorId: anuncio.vendedorId,
      tipo: tipo as OfertaTipo,
      cepDestino,
      transportadora,
      valorFrete,
      valorDesconto,
      valorTotalComprador,
      mensagem: mensagem || null,
      status: "pendente",
      expiraEm: new Date(Date.now() + HORAS_VALIDADE_OFERTA * 60 * 60 * 1000),
    })

    const channelId = getChannelId(anuncioId, compradorId)
    const stream = getStreamClient()
    const channel = stream.channel("messaging", channelId, {
      members: [compradorId, anuncio.vendedorId],
      created_by_id: compradorId,
    })
    await channel.create()

    const messagePayload = {
      user_id: compradorId,
      text: mensagem || "Nova proposta de frete",
      custom_type: "oferta",
      oferta: {
        id: oferta.id,
        anuncioId,
        tipo,
        transportadora,
        valorFrete,
        valorDesconto,
        valorTotalComprador,
        status: "pendente",
        produtoNome: anuncio.titulo,
        produtoPreco: anuncio.preco,
      },
    }
    const { message } = await channel.sendMessage(messagePayload as unknown as Parameters<typeof channel.sendMessage>[0])
    await db.ofertas.update(oferta.id, { streamChannelId: channelId, streamMessageId: message.id })
    return res.status(201).json({ oferta: { ...oferta, streamChannelId: channelId, streamMessageId: message.id }, channelId })
  } catch (error) {
    console.error("Erro ao criar oferta:", error)
    return res.status(500).json({ error: "Não foi possível criar a oferta agora" })
  }
})

router.patch("/ofertas/:ofertaId/aceitar", async (req: Request, res: Response) => responderOferta(req, res, "aceita"))
router.patch("/ofertas/:ofertaId/recusar", async (req: Request, res: Response) => responderOferta(req, res, "recusada"))

async function responderOferta(req: Request, res: Response, novoStatus: "aceita" | "recusada") {
  const vendedorId = getAuthenticatedUserId(req)
  if (!vendedorId) return res.status(401).json({ error: "Autenticação necessária" })
  const db = getDatabase()
  if (!db) return res.status(503).json({ error: "Serviço de ofertas indisponível" })
  const ofertaId = paramString(req.params.ofertaId)

  try {
    const oferta = await db.ofertas.findById(ofertaId)
    if (!oferta) return res.status(404).json({ error: "Oferta não encontrada" })
    if (oferta.vendedorId !== vendedorId) return res.status(403).json({ error: "Você não tem permissão para responder essa oferta" })
    if (oferta.status !== "pendente") return res.status(409).json({ error: "Essa oferta já foi respondida" })

    if (new Date() > new Date(oferta.expiraEm)) {
      await db.ofertas.update(ofertaId, { status: "expirada" })
      await getStreamClient().partialUpdateMessage(oferta.streamMessageId, {
        set: { "oferta.status": "expirada" },
      } as unknown as Parameters<StreamChat["partialUpdateMessage"]>[1])
      return res.status(410).json({ error: "Essa oferta expirou" })
    }

    await db.ofertas.update(ofertaId, { status: novoStatus, respondidaEm: new Date() })
    const stream = getStreamClient()
    await stream.partialUpdateMessage(oferta.streamMessageId, {
      set: { "oferta.status": novoStatus },
    } as unknown as Parameters<StreamChat["partialUpdateMessage"]>[1])

    const channel = stream.channel("messaging", oferta.streamChannelId)
    await channel.sendMessage({
      text: novoStatus === "aceita" ? "Oferta aceita. Combinem os próximos passos por aqui." : "Oferta recusada.",
      type: "system",
    })

    if (novoStatus === "aceita") await db.ofertas.recusarOutrasPendentes(oferta.anuncioId, ofertaId)
    return res.json({ status: novoStatus })
  } catch (error) {
    console.error("Erro ao responder oferta:", error)
    return res.status(500).json({ error: "Não foi possível responder a oferta agora" })
  }
}

export default router
