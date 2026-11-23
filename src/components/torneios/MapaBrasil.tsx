"use client"

import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { ESTADOS_MAPA, MAPA_H, MAPA_W, NOMES_UF } from "./mapa-brasil-dados"

type Props = {
    /** Quantos eventos cada UF tem; UF fora daqui fica apagada. */
    contagem: Record<string, number>
    selecionado: string | null
    onSelecionar: (uf: string | null) => void
}

/**
 * Mapa do Brasil com cara de monitor dos anos 80: estados em traço fino,
 * luz vermelha acesa onde há evento. Tocar num estado filtra a lista abaixo.
 */
export function MapaBrasil({ contagem, selecionado, onSelecionar }: Props) {
    const comEvento = Object.keys(contagem).filter((uf) => ESTADOS_MAPA[uf]).sort()
    const total = comEvento.reduce((n, uf) => n + contagem[uf], 0)
    const alternar = (uf: string) => onSelecionar(selecionado === uf ? null : uf)

    return (
        <section aria-label="Eventos por estado" className="relative isolate mt-6 overflow-hidden rounded-2xl bg-[oklch(0.17_0.02_255)] px-4 pb-5 pt-4 font-mono text-white ring-1 ring-white/10 sm:px-8 sm:pt-6">
            <div className="flex items-baseline justify-between gap-3 text-[0.6875rem] uppercase tracking-[0.2em] text-white/50">
                <span>Brasil // 27 UF</span>
                <span className="tabular-nums">
                    {comEvento.length} {comEvento.length === 1 ? "estado" : "estados"} · {total} {total === 1 ? "evento" : "eventos"}
                </span>
            </div>

            <svg
                viewBox={`-10 -10 ${MAPA_W + 20} ${MAPA_H + 20}`}
                className="mx-auto mt-3 block w-full max-w-xl"
                role="group"
                aria-label="Mapa do Brasil"
            >
                <defs>
                    <filter id="mapa-luz" x="-200%" y="-200%" width="500%" height="500%">
                        <feGaussianBlur stdDeviation="9" />
                    </filter>
                </defs>

                {Object.entries(ESTADOS_MAPA).map(([uf, e]) => {
                    const tem = !!contagem[uf]
                    const ativo = selecionado === uf
                    return (
                        <path
                            key={uf}
                            d={e.d}
                            onClick={() => alternar(uf)}
                            className={cn(
                                "cursor-pointer stroke-[1.6] transition-colors duration-300 [vector-effect:non-scaling-stroke]",
                                ativo
                                    ? "fill-primary/30 stroke-white"
                                    : tem
                                        ? "fill-primary/[0.08] stroke-primary/70 hover:fill-primary/20"
                                        : "fill-white/[0.03] stroke-white/20 hover:fill-white/[0.07]",
                            )}
                        >
                            <title>{`${NOMES_UF[uf]}${tem ? ` — ${contagem[uf]} ${contagem[uf] === 1 ? "evento" : "eventos"}` : ""}`}</title>
                        </path>
                    )
                })}

                {/* Luzes vermelhas nos estados com evento */}
                {comEvento.map((uf) => {
                    const [x, y] = ESTADOS_MAPA[uf].c
                    return (
                        <g key={uf} className="pointer-events-none fill-primary">
                            <circle cx={x} cy={y} r={14} filter="url(#mapa-luz)" opacity={0.9} />
                            <circle cx={x} cy={y} r={9} className="mapa-pulso" />
                            <circle cx={x} cy={y} r={6.5} />
                            <circle cx={x} cy={y} r={2.5} className="fill-white/80" />
                        </g>
                    )
                })}
            </svg>

            {/* Atalhos: estados pequenos (DF, SE…) são difíceis de tocar no mapa */}
            {comEvento.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {comEvento.map((uf) => (
                        <button
                            key={uf}
                            type="button"
                            onClick={() => alternar(uf)}
                            aria-pressed={selecionado === uf}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs tabular-nums transition-colors",
                                selecionado === uf ? "border-white bg-primary text-primary-foreground" : "border-primary/50 text-white/85 hover:border-primary",
                            )}
                        >
                            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)]" aria-hidden="true" />
                            {uf} <span className="opacity-70">{contagem[uf]}</span>
                        </button>
                    ))}
                </div>
            )}

            {selecionado && (
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm">
                    <p>
                        <span className="text-white/50">&gt; </span>
                        {NOMES_UF[selecionado]}
                        <span className="text-white/50"> · {contagem[selecionado] ?? 0} {contagem[selecionado] === 1 ? "evento" : "eventos"}</span>
                    </p>
                    <button type="button" onClick={() => onSelecionar(null)} className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-white/60 hover:text-white">
                        <X className="size-3.5" aria-hidden="true" /> Todos
                    </button>
                </div>
            )}

            {/* Linhas de monitor antigo por cima */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(0_0_0/.22)_0_1px,transparent_1px_3px)]" />
        </section>
    )
}
