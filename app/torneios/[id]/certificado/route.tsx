import { ImageResponse } from "next/og"

import { API_BASE_URL } from "@/lib/api-config"
import { empresa } from "@/lib/empresa"
import { marcaDe, modoDaApi } from "@/lib/placar"

type Evento = { name?: string; city?: string | null; state?: string | null; startDate?: string | null; scoringMode?: string; status?: string }
type Inscrito = { id?: string; category?: string | null; userName?: string; rankPosition?: number | null; finalTimeMs?: number | null; points?: number | null }

const MEDALHA: Record<number, string> = { 1: "#E8B931", 2: "#C0C4CC", 3: "#C7834A" }

async function buscar<T>(path: string): Promise<T | null> {
    try {
        const res = await fetch(`${API_BASE_URL}${path}`, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(9000) })
        return res.ok ? ((await res.json()) as T) : null
    } catch {
        return null
    }
}

function dataPorExtenso(iso?: string | null): string {
    if (!iso) return ""
    const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
}

/**
 * Certificado de participação como imagem 1080×1350 (post do Instagram): nome, evento, categoria,
 * colocação e marca. Só sai depois que o evento é encerrado. ?p=<id da inscrição>
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const participanteId = new URL(request.url).searchParams.get("p")?.trim()
    if (!participanteId) return new Response("Falta dizer de quem é o certificado.", { status: 400 })

    const [evento, inscritos] = await Promise.all([
        buscar<Evento>(`/api/tournaments/${encodeURIComponent(id)}`),
        buscar<Inscrito[]>(`/api/tournaments/${encodeURIComponent(id)}/participants/public`),
    ])
    if (!evento || !Array.isArray(inscritos)) {
        return new Response("Não foi possível montar o certificado agora. Tente de novo em alguns segundos.", { status: 503 })
    }
    if (evento.status !== "FINISHED") {
        return new Response("O certificado sai quando o organizador encerra o evento.", { status: 404 })
    }
    const pessoa = inscritos.find((i) => i.id === participanteId)
    if (!pessoa) return new Response("Inscrição não encontrada neste evento.", { status: 404 })

    const modo = modoDaApi(evento.scoringMode)
    const posicao = pessoa.rankPosition ?? null
    const marca = marcaDe({ tempoMs: pessoa.finalTimeMs ?? null, pontos: pessoa.points ?? null }, modo)
    const destaque = posicao && MEDALHA[posicao] ? MEDALHA[posicao] : "#E8B931"
    const categoria = pessoa.category && pessoa.category !== "Geral" ? pessoa.category : null
    const local = [evento.city, evento.state].filter(Boolean).join("/")
    const nome = (pessoa.userName ?? "Participante").slice(0, 40)

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
                    padding: 56,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        alignItems: "center",
                        border: `4px solid ${destaque}`,
                        borderRadius: 24,
                        padding: "72px 56px 48px",
                        textAlign: "center",
                    }}
                >
                    <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 10, color: destaque }}>CERTIFICADO</div>
                    <div style={{ display: "flex", marginTop: 8, fontSize: 30, letterSpacing: 4, color: "rgba(255,255,255,0.7)" }}>DE PARTICIPAÇÃO</div>

                    <div style={{ display: "flex", marginTop: 80, fontSize: 32, color: "rgba(255,255,255,0.7)" }}>Certificamos que</div>
                    <div style={{ display: "flex", marginTop: 20, fontSize: nome.length > 24 ? 64 : 80, fontWeight: 800, lineHeight: 1.05, justifyContent: "center" }}>{nome}</div>
                    <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "rgba(255,255,255,0.7)" }}>participou de</div>
                    <div style={{ display: "flex", marginTop: 16, fontSize: 48, fontWeight: 700, lineHeight: 1.15, justifyContent: "center" }}>{(evento.name ?? "Evento").slice(0, 70)}</div>
                    <div style={{ display: "flex", marginTop: 16, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>
                        {[dataPorExtenso(evento.startDate), local].filter(Boolean).join(" · ")}
                    </div>

                    <div style={{ display: "flex", flex: 1 }} />

                    {(posicao || marca || categoria) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 40, justifyContent: "center" }}>
                            {posicao && (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ display: "flex", fontSize: 112, fontWeight: 900, color: destaque, lineHeight: 1 }}>{`${posicao}º`}</div>
                                    <div style={{ display: "flex", marginTop: 8, fontSize: 26, letterSpacing: 4, color: "rgba(255,255,255,0.7)" }}>LUGAR</div>
                                </div>
                            )}
                            {(marca || categoria) && (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: posicao ? "flex-start" : "center" }}>
                                    {marca && <div style={{ display: "flex", fontSize: 56, fontWeight: 800 }}>{marca}</div>}
                                    {categoria && <div style={{ display: "flex", marginTop: 8, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>{categoria.slice(0, 40)}</div>}
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 56, fontSize: 26, color: "rgba(255,255,255,0.75)" }}>
                        <div style={{ display: "flex", fontWeight: 800, letterSpacing: 4, color: "white" }}>IMPERIUM BIKES</div>
                        <div style={{ display: "flex" }}>{empresa.site.replace(/^https?:\/\//, "")}</div>
                    </div>
                </div>
            </div>
        ),
        {
            width: 1080,
            height: 1350,
            headers: {
                "Content-Disposition": `inline; filename="certificado-${participanteId}.png"`,
                // Depois de encerrado o resultado não muda
                "Cache-Control": "public, max-age=3600",
            },
        },
    )
}
