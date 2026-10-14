"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mensagemDaApi } from "@/services/tournamentService"

export type PedidoMotivo = {
    titulo: string
    descricao: string
    rotulo: string
    acao: string
    perigo?: boolean
    /** Campo extra de dias (suspensão). */
    comDias?: boolean
    confirmar: (texto: string, dias: number) => Promise<void>
}

/** Confirmação que exige um texto (nota da denúncia, motivo do banimento etc.). */
export function DialogoMotivo({ pedido, onFechar }: { pedido: PedidoMotivo | null; onFechar: () => void }) {
    return (
        <Dialog open={!!pedido} onOpenChange={(aberto) => !aberto && onFechar()}>
            <DialogContent className="sm:max-w-md">
                {pedido && <Conteudo key={pedido.titulo} pedido={pedido} onFechar={onFechar} />}
            </DialogContent>
        </Dialog>
    )
}

function Conteudo({ pedido, onFechar }: { pedido: PedidoMotivo; onFechar: () => void }) {
    const [texto, setTexto] = useState("")
    const [dias, setDias] = useState(7)
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function enviar(e: React.FormEvent) {
        e.preventDefault()
        if (!texto.trim()) return setErro("Escreva um motivo.")
        setEnviando(true)
        setErro(null)
        try {
            await pedido.confirmar(texto.trim(), dias)
            onFechar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível concluir. Tente de novo."))
            setEnviando(false)
        }
    }

    const campo = "mt-1.5 w-full rounded-lg bg-surface px-3.5 py-2.5 text-base outline-none md:text-sm"

    return (
        <form onSubmit={enviar}>
            <DialogHeader>
                <DialogTitle>{pedido.titulo}</DialogTitle>
                <DialogDescription>{pedido.descricao}</DialogDescription>
            </DialogHeader>
            <div className="mt-5 space-y-4">
                {pedido.comDias && (
                    <div className="w-32">
                        <label htmlFor="motivo-dias" className="type-label">Dias</label>
                        <input id="motivo-dias" type="number" min={1} max={365} value={dias} onChange={(e) => setDias(Math.max(1, Number(e.target.value) || 1))} className={campo} />
                    </div>
                )}
                <div>
                    <label htmlFor="motivo-texto" className="type-label">{pedido.rotulo}</label>
                    <textarea id="motivo-texto" value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} maxLength={1000} className={`${campo} resize-none`} autoFocus />
                </div>
                {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-6">
                <button type="button" onClick={onFechar} className="line-btn line-btn--sm line-btn--muted">
                    Voltar
                </button>
                <button type="submit" disabled={enviando} aria-busy={enviando} className={`line-btn line-btn--sm ${pedido.perigo ? "line-btn--danger" : "line-btn--accent"}`}>
                    {enviando && <Loader2 className="animate-spin" aria-hidden="true" />}
                    {pedido.acao}
                </button>
            </div>
        </form>
    )
}
