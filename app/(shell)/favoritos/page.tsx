"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { Heart, Trash2 } from "lucide-react"

import { PageHeading } from "@/components/layout/page-heading"
import { ProductImage } from "@/components/marketplace/ProductImage"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { FAVORITES_UPDATED_EVENT, readFavorites, removeFavorite, sincronizarFavoritos, type FavoriteProduct } from "@/lib/favorites"
import { formatarPreco } from "@/lib/format"

export default function FavoritosPage() {
  const { isSignedIn } = useAuth()
  const [products, setProducts] = useState<FavoriteProduct[]>([])
  const refresh = useCallback(() => setProducts(readFavorites()), [])

  useEffect(() => {
    window.requestAnimationFrame(refresh)
    window.addEventListener(FAVORITES_UPDATED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [refresh])

  // Logado: traz os favoritos salvos em outros aparelhos
  useEffect(() => {
    if (isSignedIn) void sincronizarFavoritos()
  }, [isSignedIn])

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-3 sm:px-6 lg:px-8 lg:pt-6">
      <PageHeading
        title="Favoritos"
        description={isSignedIn === false ? "Entre na conta para ver seus favoritos em qualquer aparelho." : undefined}
        back={{ href: "/", label: "Início" }}
      />

      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nenhum favorito ainda"
          description="Toque no coração de um anúncio para guardar aqui."
          action={
            <Button asChild>
              <Link href="/buscar">Ver anúncios</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id} className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary/40">
              <Link href={`/produtos/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-secondary">
                  <ProductImage
                    src={product.images.find((image) => image.isMain)?.url ?? product.images[0]?.url}
                    alt={product.title}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h2 className="type-body-small line-clamp-2 font-semibold text-foreground">{product.title}</h2>
                  <p className="type-label mt-1.5 tabular-nums text-foreground">{formatarPreco(product.price)}</p>
                  {(product.city || product.state) && (
                    <p className="type-caption mt-0.5 truncate text-muted-foreground">{[product.city, product.state].filter(Boolean).join("/")}</p>
                  )}
                </div>
              </Link>
              <button
                type="button"
                onClick={() => removeFavorite(product.id)}
                className="absolute right-2 top-2 grid size-9 cursor-pointer place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-destructive"
                aria-label={`Remover ${product.title} dos favoritos`}
                title="Remover"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
