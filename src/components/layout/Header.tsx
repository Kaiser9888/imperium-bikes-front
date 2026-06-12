"use client"

import { Bell, Menu, ShoppingCart, Search, User } from "lucide-react"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Authed, Guest } from "@/components/auth/auth-gates"
import Link from "next/link";

type HeaderProps = {
    onMenuClick: () => void
    cartCount?: number
    notificationCount?: number
}

export function Header({ onMenuClick, cartCount = 0, notificationCount = 0 }: HeaderProps) {
    return (
        <header
            className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm"
            style={{ backgroundImage: "url(/images/marble-light.png)" }}
        >
            {/* overlay para garantir legibilidade sobre o mármore */}
            <div className="bg-marble/15 backdrop-blur-[2px]">
                <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3">
                    {/* Logo */}
                    <Link href="/" className="flex shrink-0 flex-col leading-none" aria-label="Imperium Bikes - início">
                        <span className="font-blackletter text-2xl leading-none text-primary">Imperium</span>
                        <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-marble-foreground/70">
              Bikes
            </span>
                    </Link>

                    {/* Ações à direita */}
                    <div className="flex items-center gap-1">
                        <IconButton label="Notificações" badge={notificationCount}>
                            <Bell className="size-5" />
                        </IconButton>
                        <IconButton label="Carrinho" badge={cartCount}>
                            <ShoppingCart className="size-5" />
                        </IconButton>

                        {/* Conta do usuário (Clerk) */}
                        <Guest>
                            <SignInButton mode="modal">
                                <button
                                    type="button"
                                    aria-label="Entrar"
                                    className="flex size-10 items-center justify-center rounded-md text-marble-foreground transition-colors hover:bg-marble-foreground/10"
                                >
                                    <User className="size-5" />
                                </button>
                            </SignInButton>
                        </Guest>
                        <Authed>
                            <div className="flex size-10 items-center justify-center">
                                <UserButton
                                    appearance={{ elements: { avatarBox: "size-7" } }}
                                />
                            </div>
                        </Authed>

                        <button
                            type="button"
                            onClick={onMenuClick}
                            aria-label="Abrir menu"
                            className="flex size-10 items-center justify-center rounded-md text-marble-foreground transition-colors hover:bg-marble-foreground/10"
                        >
                            <Menu className="size-5" />
                        </button>
                    </div>
                </div>

                {/* Busca central */}
                <div className="mx-auto w-full max-w-2xl px-4 pb-3">
                    <form
                        role="search"
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-ring/40"
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <Search className="size-4 shrink-0 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Buscar bikes, peças, marcas..."
                            className="w-full bg-transparent text-sm text-card-foreground outline-none placeholder:text-muted-foreground"
                        />
                    </form>
                </div>
            </div>
        </header>
    )
}

function IconButton({
                        children,
                        label,
                        badge = 0,
                    }: {
    children: React.ReactNode
    label: string
    badge?: number
}) {
    return (
        <button
            type="button"
            aria-label={label}
            className="relative flex size-10 items-center justify-center rounded-md text-marble-foreground transition-colors hover:bg-marble-foreground/10"
        >
            {children}
            {badge > 0 && (
                <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold leading-4 text-primary-foreground">
          {badge > 9 ? "9+" : badge}
        </span>
            )}
        </button>
    )
}