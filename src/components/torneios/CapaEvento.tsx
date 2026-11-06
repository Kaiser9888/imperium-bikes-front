import { Trophy } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Capa do evento. Sem foto do organizador, mostra um fundo escuro da marca com o troféu
 * em vez da imagem cinza de "indisponível".
 */
export function CapaEvento({ src, nome, apagada, className }: { src: string; nome: string; apagada?: boolean; className?: string }) {
    if (!src || src.endsWith("placeholder.svg")) {
        return (
            <div
                aria-hidden="true"
                className={cn(
                    "relative grid place-items-center overflow-hidden bg-[oklch(0.21_0.03_255)] bg-[radial-gradient(circle_at_75%_20%,oklch(0.35_0.12_25/0.55),transparent_55%)]",
                    className,
                )}
            >
                <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/2 w-full text-white/[0.06]">
                    <path d="M0 120 L70 55 L120 85 L200 20 L270 80 L320 50 L400 95 L400 120 Z" fill="currentColor" />
                </svg>
                <Trophy className="relative size-10 text-white/30" />
            </div>
        )
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element -- capa enviada pelo organizador, domínio variável
        <img src={src} alt={`Capa do evento ${nome}`} className={cn("object-cover", apagada && "grayscale", className)} />
    )
}
