import type { Metadata } from "next"
import { API_BASE_URL } from "@/lib/api-config"
import { empresa } from "@/lib/empresa"

/** Endereço oficial (com www): base dos links da prévia, do sitemap e do canonical. */
export const SITE_URL = empresa.site

/**
 * Busca no backend para montar a prévia do link (WhatsApp, Google). Com o backend
 * dormindo, desiste rápido e a página sai com a prévia padrão em vez de travar.
 */
export async function buscarPublico<T>(path: string, revalidarSegundos = 600): Promise<T | null> {
    try {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(6000),
            next: { revalidate: revalidarSegundos },
        })
        return res.ok ? ((await res.json()) as T) : null
    } catch {
        return null
    }
}

/** Imagem só serve para a prévia com endereço absoluto e público (data URL não funciona). */
export function imagemAbsoluta(url?: string | null): string | undefined {
    if (!url) return undefined
    if (/^https?:\/\//i.test(url)) return url
    if (url.startsWith("/api/files/")) return `${API_BASE_URL}${url}`
    return undefined
}

/** Corta a descrição no tamanho que o Google e o WhatsApp mostram. */
export function resumo(texto?: string | null, max = 160): string | undefined {
    const limpo = texto?.replace(/\s+/g, " ").trim()
    if (!limpo) return undefined
    return limpo.length > max ? `${limpo.slice(0, max - 1).trimEnd()}…` : limpo
}

/** Título, descrição, imagem e endereço da prévia de uma página de conteúdo. */
export function previa({
    titulo,
    descricao,
    imagem,
    caminho,
    tipo = "website",
}: {
    titulo: string
    descricao?: string
    imagem?: string
    caminho: string
    tipo?: "website" | "article" | "video.other"
}): Metadata {
    const imagens = imagem ? [{ url: imagem }] : undefined
    return {
        title: `${titulo} | Imperium Bikes`,
        description: descricao,
        alternates: { canonical: caminho },
        openGraph: { title: titulo, description: descricao, url: caminho, type: tipo, siteName: "Imperium Bikes", locale: "pt_BR", images: imagens },
        twitter: { card: imagem ? "summary_large_image" : "summary", title: titulo, description: descricao, images: imagem ? [imagem] : undefined },
    }
}
