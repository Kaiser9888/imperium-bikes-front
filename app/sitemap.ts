import type { MetadataRoute } from "next"
import { esportes, modalidades } from "@/lib/esportes"
import { buscarPublico, SITE_URL } from "@/lib/seo"

// Refeito no máximo a cada hora: anúncio novo entra no Google sem deploy
export const revalidate = 3600

type Pagina<T> = { content: T[]; last: boolean }
type ComId = { id: string; createdAt?: string }

const MAX_PAGINAS = 20
const TAMANHO = 50

/** Junta as páginas da listagem pública (até 1.000 itens); backend dormindo = lista vazia. */
async function todos(path: string): Promise<ComId[]> {
    const itens: ComId[] = []
    for (let page = 0; page < MAX_PAGINAS; page++) {
        const sep = path.includes("?") ? "&" : "?"
        const dados = await buscarPublico<Pagina<ComId>>(`${path}${sep}page=${page}&size=${TAMANHO}`, revalidate)
        if (!dados?.content?.length) break
        itens.push(...dados.content)
        if (dados.last) break
    }
    return itens
}

function data(iso?: string): Date | undefined {
    const d = iso ? new Date(iso) : undefined
    return d && !Number.isNaN(d.getTime()) ? d : undefined
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const fixas: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`, priority: 1, changeFrequency: "daily" },
        { url: `${SITE_URL}/buscar`, priority: 0.9, changeFrequency: "daily" },
        { url: `${SITE_URL}/torneios`, priority: 0.8, changeFrequency: "daily" },
        { url: `${SITE_URL}/videos`, priority: 0.8, changeFrequency: "daily" },
        { url: `${SITE_URL}/modalidades`, priority: 0.6 },
        { url: `${SITE_URL}/ajuda`, priority: 0.4 },
        { url: `${SITE_URL}/ajuda/envio-de-bike`, priority: 0.4 },
        { url: `${SITE_URL}/seguranca/bike-roubada`, priority: 0.4 },
        { url: `${SITE_URL}/termos`, priority: 0.2 },
        { url: `${SITE_URL}/privacidade`, priority: 0.2 },
        { url: `${SITE_URL}/reembolso`, priority: 0.2 },
        ...modalidades.map(({ slug }) => ({ url: `${SITE_URL}/modalidades/${slug}`, priority: 0.6 })),
        ...esportes.map(({ slug }) => ({ url: `${SITE_URL}/esportes/${slug}`, priority: 0.5 })),
    ]

    const [produtos, abertos, andamento, encerrados, videos] = await Promise.all([
        todos("/api/products"),
        todos("/api/tournaments"),
        todos("/api/tournaments?status=active"),
        todos("/api/tournaments?status=finished"),
        todos("/api/videos?isShort=false"),
    ])
    const eventos = [...new Map([...abertos, ...andamento, ...encerrados].map((e) => [e.id, e])).values()]

    return [
        ...fixas,
        ...produtos.map((p) => ({ url: `${SITE_URL}/produtos/${p.id}`, lastModified: data(p.createdAt), priority: 0.7 })),
        ...eventos.map((e) => ({ url: `${SITE_URL}/torneios/${e.id}`, lastModified: data(e.createdAt), priority: 0.6 })),
        ...videos.map((v) => ({ url: `${SITE_URL}/videos/watch/${v.id}`, lastModified: data(v.createdAt), priority: 0.5 })),
    ]
}
