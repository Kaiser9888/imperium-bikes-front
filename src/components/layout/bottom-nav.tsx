"use client"

import Link from "next/link"
import { Clapperboard, House, Search, Trophy, User, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import { useAppShell } from "@/components/layout/app-shell"
import { isRouteActive } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const itemClasses =
    "type-caption flex size-full cursor-pointer flex-col items-center justify-center gap-1 font-medium transition-colors focus-visible:-outline-offset-2 active:bg-surface-muted"

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
    // Rotas filhas (/videos/watch/1) mantêm a seção ativa
    const active = isRouteActive(usePathname(), href)
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(itemClasses, active ? "text-primary" : "text-muted-foreground")}
        >
            <Icon className="size-6" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
            {label}
        </Link>
    )
}

export function BottomNav() {
    const { openMenu } = useAppShell()

    return (
        <nav
            aria-label="Navegação inferior"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
        >
            <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
                <li>
                    <button type="button" onClick={openMenu} className={cn(itemClasses, "text-muted-foreground")}>
                        <House className="size-6" strokeWidth={1.8} aria-hidden="true" />
                        Menu
                    </button>
                </li>
                <li>
                    <NavLink href="/buscar" label="Busca" icon={Search} />
                </li>
                <li>
                    <Link href="/torneios" aria-label="Eventos" className={itemClasses}>
                        <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <Trophy className="size-6" strokeWidth={2} aria-hidden="true" />
                        </span>
                    </Link>
                </li>
                <li>
                    <NavLink href="/videos" label="Vídeos" icon={Clapperboard} />
                </li>
                <li>
                    <NavLink href="/perfil" label="Perfil" icon={User} />
                </li>
            </ul>
        </nav>
    )
}
