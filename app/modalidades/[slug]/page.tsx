import { notFound } from "next/navigation"
import { ProductsCatalog } from "@/components/marketplace/ProductsCatalog"

const categories: Record<string, string> = {
  downhill: "Downhill", bmx: "BMX", mountain: "Mountain", speed: "Speed", urbana: "Urbana", outros: "Outros",
}

export default async function ModalityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = categories[slug]
  if (!category) notFound()
  return <main className="mx-auto min-h-screen max-w-7xl px-4 py-8"><h1 className="font-heading text-2xl font-bold">{category}</h1><p className="mb-6 mt-1 text-sm text-muted-foreground">Produtos disponíveis nesta modalidade.</p><ProductsCatalog category={category} /></main>
}
