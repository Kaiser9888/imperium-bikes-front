"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIAS_SUPORTE, suporteService, type Chamado } from "@/lib/suporte"
import { mensagemDaApi } from "@/services/tournamentService"

const rotuloCategoria = (id: string) => CATEGORIAS_SUPORTE.find((c) => c.id === id)?.label ?? id

/** Chamados da Central de Ajuda: responder envia a resposta como notificação para a pessoa. */
export function SuporteAdmin() {
    const [filtro, setFiltro] = useState<Chamado["status"]>("OPEN")
    const [lista, setLista] = useState<Chamado[] | null>(null)
    const [erro, setErro] = useState<string | null>(null)

    const carregar = useCallback(async (status: Chamado["status"]) => {
        setErro(null)
        try {
            setLista(await suporteService.porStatus(status))
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível carregar os chamados."))
            setLista([])
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- recarrega ao trocar o filtro
        setLista(null)
        void carregar(filtro)
    }, [filtro, carregar])

    return (
        <div>
            <div className="flex gap-2">
                {(["OPEN", "ANSWERED"] as const).map((s) => (
                    <Button key={s} size="sm" variant={filtro === s ? "default" : "outline"} aria-pressed={filtro === s} onClick={() => setFiltro(s)}>
                        {s === "OPEN" ? "Abertos" : "Respondidos"}
                    </Button>
                ))}
            </div>
            {erro && (
                <p role="alert" className="type-body-small mt-3 text-destructive">
                    {erro}
                </p>
            )}
            {lista?.length === 0 && !erro && <p className="type-body-small mt-6 text-muted-foreground">Nenhum chamado aqui.</p>}
            <ul className="mt-4 flex flex-col gap-4">
                {lista?.map((c) => (
                    <ItemChamado key={c.id} chamado={c} onRespondido={() => setLista((l) => l?.filter((x) => x.id !== c.id) ?? null)} />
                ))}
            </ul>
        </div>
    )
}

function ItemChamado({ chamado: c, onRespondido }: { chamado: Chamado; onRespondido: () => void }) {
    const [resposta, setResposta] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function responder(event: React.FormEvent) {
        event.preventDefault()
        setEnviando(true)
        setErro(null)
        try {
            await suporteService.responder(c.id, resposta.trim())
            onRespondido()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível enviar a resposta."))
            setEnviando(false)
        }
    }

    return (
        <li className="rounded-xl border border-border bg-surface p-4">
            <p className="type-caption uppercase tracking-[0.12em] text-muted-foreground">{rotuloCategoria(c.category)}</p>
            <p className="type-label mt-1 text-foreground">{c.subject}</p>
            <p className="type-caption mt-1 text-muted-foreground">
                {c.userName ?? "Usuário"}
                {c.userEmail ? ` · ${c.userEmail}` : ""} · {new Date(c.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </p>
            <p className="type-body-small mt-3 whitespace-pre-line text-foreground">{c.message}</p>
            {c.answer ? (
                <p className="type-body-small mt-3 whitespace-pre-line border-l-2 border-primary pl-3 text-muted-foreground">{c.answer}</p>
            ) : (
                <form onSubmit={responder} className="mt-4 flex flex-col gap-2">
                    <label htmlFor={`resposta-${c.id}`} className="type-label text-foreground">
                        Resposta
                    </label>
                    <Textarea id={`resposta-${c.id}`} required minLength={5} maxLength={4000} rows={4} value={resposta} onChange={(e) => setResposta(e.target.value)} />
                    {erro && (
                        <p role="alert" className="type-caption text-destructive">
                            {erro}
                        </p>
                    )}
                    <Button type="submit" size="sm" loading={enviando} className="self-start">
                        Responder
                    </Button>
                </form>
            )}
        </li>
    )
}
