import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

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
            <Image
                src="/logo1.png"
                alt=""
                width={446}
                height={331}
                priority
                className={cn("w-auto mix-blend-multiply dark:invert dark:mix-blend-screen", compact ? "h-7" : "h-8")}
            />
            {!compact && (
                <span className="text-lg font-bold tracking-tight text-foreground">
                    Imperium <span className="text-accent">Bikes</span>
                </span>
            )}
        </Link>
    )
}
