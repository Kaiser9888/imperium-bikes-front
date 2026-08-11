
// app/publicar/page.tsx

"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { CategoryStep } from "@/components/publish/CategoryStep"

export default function PublicarPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HEADER */}
      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-border
          bg-background/95
          backdrop-blur-lg
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            max-w-2xl
            items-center
            justify-between
            px-4
          "
        >

          <Link
            href="/"
            className="
              flex
              items-center
              gap-1.5
              text-sm
              text-muted-foreground
              transition-colors
              hover:text-foreground
            "
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>

          <span className="text-sm font-semibold">
            Novo anúncio
          </span>

          <div className="w-[52px]" />

        </div>
      </header>

      {/* CONTEÚDO */}
      <div
        className="
          mx-auto
          max-w-2xl
          px-4
          pb-10
          pt-7
        "
      >

        {/* PROGRESSO */}
        <div className="mb-8">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-xs font-medium">
              Etapa 1
            </span>

            <span className="text-xs text-muted-foreground">
              1 de 5
            </span>

          </div>

          <div
            className="
              h-1.5
              overflow-hidden
              rounded-full
              bg-muted
            "
          >
            <div
              className="
                h-full
                w-1/5
                rounded-full
                bg-primary
              "
            />
          </div>

        </div>

        {/* CATEGORIAS */}
        <CategoryStep />

      </div>

    </main>
  )
}
