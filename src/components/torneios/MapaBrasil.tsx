"use client"

import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { ESTADOS_MAPA, MAPA_H, MAPA_W, NOMES_UF } from "./mapa-brasil-dados"

type Props = {
    /** Quantos eventos cada UF tem; UF fora daqui fica apagada. */
    contagem: Record<string, number>
    selecionado: string | null
    onSelecionar: (uf: string | null) => void
    className?: string
}

const eventos = (n: number) => `${n} ${n === 1 ? "evento" : "eventos"}`

/**
 * Mapa do Brasil com cara de monitor dos anos 80: estados em traço fino,
 * luz vermelha acesa onde há evento. Tocar num estado filtra a lista abaixo.
 * Feito para ficar dentro do painel escuro do topo de Eventos (escuro nos dois temas).
 */
export function MapaBrasil({ contagem, selecionado, onSelecionar, className }: Props) {
    const comEvento = Object.keys(contagem).filter((uf) => ESTADOS_MAPA[uf]).sort()
    const total = comEvento.reduce((n, uf) => n + contagem[uf], 0)
    const alternar = (uf: string) => onSelecionar(selecionado === uf ? null : uf)

    return (
        <div role="group" aria-label="Mapa de eventos por estado" className={cn("font-mono text-white", className)}>
            <div className="flex items-baseline justify-between gap-3 text-[0.6875rem] uppercase tracking-[0.2em] text-white/55">
                <span>Mapa de eventos</span>
                <span className="tabular-nums">
                    {comEvento.length} {comEvento.length === 1 ? "estado" : "estados"} · {eventos(total)}
                </span>
            </div>

            <div className="relative mt-2">
                <svg
                    viewBox={`-10 -10 ${MAPA_W + 20} ${MAPA_H + 20}`}
                    className="mx-auto block h-44 w-auto max-w-full sm:h-60"
                    aria-label="Mapa do Brasil"
                >
                    <defs>
                        <filter id="mapa-luz" x="-200%" y="-200%" width="500%" height="500%">
                            <feGaussianBlur stdDeviation="16" />
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
                                    "cursor-pointer stroke-[1.4] transition-colors duration-300 [vector-effect:non-scaling-stroke]",
                                    ativo
                                        ? "fill-primary/35 stroke-white"
                                        : tem
                                            ? "fill-primary/15 stroke-primary hover:fill-primary/25"
                                            : "fill-white/[0.04] stroke-white/25 hover:fill-white/[0.08]",
                                )}
                            >
                                <title>{`${NOMES_UF[uf]}${tem ? ` — ${eventos(contagem[uf])}` : ""}`}</title>
                            </path>
                        )
                    })}

                    {/* Luzes vermelhas nos estados com evento */}
                    {comEvento.map((uf) => {
                        const [x, y] = ESTADOS_MAPA[uf].c
                        return (
                            <g key={uf} className="pointer-events-none fill-primary">
                                <circle cx={x} cy={y} r={38} filter="url(#mapa-luz)" />
                                <circle cx={x} cy={y} r={15} className="mapa-pulso" />
                                <circle cx={x} cy={y} r={14} />
                                <circle cx={x} cy={y} r={5} className="fill-white" />
                            </g>
                        )
                    })}
                </svg>
                {/* Linhas de monitor antigo por cima do mapa */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_72%)] bg-[repeating-linear-gradient(to_bottom,rgb(0_0_0/.25)_0_1px,transparent_1px_3px)]" />
            </div>

            {/* Rodapé: atalhos por estado (DF, SE… são difíceis de tocar no mapa) + dica ou estado escolhido */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/10 pt-3">
                {comEvento.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {comEvento.map((uf) => (
                            <button
                                key={uf}
                                type="button"
                                onClick={() => alternar(uf)}
                                aria-pressed={selecionado === uf}
                                aria-label={`${NOMES_UF[uf]}: ${eventos(contagem[uf])}`}
                                className={cn(
                                    "inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs tabular-nums transition-colors",
                                    selecionado === uf ? "border-white bg-primary text-primary-foreground" : "border-primary/60 text-white/90 hover:border-primary",
                                )}
                            >
                                <span className={cn("size-1.5 rounded-full", selecionado === uf ? "bg-white" : "bg-primary shadow-[0_0_6px_var(--primary)]")} aria-hidden="true" />
                                {uf} <span className="opacity-70">{contagem[uf]}</span>
                            </button>
                        ))}
                    </div>
                )}

                {selecionado ? (
                    <p className="flex items-center gap-3 text-xs">
                        <span>
                            <span className="text-white/50">&gt; </span>
                            {NOMES_UF[selecionado]}
                            <span className="text-white/50"> · {eventos(contagem[selecionado] ?? 0)}</span>
                        </span>
                        <button type="button" onClick={() => onSelecionar(null)} className="inline-flex items-center gap-1 uppercase tracking-[0.14em] text-white/60 hover:text-white">
                            <X className="size-3.5" aria-hidden="true" /> Todos
                        </button>
                    </p>
                ) : (
                    <p className="text-xs text-white/45">
                        {comEvento.length > 0 ? "Toque num estado para ver os eventos" : "Nenhum estado com evento ainda"}
                    </p>
                )}
            </div>
        </div>
    )
}
