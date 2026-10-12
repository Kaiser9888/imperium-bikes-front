"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

import { BottomNav } from "@/components/layout/bottom-nav"
import { Header } from "@/components/layout/Header"
import { MenuDrawer } from "@/components/layout/menu-drawer"

type AppShellContextValue = {
    openMenu: () => void
    closeMenu: () => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

/** Acesso ao drawer único do app. */
export function useAppShell(): AppShellContextValue {
    const context = useContext(AppShellContext)
    if (!context) throw new Error("useAppShell precisa estar dentro de <AppShellProvider>")
    return context
}

/** Fica no layout raiz: guarda o estado do menu e renderiza o único Drawer do app. */
export function AppShellProvider({ children }: { children: React.ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const openMenu = useCallback(() => setMenuOpen(true), [])
    const closeMenu = useCallback(() => setMenuOpen(false), [])
    const value = useMemo(() => ({ openMenu, closeMenu }), [openMenu, closeMenu])

    return (
        <AppShellContext.Provider value={value}>
            {children}
            <MenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />
        </AppShellContext.Provider>
    )
}

/** Estrutura padrão de página: Header, conteúdo e BottomNav. */
export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            {children}
            {/* Reserva a altura da BottomNav fixa para ela não cobrir o fim da página */}
            <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
            <BottomNav />
        </div>
    )
}
