import { useId } from "react"

import { cn } from "@/lib/utils"

/** Troféu dourado com estrela vazada (botão de Eventos da BottomNav). Cores fixas: o ouro é a identidade do ícone. */
export function TrophyIcon({ className }: { className?: string }) {
    // Ids únicos: o mesmo ícone pode aparecer mais de uma vez na página
    const id = useId()
    const ouro = `ouro-${id}`
    const estrela = `estrela-${id}`

    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-6", className)}>
            <defs>
                <linearGradient id={ouro} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6dc8c" />
                    <stop offset=".55" stopColor="#d9ab45" />
                    <stop offset="1" stopColor="#a87a22" />
                </linearGradient>
                <mask id={estrela}>
                    <rect width="24" height="24" fill="#fff" />
                    <path d="M12 5.2l.95 1.95 2.15.31-1.55 1.51.37 2.13L12 10.1l-1.92 1 .37-2.13L8.9 7.46l2.15-.31z" fill="#000" />
                </mask>
            </defs>
            {/* Alças */}
            <g fill="none" stroke={`url(#${ouro})`} strokeWidth={1.6} strokeLinecap="round">
                <path d="M6.8 4.6H4.6a.9.9 0 0 0-.9.95c.15 2.4 1.35 3.9 3.6 4.35" />
                <path d="M17.2 4.6h2.2a.9.9 0 0 1 .9.95c-.15 2.4-1.35 3.9-3.6 4.35" />
            </g>
            {/* Taça com a estrela vazada */}
            <path d="M6.5 3h11v4.6a5.5 5.5 0 0 1-11 0z" fill={`url(#${ouro})`} mask={`url(#${estrela})`} />
            {/* Haste e base */}
            <g fill={`url(#${ouro})`}>
                <path d="M10.9 12.9h2.2l.35 3.1h-2.9z" />
                <rect x="8.6" y="16" width="6.8" height="1.7" rx=".6" />
                <rect x="7.2" y="18.4" width="9.6" height="2.6" rx=".8" />
            </g>
        </svg>
    )
}
