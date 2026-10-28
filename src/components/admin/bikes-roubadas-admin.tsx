"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { DialogoMotivo, type PedidoMotivo } from "@/components/admin/dialogo-motivo"
import { bikesRoubadasService, STATUS_ALERTA, type AlertaRoubo, type StatusAlerta } from "@/lib/bikes-roubadas"
import { mensagemDaApi } from "@/services/tournamentService"

const FILTROS: StatusAlerta[] = ["PENDENTE", "CONFIRMADO", "RECUSADO", "RECUPERADO"]

type Anuncio = { id: string; title: string; sellerId: string; sellerName: string }

/**
 * Alertas de bike roubada. Confirmar só depois de conferir o boletim: o número passa a bloquear
 * anúncios e os que estão no ar com ele saem.
 */
export function BikesRoubadasAdmin() {
    const [filtro, setFiltro] = useState<StatusAlerta>("PENDENTE")
    const [lista, setLista] = useState<AlertaRoubo[] | null>(null)
    const [anuncios, setAnuncios] = useState<Record<string, Anuncio[]>>({})
    const [erro, setErro] = useState<string | null>(null)
    const [pedido, setPedido] = useState<PedidoMotivo | null>(null)

    const carregar = useCallback(async (status: StatusAlerta) => {
        setLista(null)
        setErro(null)
        try {
            const pagina = await bikesRoubadasService.porStatus(status)
            setLista(pagina.content)
            if (status === "PENDENTE") {
                // Anúncios no ar com o mesmo número: aparecem antes de confirmar
                const pares = await Promise.all(pagina.content.map(async (a) => [a.id, await bikesRoubadasService.anuncios(a.id).catch(() => [])] as const))
                setAnuncios(Object.fromEntries(pares))
            }
        } catch (cause) {
            setLista([])
            setErro(mensagemDaApi(cause, "Não foi possível carregar os alertas."))
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga ao trocar o filtro
        void carregar(filtro)
    }, [filtro, carregar])

    const tirar = (id: string) => setLista((l) => l?.filter((a) => a.id !== id) ?? null)

    async function confirmar(a: AlertaRoubo) {
        setErro(null)
        try {
            await bikesRoubadasService.confirmar(a.id)
            tirar(a.id)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível confirmar."))
        }
    }

    function recusar(a: AlertaRoubo) {
        setPedido({
            titulo: `Recusar o alerta ${a.numeroSerie}?`,
            descricao: "O dono é avisado com o motivo. O número continua podendo ser anunciado.",
            rotulo: "Motivo",
            acao: "Recusar",
            confirmar: async (motivo) => {
                await bikesRoubadasService.recusar(a.id, motivo)
                tirar(a.id)
            },
        })
    }

    return (
        <section>
            <div className="flex flex-wrap items-center gap-6">
                {FILTROS.map((f) => (
                    <button key={f} type="button" onClick={() => setFiltro(f)} aria-pressed={filtro === f} className="line-btn line-btn--sm line-btn--muted">
                        {STATUS_ALERTA[f].label}
                    </button>
                ))}
            </div>

            {erro && <p role="alert" className="type-body-small mt-4 border-l-2 border-destructive pl-3 text-destructive">{erro}</p>}

            {lista === null ? (
                <Loader2 className="mt-8 size-5 animate-spin text-muted-foreground" />
            ) : lista.length === 0 ? (
                <p className="type-body-small mt-8 text-muted-foreground">Nenhum alerta com esse filtro.</p>
            ) : (
                <ul className="mt-5 divide-y divide-border border-y border-border">
                    {lista.map((a) => (
                        <li key={a.id} className="py-4">
                            <p className="font-mono text-sm font-semibold">{a.numeroSerie}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {[a.marca, a.modelo, a.cidade].filter(Boolean).join(" · ") || "Sem detalhes"} · B.O. <strong>{a.boletim}</strong> ·{" "}
                                {new Date(a.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                            {a.descricao && <p className="mt-1 text-sm">{a.descricao}</p>}
                            {(anuncios[a.id]?.length ?? 0) > 0 && filtro === "PENDENTE" && (
                                <div className="mt-2 text-xs">
                                    <p className="font-semibold text-warning">Anúncios no ar com este número (saem ao confirmar):</p>
                                    <ul className="mt-1 flex flex-col gap-0.5">
                                        {anuncios[a.id].map((p) => (
                                            <li key={p.id}>
                                                <Link href={`/produtos/${p.id}`} className="underline">{p.title}</Link> · {p.sellerName}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {filtro === "PENDENTE" && (
                                <div className="mt-3 flex gap-5">
                                    <button type="button" onClick={() => confirmar(a)} className="line-btn line-btn--sm line-btn--danger">
                                        Confirmar alerta (B.O. conferido)
                                    </button>
                                    <button type="button" onClick={() => recusar(a)} className="line-btn line-btn--sm line-btn--muted">
                                        Recusar
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <DialogoMotivo pedido={pedido} onFechar={() => setPedido(null)} />
        </section>
    )
}
