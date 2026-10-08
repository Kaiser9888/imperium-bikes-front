"use client"
import { Button } from "@/components/ui/button"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Package, Search, X } from "lucide-react"
import { ProductImage } from "@/components/marketplace/ProductImage"
import { searchList, searchProducts } from "@/lib/meilisearch"
import { formatarPreco } from "@/lib/format"

type SearchProduct = {
  id: string | number
  title?: string
  nome?: string
  price?: number
  preco?: number
  category?: string
  images?: { url?: string; isMain?: boolean; displayOrder?: number }[]
  imageUrl?: string
  img?: string
  photos?: string[]
}

function parseProduct(value: unknown): SearchProduct | null {
  if (!value || typeof value !== "object") return null
  const item = value as Record<string, unknown>
  if (typeof item.id !== "string" && typeof item.id !== "number") return null
  const images = Array.isArray(item.images)
    ? item.images.filter((image): image is Record<string, unknown> => Boolean(image && typeof image === "object"))
        .map((image) => ({ url: typeof image.url === "string" ? image.url : undefined, isMain: Boolean(image.isMain), displayOrder: Number(image.displayOrder ?? 0) }))
    : undefined
  return {
    id: item.id,
    title: typeof item.title === "string" ? item.title : typeof item.nome === "string" ? item.nome : undefined,
    nome: typeof item.nome === "string" ? item.nome : undefined,
    price: typeof item.price === "number" ? item.price : undefined,
    preco: typeof item.preco === "number" ? item.preco : undefined,
    category: typeof item.category === "string" ? item.category : undefined,
    images,
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : undefined,
    img: typeof item.img === "string" ? item.img : undefined,
    photos: Array.isArray(item.photos) ? item.photos.filter((photo): photo is string => typeof photo === "string") : undefined,
  }
}

function BuscarPageContent() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [products, setProducts] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    try {
      const stored = JSON.parse(localStorage.getItem("imperium-product-search-history") ?? "[]")
      if (Array.isArray(stored)) window.requestAnimationFrame(() => setHistory(stored.filter((item): item is string => typeof item === "string").slice(0, 10)))
    } catch {
      localStorage.removeItem("imperium-product-search-history")
    }
  }, [])

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) return

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const results = await searchProducts(term, controller.signal)
        if (!controller.signal.aborted) setProducts(searchList(results).map(parseProduct).filter((item): item is SearchProduct => item !== null))
      } catch (cause) {
        if (!controller.signal.aborted) {
          setProducts([])
          setError(cause instanceof Error ? cause.message : "A busca está indisponível. Tente novamente.")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 300)

    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query])

  function saveSearch(term: string) {
    const value = term.trim()
    if (!value) return
    const next = [value, ...history.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 10)
    setHistory(next)
    localStorage.setItem("imperium-product-search-history", JSON.stringify(next))
    setQuery(value)
  }

  function updateQuery(value: string) {
    setQuery(value)
    if (value.trim().length < 2) {
      setProducts([])
      setError(null)
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
        <div className="bg-marble/15 px-4 py-3 backdrop-blur-[2px]">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center text-marble-foreground hover:text-foreground" aria-label="Voltar ao início"><X className="size-5" /></Link>
            <Link href="/" className="flex shrink-0 items-center" aria-label="Imperium Bikes — início"><img src="/logo1.png" alt="Imperium Bikes" className="h-7 w-auto" /></Link>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input ref={inputRef} type="search" value={query} onChange={(event) => updateQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") saveSearch(query) }} placeholder="Buscar produtos..." aria-label="Buscar produtos" className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-10 text-sm outline-none focus:border-primary/30" />
              {query && <button type="button" onClick={() => updateQuery("")} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2"><X className="size-4 text-muted-foreground hover:text-foreground" /></button>}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5">
        {!query && history.length > 0 && <section aria-label="Buscas recentes"><h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Buscas recentes</h2><div className="flex flex-wrap gap-2">{history.map((term) => <Button key={term} type="button" onClick={() => saveSearch(term)} variant="outline" size="sm">{term}</Button>)}</div></section>}
        {loading && <p className="py-12 text-center text-sm text-muted-foreground" role="status">Buscando produtos…</p>}
        {error && <p role="alert" className="py-12 text-center text-sm text-destructive">{error}</p>}
        {!loading && !error && query.trim().length >= 2 && products.length === 0 && <div className="py-16 text-center"><Package className="mx-auto mb-4 size-12 text-muted-foreground/40" /><p className="text-sm font-medium text-muted-foreground">Nenhum produto encontrado</p><p className="mt-1 text-xs text-muted-foreground/60">Tente outro termo de busca</p></div>}
        {!loading && !error && products.length > 0 && <>
          <p className="mb-3 text-xs text-muted-foreground">{products.length} produto{products.length === 1 ? "" : "s"} encontrado{products.length === 1 ? "" : "s"}</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {products.map((product) => {
              const image = product.photos?.[0] ?? product.images?.slice().sort((a, b) => Number(b.isMain) - Number(a.isMain) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0)).find((item) => item.url)?.url ?? product.imageUrl ?? product.img
              const title = product.title ?? product.nome ?? "Produto"
              const price = product.price ?? product.preco
              return <Link key={product.id} href={`/produtos/${product.id}`} className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/20 hover:shadow-md">
                <div className="aspect-square overflow-hidden bg-secondary"><ProductImage src={image} alt={title} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" /></div>
                <div className="p-3">{product.category && <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">{product.category}</span>}<h2 className="mt-1 line-clamp-2 text-sm font-semibold group-hover:text-primary">{title}</h2>{typeof price === "number" && <p className="mt-2 font-heading text-base font-bold">{formatarPreco(price)}</p>}</div>
              </Link>
            })}
          </div>
        </>}
        {query.trim().length > 0 && query.trim().length < 2 && <p className="py-16 text-center text-sm text-muted-foreground">Digite pelo menos 2 caracteres para buscar produtos.</p>}
      </main>
    </div>
  )
}

export default function BuscarPage() {
  return <Suspense fallback={<main className="min-h-screen py-16 text-center text-sm text-muted-foreground">Carregando busca...</main>}><BuscarPageContent /></Suspense>
}
