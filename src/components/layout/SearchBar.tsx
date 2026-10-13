"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { cn } from "@/lib/utils"

/** Busca global: envia para /buscar?q=termo. */
export function SearchBar({ className }: { className?: string }) {
    const router = useRouter()
    const [termo, setTermo] = useState("")

    return (
        <form
            role="search"
            className={cn(
                "flex h-11 items-center gap-2.5 rounded-full bg-surface-muted px-4 outline-2 outline-offset-2 outline-transparent transition-colors focus-within:bg-surface focus-within:outline-ring",
                className,
            )}
            onSubmit={(event) => {
                event.preventDefault()
                const valor = termo.trim()
                if (valor) router.push(`/buscar?q=${encodeURIComponent(valor)}`)
            }}
        >
            <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
                type="search"
                value={termo}
                onChange={(event) => setTermo(event.target.value)}
                placeholder="Buscar eventos, produtos e vídeos"
                aria-label="Buscar"
                data-plain
                className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
            />
        </form>
    )
}
