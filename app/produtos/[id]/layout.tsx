import type { Metadata } from "next"
import { API_BASE_URL } from "@/lib/api-config"
import { formatarPreco } from "@/lib/format"
import { buscarPublico, previa, resumo } from "@/lib/seo"

type Produto = {
    title: string
    description?: string | null
    price: number
    city?: string | null
    state?: string | null
    status?: string
    images?: unknown[] | null
}

type Props = { params: Promise<{ id: string }>; children: React.ReactNode }

/** Prévia do anúncio ao compartilhar o link: foto, título, preço e cidade. */
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
    const { id } = await params
    const p = await buscarPublico<Produto>(`/api/products/${encodeURIComponent(id)}?contarVisita=false`)
    if (!p) return { title: "Anúncio | Imperium Bikes" }

    const local = [p.city, p.state].filter(Boolean).join("/")
    const linha = [formatarPreco(Number(p.price)), local].filter(Boolean).join(" · ")
    return {
        ...previa({
            titulo: p.title,
            descricao: [linha, resumo(p.description, 120)].filter(Boolean).join(" — "),
            imagem: p.images?.length ? `${API_BASE_URL}/api/products/${encodeURIComponent(id)}/foto` : undefined,
            caminho: `/produtos/${id}`,
        }),
        // Vendido ou fora do ar não deve aparecer no Google
        robots: p.status && p.status !== "ACTIVE" ? { index: false } : undefined,
    }
}

export default function ProdutoLayout({ children }: Props) {
    return children
}
