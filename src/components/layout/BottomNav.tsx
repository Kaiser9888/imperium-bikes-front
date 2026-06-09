'use client'

import { Home, Search, Trophy, MessageCircle, User } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'

export function BottomNav() {
    const pathname = usePathname()
    const { isSignedIn } = useUser()

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Buscar', href: '/buscar' },
        { icon: Trophy, label: 'Torneios', href: '/torneios' },
        { icon: MessageCircle, label: 'Chat', href: '/chat' },
        { icon: User, label: 'Perfil', href: '/perfil', protected: true },
    ]

    return (
        <nav className="bottom-nav" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-nav)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
            zIndex: 50,
            height: '62px'
        }}>
            {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                // Se for rota protegida e usuário não estiver logado, mostra modal de login
                if (item.protected && !isSignedIn) {
                    return (
                        <SignInButton key={item.href} mode="modal">
                            <button style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 14px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ position: 'relative', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={24} color="#888888" strokeWidth={1.5} />
                                </div>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '500',
                                    color: '#888888',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase'
                                }}>
                                    {item.label}
                                </span>
                            </button>
                        </SignInButton>
                    )
                }

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 14px',
                            textDecoration: 'none',
                            position: 'relative',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isActive && (
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                width: '22px',
                                height: '3px',
                                backgroundColor: '#DC2626',
                                borderRadius: '2px'
                            }} />
                        )}

                        <div style={{
                            position: 'relative',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Icon
                                size={24}
                                color={isActive ? '#DC2626' : '#888888'}
                                strokeWidth={isActive ? 2.5 : 1.5}
                                style={{ transition: 'all 0.2s' }}
                            />

                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    left: '-4px',
                                    right: '-4px',
                                    bottom: '-4px',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(220,38,38,0.08)',
                                    animation: 'pulseBg 2s infinite'
                                }} />
                            )}
                        </div>

                        <span style={{
                            fontSize: '10px',
                            fontWeight: isActive ? '700' : '500',
                            color: isActive ? '#DC2626' : '#888888',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            transition: 'color 0.2s'
                        }}>
                            {item.label}
                        </span>
                    </Link>
                )
            })}

            <style>{`
                @keyframes pulseBg {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    50% {
                        transform: scale(1.3);
                        opacity: 0;
                    }
                }
            `}</style>
        </nav>
    )
}