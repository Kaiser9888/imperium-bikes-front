import type { PontoRota } from "@/services/tournamentService"

/** Pontos guardados por percurso: sobra detalhe para o mapa e o gráfico, e o envio fica leve. */
export const MAX_PONTOS_ROTA = 1500
/** Igual ao backend: subida menor que isso é ruído do GPS. */
const LIMIAR_SUBIDA_M = 3
const RAIO_TERRA_M = 6_371_000

/**
 * Lê um GPX (Strava, Garmin, Komoot, Wikiloc...): trilha (trkpt), rota (rtept) ou, sem elas, os pontos soltos (wpt).
 * Lança Error com mensagem em português quando o arquivo não serve.
 */
export function lerGpx(texto: string): PontoRota[] {
    const doc = new DOMParser().parseFromString(texto, "application/xml")
    if (doc.getElementsByTagName("parsererror").length > 0) throw new Error("Esse arquivo não é um GPX válido.")
    let nos = Array.from(doc.getElementsByTagName("trkpt"))
    if (nos.length < 2) nos = Array.from(doc.getElementsByTagName("rtept"))
    if (nos.length < 2) nos = Array.from(doc.getElementsByTagName("wpt"))
    const pontos: PontoRota[] = []
    for (const no of nos) {
        const lat = Number(no.getAttribute("lat"))
        const lon = Number(no.getAttribute("lon"))
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) continue
        const eleTexto = no.getElementsByTagName("ele")[0]?.textContent
        const ele = eleTexto != null && eleTexto.trim() !== "" ? Number(eleTexto) : NaN
        pontos.push([lat, lon, Number.isFinite(ele) ? ele : null])
    }
    if (pontos.length < 2) throw new Error("O arquivo não tem um percurso (trilha ou rota) com pelo menos 2 pontos.")
    return pontos
}

/** Reduz para no máximo `max` pontos mantendo início, fim e uma amostra uniforme (curvas fechadas sobram bem nesse número). */
export function simplificar(pontos: PontoRota[], max = MAX_PONTOS_ROTA): PontoRota[] {
    if (pontos.length <= max) return pontos
    const passo = (pontos.length - 1) / (max - 1)
    return Array.from({ length: max }, (_, i) => pontos[Math.round(i * passo)])
}

function haversine(a: PontoRota, b: PontoRota): number {
    const rad = Math.PI / 180
    const dLat = (b[0] - a[0]) * rad
    const dLon = (b[1] - a[1]) * rad
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2
    return 2 * RAIO_TERRA_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Distância acumulada até cada ponto, em metros (para o eixo do gráfico). */
export function distanciasAcumuladas(pontos: PontoRota[]): number[] {
    const acc = [0]
    for (let i = 1; i < pontos.length; i++) acc.push(acc[i - 1] + haversine(pontos[i - 1], pontos[i]))
    return acc
}

/** Subida acumulada com a mesma histerese do backend; null sem altitude. */
export function subida(pontos: PontoRota[]): number | null {
    let ref: number | null = null
    let total = 0
    for (const [, , alt] of pontos) {
        if (alt == null) continue
        if (ref == null) ref = alt
        else if (alt - ref >= LIMIAR_SUBIDA_M) {
            total += alt - ref
            ref = alt
        } else if (ref - alt >= LIMIAR_SUBIDA_M) ref = alt
    }
    return ref == null ? null : Math.round(total)
}

export function formatarDistancia(metros: number): string {
    return metros >= 1000 ? `${(metros / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km` : `${Math.round(metros)} m`
}

const escapar = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!)

/** GPX para o atleta baixar e abrir no relógio/app (Strava, Garmin, Wikiloc). */
export function gerarGpx(nome: string, pontos: PontoRota[]): string {
    const linhas = pontos.map(([lat, lon, alt]) => `      <trkpt lat="${lat}" lon="${lon}">${alt != null ? `<ele>${alt}</ele>` : ""}</trkpt>`)
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Imperium Bikes" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${escapar(nome)}</name>
    <trkseg>
${linhas.join("\n")}
    </trkseg>
  </trk>
</gpx>
`
}
