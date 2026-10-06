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
      <button type="button" aria-label="Fechar menu" onClick={onClose} className={`fixed inset-0 z-40 cursor-default bg-[#17150f]/45 backdrop-blur-[3px] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside role="dialog" aria-modal="true" aria-label="Menu principal" aria-hidden={!open} className={`fixed inset-y-0 right-0 z-50 flex w-[min(92vw,390px)] flex-col overflow-hidden rounded-l-[2.25rem] bg-[#faf8f2] text-[#25231d] shadow-[-24px_0_70px_rgba(32,27,16,0.22)] transition-[transform,visibility] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${open ? 'visible translate-x-0' : 'invisible translate-x-full'}`}>
        <div className="relative px-7 pb-6 pt-7">
          <div className="pointer-events-none absolute -left-16 -top-24 size-64 rounded-full bg-[#d9b56b]/30 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="mb-3 flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-[#a27b38]"><span className="size-1.5 rounded-full bg-[#c69a4e]" />Navegação</p>
              <p className="font-serif text-[2.9rem] font-semibold leading-none tracking-[-0.07em]">Imperium</p>
              <p className="mt-3 max-w-[220px] text-xs leading-relaxed text-[#25231d]/45">Tudo o que você precisa, em um só lugar.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Fechar menu" className="flex size-10 items-center justify-center rounded-2xl border border-[#25231d]/10 bg-white/70 text-[#25231d]/60 transition-all hover:rotate-90 hover:bg-white hover:text-[#25231d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b48a45]"><X className="size-4" /></button>
          </div>
        </div>

        <ProfileBar onClose={onClose} />

        <nav className="flex-1 overflow-y-auto px-5 py-5" aria-label="Navegação principal">
          <Link href="/vendedor" onClick={onClose} className={`group mb-6 flex items-center gap-3 rounded-2xl p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${isActive('/vendedor') ? 'bg-[#2d2a22] text-[#faf8f2]' : 'bg-[#ead7ad] text-[#2d2a22] shadow-[0_8px_25px_rgba(167,125,49,0.14)]'}`}>
            <span className={`flex size-12 shrink-0 items-center justify-center rounded-[1rem] ${isActive('/vendedor') ? 'bg-[#d9b56b] text-[#2d2a22]' : 'bg-[#2d2a22] text-[#faf8f2]'}`}><Store className="size-5" /></span>
            <span className="flex min-w-0 flex-1 flex-col"><span className="text-sm font-bold">Central do vendedor</span><span className={`mt-1 truncate text-xs ${isActive('/vendedor') ? 'text-white/60' : 'text-[#2d2a22]/60'}`}>Publique e gerencie seus anúncios</span></span>
            <ChevronRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="flex flex-col gap-6">
            {menuSections.map((section, index) => (
              <section key={section.title ?? index}>
                {section.title && <h2 className="mb-2 px-3 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#a27b38]">{section.title}</h2>}
                <ul className="grid gap-1">
                  {section.items.map(({ icon: Icon, label, href, hint }) => {
                    const selected = isActive(href)
                    return <li key={href}><Link href={href} prefetch={false} onClick={onClose} aria-current={selected ? 'page' : undefined} className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b48a45] ${selected ? 'bg-white text-[#9b7335] shadow-[0_5px_18px_rgba(50,42,27,0.09)]' : 'text-[#25231d]/65 hover:translate-x-1 hover:bg-white/80 hover:text-[#25231d]'}`}>
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${selected ? 'bg-[#f0e2c4]' : 'bg-[#efebe2] group-hover:bg-[#f0e2c4]'}`}><Icon className="size-[1.05rem]" /></span>
                      <span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm font-semibold">{label}</span>{hint && <span className="truncate text-xs text-[#25231d]/40">{hint}</span>}</span>
                      <ChevronRight className={`size-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${selected ? 'text-[#b48a45]' : 'text-[#25231d]/20'}`} />
                    </Link></li>
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-[#25231d]/10 bg-white/35 px-6 py-4">
          {isSignedIn && <SignOutButton><button type="button" onClick={onClose} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#25231d]/10 py-2.5 text-sm font-semibold text-[#25231d]/60 transition-colors hover:border-[#b48a45]/40 hover:bg-white hover:text-[#25231d]"><LogOut className="size-4" />Sair da conta</button></SignOutButton>}
          <p className="text-center text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-[#25231d]/30">Imperium · 2026</p>
        </div>
      </aside>
    </>
  )
}

function ProfileBar({ onClose }: { onClose: () => void }) {
  const { user } = useUser()
  const { isSignedIn } = useAuth()

  if (!isSignedIn) return <div className="border-y border-[#25231d]/10 bg-white/60 px-6 py-5"><div className="mb-4 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-[#2d2a22] text-[#d9b56b]"><Sparkles className="size-4" /></span><div><p className="text-sm font-bold text-[#25231d]">Sua experiência, elevada</p><p className="mt-0.5 text-xs text-[#25231d]/50">Entre para desbloquear tudo.</p></div></div><div className="flex gap-2"><SignInButton mode="modal"><button type="button" onClick={onClose} className="flex-1 rounded-xl bg-[#2d2a22] py-2.5 text-sm font-bold text-[#faf8f2] transition-transform hover:-translate-y-0.5 hover:bg-[#484235] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b48a45]">Entrar</button></SignInButton><SignUpButton mode="modal"><button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#25231d]/15 bg-white/70 py-2.5 text-sm font-bold text-[#25231d]/75 transition-colors hover:bg-white hover:text-[#25231d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b48a45]">Cadastrar</button></SignUpButton></div></div>

  return <Link href="/perfil" onClick={onClose} className="flex items-center gap-3 border-y border-[#25231d]/10 bg-white/60 px-6 py-4 transition-colors hover:bg-white"><span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#d9b56b] text-[#2d2a22]">{user?.imageUrl ? <img src={user.imageUrl} alt={user.fullName ?? 'Foto de perfil'} className="size-full object-cover" /> : <User className="size-5" />}</span><span className="flex min-w-0 flex-1 flex-col"><span className="truncate text-sm font-bold text-[#25231d]">{user?.fullName ?? user?.username ?? 'Bem-vindo'}</span><span className="truncate text-xs text-[#25231d]/45">{user?.primaryEmailAddress?.emailAddress ?? 'Sua conta Imperium'}</span></span><ChevronRight className="size-4 shrink-0 text-[#25231d]/30" /></Link>
}

export default MenuDrawer