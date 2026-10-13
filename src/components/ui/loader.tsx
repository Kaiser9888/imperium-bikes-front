import { cn } from "@/lib/utils"

const PULSE = "0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"

/** Indicador de carregamento da marca. `fullPage` centraliza na tela inteira. */
export function Loader({ label = "Carregando", fullPage = false, className }: { label?: string; fullPage?: boolean; className?: string }) {
    return (
        <div
            role="status"
            aria-label={label}
            className={cn("pulse-loader flex items-center justify-center", fullPage && "min-h-screen bg-background", className)}
        >
            <svg width="64" height="48" viewBox="0 0 64 48" aria-hidden="true">
                <polyline className="back" points={PULSE} />
                <polyline className="front" points={PULSE} />
                <polyline className="front" points={PULSE} />
            </svg>
        </div>
    )
}
