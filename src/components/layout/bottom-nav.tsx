// src/components/layout/bottom-nav.tsx
"use client"

import { Home, Search, Trophy, MessageCircle, User } from "lucide-react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"

const navItems = [
    { icon: Home, label: "Menu", key: "menu", href: "/" },
    { icon: Search, label: "Pesquisa", key: "pesquisa", href: "/buscar" },
    { icon: Trophy, label: "Torneio", key: "torneio", href: "/torneios" },
    { icon: MessageCircle, label: "Chat", key: "chat", href: "/chat" },
    { icon: User, label: "Perfil", key: "perfil", href: "/perfil" },
]

type BottomNavProps = {
    onMenuClick: () => void
}

export function BottomNav({ onMenuClick }: BottomNavProps) {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <nav
            aria-label="Navegação inferior"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md"
        >
            <ul className="mx-auto flex w-full max-w-7xl items-stretch justify-between px-2">
                {navItems.map(({ icon: Icon, label, key, href }) => {
                    const isActive = pathname === href
                    return (
                        <li key={key} className="flex-1">
                            <button
                                type="button"
                                onClick={() => {
                                    if (key === "menu") {
                                        onMenuClick()
                                    } else {
                                        router.push(href)
                                    }
                                }}
                                aria-current={isActive ? "page" : undefined}
                                className={`flex w-full flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium transition-colors ${
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Icon className="size-5" strokeWidth={isActive ? 2.4 : 1.8} />
                                {label}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}