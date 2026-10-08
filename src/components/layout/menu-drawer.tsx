'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignUpButton, SignOutButton, useUser, useAuth } from '@clerk/nextjs'
import { Bell, ChevronRight, Headphones, Heart, History, Home, LayoutGrid, LogOut, ShoppingBag, Sparkles, Store, Tag, User, Wallet, X, type LucideIcon } from 'lucide-react'

type MenuDrawerProps = { open: boolean; onClose: () => void }
type MenuItem = { icon: LucideIcon; label: string; href: string; hint?: string }
type MenuSection = { title?: string; items: MenuItem[] }

const menuSections: MenuSection[] = [
  { items: [{ icon: Home, label: 'Início', href: '/' }] },
  {
    title: 'Explorar',
    items: [
      { icon: LayoutGrid, label: 'Categorias', href: '/categorias' },
      { icon: Tag, label: 'Ofertas', href: '/ofertas' },
      { icon: Heart, label: 'Favoritos', href: '/favoritos' },
      { icon: ShoppingBag, label: 'Compras', href: '/compras', hint: 'Histórico e gastos' },
    ],
  },
  {
    title: 'Sua conta',
    items: [
      { icon: User, label: 'Meu perfil', href: '/perfil' },
      { icon: Wallet, label: 'Carteira', href: '/carteira' },
      { icon: Bell, label: 'Notificações', href: '/notificacoes' },
      { icon: History, label: 'Histórico', href: '/historico' },
      { icon: User, label: 'Configurações da conta', href: '/conta' },
    ],
  },
  { title: 'Suporte', items: [{ icon: Headphones, label: 'Contato', href: '/contato', hint: 'Ajuda em geral' }] },
]

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href))

  return (
    <>
      <button type="button" aria-label="Fechar menu" onClick={onClose} className={`fixed inset-0 z-40 cursor-default bg-foreground/45 backdrop-blur-[3px] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside role="dialog" aria-modal="true" aria-label="Menu principal" aria-hidden={!open} className={`fixed inset-y-0 right-0 z-50 flex w-[min(92vw,390px)] flex-col overflow-hidden rounded-l-[2.25rem] bg-background text-foreground shadow-[-24px_0_70px_rgba(32,27,16,0.22)] transition-[transform,visibility] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${open ? 'visible translate-x-0' : 'invisible translate-x-full'}`}>
        <div className="relative px-7 pb-6 pt-7">
          <div className="pointer-events-none absolute -left-16 -top-24 size-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-primary"><span className="size-1.5 rounded-full bg-primary" />Navegação</p>
              <p className="font-serif text-[2.9rem] font-semibold leading-none tracking-[-0.07em]">Imperium</p>
              <p className="mt-3 max-w-[220px] text-xs leading-relaxed text-muted-foreground">Tudo o que você precisa, em um só lugar.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Fechar menu" className="flex size-10 items-center justify-center rounded-2xl border border-border bg-white/70 text-muted-foreground transition-all hover:rotate-90 hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="size-4" /></button>
          </div>
        </div>

        <ProfileBar onClose={onClose} />

        <nav className="flex-1 overflow-y-auto px-5 py-5" aria-label="Navegação principal">
          <Link href="/vendedor" onClick={onClose} className={`group mb-6 flex items-center gap-3 rounded-2xl p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${isActive('/vendedor') ? 'bg-foreground text-primary-foreground' : 'bg-primary/10 text-foreground shadow-[0_8px_25px_rgba(167,125,49,0.14)]'}`}>
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-[1rem] ${isActive('/vendedor') ? 'bg-primary text-primary-foreground' : 'bg-foreground text-primary-foreground'}`}><Store className="size-5" /></span>
            <span className="flex min-w-0 flex-1 flex-col"><span className="text-sm font-bold">Central do vendedor</span><span className={`mt-1 truncate text-xs ${isActive('/vendedor') ? 'text-white/60' : 'text-muted-foreground'}`}>Publique e gerencie seus anúncios</span></span>
            <ChevronRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="flex flex-col gap-6">
            {menuSections.map((section, index) => (
              <section key={section.title ?? index}>
                {section.title && <h2 className="mb-2 px-3 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-primary">{section.title}</h2>}
                <ul className="grid gap-1">
                  {section.items.map(({ icon: Icon, label, href, hint }) => {
                    const selected = isActive(href)
                    return <li key={href}><Link href={href} prefetch={false} onClick={onClose} aria-current={selected ? 'page' : undefined} className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'bg-white text-primary shadow-[0_5px_18px_rgba(50,42,27,0.09)]' : 'text-muted-foreground hover:translate-x-1 hover:bg-white/80 hover:text-foreground'}`}>
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${selected ? 'bg-primary/10' : 'bg-surface-muted group-hover:bg-primary/10'}`}><Icon className="size-[1.05rem]" /></span>
                      <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm font-semibold">{label}</span>{hint && <span className="truncate text-xs text-foreground/40">{hint}</span>}</span>
                      <ChevronRight className={`size-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${selected ? 'text-primary' : 'text-foreground/20'}`} />
                    </Link></li>
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-border bg-white/35 px-6 py-4">
          {isSignedIn && <SignOutButton><button type="button" onClick={onClose} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-white hover:text-foreground"><LogOut className="size-4" />Sair da conta</button></SignOutButton>}
          <p className="text-center text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-foreground/30">Imperium · 2026</p>
        </div>
      </aside>
    </>
  )
}

function ProfileBar({ onClose }: { onClose: () => void }) {
  const { user } = useUser()
  const { isSignedIn } = useAuth()

  if (!isSignedIn) return <div className="border-y border-border bg-white/60 px-6 py-5"><div className="mb-4 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-foreground text-primary-foreground"><Sparkles className="size-4" /></span><div><p className="text-sm font-bold text-foreground">Sua experiência, elevada</p><p className="mt-0.5 text-xs text-muted-foreground">Entre para desbloquear tudo.</p></div></div><div className="flex gap-2"><SignInButton mode="modal"><button type="button" onClick={onClose} className="flex-1 rounded-xl bg-foreground py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Entrar</button></SignInButton><SignUpButton mode="modal"><button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border bg-white/70 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Cadastrar</button></SignUpButton></div></div>

  return <Link href="/perfil" onClick={onClose} className="flex items-center gap-3 border-y border-border bg-white/60 px-6 py-4 transition-colors hover:bg-white"><span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground">{user?.imageUrl ? <img src={user.imageUrl} alt={user.fullName ?? 'Foto de perfil'} className="size-full object-cover" /> : <User className="size-5" />}</span><span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm font-bold text-foreground">{user?.fullName ?? user?.username ?? 'Bem-vindo'}</span><span className="truncate text-xs text-muted-foreground">{user?.primaryEmailAddress?.emailAddress ?? 'Sua conta Imperium'}</span></span><ChevronRight className="size-4 shrink-0 text-foreground/30" /></Link>
}

export default MenuDrawer