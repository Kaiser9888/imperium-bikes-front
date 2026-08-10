"use client"

import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

interface Props {
    onClear: () => void
}

export function PublishHeader({ onClear }: Props) {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
          <div className="flex h-14 items-center justify-between px-4">
              <Link
                href="/videos"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">Voltar</span>
              </Link>

              <h1 className="text-sm font-semibold sm:text-base">Publicar anúncio</h1>

              <button
                onClick={onClear}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                  <Trash2 className="size-3" />
                  <span className="hidden sm:inline">Limpar</span>
              </button>
          </div>
      </header>
    )
}