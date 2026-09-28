"use client"

import { useState } from "react"
import {
    Bell,
    Menu,
    ShoppingCart,
    Search,
    User,
    X,
} from "lucide-react"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Authed, Guest } from "@/components/auth/auth-gates"
import Link from "next/link"
import Image from "next/image"

type HeaderProps = {
    onMenuClick: () => void
    cartCount?: number
    notificationCount?: number
}

export function Header({
                           onMenuClick,
                           cartCount,
                           notificationCount,
                       }: HeaderProps) {
    const [activeCard, setActiveCard] = useState<
      "notifications" | "cart" | null
    >(null)

    function handleNotifications() {
        setActiveCard((current) =>
          current === "notifications"
            ? null
            : "notifications"
        )
    }

    function handleCart() {
        setActiveCard((current) =>
          current === "cart" ? null : "cart"
        )
    }

    function closeCard() {
        setActiveCard(null)
    }

    const hasNotificationCount =
      typeof notificationCount === "number" &&
      notificationCount > 0

    const hasCartCount =
      typeof cartCount === "number" &&
      cartCount > 0

    return (
      <header
        className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm"
        style={{
            backgroundImage:
              "url(/images/marble-light.png)",
        }}
      >
          <div className="bg-marble/1 backdrop-blur-[2px]">

              <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">

                  {/* LOGO + NOME */}
                  <Link
                    href="/"
                    className="flex shrink-0 flex-col items-center justify-center"
                    aria-label="Imperium Bikes - início"
                  >
                      <Image
                        src="/logo1.png"
                        alt="Imperium Bikes"
                        width={100}
                        height={50}
                        priority
                        className="h-auto w-[80px] object-contain"
                      />

                      <span className="mt-0.5 font-Norse text-[11px] font-semibold tracking-[0.18em] text-#A33C36">
                            IMPERIUM BIKES
                        </span>
                  </Link>

                  {/* AÇÕES DO HEADER */}
                  <div className="flex items-center gap-1">

                      {/* NOTIFICAÇÕES */}
                      <button
                        type="button"
                        onClick={handleNotifications}
                        aria-label="Notificações"
                        aria-expanded={
                          activeCard === "notifications"
                        }
                        className="relative flex size-10 items-center justify-center rounded-md text-marble-foreground transition-colors hover:bg-marble-foreground/10"
                      >
                          <Bell className="size-5" />

                          {hasNotificationCount && (
                            <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold leading-4 text-primary-foreground">
                                    {notificationCount! > 9
                                      ? "9+"
                                      : notificationCount}
                                </span>
                          )}
                      </button>

                      {/* CARRINHO */}
                      <button
                        type="button"
                        onClick={handleCart}
                        aria-label="Carrinho"
                        aria-expanded={
                          activeCard === "cart"
                        }
                        className="relative flex size-10 items-center justify-center rounded-md text-marble-foreground transition-colors hover:bg-marble-foreground/10"
                      >
                          <ShoppingCart className="size-5" />

                          {hasCartCount && (
                            <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold leading-4 text-primary-foreground">
                                    {cartCount! > 9
                                      ? "9+"
                                      : cartCount}
                                </span>
                          )}
                      </button>

                      {/* USUÁRIO NÃO LOGADO */}
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

                      {/* USUÁRIO LOGADO */}
                      <Authed>
                          <div className="flex size-10 items-center justify-center">
                              <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox:
                                          "size-7",
                                    },
                                }}
                              />
                          </div>
                      </Authed>

                      {/* MENU */}
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

              {/* BUSCA */}
              <div className="mx-auto w-full max-w-7xl px-4 pb-3">
                  <form
                    role="search"
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-ring/40"
                    onSubmit={(e) =>
                      e.preventDefault()
                    }
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

          {/* CARD DE NOTIFICAÇÕES */}
          {activeCard === "notifications" && (
            <div className="absolute right-20 top-full mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-4 shadow-lg">
                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="font-heading text-base font-semibold text-card-foreground">
                            Notificações
                        </h2>

                        {hasNotificationCount ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                              Você tem{" "}
                              {notificationCount}{" "}
                              {notificationCount === 1
                                ? "notificação"
                                : "notificações"}{" "}
                              não lidas.
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">
                              Você não possui novas
                              notificações.
                          </p>
                        )}
                    </div>

                    <button
                      type="button"
                      onClick={closeCard}
                      aria-label="Fechar notificações"
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
          )}

          {/* CARD DO CARRINHO */}
          {activeCard === "cart" && (
            <div className="absolute right-16 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-4 shadow-lg">

                <div className="flex items-center justify-between">

                    <div>
                        <h2 className="font-heading text-base font-semibold text-card-foreground">
                            Carrinho
                        </h2>

                        {hasCartCount ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                              Você possui{" "}
                              {cartCount}{" "}
                              {cartCount === 1
                                ? "item"
                                : "itens"}{" "}
                              no carrinho.
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">
                              Seu carrinho está vazio.
                          </p>
                        )}
                    </div>

                    <button
                      type="button"
                      onClick={closeCard}
                      aria-label="Fechar carrinho"
                      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <Link
                  href="/carrinho"
                  onClick={closeCard}
                  className="mt-4 block rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
                >
                    Ver carrinho
                </Link>
            </div>
          )}
      </header>
    )
}