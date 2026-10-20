import { API_BASE_URL } from "@/lib/api-config"
import { esportes, modalidades } from "@/lib/esportes"

/** Campos filtráveis da busca (o backend devolve a contagem de cada valor). */
export const FILTROS = ["modality", "sport", "productType", "brand", "condition", "state"] as const
export type Filtro = (typeof FILTROS)[number]

export const ORDENS = [
    { value: "relevance", label: "Mais relevantes" },
    { value: "recent", label: "Mais recentes" },
    { value: "price_asc", label: "Menor preço" },
    { value: "price_desc", label: "Maior preço" },
] as const

export type BuscaParams = {
    q: string
    filtros: Partial<Record<Filtro, string>>
    minPrice?: string
    maxPrice?: string
    sort: string
    page: number
}

export type ResultadoProduto = {
    id: string
    title: string
    price: number
    originalPrice?: number | null
    brand?: string | null
    image?: string | null
    city?: string | null
    state?: string | null
}

export type BuscaResultado = {
    hits: ResultadoProduto[]
    total: number
    totalPages: number
    /** campo -> valor -> quantidade. Vazio quando o backend usou o banco em vez do Meilisearch. */
    facets: Partial<Record<Filtro, Record<string, number>>>
}

/** Texto amigável de cada valor de filtro. */
export function rotuloDoValor(campo: Filtro, valor: string): string {
    if (campo === "modality") return modalidades.find((m) => m.slug === valor)?.label ?? capitalizar(valor)
    if (campo === "sport") return esportes.find((e) => e.slug === valor)?.nome ?? capitalizar(valor)
    if (campo === "condition") return valor === "NEW" ? "Novo" : valor === "USED" ? "Usado" : valor
    return valor
}

function capitalizar(valor: string) {
    return valor.charAt(0).toUpperCase() + valor.slice(1)
}

/** Aceita o documento do Meilisearch e o ProductResponse do plano B (banco). */
function normalizar(item: Record<string, unknown>): ResultadoProduto | null {
    if (typeof item.id !== "string" && typeof item.id !== "number") return null
    const imagens = Array.isArray(item.images) ? (item.images as { url?: string; isMain?: boolean; displayOrder?: number }[]) : []
    const capa =
        typeof item.imageUrl === "string"
            ? item.imageUrl
            : [...imagens].sort((a, b) => Number(b.isMain) - Number(a.isMain) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0))[0]?.url
    return {
        id: String(item.id),
        title: typeof item.title === "string" ? item.title : "Produto",
        price: Number(item.price ?? 0),
        originalPrice: item.originalPrice == null ? null : Number(item.originalPrice),
        brand: typeof item.brand === "string" ? item.brand : null,
        image: capa ?? null,
        city: typeof item.city === "string" ? item.city : null,
        state: typeof item.state === "string" ? item.state : null,
    }
}

export const TAMANHO_PAGINA = 24

export async function buscarProdutos(params: BuscaParams, signal?: AbortSignal): Promise<BuscaResultado> {
    const query = new URLSearchParams({ q: params.q, sort: params.sort, page: String(params.page), size: String(TAMANHO_PAGINA) })
    for (const [campo, valor] of Object.entries(params.filtros)) if (valor) query.set(campo, valor)
    if (params.minPrice) query.set("minPrice", params.minPrice)
    if (params.maxPrice) query.set("maxPrice", params.maxPrice)

    const response = await fetch(`${API_BASE_URL}/api/search/products?${query}`, { signal, cache: "no-store" })
    if (!response.ok) throw new Error(`A busca não respondeu (erro ${response.status}). Tente novamente.`)
    const data = (await response.json()) as { hits?: unknown[]; total?: number; totalPages?: number; facets?: BuscaResultado["facets"] }
    return {
        hits: (data.hits ?? []).map((h) => normalizar(h as Record<string, unknown>)).filter((h): h is ResultadoProduto => h !== null),
        total: Number(data.total ?? 0),
        totalPages: Number(data.totalPages ?? 0),
        facets: data.facets ?? {},
    }
}
