import { ImageResponse } from "next/og"

import { API_BASE_URL } from "@/lib/api-config"
import { empresa } from "@/lib/empresa"
import { marcaDe, modoDaApi } from "@/lib/placar"

type Evento = { name?: string; city?: string | null; state?: string | null; startDate?: string | null; scoringMode?: string }
type Inscrito = { category?: string | null; userName?: string; userAvatarUrl?: string | null; rankPosition?: number | null; finalTimeMs?: number | null; points?: number | null }

const MEDALHA: Record<number, { cor: string; degrau: string; altura: number; foto: number }> = {
    1: { cor: "#E8B931", degrau: "linear-gradient(#E8B931, #B8860B)", altura: 400, foto: 270 },
    2: { cor: "#C0C4CC", degrau: "linear-gradient(#D7DAE0, #8E939C)", altura: 290, foto: 210 },
    3: { cor: "#C7834A", degrau: "linear-gradient(#D9955C, #8A5528)", altura: 210, foto: 210 },
}

async function buscar<T>(path: string): Promise<T | null> {
    try {
        const res = await fetch(`${API_BASE_URL}${path}`, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(9000) })
        return res.ok ? ((await res.json()) as T) : null
    } catch {
        return null
    }
}

/** A imagem precisa estar embutida: o gerador só entende PNG e JPEG. Sem isso, fica a inicial do nome. */
async function fotoEmbutida(url?: string | null): Promise<string | null> {
    if (!url) return null
    const absoluta = url.startsWith("/api/files/") ? `${API_BASE_URL}${url}` : url
    if (!/^https?:\/\//.test(absoluta)) return null
    try {
        const res = await fetch(absoluta, { headers: { Accept: "image/png,image/jpeg" }, signal: AbortSignal.timeout(5000) })
        const tipo = res.headers.get("content-type") ?? ""
        if (!res.ok || !/^image\/(png|jpe?g)/.test(tipo)) return null
        return `data:${tipo};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`
    } catch {
        return null
    }
}

function dataCurta(iso?: string | null): string {
    if (!iso) return ""
    const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
}

/** Pódio do evento como imagem 1080×1350 (post do Instagram), para baixar e compartilhar. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // Evento com categorias: um pódio por categoria (?categoria=Elite Masculino)
    const categoria = new URL(request.url).searchParams.get("categoria")?.trim() || null
    const [evento, inscritos] = await Promise.all([
        buscar<Evento>(`/api/tournaments/${encodeURIComponent(id)}`),
        buscar<Inscrito[]>(`/api/tournaments/${encodeURIComponent(id)}/participants/public`),
    ])
    if (!evento || !Array.isArray(inscritos)) {
        return new Response("Não foi possível montar o pódio agora. Tente de novo em alguns segundos.", { status: 503 })
    }

    const modo = modoDaApi(evento.scoringMode)
    const daCategoria = categoria ? inscritos.filter((i) => (i.category ?? "").toLowerCase() === categoria.toLowerCase()) : inscritos
    const lugares = await Promise.all(
        [2, 1, 3].map(async (pos) => {
            const empatados = daCategoria.filter((i) => i.rankPosition === pos)
            const primeiro = empatados[0]
            return {
                pos,
                nome: primeiro?.userName ?? null,
                extra: empatados.length - 1,
                marca: primeiro ? marcaDe({ tempoMs: primeiro.finalTimeMs ?? null, pontos: primeiro.points ?? null }, modo) : null,
                foto: await fotoEmbutida(primeiro?.userAvatarUrl),
            }
        }),
    )
    if (lugares.every((l) => !l.nome)) {
        return new Response("Este evento ainda não tem resultado.", { status: 404 })
    }

    const linha = [dataCurta(evento.startDate), [evento.city, evento.state].filter(Boolean).join("/")].filter(Boolean).join(" · ")

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "linear-gradient(160deg, #1B2333 0%, #0E121A 70%)",
                    color: "white",
                    padding: "72px 64px 56px",
                }}
            >
                <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: 8, color: "#E8B931" }}>{categoria ? `PÓDIO · ${categoria.toUpperCase().slice(0, 40)}` : "PÓDIO"}</div>
                <div style={{ display: "flex", marginTop: 16, fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>{(evento.name ?? "Evento").slice(0, 70)}</div>
                {linha && <div style={{ display: "flex", marginTop: 16, fontSize: 32, color: "rgba(255,255,255,0.7)" }}>{linha}</div>}

                <div style={{ display: "flex", flex: 1, alignItems: "flex-end", gap: 24 }}>
                    {lugares.map((l) => {
                        const m = MEDALHA[l.pos]
                        return (
                            <div key={l.pos} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                                {l.nome && (
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24, width: "100%" }}>
                                        {l.foto ? (
                                            // eslint-disable-next-line @next/next/no-img-element -- imagem gerada no servidor (next/og)
                                            <img src={l.foto} alt="" width={m.foto} height={m.foto} style={{ borderRadius: 9999, border: `8px solid ${m.cor}`, objectFit: "cover" }} />
                                        ) : (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    width: m.foto,
                                                    height: m.foto,
                                                    borderRadius: 9999,
                                                    border: `8px solid ${m.cor}`,
                                                    background: "#2A3346",
                                                    fontSize: m.foto / 2.4,
                                                    fontWeight: 800,
                                                }}
                                            >
                                                {l.nome.slice(0, 1).toUpperCase()}
                                            </div>
                                        )}
                                        <div style={{ display: "flex", marginTop: 20, fontSize: l.pos === 1 ? 40 : 32, fontWeight: 700, textAlign: "center", justifyContent: "center" }}>
                                            {l.nome.slice(0, 22)}
                                            {l.extra > 0 ? ` +${l.extra}` : ""}
                                        </div>
                                        {l.marca && <div style={{ display: "flex", marginTop: 8, fontSize: 30, fontWeight: 700, color: m.cor }}>{l.marca}</div>}
                                    </div>
                                )}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "100%",
                                        height: m.altura,
                                        background: m.degrau,
                                        borderRadius: "16px 16px 0 0",
                                        fontSize: 88,
                                        fontWeight: 900,
                                        color: "rgba(0,0,0,0.65)",
                                    }}
                                >
                                    {`${l.pos}º`}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40, fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
                    <div style={{ display: "flex", fontWeight: 800, letterSpacing: 4, color: "white" }}>IMPERIUM BIKES</div>
                    <div style={{ display: "flex" }}>{empresa.site.replace(/^https?:\/\//, "")}</div>
                </div>
            </div>
        ),
        {
            width: 1080,
            height: 1350,
            headers: {
                "Content-Disposition": `inline; filename="podio-${id}.png"`,
                // O pódio muda durante a prova: guarda pouco
                "Cache-Control": "public, max-age=60",
            },
        },
    )
}
