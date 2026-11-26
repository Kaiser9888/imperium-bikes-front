"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, Menu, ShoppingCart, Trophy, TvMinimalPlay, User } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { isRouteActive } from "@/lib/navigation"
import { Logo } from "@/components/layout/logo"

import { Authed, Guest } from "@/components/auth/auth-gates"
import { useAppShell } from "@/components/layout/app-shell"
import { SearchBar } from "@/components/layout/SearchBar"
import { Button } from "@/components/ui/button"
import { CART_UPDATED_EVENT, cartItemCount } from "@/lib/cart"
import { rotuloContador, useContadores } from "@/hooks/useContadores"

/*
  Celular:  [logo] Imperium Bikes        sino  carrinho  conta  menu
            ( busca em linha própria )
  md+:      [logo] Imperium Bikes   ( busca central )   sino  carrinho  conta  menu
  lg+:      + Eventos e Vídeos antes dos ícones (a barra de baixo some)

  O sino mostra as notificações não lidas; o ponto no menu avisa mensagem nova no chat.
*/
function Selo({ children }: { children: React.ReactNode }) {
    return (
        <span
            aria-hidden="true"
            className="type-caption absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-bold text-accent-foreground"
        >
            {children}
        </span>
    )
}

const SECOES = [
    { href: "/torneios", label: "Eventos", icon: Trophy },
    { href: "/videos", label: "Vídeos", icon: TvMinimalPlay },
]

/** Some ao rolar para baixo e volta ao rolar para cima (mais tela para o conteúdo). */
function useSomeAoRolar(ativo: boolean): boolean {
    const [escondido, setEscondido] = useState(false)
    const ultimo = useRef(0)
    useEffect(() => {
        if (!ativo) return
        const aoRolar = () => {
            const y = window.scrollY
            // Margem de 8px para não piscar com tremida do dedo; perto do topo sempre aparece
            if (y < 80) setEscondido(false)
            else if (y > ultimo.current + 8) setEscondido(true)
            else if (y < ultimo.current - 8) setEscondido(false)
            else return
            ultimo.current = y
        }
        window.addEventListener("scroll", aoRolar, { passive: true })
        return () => window.removeEventListener("scroll", aoRolar)
    }, [ativo])
    return ativo && escondido
}

export function Header({
    busca = true,
    someAoRolar = false,
}: {
    /** "compacta": sem a barra no celular (a área de vídeos põe a lupa nas abas); do md para cima continua */
    busca?: boolean | "compacta"
    someAoRolar?: boolean
}) {
    const escondido = useSomeAoRolar(someAoRolar)
    const { openMenu } = useAppShell()
    const pathname = usePathname()
    const [cartCount, setCartCount] = useState(0)
    const { notificacoes, mensagens } = useContadores()

    useEffect(() => {
        const updateCount = () => setCartCount(cartItemCount())
        updateCount()
        window.addEventListener(CART_UPDATED_EVENT, updateCount)
        window.addEventListener("storage", updateCount)
        return () => {
            window.removeEventListener(CART_UPDATED_EVENT, updateCount)
            window.removeEventListener("storage", updateCount)
        }
    }, [])

    const cartLabel =
        cartCount > 0 ? `Carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}` : "Carrinho vazio"

    return (
        <header
            className={`sticky top-0 z-40 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-md transition-transform duration-300 ${escondido ? "-translate-y-full" : ""}`}
        >
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-2 gap-y-2 px-4 sm:gap-x-4 py-2.5 sm:px-6 md:flex-nowrap md:py-3 lg:px-8">
                <Logo className="order-1" />

                {/* Celular: ícones colados e um pouco menores em telas estreitas, para logo e ícones caberem numa linha só */}
                <div className={`order-2 ml-auto flex items-center sm:gap-1 md:order-3 ${busca ? "md:ml-0" : ""}`}>
                    {/* Computador: sem a barra de baixo, Eventos e Vídeos ficam aqui */}
                    <nav aria-label="Seções" className="mr-2 hidden items-center gap-1 lg:flex">
                        {SECOES.map(({ href, label, icon: Icone }) => (
                            <Link
                                key={href}
                                href={href}
                                aria-current={isRouteActive(pathname, href) ? "page" : undefined}
                                className="type-label inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground aria-[current=page]:text-primary"
                            >
                                <Icone className="size-5" aria-hidden="true" />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <Authed>
                        <Button asChild variant="ghost" size="icon" className="relative rounded-full max-[379px]:size-9">
                            <Link
                                href="/notificacoes"
                                aria-label={notificacoes > 0 ? `Notificações, ${notificacoes} não ${notificacoes === 1 ? "lida" : "lidas"}` : "Notificações"}
                            >
                                <Bell className="size-[22px]" aria-hidden="true" />
                                {notificacoes > 0 && <Selo>{rotuloContador(notificacoes)}</Selo>}
                            </Link>
                        </Button>
                    </Authed>

                    <Button asChild variant="ghost" size="icon" className="relative rounded-full max-[379px]:size-9">
                        <Link href="/carrinho" aria-label={cartLabel}>
                            <ShoppingCart className="size-[22px]" aria-hidden="true" />
                            {cartCount > 0 && (
                                <Selo>{cartCount > 9 ? "9+" : cartCount}</Selo>
                            )}
                        </Link>
                    </Button>

                    <Guest>
                        <Button asChild variant="ghost" size="icon" className="rounded-full max-[379px]:size-9" aria-label="Entrar"><Link href="/sign-in">
                                <User className="size-[22px]" aria-hidden="true" />
                            </Link></Button>
                    </Guest>

                    <Authed>
                        <div className="hidden size-10 items-center justify-center lg:flex">
                            <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
                        </div>
                    </Authed>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full max-[379px]:size-9"
                        onClick={openMenu}
                        aria-label={mensagens > 0 ? `Abrir menu, ${mensagens} ${mensagens === 1 ? "mensagem não lida" : "mensagens não lidas"}` : "Abrir menu"}
                    >
                        <Menu className="size-6" aria-hidden="true" />
                        {mensagens > 0 && (
                            <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-accent ring-2 ring-background" />
                        )}
                    </Button>
                </div>

                {busca && (
                    <SearchBar
                        className={`order-3 w-full md:order-2 md:mx-auto md:max-w-xl md:flex-1 ${busca === "compacta" ? "max-md:hidden" : ""}`}
                    />
                )}
            </div>
        </header>
    )
}
