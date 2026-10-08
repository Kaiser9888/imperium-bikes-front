// src/components/layout/bottom-nav.tsx
"use client"

import { MotionConfig, motion } from "framer-motion"
import { Menu, Search, Plus, Clapperboard, User, type LucideIcon } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import { useAppShell } from "@/components/layout/app-shell"
import { isRouteActive } from "@/lib/navigation"
import { cn } from "@/lib/utils"

type NavItem = { icon: LucideIcon; label: string; key: string; href?: string }

// O botão central (Criar evento) fica entre os dois grupos
const leftItems: NavItem[] = [
    { icon: Menu, label: "Menu", key: "menu" },
    { icon: Search, label: "Busca", key: "busca", href: "/buscar" },
]
const rightItems: NavItem[] = [
    { icon: Clapperboard, label: "Vídeos", key: "videos", href: "/videos" },
    { icon: User, label: "Perfil", key: "perfil", href: "/perfil" },
]
const CREATE_HREF = "/torneios/criar"

const spring = { type: "spring", stiffness: 420, damping: 32 } as const

export function BottomNav() {
    const { openMenu } = useAppShell()
    const router = useRouter()
    const pathname = usePathname()

    // Rotas filhas (/videos/watch/1) mantêm a seção ativa
    const isActiveRoute = (href?: string) => !!href && isRouteActive(pathname, href)

    const renderItem = ({ icon: Icon, label, key, href }: NavItem) => {
        const isActive = isActiveRoute(href)
        return (
            <li key={key}>
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => (href ? router.push(href) : openMenu())}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                        "relative flex h-12 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full transition-colors",
                        isActive ? "text-foreground" : "text-background/65 hover:text-background",
                    )}
                >
                    {/* A pílula desliza de um item para o outro; os botões não saem do lugar */}
                    {isActive && (
                        <motion.span
                            layoutId="bottom-nav-pill"
                            transition={spring}
                            className="absolute inset-0 rounded-full bg-background"
                        />
                    )}
                    <motion.span
                        className="relative flex"
                        animate={isActive ? { y: [0, -3, 0] } : { y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        <Icon className="size-5" strokeWidth={isActive ? 2.3 : 1.9} aria-hidden="true" />
                    </motion.span>
                    <span aria-hidden="true" className="type-caption relative font-semibold">
                        {label}
                    </span>
                </motion.button>
            </li>
        )
    }

    const creating = isActiveRoute(CREATE_HREF)

    return (
        <MotionConfig reducedMotion="user">
            <nav
                aria-label="Navegação inferior"
                className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
            >
                <motion.ul
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                    className="pointer-events-auto flex h-16 items-center gap-1 rounded-full bg-foreground px-2.5 shadow-lg"
                >
                    {leftItems.map(renderItem)}

                    <li className="px-1.5">
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ y: -22 }}
                            initial={false}
                            animate={{ y: -18, rotate: creating ? 45 : 0 }}
                            transition={spring}
                            onClick={() => router.push(CREATE_HREF)}
                            aria-label="Criar evento"
                            aria-current={creating ? "page" : undefined}
                            className="flex size-14 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg ring-4 ring-background hover:bg-accent-hover"
                        >
                            <Plus className="size-7" strokeWidth={2.4} aria-hidden="true" />
                        </motion.button>
                    </li>

                    {rightItems.map(renderItem)}
                </motion.ul>
            </nav>
        </MotionConfig>
    )
}
