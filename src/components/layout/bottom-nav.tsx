"use client"

import { Menu, Search, Trophy, MessageCircle, User } from "lucide-react"
import { useState } from "react"

const navItems = [
    { icon: Menu, label: "Menu", key: "menu" },
    { icon: Search, label: "Pesquisa", key: "pesquisa" },
    { icon: Trophy, label: "Torneio", key: "torneio" },
    { icon: MessageCircle, label: "Chat", key: "chat" },
    { icon: User, label: "Perfil", key: "perfil" },
]

type BottomNavProps = {
    onMenuClick: () => void
}

export function BottomNav({ onMenuClick }: BottomNavProps) {
    const [active, setActive] = useState("menu")

    return (
        <nav
            aria-label="Navegação inferior"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md"
        >
            <ul className="mx-auto flex w-full max-w-2xl items-stretch justify-between px-2">
                {navItems.map(({ icon: Icon, label, key }) => {
                    const isActive = active === key
                    return (
                        <li key={key} className="flex-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setActive(key)
                                    if (key === "menu") onMenuClick()
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