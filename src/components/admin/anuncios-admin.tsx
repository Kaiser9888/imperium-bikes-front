"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, ExternalLink, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { adsService, urlDaArte, type Campaign } from "@/lib/ads"
import { formatarPreco } from "@/lib/format"
import { mensagemDaApi } from "@/services/tournamentService"

/** Campanhas pagas esperando aprovação: confere a arte e o link antes de ir ao ar. */
export function AnunciosAdmin() {
    const [campanhas, setCampanhas] = useState<Campaign[] | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [ocupado, setOcupado] = useState<string | null>(null)

    const carregar = useCallback(async () => {
        setErro(null)
        try {
            setCampanhas(await adsService.porStatus("PENDING_REVIEW"))
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível carregar as campanhas."))
            setCampanhas([])
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
        void carregar()
    }, [carregar])

    async function revisar(c: Campaign, aprovar: boolean) {
        let motivo: string | undefined
        if (!aprovar) {
            motivo = window.prompt("Motivo da recusa (o anunciante vê esta mensagem):")?.trim()
            if (!motivo) return
        }
        setOcupado(c.id)
        try {
            await adsService.revisar(c.id, aprovar, motivo)
            setCampanhas((lista) => lista?.filter((x) => x.id !== c.id) ?? null)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível revisar a campanha."))
        } finally {
            setOcupado(null)
        }
    }

    return (
        <div>
            <p className="type-body-small text-muted-foreground">
                Campanhas já pagas aguardando aprovação. Recusar não devolve o dinheiro automaticamente: faça o reembolso pelo painel do Stripe.
            </p>
            {erro && (
                <p role="alert" className="type-body-small mt-3 text-destructive">
                    {erro}
                </p>
            )}
            {campanhas !== null && campanhas.length === 0 && !erro && (
                <p className="type-body-small mt-6 text-muted-foreground">Nenhuma campanha esperando aprovação.</p>
            )}
            <ul className="mt-4 flex flex-col gap-4">
                {campanhas?.map((c) => (
                    <li key={c.id} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 md:flex-row">
                        {/* eslint-disable-next-line @next/next/no-img-element -- arte do anunciante */}
                        <img src={urlDaArte(c.imageUrl)} alt="" className="aspect-video w-full rounded-lg object-cover md:w-64" />
                        <div className="min-w-0 flex-1">
                            <p className="type-label text-foreground">{c.title}</p>
                            <p className="type-caption mt-1 text-muted-foreground">
                                {c.advertiserName ?? "Anunciante"} · orçamento {formatarPreco(Number(c.budget))}
                            </p>
                            <a
                                href={c.clickUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="type-caption mt-2 inline-flex max-w-full items-center gap-1 break-all text-primary hover:underline"
                            >
                                {c.clickUrl}
                                <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                            </a>
                            <div className="mt-4 flex gap-2">
                                <Button size="sm" loading={ocupado === c.id} onClick={() => revisar(c, true)}>
                                    <Check aria-hidden="true" />
                                    Aprovar
                                </Button>
                                <Button size="sm" variant="outline" disabled={ocupado === c.id} onClick={() => revisar(c, false)}>
                                    <X aria-hidden="true" />
                                    Recusar
                                </Button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
