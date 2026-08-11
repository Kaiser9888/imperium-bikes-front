"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Props {
  onClear: () => void
}

export function PublishHeader({ onClear }: Props) {
  return (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm"
      style={{ backgroundImage: "url(/images/marble-light.png)" }}
    >
      <div className="bg-white/60 backdrop-blur-[2px]">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Botão Voltar */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Voltar</span>
          </Link>


          {/* Espaço vazio para centralizar o título */}
          <div className="w-16" />
        </div>
      </div>
    </header>
  )
}