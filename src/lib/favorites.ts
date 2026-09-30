import type { ProductResponse } from "@/types/publish/product"

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT))
}

export function isFavoriteProduct(id: string): boolean {
  return readFavorites().some((item) => item.id === id)
}

export function toggleFavorite(product: FavoriteProduct): boolean {
  const items = readFavorites()
  const exists = items.some((item) => item.id === product.id)
  saveFavorites(exists ? items.filter((item) => item.id !== product.id) : [product, ...items])
  return !exists
}

export function removeFavorite(id: string) {
  saveFavorites(readFavorites().filter((item) => item.id !== id))
}
