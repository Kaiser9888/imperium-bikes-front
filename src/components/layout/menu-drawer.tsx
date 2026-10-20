"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs"
import {
    CircleDollarSign,
    Clapperboard,
    Heart,
    LayoutGrid,
    LogOut,
    Megaphone,
    MessageCircle,
    PlusCircle,
    Settings,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Store,
    Trophy,
    Bell,
    Users,
    Package,
    User,
    Wallet,
    type LucideIcon,
} from "lucide-react"

import { OrcaMark } from "@/components/layout/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { isRouteActive } from "@/lib/navigation"
import { useIsAdmin } from "@/lib/use-is-admin"
import { cn } from "@/lib/utils"

type MenuDrawerProps = { open: boolean; onOpenChange: (open: boolean) => void }
type MenuItem = { icon: LucideIcon; label: string; href: string }
type MenuSection = { title: string; items: MenuItem[] }

// Somente rotas que existem no app. Suporte volta quando tiver implementação real.
const menuSections: MenuSection[] = [
    {
        title: "Minha conta",
        items: [
            { icon: User, label: "Perfil", href: "/perfil" },
            { icon: Heart, label: "Favoritos", href: "/favoritos" },
            { icon: MessageCircle, label: "Chat", href: "/chat" },
            { icon: Bell, label: "Notificações", href: "/notificacoes" },
            { icon: Wallet, label: "Carteira", href: "/carteira" },
        ],
    },
    {
        title: "Eventos",
        items: [
            { icon: Trophy, label: "Eventos", href: "/torneios" },
            { icon: PlusCircle, label: "Criar evento", href: "/torneios/criar" },
        ],
    },
    {
        title: "Marketplace",
        items: [
            { icon: ShoppingBag, label: "Comprar", href: "/produtos" },
            { icon: ShoppingCart, label: "Carrinho", href: "/carrinho" },
            { icon: Package, label: "Pedidos", href: "/pedidos" },
        ],
    },
    {
        // Tudo de anunciar (publicar, rascunhos, gerenciar) fica dentro da Central
        title: "Vender",
        items: [
            { icon: Store, label: "Central do vendedor", href: "/vendedor" },
            { icon: Megaphone, label: "Anunciar nos vídeos", href: "/anunciar" },
        ],
    },
    {
        title: "Conteúdo",
        items: [
            { icon: Clapperboard, label: "Vídeos", href: "/videos" },
            { icon: CircleDollarSign, label: "Monetização", href: "/videos/monetizacao" },
            { icon: Users, label: "Comunidade", href: "/forum" },
            { icon: LayoutGrid, label: "Categorias", href: "/modalidades" },
        ],
    },
    {
        title: "Sistema",
        items: [{ icon: Settings, label: "Configurações", href: "/configuracoes" }],
    },
]

// Só aparece para quem tem ROLE_ADMIN no backend
const secaoAdmin: MenuSection = {
    title: "Administração",
    items: [{ icon: ShieldCheck, label: "Painel admin", href: "/admin" }],
}

export function MenuDrawer({ open, onOpenChange }: MenuDrawerProps) {
    const { isSignedIn } = useAuth()
    const { isAdmin } = useIsAdmin()
    const pathname = usePathname()
    const close = () => onOpenChange(false)

    const secoes = isAdmin ? [...menuSections, secaoAdmin] : menuSections
    const todosOsLinks = secoes.flatMap((section) => section.items.map((item) => item.href))

    // Entre /torneios e /torneios/criar, só o link mais específico fica marcado
    // e o fluxo de publicação (/publicar/...) conta como Central do vendedor
    const rota = isRouteActive(pathname, "/publicar") ? "/vendedor" : pathname
    const ativo = todosOsLinks
        .filter((href) => isRouteActive(rota, href))
        .sort((a, b) => b.length - a.length)[0]

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="flex w-[min(90vw,22.5rem)] flex-col gap-0 border-l-0 bg-surface p-0 sm:max-w-none">
                <div className="flex items-center gap-2.5 px-6 pb-5 pt-6">
                    <OrcaMark className="h-8" />
                    <SheetTitle className="brand-name text-xl">Imperium Bikes</SheetTitle>
                    <SheetDescription className="sr-only">Menu principal</SheetDescription>
                </div>

                <ProfileBar onNavigate={close} />

                <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-3 py-4">
                    {secoes.map((section) => (
                        <section key={section.title} className="mb-5 last:mb-0">
                            <h3 className="type-caption px-3 pb-1 font-semibold text-muted-foreground">{section.title}</h3>
                            <ul>
                                {section.items.map(({ icon: Icon, label, href }) => {
                                    const selected = href === ativo
                                    return (
                                        <li key={href}>
                                            <Link
                                                href={href}
                                                onClick={close}
                                                aria-current={selected ? "page" : undefined}
                                                className={cn(
                                                    "type-label flex h-11 items-center gap-3 rounded-lg px-3 transition-colors",
                                                    selected
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-foreground hover:bg-surface-muted",
                                                )}
                                            >
                                                <Icon
                                                    className={cn("size-5", !selected && "text-muted-foreground")}
                                                    strokeWidth={1.9}
                                                    aria-hidden="true"
                                                />
                                                {label}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    ))}
                </nav>

                {isSignedIn && (
                    <div className="border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                        <SignOutButton>
                            <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground" onClick={close}>
                                <LogOut className="size-5" aria-hidden="true" />
                                Sair da conta
                            </Button>
                        </SignOutButton>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

function ProfileBar({ onNavigate }: { onNavigate: () => void }) {
    const { user } = useUser()
    const { isSignedIn } = useAuth()

    if (!isSignedIn) {
        return (
            <div className="border-y border-border bg-surface-secondary px-6 py-5">
                <p className="type-label text-foreground">Entre na sua conta</p>
                <p className="type-body-small mt-0.5 text-muted-foreground">
                    Para se inscrever em eventos, comprar e vender.
                </p>
                <div className="mt-4 flex gap-2">
                    <Button asChild className="flex-1" onClick={onNavigate}><Link href="/sign-in">
                            Entrar
                        </Link></Button>
                    <Button asChild variant="outline" className="flex-1" onClick={onNavigate}><Link href="/sign-up">
                            Cadastrar
                        </Link></Button>
                </div>
            </div>
        )
    }

    const nome = user?.fullName ?? user?.username
    return (
        <Link
            href="/perfil"
            onClick={onNavigate}
            className="flex items-center gap-3 border-y border-border bg-surface-secondary px-6 py-4 transition-colors hover:bg-surface-muted"
        >
            <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
                {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                    <User className="size-5" aria-hidden="true" />
                )}
            </span>
            <span className="flex min-w-0 flex-col">
                {nome && <span className="type-label truncate text-foreground">{nome}</span>}
                <span className="type-body-small truncate text-muted-foreground">Ver perfil</span>
            </span>
        </Link>
    )
}

export default MenuDrawer
