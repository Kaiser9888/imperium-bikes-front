"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Heart, Trash2 } from "lucide-react"
import { ProductImage } from "@/components/marketplace/ProductImage"
import { FAVORITES_UPDATED_EVENT, readFavorites, removeFavorite, type FavoriteProduct } from "@/lib/favorites"
import { formatarPreco } from "@/lib/format"


export default function FavoritosPage() {
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

  return <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar ao início</Link>
    <h1 className="mt-4 flex items-center gap-2 font-heading text-3xl font-bold"><Heart className="size-7 text-primary" />Meus favoritos</h1>
    {products.length === 0 ? <section className="mt-8 rounded-xl border border-border bg-card p-10 text-center"><p className="font-semibold">Você ainda não salvou produtos.</p><Link href="/produtos" className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Explorar produtos</Link></section> :
      <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{products.map((product) => <li key={product.id} className="overflow-hidden rounded-xl border border-border bg-card">
        <Link href={`/produtos/${product.id}`}><div className="aspect-square bg-secondary"><ProductImage src={product.images.find((image) => image.isMain)?.url ?? product.images[0]?.url} alt={product.title} className="size-full object-cover" /></div><div className="p-3"><h2 className="line-clamp-2 text-sm font-semibold">{product.title}</h2><p className="mt-2 font-heading font-bold">{formatarPreco(product.price)}</p></div></Link>
        <button type="button" onClick={() => removeFavorite(product.id)} className="flex w-full items-center justify-center gap-2 border-t border-border py-2 text-xs text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" />Remover</button>
      </li>)}</ul>}
    <p className="mt-5 text-xs text-muted-foreground">Favoritos salvos neste navegador.</p>
  </main>
}
