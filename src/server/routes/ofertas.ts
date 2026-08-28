import { Router, Request, Response } from "express"
import { StreamChat } from "stream-chat"

// Troque por importar seu client de banco de verdade (ex.: import { db } from "../db")
// As funções abaixo são o "contrato" esperado — implemente com Prisma/Knex/etc.
declare const db: {
  anuncios: {
    findById(id: string): Promise<{ id: string; vendedorId: string; titulo: string; preco: number } | null>
  }
  ofertas: {
    findById(id: string): Promise<any | null>
    findPendentePorCompradorEAnuncio(compradorId: string, anuncioId: string): Promise<any | null>
    create(data: any): Promise<{ id: string }>
    update(id: string, data: any): Promise<void>
    recusarOutrasPendentes(anuncioId: string, exceptOfertaId: string): Promise<void>
  }
}

const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
)

const router = Router()

const HORAS_VALIDADE_OFERTA = 48

type StatusOferta = "pendente" | "aceita" | "recusada" | "expirada"

// Normaliza params de rota que o TypeScript pode inferir como string | string[]
// (acontece dependendo da versão do Express/@types/express instalada)
function paramString(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? ""
}

// Canal único por anúncio + comprador, assim cada negociação tem sua própria conversa
function getChannelId(anuncioId: string, compradorId: string) {
  return `oferta-${anuncioId}-${compradorId}`
}

/**
 * POST /api/anuncios/:anuncioId/ofertas
 * Cria a oferta no banco (fonte da verdade) e a publica no Stream Chat
 * como uma mensagem customizada, visível pros dois usuários em tempo real.
 *
 * IMPORTANTE: compradorId deveria vir do usuário autenticado (ex.: req.user.id),
 * nunca do body — aqui está explícito só pra facilitar a leitura do fluxo.
 */
router.post("/anuncios/:anuncioId/ofertas", async (req: Request, res: Response) => {
  const anuncioId = paramString(req.params.anuncioId)
  const {
    compradorId,
    tipo,
    cepDestino,
    transportadora,
    valorFrete,
    valorDesconto,
    valorTotalComprador,
    mensagem,
  } = req.body

  try {
    const anuncio = await db.anuncios.findById(anuncioId)
    if (!anuncio) return res.status(404).json({ error: "Anúncio não encontrado" })

    const vendedorId = anuncio.vendedorId

    if (compradorId === vendedorId) {
      return res.status(400).json({ error: "Você não pode fazer oferta no seu próprio anúncio" })
    }

    // Impede oferta nova enquanto já existe uma pendente do mesmo comprador nesse anúncio
    const ofertaPendente = await db.ofertas.findPendentePorCompradorEAnuncio(compradorId, anuncioId)
    if (ofertaPendente) {
      return res.status(409).json({ error: "Você já tem uma oferta pendente nesse anúncio" })
    }

    // 1. Cria a oferta no banco
    const expiraEm = new Date(Date.now() + HORAS_VALIDADE_OFERTA * 60 * 60 * 1000)
    const oferta = await db.ofertas.create({
      anuncioId,
      compradorId,
      vendedorId,
      tipo,
      cepDestino,
      transportadora,
      valorFrete,
      valorDesconto: valorDesconto ?? 0,
      valorTotalComprador,
      mensagem: mensagem ?? null,
      status: "pendente" as StatusOferta,
      expiraEm,
    })

    // 2. Garante que o canal 1:1 entre comprador e vendedor existe
    const channelId = getChannelId(anuncioId, compradorId)
    const channel = streamClient.channel("messaging", channelId, {
      members: [compradorId, vendedorId],
      created_by_id: compradorId,
    })
    await channel.create()

    // 3. Publica a oferta como mensagem customizada no canal
    // OBS: `custom_type` e `oferta` são campos customizados nossos — a API do Stream
    // aceita normalmente, mas a tipagem do SDK só conhece os campos padrão, daí o cast.
    const { message } = await channel.sendMessage({
      user_id: compradorId,
      text: mensagem || "Nova proposta de frete",
      custom_type: "oferta",
      oferta: {
        id: oferta.id,
        anuncioId,
        tipo,
        transportadora,
        valorFrete,
        valorDesconto: valorDesconto ?? 0,
        valorTotalComprador,
        status: "pendente",
        produtoNome: anuncio.titulo,
        produtoPreco: anuncio.preco,
      },
    } as any)

    // 4. Guarda a referência da mensagem, necessária pra atualizar o status depois
    await db.ofertas.update(oferta.id, {
      streamChannelId: channelId,
      streamMessageId: message.id,
    })

    res.status(201).json({ oferta, channelId })
  } catch (err) {
    console.error("Erro ao criar oferta:", err)
    res.status(500).json({ error: "Não foi possível criar a oferta agora" })
  }
})

/**
 * PATCH /api/ofertas/:ofertaId/aceitar
 * PATCH /api/ofertas/:ofertaId/recusar
 *
 * Só o vendedor dono do anúncio pode responder. Atualiza o banco e sincroniza
 * a mensagem no Stream via partialUpdateMessage — isso propaga em tempo real
 * pros dois clientes conectados ao canal, sem precisar de refresh.
 */
router.patch("/ofertas/:ofertaId/aceitar", async (req: Request, res: Response) => {
  await responderOferta(req, res, "aceita")
})

router.patch("/ofertas/:ofertaId/recusar", async (req: Request, res: Response) => {
  await responderOferta(req, res, "recusada")
})

async function responderOferta(req: Request, res: Response, novoStatus: "aceita" | "recusada") {
  const ofertaId = paramString(req.params.ofertaId)
  const { vendedorId } = req.body // idealmente req.user.id, vindo de autenticação

  try {
    const oferta = await db.ofertas.findById(ofertaId)
    if (!oferta) return res.status(404).json({ error: "Oferta não encontrada" })
    if (oferta.vendedorId !== vendedorId) {
      return res.status(403).json({ error: "Você não tem permissão para responder essa oferta" })
    }
    if (oferta.status !== "pendente") {
      return res.status(409).json({ error: "Essa oferta já foi respondida" })
    }
    if (oferta.expiraEm && new Date() > new Date(oferta.expiraEm)) {
      await db.ofertas.update(ofertaId, { status: "expirada" as StatusOferta })
      await streamClient.partialUpdateMessage(oferta.streamMessageId, {
        set: { "oferta.status": "expirada" },
      } as any)
      return res.status(410).json({ error: "Essa oferta expirou" })
    }

    await db.ofertas.update(ofertaId, { status: novoStatus, respondidaEm: new Date() })

    // Sincroniza o card no chat pros dois usuários
    await streamClient.partialUpdateMessage(oferta.streamMessageId, {
      set: { "oferta.status": novoStatus },
    } as any)

    // Mensagem de sistema anunciando o resultado da negociação
    const channel = streamClient.channel("messaging", oferta.streamChannelId)
    await channel.sendMessage({
      text:
        novoStatus === "aceita"
          ? "✅ Oferta aceita. Combinem os próximos passos por aqui."
          : "❌ Oferta recusada.",
      type: "system",
    })

    if (novoStatus === "aceita") {
      // Evita duas ofertas "aceitas" pro mesmo anúncio ao mesmo tempo
      await db.ofertas.recusarOutrasPendentes(oferta.anuncioId, ofertaId)
    }

    res.json({ status: novoStatus })
  } catch (err) {
    console.error("Erro ao responder oferta:", err)
    res.status(500).json({ error: "Não foi possível responder a oferta agora" })
  }
}

export default router