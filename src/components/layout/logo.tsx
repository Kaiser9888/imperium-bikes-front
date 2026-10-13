import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * A orca da marca. No tema escuro usa logo1-dark (manchas brancas preenchidas)
 * com um contorno branco, para continuar preta com manchas brancas em vez de
 * virar o negativo.
 */
export function OrcaMark({ className, priority }: { className?: string; priority?: boolean }) {
    return (
        <>
            <Image
                src="/logo1.png"
                alt=""
                width={447}
                height={317}
                priority={priority}
                className={cn("w-auto mix-blend-multiply dark:hidden", className)}
            />
            <Image
                src="/logo1-dark.png"
                alt=""
                width={447}
                height={317}
                priority={priority}
                className={cn(
                    "hidden w-auto dark:block [filter:drop-shadow(1px_0_0_#fff)_drop-shadow(-1px_0_0_#fff)_drop-shadow(0_1px_0_#fff)_drop-shadow(0_-1px_0_#fff)]",
                    className,
                )}
            />
        </>
    )
}

type LogoProps = {
    /** Só a orca, para cabeçalhos de páginas internas que já têm título. */
    compact?: boolean
    className?: string
}

/** Marca do site: a orca (logo1) e o nome. Sempre leva para o início. */
export function Logo({ compact = false, className }: LogoProps) {
    return (
        <Link
            href="/"
            aria-label="Imperium Bikes — início"
            className={cn("flex shrink-0 items-center gap-2.5 rounded-lg", className)}
        >
            <OrcaMark priority className={compact ? "h-7" : "h-8"} />
            {!compact && (
                <span className="text-lg font-bold tracking-tight text-foreground">
                    Imperium <span className="text-accent">Bikes</span>
                </span>
            )}
        </Link>
    )
}
