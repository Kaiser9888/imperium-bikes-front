"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { productService } from "@/services/publish/product.service"
import type { ProductResponse } from "@/types/publish/product"
import { ProductImage } from "@/components/marketplace/ProductImage"

const PAGE_SIZE = 24
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function ProductsCatalog({ category, condition, minPrice, maxPrice, subcategory }: { category?: string; condition?: string | null; minPrice?: string; maxPrice?: string; subcategory?: string | null }) {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (pageToLoad: number, append: boolean) => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    setError(null)
    try {
      const result = await productService.getAll(pageToLoad, PAGE_SIZE)
      setProducts((current) => append ? [...current, ...result.content] : result.content)
      setPage(result.number)
      setTotalPages(result.totalPages)
    } catch {
      setError("Não foi possível carregar os produtos. Tente novamente.")
      if (!append) setProducts([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { queueMicrotask(() => { void load(0, false) }) }, [load])

  const filtered = useMemo(() => {
    if (!category) return products
    const term = normalize(category)
    return products.filter((product) => normalize(`${product.category} ${product.title} ${product.description} ${product.model} ${product.brand}`).includes(term))
  }, [category, products])

  const filteredByOptions = filtered.filter((product) => {
    const price = Number(product.price)
    const categoryMatches = !subcategory || normalize(`${product.category} ${product.title} ${product.description} ${product.model}`).includes(normalize(subcategory))
    const conditionValue = normalize(product.condition)
    const conditionMatches = !condition || (normalize(condition) === "novo" ? conditionValue === "new" : conditionValue !== "new")
    const minMatches = !minPrice || price >= Number(minPrice.replace(",", "."))
    const maxMatches = !maxPrice || price <= Number(maxPrice.replace(",", "."))
    return categoryMatches && conditionMatches && minMatches && maxMatches
  })

  if (loading) return <p className="py-12 text-center text-sm text-muted-foreground">Carregando produtos...</p>
  if (error) return <div className="py-12 text-center"><p role="alert" className="text-sm text-destructive">{error}</p><button onClick={() => void load(0, false)} className="mt-3 text-sm font-medium text-primary underline">Tentar novamente</button></div>
  if (!filteredByOptions.length) return <div className="py-12 text-center"><p className="text-sm text-muted-foreground">{category ? "Nenhum produto encontrado com esses filtros nesta modalidade." : "Nenhum produto disponível no momento."}</p>{page + 1 < totalPages && <button disabled={loadingMore} onClick={() => void load(page + 1, true)} className="mt-4 rounded-lg border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-50">{loadingMore ? "Carregando..." : "Buscar em mais produtos"}</button>}</div>

  return <>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {filteredByOptions.map((product) => (
        <Link key={product.id} href={`/produtos/${product.id}`} className="overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40 hover:shadow-md">
          <div className="aspect-square bg-secondary"><ProductImage src={product.images?.find((image) => image.isMain)?.url ?? product.images?.[0]?.url} alt={product.title} className="size-full object-cover" /></div>
          <div className="p-3"><p className="line-clamp-2 min-h-10 text-sm font-semibold">{product.title}</p><p className="mt-2 font-heading text-base font-bold text-primary">{money(product.price)}</p><p className="mt-1 truncate text-xs text-muted-foreground">{product.city}{product.state ? `, ${product.state}` : ""}</p></div>
        </Link>
      ))}
    </div>
    {page + 1 < totalPages && <div className="mt-8 text-center"><button disabled={loadingMore} onClick={() => void load(page + 1, true)} className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-50">{loadingMore ? "Carregando..." : "Carregar mais"}</button></div>}
  </>
}
