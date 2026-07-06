"use client"

import { useEffect } from "react"
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
} from "lucide-react"

type MenuDrawerProps = {
    open: boolean
    onClose: () => void
}

const menuItems = [
    { icon: Home, label: "Início", href: "/" },
    { icon: Bell, label: "Notificações", href: "/notificacoes" },
    { icon: Heart, label: "Favoritos", href: "/favoritos" },
    { icon: ShoppingBag, label: "Compras", href: "/compras", hint: "Histórico e gastos" },
    { icon: Wallet, label: "Carteira", href: "/carteira" },
    { icon: Tag, label: "Ofertas", href: "/ofertas" },
    { icon: History, label: "Histórico", href: "/historico" },
    { icon: User, label: "Minha conta", href: "/conta" },
    { icon: Headphones, label: "Contato", href: "/contato", hint: "Ajuda em geral" },
    { icon: LayoutGrid, label: "Categorias", href: "/categorias" },
    { icon: Store, label: "Publicar anuncio", href: "/publicar" },
]

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
    const { isSignedIn } = useAuth()

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [open])

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden={!open}
                onClick={onClose}
                className={`fixed inset-0 z-50 bg-foreground/40 transition-opacity duration-300 ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            {/* Drawer */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Menu principal"
                className={`fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col bg-sidebar shadow-2xl transition-transform duration-300 ease-out ${
                    open ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Cabeçalho do menu (mármore) */}
                <div
                    className="relative bg-cover bg-center"
                    style={{ backgroundImage: "url(/images/marble-light.png)" }}
                >
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

                {/* Faixa de conta (Clerk) */}
                <ProfileBar onClose={onClose} />

                {/* Itens */}
                <nav className="flex-1 overflow-y-auto px-2 py-3">
                    <ul className="flex flex-col">
                        {menuItems.map(({ icon: Icon, label, href, hint }) => (
                            <li key={label}>
                                <a
                                    href={href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                    <Icon className="size-[1.15rem]" />
                  </span>
                                    <span className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">{label}</span>
                                        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
                  </span>
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

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

    return (
        <div className="border-b border-sidebar-border bg-secondary/50 px-5 py-4">
            {isSignedIn ? (
                <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
            {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={user.imageUrl || "/placeholder.svg"}
                    alt={user?.fullName ?? "Foto de perfil"}
                    className="size-full object-cover"
                />
            ) : (
                <User className="size-5" />
            )}
          </span>
                    <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-sidebar-foreground">
              {user?.fullName ?? user?.username ?? "Bem-vindo"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ?? "Sua conta Imperium"}
            </span>
          </span>
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-sidebar-foreground">Entre na sua conta</p>
                    <p className="mb-2 text-xs text-muted-foreground">
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
            )}
        </div>
    )
}