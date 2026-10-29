"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { ShoppingCart, Trash2 } from "lucide-react"

import { PageHeading } from "@/components/layout/page-heading"
import { ProductImage } from "@/components/marketplace/ProductImage"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { CART_UPDATED_EVENT, cartItemCount, readCart, removeFromCart, type CartItem } from "@/lib/cart"
import { formatarPreco } from "@/lib/format"

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const refresh = useCallback(() => setItems(readCart()), [])

  useEffect(() => {
    queueMicrotask(refresh)
    window.addEventListener(CART_UPDATED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [refresh])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function comprar(item: CartItem) {
    if (!isLoaded) return
    const destino = `/checkout?productId=${encodeURIComponent(item.id)}`
    router.push(isSignedIn ? destino : `/sign-in?redirect_url=${encodeURIComponent(destino)}`)
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 pt-3 sm:px-6 lg:pt-6">
      <PageHeading title="Carrinho" back={{ href: "/", label: "Continuar comprando" }} />

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Os itens que você adicionar pelo anúncio aparecem aqui."
          action={
            <Button asChild>
              <Link href="/buscar">Ver anúncios</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 sm:p-4">
                <Link href={`/produtos/${item.id}`} className="shrink-0">
                  <ProductImage
                    src={item.images?.find((image) => image.isMain)?.url ?? item.images?.[0]?.url}
                    alt={item.title}
                    className="size-20 rounded-xl object-cover sm:size-24"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/produtos/${item.id}`} className="type-label line-clamp-2 text-foreground hover:text-primary">
                      {item.title}
                    </Link>
                    <p className="type-body-small mt-0.5 text-muted-foreground">
                      {item.quantity > 1 ? `${item.quantity} × ` : ""}
                      <span className="font-semibold text-foreground">{formatarPreco(item.price)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => comprar(item)}>
                      Comprar
                    </Button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remover ${item.title}`}
                      title="Remover"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted/50 px-4 py-3">
            <span className="type-body-small text-muted-foreground">
              {cartItemCount(items)} {cartItemCount(items) === 1 ? "item" : "itens"}
            </span>
            <strong className="type-h3 tabular-nums text-foreground">{formatarPreco(total)}</strong>
          </div>
          <p className="type-caption -mt-3 text-muted-foreground">Cada item é pago à parte, com o frete do vendedor dele.</p>
        </>
      )}
    </main>
  )
}
