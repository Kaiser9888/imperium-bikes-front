/** Como o evento decide a classificação (igual ao ScoringMode do backend). */
export type ModoPontuacao = "tempo" | "pontos" | "posicao"

export const MODOS: { id: ModoPontuacao; titulo: string; texto: string }[] = [
    { id: "tempo", titulo: "Por tempo", texto: "Menor tempo vence. Corrida, XCO, downhill, enduro." },
    { id: "pontos", titulo: "Por pontos", texto: "Maior nota vence. Manobras, juízes, BMX, skate." },
    { id: "posicao", titulo: "Colocação manual", texto: "Você digita 1º, 2º, 3º no fim." },
]

export function modoDaApi(valor: unknown): ModoPontuacao {
    return valor === "TEMPO" ? "tempo" : valor === "PONTOS" ? "pontos" : "posicao"
}

export function modoParaApi(modo: ModoPontuacao): "TEMPO" | "PONTOS" | "POSICAO" {
    return modo === "tempo" ? "TEMPO" : modo === "pontos" ? "PONTOS" : "POSICAO"
}

const dois = (n: number) => String(n).padStart(2, "0")

/** 1:02:03.4 ou 02:03.45: horas só quando tem, milésimos sem zeros sobrando. */
export function formatarTempo(ms: number): string {
    const h = Math.floor(ms / 3_600_000)
    const m = Math.floor((ms % 3_600_000) / 60_000)
    const s = Math.floor((ms % 60_000) / 1000)
    const fracao = String(ms % 1000).padStart(3, "0").replace(/0+$/, "")
    const base = h > 0 ? `${h}:${dois(m)}:${dois(s)}` : `${dois(m)}:${dois(s)}`
    return fracao ? `${base}.${fracao}` : base
}

/**
 * Lê o que o organizador digitou: "45.3" (segundos), "2:15", "2:15.4", "1:02:15.123".
 * Vírgula vale como ponto. null quando não dá para entender.
 */
export function lerTempo(texto: string): number | null {
    const limpo = texto.trim().replace(",", ".")
    const m = /^(\d{1,5}(?::\d{2}){0,2})(?:\.(\d{1,3}))?$/.exec(limpo)
    if (!m) return null
    const partes = m[1].split(":").map(Number)
    if (partes.slice(1).some((p) => p > 59)) return null
    const segundos = partes.reduce((total, p) => total * 60 + p, 0)
    const ms = segundos * 1000 + Number((m[2] ?? "").padEnd(3, "0"))
    // O backend aceita até 99:59:59.999 (duas casas de hora)
    return ms > 0 && ms < 100 * 3_600_000 ? ms : null
}

/** Formato que o backend aceita: HH:MM:SS.mmm */
export function tempoParaApi(ms: number): string {
    const h = Math.floor(ms / 3_600_000)
    const m = Math.floor((ms % 3_600_000) / 60_000)
    const s = Math.floor((ms % 60_000) / 1000)
    return `${dois(h)}:${dois(m)}:${dois(s)}.${String(ms % 1000).padStart(3, "0")}`
}

export function formatarPontos(pontos: number): string {
    return pontos.toLocaleString("pt-BR", { maximumFractionDigits: 3 })
}

/** "8,75" ou "8.75"; até 3 casas. */
export function lerPontos(texto: string): number | null {
    const limpo = texto.trim().replace(",", ".")
    if (!/^\d{1,7}(\.\d{1,3})?$/.test(limpo)) return null
    return Number(limpo)
}

/** A marca de alguém, pronta para mostrar; null se ainda não tem. */
export function marcaDe(inscrito: { tempoMs: number | null; pontos: number | null }, modo: ModoPontuacao): string | null {
    if (modo === "tempo" && inscrito.tempoMs !== null) return formatarTempo(inscrito.tempoMs)
    if (modo === "pontos" && inscrito.pontos !== null) return `${formatarPontos(inscrito.pontos)} pts`
    return null
}
