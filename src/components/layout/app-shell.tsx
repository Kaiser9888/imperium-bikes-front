"use client"

import Link from "next/link"
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
            {/* Teclado: primeiro Tab mostra este atalho, que pula o cabeçalho */}
            <a
                href="#conteudo"
                onClick={(event) => {
                    const main = document.querySelector("main")
                    if (!main) return
                    event.preventDefault()
                    main.setAttribute("tabindex", "-1")
                    main.focus()
                }}
                className="type-label fixed left-3 top-3 z-[60] -translate-y-24 rounded-lg bg-foreground px-4 py-2.5 text-background transition-transform focus:translate-y-0"
            >
                Pular para o conteúdo
            </a>
            <Header />
            {children}
            {/* Beta discreto no fim da página; ideias de quem usa de verdade valem ouro. ponytail: tirar o "beta" quando sair do beta */}
            <p className="px-4 pb-3 pt-8 text-center text-[0.6875rem] text-muted-foreground/80">
                Versão beta ·{" "}
                <Link href="/ajuda/contato?assunto=IDEIA" className="underline-offset-2 hover:text-foreground hover:underline">
                    Sugerir uma ideia
                </Link>{" "}
                ·{" "}
                <Link href="/ajuda/contato?assunto=ERRO" className="underline-offset-2 hover:text-foreground hover:underline">
                    Reportar erro
                </Link>
            </p>
            {/* Reserva a altura da BottomNav fixa para ela não cobrir o fim da página */}
            <div className="h-[calc(4rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />
            <BottomNav />
        </div>
    )
}
