// components/layout/menu-drawer.tsx
"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignInButton, SignUpButton, SignOutButton, useUser, useAuth } from "@clerk/nextjs"
import {
  Home,
  Bell,
  Heart,
  ShoppingBag,
  Wallet,
  Tag,
  History,
  User,
  Headphones,
  LayoutGrid,
  Store,
  X,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from "lucide-react"

type MenuDrawerProps = {
  open: boolean
  onClose: () => void
}

type MenuItem = {
  icon: LucideIcon
  label: string
  href: string
  hint?: string
}

type MenuSection = {
  title?: string
  items: MenuItem[]
}

const menuSections: MenuSection[] = [
  {
    items: [{ icon: Home, label: "Início", href: "/" }],
  },
  {
    title: "Comprar",
    items: [
      { icon: LayoutGrid, label: "Categorias", href: "/categorias" },
      { icon: Tag, label: "Ofertas", href: "/ofertas" },
      { icon: Heart, label: "Favoritos", href: "/favoritos" },
      { icon: ShoppingBag, label: "Compras", href: "/compras", hint: "Histórico e gastos" },
    ],
  },
  {
    title: "Minha conta",
    items: [
      { icon: User, label: "Meu perfil", href: "/perfil" },
      { icon: Wallet, label: "Carteira", href: "/carteira" },
      { icon: Bell, label: "Notificações", href: "/notificacoes" },
      { icon: History, label: "Histórico", href: "/historico" },
      { icon: User, label: "Configurações da conta", href: "/conta" },
    ],
  },
  {
    title: "Ajuda",
    items: [{ icon: Headphones, label: "Contato", href: "/contato", hint: "Ajuda em geral" }],
  },
]

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  // Trava o scroll da página enquanto o menu está aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Fecha com a tecla Esc
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const ativo = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href))

  return (
    <>
      {/* Fundo escuro */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-foreground/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Painel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col bg-sidebar shadow-2xl transition-[transform,visibility] duration-300 ease-out ${
          open ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        {/* Cabeçalho (mármore) */}
        <div className="relative bg-cover bg-center" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
          <div className="bg-marble/70 px-5 py-6 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-md text-marble-foreground transition-colors hover:bg-marble-foreground/10"
            >
              <X className="size-5" />
            </button>
            <p className="font-blackletter text-3xl leading-none text-primary">Imperium</p>
            <p className="mt-1 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-marble-foreground/70">
              Bikes
            </p>
          </div>
        </div>

        {/* Conta */}
        <ProfileBar onClose={onClose} />

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação principal">
          {/* Destaque: Central do vendedor */}
          <Link
            href="/vendedor"
            onClick={onClose}
            className={`mb-5 flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
              ativo("/vendedor")
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10"
            }`}
          >
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                            ativo("/vendedor") ? "bg-primary-foreground/15" : "bg-primary text-primary-foreground"
                          }`}
                        >
                            <Store className="size-5" />
                        </span>
            <span className="flex min-w-0 flex-1 flex-col">
                            <span className="text-sm font-semibold">Central do vendedor</span>
                            <span
                              className={`text-xs ${
                                ativo("/vendedor") ? "text-primary-foreground/80" : "text-muted-foreground"
                              }`}
                            >
                                Publique e gerencie seus anúncios
                            </span>
                        </span>
            <ChevronRight className="size-4 shrink-0 opacity-60" />
          </Link>

          <div className="flex flex-col gap-5">
            {menuSections.map((section, i) => (
              <section key={section.title ?? i}>
                {section.title && (
                  <h2 className="mb-1.5 px-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {section.title}
                  </h2>
                )}
                <ul className="flex flex-col gap-0.5">
                  {section.items.map(({ icon: Icon, label, href, hint }) => {
                    const selecionado = ativo(href)
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          onClick={onClose}
                          aria-current={selecionado ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                            selecionado
                              ? "bg-sidebar-accent text-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent"
                          }`}
                        >
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                                                        <Icon className="size-[1.1rem]" />
                                                    </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                                                        <span className="truncate text-sm font-medium">{label}</span>
                            {hint && (
                              <span className="truncate text-xs text-muted-foreground">{hint}</span>
                            )}
                                                    </span>
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        {/* Rodapé */}
        <div className="border-t border-sidebar-border px-5 py-4">
          {isSignedIn && (
            <SignOutButton>
              <button
                type="button"
                onClick={onClose}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-sidebar-border py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              >
                <LogOut className="size-4" />
                Sair da conta
              </button>
            </SignOutButton>
          )}
          <p className="font-heading text-xs uppercase tracking-widest text-muted-foreground">
            Imperium Bikes · 2026
          </p>
        </div>
      </aside>
    </>
  )
}

function ProfileBar({ onClose }: { onClose: () => void }) {
  const { user } = useUser()
  const { isSignedIn } = useAuth()

  if (!isSignedIn) {
    return (
      <div className="border-b border-sidebar-border bg-secondary/50 px-5 py-4">
        <p className="text-sm font-medium text-sidebar-foreground">Entre na sua conta</p>
        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
          Acesse compras, favoritos e ofertas exclusivas.
        </p>
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Entrar
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-sidebar-border py-2.5 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              Cadastrar
            </button>
          </SignUpButton>
        </div>
      </div>
    )
  }

  return (
    <Link
      href="/perfil"
      onClick={onClose}
      className="flex items-center gap-3 border-b border-sidebar-border bg-secondary/50 px-5 py-4 transition-colors hover:bg-secondary"
    >
            <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.imageUrl}
                    alt={user.fullName ?? "Foto de perfil"}
                    className="size-full object-cover"
                  />
                ) : (
                  <User className="size-5" />
                )}
            </span>
      <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-sidebar-foreground">
                    {user?.fullName ?? user?.username ?? "Bem-vindo"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress ?? "Sua conta Imperium"}
                </span>
            </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}