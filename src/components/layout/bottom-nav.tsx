"use client"

import Link from "next/link"
import { House, Search, Trophy, TvMinimalPlay, User, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"

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

/** `escuro`: força o tema escuro (feed do Memento, que é preto nos dois temas). */
export function BottomNav({ escuro = false }: { escuro?: boolean }) {
    return (
        <nav
            aria-label="Navegação inferior"
            className={cn("fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden", escuro && "dark")}
        >
            <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
                <li>
                    <NavLink href="/" label="Início" icon={House} />
                </li>
                <li>
                    <NavLink href="/buscar" label="Busca" icon={Search} />
                </li>
                <li>
                    <NavLink href="/torneios" label="Eventos" icon={Trophy} />
                </li>
                <li>
                    <NavLink href="/videos" label="Vídeos" icon={TvMinimalPlay} />
                </li>
                <li>
                    <NavLink href="/perfil" label="Perfil" icon={User} />
                </li>
            </ul>
        </nav>
    )
}
