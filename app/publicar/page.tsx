"use client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CategoryStep } from "@/components/publish/CategoryStep"

export default function PublicarPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">Novo anúncio</span>
          <div className="w-[52px]" />
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-5">
        {/* CATEGORIAS */}
        <CategoryStep />
      </div>
    </main>
  )
}