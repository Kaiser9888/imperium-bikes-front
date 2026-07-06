// components/publish/PublishHeader.tsx
"use client"

import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

interface Props {
    onClear: () => void
}

export function PublishHeader({ onClear }: Props) {
    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
            <div className="bg-marble/15 backdrop-blur-[2px]">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-4" /> Voltar
                    </Link>
                    <h1 className="font-heading text-base font-bold">Publicar anúncio</h1>
                    <button onClick={onClear} className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1">
                        <Trash2 className="size-3" /> Limpar
                    </button>
                </div>
            </div>
        </header>
    )
}
