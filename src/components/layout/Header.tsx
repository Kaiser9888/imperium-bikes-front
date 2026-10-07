"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Menu, Search, ShoppingCart, User, X } from "lucide-react"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Authed, Guest } from "@/components/auth/auth-gates"
import Link from "next/link"
import Image from "next/image"
import { CART_UPDATED_EVENT, cartItemCount } from "@/lib/cart"

type HeaderProps = {
    onMenuClick: () => void
    notificationCount?: number
}

/*
  Layout (mobile):
  ┌──────────────────────────────────┐
  │ ☰        [logo] Imperium     🔔 🛒 👤 │
  │ ( 🔍 Buscar bikes, peças... )    │
  └──────────────────────────────────┘
  Menu à esquerda (navegar), marca ao centro, ações à direita.
*/

const iconBtn =
  "relative flex size-10 items-center justify-center rounded-full text-[#2B2A22] transition-colors active:bg-[#E4D9BF]/70"

const badge =
  "absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-[#2E3B2B] px-1 text-[0.6rem] font-bold leading-4 text-[#F5EEDC]"

export function Header({ onMenuClick, notificationCount }: HeaderProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [activeCard, setActiveCard] = useState<"notifications" | "cart" | null>(null)
    const [cartCount, setCartCount] = useState(0)

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

    const toggle = (card: "notifications" | "cart") =>
      setActiveCard((current) => (current === card ? null : card))
    const closeCard = () => setActiveCard(null)

    const hasNotificationCount = typeof notificationCount === "number" && notificationCount > 0
    const hasCartCount = cartCount > 0

    return (
      <header className="sticky top-0 z-40 border-b border-[#E4D9BF] bg-[#F5EEDC]">
          {/* Fecha o card ao tocar fora */}
          {activeCard && (
            <button
              type="button"
              aria-label="Fechar"
              onClick={closeCard}
              className="fixed inset-0 -z-10 cursor-default"
            />
          )}

          <div className="mx-auto w-full max-w-7xl px-3">
              {/* LINHA 1 */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2">
                  {/* Menu */}
                  <div className="flex justify-start">
                      <button type="button" onClick={onMenuClick} aria-label="Abrir menu" className={iconBtn}>
                          <Menu className="size-6" />
                      </button>
                  </div>

                  {/* Marca */}
                  <Link href="/" aria-label="Imperium Bikes - início" className="flex items-center gap-2">
                      <Image
                        src="/logo1.png"
                        alt=""
                        width={80}
                        height={40}
                        priority
                        className="h-auto w-9 object-contain"
                      />
                      <span className="font-heading text-[15px] font-bold tracking-wide text-[#A33C36]">
              Imperium Bikes
            </span>
                  </Link>

                  {/* Ações */}
                  <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => toggle("notifications")}
                        aria-label="Notificações"
                        aria-expanded={activeCard === "notifications"}
                        className={iconBtn}
                      >
                          <Bell className="size-[22px]" />
                          {hasNotificationCount && (
                            <span className={badge}>{notificationCount! > 9 ? "9+" : notificationCount}</span>
                          )}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggle("cart")}
                        aria-label="Carrinho"
                        aria-expanded={activeCard === "cart"}
                        className={iconBtn}
                      >
                          <ShoppingCart className="size-[22px]" />
                          {hasCartCount && <span className={badge}>{cartCount > 9 ? "9+" : cartCount}</span>}
                      </button>

                      <Guest>
                          <SignInButton mode="modal">
                              <button type="button" aria-label="Entrar" className={iconBtn}>
                                  <User className="size-[22px]" />
                              </button>
                          </SignInButton>
                      </Guest>

                      <Authed>
                          <div className="flex size-10 items-center justify-center">
                              <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
                          </div>
                      </Authed>
                  </div>
              </div>

              {/* LINHA 2: busca */}
              <div className="pb-3">
                  <form
                    role="search"
                    className="flex items-center gap-2.5 rounded-full border border-[#E4D9BF] bg-[#FBF7EC] px-4 py-3 focus-within:border-[#2E3B2B]"
                    onSubmit={(event) => {
                        event.preventDefault()
                        const term = searchTerm.trim()
                        if (term) router.push(`/buscar?q=${encodeURIComponent(term)}`)
                    }}
                  >
                      <Search className="size-[18px] shrink-0 text-[#7A7260]" />
                      <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Buscar bikes, peças, marcas"
                        className="w-full bg-transparent text-base text-[#2B2A22] outline-none placeholder:text-[#7A7260]"
                      />
                  </form>
              </div>
          </div>

          {/* NOTIFICAÇÕES */}
          {activeCard === "notifications" && (
            <div className="absolute inset-x-3 top-full mt-2 rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC] p-4 shadow-lg sm:left-auto sm:right-4 sm:w-80">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="font-heading text-base font-bold text-[#2B2A22]">Notificações</h2>
                        <p className="mt-1 text-sm text-[#7A7260]">
                            {hasNotificationCount
                              ? `Você tem ${notificationCount} ${
                                notificationCount === 1 ? "notificação não lida" : "notificações não lidas"
                              }.`
                              : "Tudo em dia por aqui."}
                        </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeCard}
                      aria-label="Fechar notificações"
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#7A7260] active:bg-[#E4D9BF]/70"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
          )}

          {/* CARRINHO */}
          {activeCard === "cart" && (
            <div className="absolute inset-x-3 top-full mt-2 rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC] p-4 shadow-lg sm:left-auto sm:right-4 sm:w-80">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="font-heading text-base font-bold text-[#2B2A22]">Carrinho</h2>
                        <p className="mt-1 text-sm text-[#7A7260]">
                            {hasCartCount
                              ? `${cartCount} ${cartCount === 1 ? "item" : "itens"} no carrinho.`
                              : "Seu carrinho está vazio."}
                        </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeCard}
                      aria-label="Fechar carrinho"
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#7A7260] active:bg-[#E4D9BF]/70"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {hasCartCount && (
                  <Link
                    href="/carrinho"
                    onClick={closeCard}
                    className="mt-4 block rounded-full bg-[#2E3B2B] py-3 text-center text-sm font-semibold text-[#F5EEDC] active:scale-[0.98]"
                  >
                      Ver carrinho
                  </Link>
                )}
            </div>
          )}
      </header>
    )
}