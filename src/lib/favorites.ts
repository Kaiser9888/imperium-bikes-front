import api from "@/lib/api"
import type { ProductResponse } from "@/types/publish/product"

// O navegador guarda uma cópia para os corações aparecerem na hora; logado, a conta
// é a fonte da verdade (favoritos aparecem em qualquer aparelho).
const STORAGE_KEY = "imperium-favorites"
export const FAVORITES_UPDATED_EVENT = "imperium-favorites-updated"

export type FavoriteProduct = Pick<ProductResponse, "id" | "title" | "price" | "images"> &
  Partial<Pick<ProductResponse, "category" | "condition" | "city" | "state" | "seller">>

export function readFavorites(): FavoriteProduct[] {
  if (typeof window === "undefined") return []
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    if (!Array.isArray(value)) return []
    return value.filter((item): item is FavoriteProduct => Boolean(
      item && typeof item === "object" &&
      typeof item.id === "string" && typeof item.title === "string" &&
      typeof item.price === "number" && Array.isArray(item.images),
    ))
  } catch {
    return []
  }
}

function saveFavorites(items: FavoriteProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // armazenamento bloqueado: segue só com a conta
  }
  window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT))
}

function logado(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { Clerk?: { session?: unknown } }).Clerk?.session)
}

export function isFavoriteProduct(id: string): boolean {
  return readFavorites().some((item) => item.id === id)
}

export function toggleFavorite(product: FavoriteProduct): boolean {
  const items = readFavorites()
  const exists = items.some((item) => item.id === product.id)
  saveFavorites(exists ? items.filter((item) => item.id !== product.id) : [product, ...items])
  if (logado()) {
    const pedido = exists
      ? api.delete(`/api/favorites/products/${product.id}`)
      : api.put(`/api/favorites/products/${product.id}`)
    // Recusado pela conta (ex.: o próprio anúncio): desfaz no aparelho também
    pedido.catch(() => saveFavorites(exists ? [product, ...readFavorites()] : readFavorites().filter((item) => item.id !== product.id)))
  }
  return !exists
}

export function removeFavorite(id: string) {
  saveFavorites(readFavorites().filter((item) => item.id !== id))
  if (logado()) api.delete(`/api/favorites/products/${id}`).catch(() => {})
}

let sincronizando: Promise<void> | null = null

/** Logado: sobe os favoritos do aparelho para a conta e traz os da conta para o aparelho. */
export function sincronizarFavoritos(): Promise<void> {
  if (!logado()) return Promise.resolve()
  if (sincronizando) return sincronizando
  sincronizando = (async () => {
    const { data } = await api.get<{ content: FavoriteProduct[] }>("/api/favorites", { params: { size: 100 } })
    const daConta = Array.isArray(data?.content) ? data.content : []
    const locais = readFavorites().filter((item) => !daConta.some((p) => p.id === item.id))
    const subiram = await Promise.allSettled(locais.map((item) => api.put(`/api/favorites/products/${item.id}`)))
    const aceitos = locais.filter((_, i) => subiram[i].status === "fulfilled")
    saveFavorites([...aceitos, ...daConta.map((p) => ({ ...p, price: Number(p.price) }))])
  })()
    .catch(() => {
      // backend dormindo: fica com a cópia do aparelho
    })
    .finally(() => {
      sincronizando = null
    })
  return sincronizando
}
