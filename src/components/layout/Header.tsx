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
  Celular:
  ┌────────────────────────────────────┐
  │ [logo] Imperium      🔔 🛒 👤  ☰   │
  │ ( 🔍 Buscar produtos, esportes, marcas ) │
  └────────────────────────────────────┘

  PC / tablet (md+), uma linha só:
  [logo] Imperium     ( 🔍 busca centralizada )     🔔 🛒 👤 ☰

  Paleta: creme #F5EEDC · superfície #FBF7EC · linha #E4D9BF
          marca #A33C36 · texto #2B2A22 · apagado #7A7260
*/

const iconBtn =
  "relative flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted active:bg-surface-muted"

const badge =
  "absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-bold leading-4 text-primary-foreground"

const popover =
  "absolute inset-x-3 top-full mt-2 rounded-2xl border border-border bg-surface p-4 shadow-lg md:left-auto md:right-6 md:w-80"

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
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      {activeCard && (
        <button
          type="button"
          aria-label="Fechar"
          onClick={closeCard}
          className="fixed inset-0 -z-10 cursor-default"
        />
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 px-3 py-2 md:flex-nowrap md:px-6 md:py-3">
        {/* LOGO (esquerda) */}
        <Link
          href="/"
          aria-label="Imperium - início"
          className="order-1 flex shrink-0 items-center gap-2"
        >
          <Image
            src="/logo1.png"
            alt=""
            width={80}
            height={40}
            priority
            className="h-auto w-10 object-contain md:w-12"
          />
          <span className="font-heading text-lg font-bold tracking-wide text-primary md:text-xl">
            Imperium
          </span>
        </Link>

        {/* AÇÕES + MENU (direita) */}
        <div className="order-2 ml-auto flex items-center md:order-3 md:ml-0">
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

          <button type="button" onClick={onMenuClick} aria-label="Abrir menu" className={iconBtn}>
            <Menu className="size-6" />
          </button>
        </div>

        {/* BUSCA: linha própria no celular, centralizada no PC */}
        <form
          role="search"
          className="order-3 mt-2 flex w-full items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 focus-within:border-primary md:order-2 md:mx-auto md:mt-0 md:max-w-xl md:flex-1"
          onSubmit={(event) => {
            event.preventDefault()
            const term = searchTerm.trim()
            if (term) router.push(`/buscar?q=${encodeURIComponent(term)}`)
          }}
        >
          <Search className="size-[18px] shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar produtos, esportes, marcas"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
          />
        </form>
      </div>

      {activeCard === "notifications" && (
        <div className={popover}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">Notificações</h2>
              <p className="mt-1 text-sm text-muted-foreground">
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
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {activeCard === "cart" && (
        <div className={popover}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">Carrinho</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {hasCartCount
                  ? `${cartCount} ${cartCount === 1 ? "item" : "itens"} no carrinho.`
                  : "Seu carrinho está vazio."}
              </p>
            </div>
            <button
              type="button"
              onClick={closeCard}
              aria-label="Fechar carrinho"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          {hasCartCount && (
            <Link
              href="/carrinho"
              onClick={closeCard}
              className="mt-4 block rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary-hover active:scale-[0.98]"
            >
              Ver carrinho
            </Link>
          )}
        </div>
      )}
    </header>
  )
}