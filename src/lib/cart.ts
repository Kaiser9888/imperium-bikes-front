import type { ProductResponse } from "@/types/publish/product"

export type CartItem = Pick<ProductResponse, "id" | "title" | "price" | "images" | "seller"> & {
  quantity: number
}

const STORAGE_KEY = "imperium-marketplace-cart"
export const CART_UPDATED_EVENT = "imperium-cart-updated"
/** Ids sendo pagos agora: a página de sucesso tira só eles do carrinho. */
export const CHECKOUT_ITENS_KEY = "imperium:checkout-itens"

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false
  const item = value as Partial<CartItem>
  return typeof item.id === "string" && typeof item.title === "string" &&
    typeof item.price === "number" && typeof item.quantity === "number" &&
    Array.isArray(item.images) && typeof item.seller === "object" && item.seller !== null
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

export function addToCart(product: ProductResponse) {
  const items = readCart()
  // A compra é sempre de 1 unidade: tocar de novo não soma quantidade que o checkout não cobraria
  if (items.some((item) => item.id === product.id)) return

  writeCart([...items, {
    id: product.id,
    title: product.title,
    price: product.price,
    images: product.images,
    seller: product.seller,
    quantity: 1,
  }])
}

export function removeFromCart(productId: string) {
  writeCart(readCart().filter((item) => item.id !== productId))
}

export function cartItemCount(items = readCart()) {
  return items.reduce((count, item) => count + item.quantity, 0)
}

/** Pagamento confirmado: sai do carrinho o que acabou de ser comprado (o resto continua). */
export function limparComprados() {
  try {
    const ids: unknown = JSON.parse(sessionStorage.getItem(CHECKOUT_ITENS_KEY) ?? "[]")
    sessionStorage.removeItem(CHECKOUT_ITENS_KEY)
    if (Array.isArray(ids) && ids.length > 0) writeCart(readCart().filter((item) => !ids.includes(item.id)))
  } catch {
    // sem armazenamento: o carrinho fica como estava
  }
}
