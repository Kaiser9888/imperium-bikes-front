"use client"

import { useEffect, useRef, useState } from "react"
import { X, ZoomOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { ESTADOS_MAPA, MAPA_H, MAPA_W, NOMES_UF } from "./mapa-brasil-dados"

type Props = {
    /** Quantos eventos cada UF tem; UF fora daqui fica apagada. */
    contagem: Record<string, number>
    selecionado: string | null
    onSelecionar: (uf: string | null) => void
    className?: string
}

/** Raio de toque em volta de cada luz, em unidades do mapa (~5,6 por pixel no celular). */
const RAIO_TOQUE = 110
/** Estados pequenos demais para o dedo: um toque perto deles aproxima o mapa primeiro. */
const PEQUENOS = ["RN", "PB", "PE", "AL", "SE", "DF", "ES", "RJ"]
const RAIO_ZOOM = 130
/** Quanto o mapa aproxima. */
const ZOOM = 3
const CHEIO = [-10, -10, MAPA_W + 20, MAPA_H + 20]

/** viewBox aproximado em volta do ponto, sem sair do mapa. */
function enquadrar([cx, cy]: [number, number]) {
    const w = CHEIO[2] / ZOOM
    const h = CHEIO[3] / ZOOM
    const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
    return [limitar(cx - w / 2, CHEIO[0], CHEIO[0] + CHEIO[2] - w), limitar(cy - h / 2, CHEIO[1], CHEIO[1] + CHEIO[3] - h), w, h]
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

    // Zoom: o viewBox desliza até o enquadramento novo em 300 ms
    const [foco, setFoco] = useState<[number, number] | null>(null)
    const [vb, setVb] = useState(CHEIO)
    const vbAtual = useRef(CHEIO)
    useEffect(() => {
        const alvo = foco ? enquadrar(foco) : CHEIO
        const de = vbAtual.current
        const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        const t0 = performance.now()
        let id = 0
        const passo = (t: number) => {
            const k = calmo ? 1 : Math.min(1, (t - t0) / 300)
            const suave = 1 - (1 - k) ** 3
            const v = de.map((a, i) => a + (alvo[i] - a) * suave)
            vbAtual.current = v
            setVb(v)
            if (k < 1) id = requestAnimationFrame(passo)
        }
        id = requestAnimationFrame(passo)
        return () => cancelAnimationFrame(id)
    }, [foco])
    /** Escala do zoom: luzes e áreas de toque ficam do mesmo tamanho na tela. */
    const escala = CHEIO[2] / vb[2]

    // Mapa inteiro: tocar perto dos estados pequenos (Nordeste, DF, RJ, ES) aproxima ali;
    // em outro lugar, um toque perto de uma luz vai para a luz mais próxima, senão vale o estado tocado.
    const tocar = (e: React.MouseEvent<SVGSVGElement>) => {
        const m = e.currentTarget.getScreenCTM()
        if (!m) return
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
        const distancia = (uf: string) => Math.hypot(p.x - ESTADOS_MAPA[uf].c[0], p.y - ESTADOS_MAPA[uf].c[1])
        if (!foco && PEQUENOS.some((uf) => distancia(uf) < RAIO_ZOOM)) {
            setFoco([p.x, p.y])
            return
        }
        let perto: string | null = null
        // Aproximado, cada estado já é grande o bastante: vale só o estado tocado
        let menor = foco ? 0 : RAIO_TOQUE
        for (const uf of comEvento) {
            const d = distancia(uf)
            if (d < menor) [perto, menor] = [uf, d]
        }
        const uf = perto ?? (e.target as Element).closest("path")?.getAttribute("data-uf")
        if (uf) alternar(uf)
    }

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
                    viewBox={vb.join(" ")}
                    className={cn("mx-auto block h-44 w-auto max-w-full sm:h-60", foco && "[mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_80%)]")}
                    aria-label="Mapa do Brasil"
                    onClick={tocar}
                >
                    <defs>
                        <filter id="mapa-luz" x="-200%" y="-200%" width="500%" height="500%">
                            <feGaussianBlur stdDeviation={16 / escala} />
                        </filter>
                    </defs>

                    {Object.entries(ESTADOS_MAPA).map(([uf, e]) => {
                        const tem = !!contagem[uf]
                        const ativo = selecionado === uf
                        return (
                            <path
                                key={uf}
                                d={e.d}
                                data-uf={uf}
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
                                <circle cx={x} cy={y} r={38 / escala} filter="url(#mapa-luz)" />
                                <circle cx={x} cy={y} r={15 / escala} className="mapa-pulso" />
                                <circle cx={x} cy={y} r={14 / escala} />
                                <circle cx={x} cy={y} r={5 / escala} className="fill-white" />
                            </g>
                        )
                    })}

                </svg>
                {/* Linhas de monitor antigo por cima do mapa */}
                {foco && (
                    <button
                        type="button"
                        onClick={() => setFoco(null)}
                        className="absolute right-0 top-0 inline-flex items-center gap-1 rounded border border-white/30 bg-black/60 px-2 py-1 text-[0.6875rem] uppercase tracking-[0.14em] text-white/80 hover:text-white"
                    >
                        <ZoomOut className="size-3.5" aria-hidden="true" /> Mapa inteiro
                    </button>
                )}
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
                        {foco ? "Toque no estado" : comEvento.length > 0 ? "Toque num estado para ver os eventos" : "Nenhum estado com evento ainda"}
                    </p>
                )}
            </div>
        </div>
    )
}
