"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignInButton, SignUpButton, SignOutButton, useUser, useAuth } from "@clerk/nextjs"
import {
  Bell,
  ChevronRight,
  Headphones,
  Heart,
  History,
  Home,
  LayoutGrid,
  LogOut,
  ShoppingBag,
  Store,
  Tag,
  User,
  Wallet,
  X,
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
  { items: [{ icon: Home, label: "Início", href: "/" }] },
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
  { title: "Ajuda", items: [{ icon: Headphones, label: "Contato", href: "/contato", hint: "Ajuda em geral" }] },
]

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href))

  return (
    <>
      <button
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
        className={`fixed inset-0 z-40 cursor-default bg-black/55 backdrop-blur-[3px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(88vw,390px)] flex-col overflow-hidden border-l border-white/10 bg-[#101110] text-white shadow-[-24px_0_80px_rgba(0,0,0,0.28)] transition-[transform,visibility] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
          open ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <div className="relative overflow-hidden border-b border-white/10 px-6 pb-6 pt-7">
          <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#c9a86a]/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-8 h-px w-24 bg-[#c9a86a]" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-[#c9a86a]/50 hover:bg-white/5 hover:text-[#e2c58b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a86a]"
          >
            <X className="size-4" />
          </button>
          <p className="relative font-serif text-[2.1rem] font-semibold tracking-[-0.04em] text-[#e2c58b]">Imperium</p>
        </div>

        <ProfileBar onClose={onClose} />

        <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Navegação principal">
          <Link
            href="/vendedor"
            onClick={onClose}
            className={`group mb-6 flex items-center gap-3 rounded-2xl border p-3 transition-all ${
              isActive("/vendedor")
                ? "border-[#c9a86a] bg-[#c9a86a] text-[#101110]"
                : "border-[#c9a86a]/35 bg-[#c9a86a]/[0.07] text-white hover:border-[#c9a86a]/70 hover:bg-[#c9a86a]/[0.13]"
            }`}
          >
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${isActive("/vendedor") ? "bg-black/10" : "bg-[#c9a86a] text-[#101110]"}`}>
              <Store className="size-5" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-semibold">Central do vendedor</span>
              <span className={`mt-0.5 truncate text-xs ${isActive("/vendedor") ? "text-[#101110]/65" : "text-white/50"}`}>
                Publique e gerencie seus anúncios
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <div className="flex flex-col gap-6">
            {menuSections.map((section, index) => (
              <section key={section.title ?? index}>
                {section.title && <h2 className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/35">{section.title}</h2>}
                <ul className="flex flex-col gap-1">
                  {section.items.map(({ icon: Icon, label, href, hint }) => {
                    const selected = isActive(href)
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          prefetch={false}
                          onClick={onClose}
                          aria-current={selected ? "page" : undefined}
                          className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a86a] ${
                            selected ? "bg-white/[0.09] text-[#e2c58b]" : "text-white/72 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          {selected && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#c9a86a]" />}
                          <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${selected ? "bg-[#c9a86a]/15" : "bg-white/[0.06] group-hover:bg-[#c9a86a]/10"}`}>
                            <Icon className="size-[1.05rem]" />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium">{label}</span>
                            {hint && <span className="truncate text-xs text-white/35">{hint}</span>}
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-[#c9a86a]" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          {isSignedIn && (
            <SignOutButton>
              <button type="button" onClick={onClose} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-white/65 transition-colors hover:border-[#c9a86a]/40 hover:bg-white/[0.05] hover:text-white">
                <LogOut className="size-4" />
                Sair da conta
              </button>
            </SignOutButton>
          )}
          <p className="text-center text-[0.65rem] uppercase tracking-[0.24em] text-white/30">Imperium · 2026</p>
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
      <div className="border-b border-white/10 bg-white/[0.025] px-6 py-5">
        <p className="text-sm font-semibold text-white">Entre na sua conta</p>
        <p className="mb-4 mt-1 text-xs leading-relaxed text-white/45">Acesse compras, favoritos e ofertas exclusivas.</p>
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-[#c9a86a] py-2.5 text-sm font-semibold text-[#101110] transition-colors hover:bg-[#e2c58b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2c58b]">Entrar</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/15 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:border-[#c9a86a]/50 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2c58b]">Cadastrar</button>
          </SignUpButton>
        </div>
      </div>
    )
  }

  return (
    <Link href="/perfil" onClick={onClose} className="flex items-center gap-3 border-b border-white/10 bg-white/[0.025] px-6 py-4 transition-colors hover:bg-white/[0.06]">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#c9a86a] text-[#101110]">
        {user?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt={user.fullName ?? "Foto de perfil"} className="size-full object-cover" />
        ) : <User className="size-5" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-white">{user?.fullName ?? user?.username ?? "Bem-vindo"}</span>
        <span className="truncate text-xs text-white/40">{user?.primaryEmailAddress?.emailAddress ?? "Sua conta Imperium"}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-white/35" />
    </Link>
  )
}

// Rotas preservadas: apenas a linguagem visual e o nome da marca foram atualizados.
export default MenuDrawer