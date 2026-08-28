"use client"

import { useState } from "react"
import { Check, Clock, Loader2, X } from "lucide-react"

const API_URL = "https://imperium-bikes.onrender.com"

interface OfertaCustomData {
  id: string
  anuncioId: string
  tipo: "padrao" | "frete_gratis" | "frete_gratis_desconto" | "desconto_produto"
  transportadora: string
  valorFrete: number
  valorDesconto: number
  valorTotalComprador: number
  status: "pendente" | "aceita" | "recusada" | "expirada"
  produtoNome: string
  produtoPreco: number
}

const ROTULOS_TIPO: Record<OfertaCustomData["tipo"], string> = {
  padrao: "Compra padrão",
  frete_gratis: "Pediu frete grátis",
  frete_gratis_desconto: "Pediu frete grátis + desconto",
  desconto_produto: "Pediu desconto no produto",
}

function formatarReal(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

interface OfertaMessageProps {
  // Recebido como prop em vez de via hook de contexto, pra não depender
  // da versão exata do stream-chat-react instalada no projeto.
  message: {
    user?: { id: string }
    oferta?: OfertaCustomData
  }
  currentUserId?: string
}

export function OfertaMessage({ message, currentUserId }: OfertaMessageProps) {
  const oferta = message.oferta
  const [respondendo, setRespondendo] = useState<"aceitar" | "recusar" | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  if (!oferta) return null

  const souVendedor = Boolean(currentUserId) && currentUserId !== message.user?.id
  const statusAtual = oferta.status

  async function responder(acao: "aceitar" | "recusar") {
    setRespondendo(acao)
    setErro(null)
    try {
      const res = await fetch(`${API_URL}/api/ofertas/${oferta!.id}/${acao}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendedorId: currentUserId }),
      })
      if (!res.ok) throw new Error()
      // Não precisa atualizar o estado aqui: o partialUpdateMessage feito pelo
      // backend dispara um evento em tempo real que já atualiza `message.oferta.status`
      // nos dois clientes conectados ao canal via Stream.
    } catch {
      setErro("Não foi possível responder agora. Tente de novo.")
    } finally {
      setRespondendo(null)
    }
  }

  return (
    <div className="max-w-xs rounded-xl border border-border bg-background p-3 shadow-sm">
      <p className="text-xs font-semibold text-muted-foreground">{ROTULOS_TIPO[oferta.tipo]}</p>
      <p className="mt-1 text-sm font-medium">{oferta.produtoNome}</p>

      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Frete ({oferta.transportadora})</span>
          <span>{formatarReal(oferta.valorFrete)}</span>
        </div>
        {oferta.valorDesconto > 0 && (
          <div className="flex justify-between">
            <span>Desconto pedido</span>
            <span>-{formatarReal(oferta.valorDesconto)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-semibold text-foreground">
          <span>Total do comprador</span>
          <span>{formatarReal(oferta.valorTotalComprador)}</span>
        </div>
      </div>

      {erro && <p className="mt-2 text-xs text-destructive">{erro}</p>}

      {statusAtual === "pendente" && souVendedor && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => responder("recusar")}
            disabled={respondendo !== null}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted/50 disabled:opacity-40"
          >
            {respondendo === "recusar" ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
            Recusar
          </button>
          <button
            type="button"
            onClick={() => responder("aceitar")}
            disabled={respondendo !== null}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            {respondendo === "aceitar" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            Aceitar
          </button>
        </div>
      )}

      {statusAtual === "pendente" && !souVendedor && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          Aguardando resposta do vendedor
        </div>
      )}

      {statusAtual === "aceita" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary">
          <Check className="size-3.5" />
          Oferta aceita
        </div>
      )}

      {(statusAtual === "recusada" || statusAtual === "expirada") && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <X className="size-3.5" />
          {statusAtual === "recusada" ? "Oferta recusada" : "Oferta expirada"}
        </div>
      )}
    </div>
  )
}

/**
 * Exemplo de como plugar isso no seu Channel do stream-chat-react.
 * Os nomes exatos de prop podem variar um pouco conforme a versão da lib —
 * confira a documentação do stream-chat-react instalada no seu projeto.
 *
 * import { Channel, MessageList, MessageInput, MessageSimple, useChatContext } from "stream-chat-react"
 * import { OfertaMessage } from "./OfertaMessage"
 *
 * function CustomMessage(props: any) {
 *   const { client } = useChatContext()
 *   if (props.message.custom_type === "oferta") {
 *     return <OfertaMessage message={props.message} currentUserId={client.userID} />
 *   }
 *   return <MessageSimple {...props} />
 * }
 *
 * <Channel channel={channel} Message={CustomMessage}>
 *   <MessageList />
 *   <MessageInput />
 * </Channel>
 */