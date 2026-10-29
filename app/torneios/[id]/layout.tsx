import type { Metadata } from "next"
import { API_BASE_URL } from "@/lib/api-config"
import { formatarPreco } from "@/lib/format"
import { buscarPublico, previa, resumo } from "@/lib/seo"

type Evento = {
    name: string
    description?: string | null
    city?: string | null
    state?: string | null
    startDate?: string | null
    registrationFee?: number | null
    coverImageUrl?: string | null
    status?: string
}

type Props = { params: Promise<{ id: string }>; children: React.ReactNode }

function dataCurta(iso?: string | null): string | undefined {
    if (!iso) return undefined
    const d = new Date(`${iso.slice(0, 10)}T12:00:00`)
    return Number.isNaN(d.getTime()) ? undefined : d.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })
}

/** Prévia do evento ao compartilhar o link: capa, nome, data, cidade e inscrição. */
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
    const { id } = await params
    const e = await buscarPublico<Evento>(`/api/tournaments/${encodeURIComponent(id)}`)
    if (!e) return { title: "Evento | Imperium Bikes" }

    const taxa = Number(e.registrationFee ?? 0)
    const linha = [
        dataCurta(e.startDate),
        [e.city, e.state].filter(Boolean).join("/"),
        taxa > 0 ? `Inscrição ${formatarPreco(taxa)}` : "Inscrição grátis",
    ].filter(Boolean).join(" · ")

    return {
        ...previa({
            titulo: e.name,
            descricao: [linha, resumo(e.description, 120)].filter(Boolean).join(" — "),
            imagem: e.coverImageUrl ? `${API_BASE_URL}/api/tournaments/${encodeURIComponent(id)}/capa` : undefined,
            caminho: `/torneios/${id}`,
        }),
        robots: e.status === "DRAFT" ? { index: false } : undefined,
    }
}

export default function EventoLayout({ children }: Props) {
    return children
}
