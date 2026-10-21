"use client"

import { useEffect, useState } from "react"
import { Bell, Menu, ShoppingCart, User } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
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

export function Header() {
    const { openMenu } = useAppShell()
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
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 md:flex-nowrap md:py-3 lg:px-8">
                <Logo className="order-1" />

                <div className="order-2 ml-auto flex items-center gap-1 md:order-3 md:ml-0">
                    <Authed>
                        <Button asChild variant="ghost" size="icon" className="relative rounded-full">
                            <Link
                                href="/notificacoes"
                                aria-label={notificacoes > 0 ? `Notificações, ${notificacoes} não ${notificacoes === 1 ? "lida" : "lidas"}` : "Notificações"}
                            >
                                <Bell className="size-[22px]" aria-hidden="true" />
                                {notificacoes > 0 && <Selo>{rotuloContador(notificacoes)}</Selo>}
                            </Link>
                        </Button>
                    </Authed>

                    <Button asChild variant="ghost" size="icon" className="relative rounded-full">
                        <Link href="/carrinho" aria-label={cartLabel}>
                            <ShoppingCart className="size-[22px]" aria-hidden="true" />
                            {cartCount > 0 && (
                                <Selo>{cartCount > 9 ? "9+" : cartCount}</Selo>
                            )}
                        </Link>
                    </Button>

                    <Guest>
                        <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Entrar"><Link href="/sign-in">
                                <User className="size-[22px]" aria-hidden="true" />
                            </Link></Button>
                    </Guest>

                    <Authed>
                        <div className="flex size-10 items-center justify-center">
                            <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
                        </div>
                    </Authed>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full"
                        onClick={openMenu}
                        aria-label={mensagens > 0 ? `Abrir menu, ${mensagens} ${mensagens === 1 ? "mensagem não lida" : "mensagens não lidas"}` : "Abrir menu"}
                    >
                        <Menu className="size-6" aria-hidden="true" />
                        {mensagens > 0 && (
                            <span aria-hidden="true" className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-accent ring-2 ring-background" />
                        )}
                    </Button>
                </div>

                <SearchBar className="order-3 w-full md:order-2 md:mx-auto md:max-w-xl md:flex-1" />
            </div>
        </header>
    )
}
