"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { PageHeading } from "@/components/layout/page-heading"
import { ProductsCatalog } from "@/components/marketplace/ProductsCatalog"
import { Loader } from "@/components/ui/loader"

/** Slug da categoria (?categoria=) → nome que a pessoa lê. */
const NOMES: Record<string, string> = {
  bikes: "Bicicletas",
  pecas: "Peças",
  servicos: "Serviços",
  produtos: "Produtos e acessórios",
  consumiveis: "Consumíveis",
  esportes: "Artigos esportivos",
}

function ProductsContent() {
  const params = useSearchParams()
  const category = params.get("categoria") ?? undefined
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-3 sm:px-6 lg:px-8 lg:pt-6">
      <PageHeading
        title={category ? (NOMES[category] ?? "Produtos") : "Todos os produtos"}
        description="Bikes, peças e equipamentos anunciados."
        back={{ href: "/", label: "Início" }}
      />
      <ProductsCatalog category={category} />
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loader className="py-12" />}>
      <ProductsContent />
    </Suspense>
  )
}
