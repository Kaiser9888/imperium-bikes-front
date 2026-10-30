"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Download, MapPin, Mountain, Route } from "lucide-react"

import { distanciasAcumuladas, formatarDistancia, gerarGpx } from "@/lib/gpx"
import type { Rota } from "@/services/tournamentService"

/** Leaflet vem do CDN só quando alguém abre o percurso: não pesa no resto do site. */
const LEAFLET_VERSAO = "1.9.4"
const LEAFLET_JS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSAO}/leaflet.min.js`
const LEAFLET_CSS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSAO}/leaflet.min.css`

type LatLng = [number, number]
type Camada = { addTo(mapa: Mapa): Camada; setLatLng(p: LatLng): Camada; setStyle(o: object): Camada; getBounds(): unknown; bindTooltip(t: string): Camada }
type Mapa = { remove(): void; fitBounds(b: unknown, o?: object): void; removeLayer(c: Camada): void }
type Leaflet = {
    map(el: HTMLElement, o?: object): Mapa
    tileLayer(url: string, o: object): Camada
    polyline(p: LatLng[], o: object): Camada
    circleMarker(p: LatLng, o: object): Camada
}

let carregando: Promise<Leaflet> | null = null
function carregarLeaflet(): Promise<Leaflet> {
    const global = window as unknown as { L?: Leaflet }
    if (global.L) return Promise.resolve(global.L)
    carregando ??= new Promise<Leaflet>((resolve, reject) => {
        const css = document.createElement("link")
        css.rel = "stylesheet"
        css.href = LEAFLET_CSS
        document.head.appendChild(css)
        const script = document.createElement("script")
        script.src = LEAFLET_JS
        script.async = true
        script.onload = () => (global.L ? resolve(global.L) : reject(new Error("Leaflet não carregou")))
        script.onerror = () => {
            carregando = null
            reject(new Error("Leaflet não carregou"))
        }
        document.head.appendChild(script)
    })
    return carregando
}

const ALTURA_GRAFICO = 140
const LARGURA_GRAFICO = 600

/** Mapa do percurso, altimetria e GPX para baixar. */
export function Percurso({ rota, nome }: { rota: Rota; nome: string }) {
    const mapaEl = useRef<HTMLDivElement>(null)
    const marcador = useRef<Camada | null>(null)
    const [semMapa, setSemMapa] = useState(false)
    const [foco, setFoco] = useState<number | null>(null)

    const distancias = useMemo(() => distanciasAcumuladas(rota.pontos), [rota.pontos])
    const altitudes = rota.pontos.map((p) => p[2]).filter((a): a is number => a != null)
    const temAltitude = altitudes.length >= 2
    const minAlt = temAltitude ? Math.min(...altitudes) : 0
    const maxAlt = temAltitude ? Math.max(...altitudes) : 0

    useEffect(() => {
        let mapa: Mapa | null = null
        let ativo = true
        carregarLeaflet()
            .then((L) => {
                if (!ativo || !mapaEl.current) return
                mapa = L.map(mapaEl.current, { scrollWheelZoom: false })
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 18,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                }).addTo(mapa)
                const linha = L.polyline(rota.pontos.map((p) => [p[0], p[1]] as LatLng), { color: "#e5484d", weight: 4 }).addTo(mapa)
                const inicio = rota.pontos[0]
                const fim = rota.pontos[rota.pontos.length - 1]
                L.circleMarker([inicio[0], inicio[1]], { radius: 7, color: "#fff", weight: 2, fillColor: "#30a46c", fillOpacity: 1 }).addTo(mapa).bindTooltip("Largada")
                L.circleMarker([fim[0], fim[1]], { radius: 7, color: "#fff", weight: 2, fillColor: "#111", fillOpacity: 1 }).addTo(mapa).bindTooltip("Chegada")
                marcador.current = L.circleMarker([inicio[0], inicio[1]], { radius: 6, color: "#fff", weight: 2, fillColor: "#e5484d", fillOpacity: 0, opacity: 0 }).addTo(mapa)
                mapa.fitBounds(linha.getBounds(), { padding: [20, 20] })
            })
            .catch(() => ativo && setSemMapa(true))
        return () => {
            ativo = false
            marcador.current = null
            mapa?.remove()
        }
    }, [rota.pontos])

    // Passar o dedo no gráfico mostra o ponto no mapa
    useEffect(() => {
        if (!marcador.current) return
        if (foco === null) {
            marcador.current.setStyle({ opacity: 0, fillOpacity: 0 })
            return
        }
        const p = rota.pontos[foco]
        marcador.current.setLatLng([p[0], p[1]]).setStyle({ opacity: 1, fillOpacity: 1 })
    }, [foco, rota.pontos])

    const total = distancias[distancias.length - 1] || 1
    const x = (i: number) => (distancias[i] / total) * LARGURA_GRAFICO
    const y = (alt: number) => ALTURA_GRAFICO - 8 - ((alt - minAlt) / Math.max(1, maxAlt - minAlt)) * (ALTURA_GRAFICO - 16)
    const linhaAlt = temAltitude
        ? rota.pontos.map((p, i) => (p[2] == null ? null : `${x(i).toFixed(1)},${y(p[2]).toFixed(1)}`)).filter(Boolean).join(" L")
        : ""

    function apontar(event: React.PointerEvent<SVGSVGElement>) {
        const caixa = event.currentTarget.getBoundingClientRect()
        const alvo = ((event.clientX - caixa.left) / caixa.width) * total
        let melhor = 0
        for (let i = 1; i < distancias.length; i++) if (Math.abs(distancias[i] - alvo) < Math.abs(distancias[melhor] - alvo)) melhor = i
        setFoco(melhor)
    }

    function baixar() {
        const url = URL.createObjectURL(new Blob([gerarGpx(nome, rota.pontos)], { type: "application/gpx+xml" }))
        const a = document.createElement("a")
        a.href = url
        a.download = `${nome.normalize("NFD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "percurso"}.gpx`
        a.click()
        URL.revokeObjectURL(url)
    }

    const inicio = rota.pontos[0]
    const pontoFoco = foco === null ? null : rota.pontos[foco]

    return (
        <section aria-labelledby="percurso-titulo" className="space-y-5">
            <h2 id="percurso-titulo" className="type-h2">Percurso</h2>

            <dl className="grid grid-cols-3 border-y border-foreground">
                <div className="py-3">
                    <dt className="type-caption flex items-center gap-1.5 uppercase tracking-[0.12em] text-muted-foreground"><Route className="size-3.5" aria-hidden="true" />Distância</dt>
                    <dd className="mt-1 text-2xl font-bold tabular-nums">{formatarDistancia(rota.distanciaM)}</dd>
                </div>
                <div className="border-l border-border py-3 pl-4">
                    <dt className="type-caption flex items-center gap-1.5 uppercase tracking-[0.12em] text-muted-foreground"><Mountain className="size-3.5" aria-hidden="true" />Subida</dt>
                    <dd className="mt-1 text-2xl font-bold tabular-nums">{rota.subidaM != null ? `${rota.subidaM.toLocaleString("pt-BR")} m` : "—"}</dd>
                </div>
                <div className="border-l border-border py-3 pl-4">
                    <dt className="type-caption uppercase tracking-[0.12em] text-muted-foreground">Altitude</dt>
                    <dd className="mt-1 text-lg font-bold tabular-nums">{temAltitude ? `${Math.round(minAlt)}–${Math.round(maxAlt)} m` : "—"}</dd>
                </div>
            </dl>

            {semMapa ? (
                <p className="type-body-small rounded-lg bg-surface-muted px-3 py-3 text-muted-foreground">O mapa não carregou agora. Baixe o GPX para ver o trajeto no seu app.</p>
            ) : (
                <div ref={mapaEl} role="img" aria-label={`Mapa do percurso de ${nome}`} className="relative z-0 aspect-[4/3] w-full overflow-hidden rounded-lg border border-foreground bg-surface-muted sm:aspect-[16/9]" />
            )}

            {temAltitude && (
                <figure>
                    <figcaption className="type-caption flex items-center justify-between text-muted-foreground">
                        <span>Altimetria</span>
                        {pontoFoco ? (
                            <span className="tabular-nums text-foreground">
                                {formatarDistancia(distancias[foco!])} · {pontoFoco[2] != null ? `${Math.round(pontoFoco[2])} m` : "—"}
                            </span>
                        ) : (
                            <span>Toque no gráfico para ver no mapa</span>
                        )}
                    </figcaption>
                    <svg
                        viewBox={`0 0 ${LARGURA_GRAFICO} ${ALTURA_GRAFICO}`}
                        preserveAspectRatio="none"
                        className="mt-2 h-36 w-full touch-none rounded-lg border border-border bg-surface"
                        onPointerMove={apontar}
                        onPointerDown={apontar}
                        onPointerLeave={() => setFoco(null)}
                        role="img"
                        aria-label={`Altimetria: de ${Math.round(minAlt)} a ${Math.round(maxAlt)} metros ao longo de ${formatarDistancia(rota.distanciaM)}`}
                    >
                        <path d={`M${linhaAlt} L${LARGURA_GRAFICO},${ALTURA_GRAFICO} L0,${ALTURA_GRAFICO} Z`} className="fill-primary/15" />
                        <path d={`M${linhaAlt}`} fill="none" className="stroke-primary" strokeWidth={2} vectorEffect="non-scaling-stroke" />
                        {pontoFoco && <line x1={x(foco!)} x2={x(foco!)} y1={0} y2={ALTURA_GRAFICO} className="stroke-foreground/50" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
                    </svg>
                    <div className="type-caption mt-1 flex justify-between tabular-nums text-muted-foreground">
                        <span>0 km</span>
                        <span>{formatarDistancia(rota.distanciaM)}</span>
                    </div>
                </figure>
            )}

            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={baixar} className="line-btn line-btn--sm">
                    <Download aria-hidden="true" />
                    Baixar GPX
                </button>
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${inicio[0]},${inicio[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-btn line-btn--sm"
                >
                    <MapPin aria-hidden="true" />
                    Ir até a largada
                </a>
            </div>
            <p className="type-caption text-muted-foreground">Abra o GPX no Strava, Garmin, Komoot ou Wikiloc para seguir o trajeto no relógio ou no celular.</p>
        </section>
    )
}
