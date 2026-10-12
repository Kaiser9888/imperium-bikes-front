"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ProductsCatalog } from "@/components/marketplace/ProductsCatalog"

function ProductsContent() {
  const params = useSearchParams()
  const category = params.get("categoria") ?? undefined
  return <main className="mx-auto min-h-screen max-w-7xl px-4 py-8"><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Início</Link><h1 className="mt-4 font-heading text-2xl font-bold">{category ? `Produtos: ${category}` : "Todos os produtos"}</h1><p className="mb-6 mt-1 text-sm text-muted-foreground">Encontre bikes, peças e equipamentos.</p><ProductsCatalog category={category} /></main>
}

export default function ProductsPage() {
  return <Suspense fallback={<p className="py-12 text-center text-sm text-muted-foreground">Carregando produtos...</p>}><ProductsContent /></Suspense>
}
