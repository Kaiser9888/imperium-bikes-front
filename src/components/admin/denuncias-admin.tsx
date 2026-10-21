"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { DialogoMotivo, type PedidoMotivo } from "@/components/admin/dialogo-motivo"
import { denunciaService, type Denuncia, type StatusDenuncia, type TipoDenunciado } from "@/services/adminService"
import { mensagemDaApi } from "@/services/tournamentService"

const FILTROS: { id: StatusDenuncia; label: string }[] = [
    { id: "PENDING", label: "Pendentes" },
    { id: "RESOLVED", label: "Resolvidas" },
    { id: "DISMISSED", label: "Descartadas" },
]

const MOTIVO: Record<Denuncia["reason"], string> = {
    SPAM: "Spam",
    ABUSE: "Abuso",
    SCAM: "Golpe",
    INAPPROPRIATE: "Conteúdo impróprio",
    FAKE: "Falso",
    COPYRIGHT: "Direitos autorais",
    OTHER: "Outro",
}

const TIPO: Record<TipoDenunciado, { label: string; href?: (id: string) => string }> = {
    PRODUCT: { label: "Anúncio", href: (id) => `/produtos/${id}` },
    USER: { label: "Usuário", href: (id) => `/perfil/${id}` },
    VIDEO: { label: "Vídeo", href: (id) => `/videos/watch/${id}` },
    TOURNAMENT: { label: "Evento", href: (id) => `/torneios/${id}` },
    POST: { label: "Post do fórum" },
    COMMENT: { label: "Comentário" },
}

/** Fila de denúncias: ver o item denunciado e resolver ou descartar com uma nota. */
export function DenunciasAdmin() {
    const [filtro, setFiltro] = useState<StatusDenuncia>("PENDING")
    const [lista, setLista] = useState<Denuncia[] | null>(null)
    const [pagina, setPagina] = useState({ atual: 0, total: 0 })
    const [erro, setErro] = useState<string | null>(null)
    const [pedido, setPedido] = useState<PedidoMotivo | null>(null)

    const carregar = useCallback(async (status: StatusDenuncia, page: number) => {
        setErro(null)
        try {
            const r = await denunciaService.listar(status, page)
            setLista((l) => (page === 0 ? r.content : [...(l ?? []), ...r.content]))
            setPagina({ atual: r.number, total: r.totalPages })
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível carregar as denúncias."))
            setLista((l) => l ?? [])
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- recarrega ao trocar o filtro
        setLista(null)
        void carregar(filtro, 0)
    }, [filtro, carregar])

    function decidir(d: Denuncia, tipo: "resolver" | "descartar") {
        setPedido({
            titulo: tipo === "resolver" ? "Resolver denúncia" : "Descartar denúncia",
            descricao: tipo === "resolver" ? "Conte o que foi feito (ex.: anúncio removido, usuário avisado)." : "Explique por que a denúncia não procede.",
            rotulo: "Nota",
            acao: tipo === "resolver" ? "Resolver" : "Descartar",
            confirmar: async (notas) => {
                await (tipo === "resolver" ? denunciaService.resolver(d.id, notas) : denunciaService.descartar(d.id, notas))
                // Saiu da fila atual
                setLista((l) => l?.filter((x) => x.id !== d.id) ?? null)
            },
        })
    }

    return (
        <section>
            <div className="flex gap-6">
                {FILTROS.map((f) => (
                    <button key={f.id} type="button" onClick={() => setFiltro(f.id)} aria-pressed={filtro === f.id} className="line-btn line-btn--sm line-btn--muted">
                        {f.label}
                    </button>
                ))}
            </div>

            {erro && <p role="alert" className="type-body-small mt-4 border-l-2 border-destructive pl-3 text-destructive">{erro}</p>}

            {lista === null ? (
                <Loader2 className="mt-8 size-5 animate-spin text-muted-foreground" />
            ) : lista.length === 0 ? (
                <p className="type-body-small mt-8 text-muted-foreground">
                    {filtro === "PENDING" ? "Nenhuma denúncia esperando. Tudo em dia." : "Nada por aqui."}
                </p>
            ) : (
                <ul className="mt-5 divide-y divide-border border-y border-border">
                    {lista.map((d) => {
                        const tipo = TIPO[d.reportedType]
                        return (
                            <li key={d.id} className="py-4">
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <span className="text-sm font-semibold">{MOTIVO[d.reason]}</span>
                                    <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{tipo.label}</span>
                                    {d.priority > 0 && <span className="text-xs font-semibold text-accent">prioridade {d.priority}</span>}
                                    <span className="ml-auto text-xs tabular-nums text-muted-foreground">
                                        {new Date(d.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                {d.details && <p className="type-body-small mt-1.5 whitespace-pre-line text-foreground/85">{d.details}</p>}
                                <p className="mt-1.5 text-xs text-muted-foreground">Denunciado por {d.reporterName ?? "usuário"}</p>
                                {d.resolutionNotes && <p className="mt-1.5 border-l-2 border-border pl-2 text-xs text-muted-foreground">Nota: {d.resolutionNotes}</p>}
                                <div className="mt-3 flex flex-wrap gap-6">
                                    {tipo.href && (
                                        <Link href={tipo.href(d.reportedId)} target="_blank" className="line-btn line-btn--sm line-btn--muted">
                                            Ver {tipo.label.toLowerCase()}
                                        </Link>
                                    )}
                                    {filtro === "PENDING" && (
                                        <>
                                            <button type="button" onClick={() => decidir(d, "resolver")} className="line-btn line-btn--sm">
                                                Resolver
                                            </button>
                                            <button type="button" onClick={() => decidir(d, "descartar")} className="line-btn line-btn--sm line-btn--muted">
                                                Descartar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}

            {lista && pagina.atual + 1 < pagina.total && (
                <button type="button" onClick={() => carregar(filtro, pagina.atual + 1)} className="line-btn line-btn--sm mt-6">
                    Carregar mais
                </button>
            )}

            <DialogoMotivo pedido={pedido} onFechar={() => setPedido(null)} />
        </section>
    )
}
