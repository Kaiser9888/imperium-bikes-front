import { API_BASE_URL } from "@/lib/api-config"

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, { signal, cache: "no-store" })
    if (!response.ok) throw new Error(`Busca indisponível (${response.status})`)
    return response.json() as Promise<T>
}

export function searchList(payload: unknown): unknown[] {
    if (Array.isArray(payload)) return payload
    if (payload && typeof payload === "object") {
        const result = payload as Record<string, unknown>
        for (const key of ["content", "results", "items", "hits", "data"]) {
            if (Array.isArray(result[key])) return result[key]
        }
    }
    return []
}

export function searchProducts(query: string, signal?: AbortSignal) {
    return getJson<unknown[]>(`/api/search/products?q=${encodeURIComponent(query)}`, signal)
}

export function searchVideos(query: string) {
    return getJson<unknown[]>(`/api/videos/search?query=${encodeURIComponent(query)}`)
}

