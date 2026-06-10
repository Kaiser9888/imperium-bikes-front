'use client'

import { useState } from 'react'
import { Bell, Menu, X, User, Settings, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'

export function Header() {
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)
    const { isSignedIn, user } = useUser()

    const nomeInicial = user?.firstName?.charAt(0)?.toUpperCase() || '?'

    return (
        <>
            <header style={{
                position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#000000',
                borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '6px 12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <Image
                        src="/logo.png"
                        alt="Imperium"
                        width={160}
                        height={40}
                        priority
                        style={{ objectFit: 'contain', flexShrink: 0 }}
                    />
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isSignedIn && (
                        <>
                            <button style={iconBtn} onClick={() => router.push('/notificacoes')}>
                                <Bell size={19} color="#fff" />
                            </button>
                            <button style={iconBtn} onClick={() => router.push('/chat')}>
                                <MessageCircle size={19} color="#fff" />
                            </button>
                        </>
                    )}
                    <button style={iconBtn} onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={19} color="#fff" /> : <Menu size={19} color="#fff" />}
                    </button>
                </div>
            </header>

            {menuOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 60
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)'
                    }} onClick={() => setMenuOpen(false)} />

                    <div style={{
                        position: 'absolute', top: 0, right: 0, width: '300px', height: '100%',
                        backgroundColor: '#0a0a0a', padding: '20px', borderLeft: '1px solid #222',
                        overflowY: 'auto', display: 'flex', flexDirection: 'column'
                    }}>
                        {isSignedIn && user && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '8px 0 20px', borderBottom: '1px solid #222', marginBottom: '20px'
                            }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #DC2626, #991b1b)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '20px', fontWeight: 'bold', color: '#fff',
                                    overflow: 'hidden'
                                }}>
                                    {user.imageUrl ? (
                                        <img src={user.imageUrl} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : nomeInicial}
                                </div>
                                <div>
                                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0 }}>
                                        {user.fullName || user.firstName}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>
                                        {user.primaryEmailAddress?.emailAddress}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                            {[
                                { icon: '🎥', label: 'Vídeos', href: '/videos' },
                                { icon: '💬', label: 'Fórum', href: '/forum' },
                                { icon: '🏆', label: 'Torneios', href: '/torneios' },
                                { icon: '⭐', label: 'Favoritos', href: '/favoritos' },
                                { icon: '🏷️', label: 'Meus Anúncios', href: '/meus-anuncios' },
                            ].map(item => (
                                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                                    <button
                                        onClick={() => setMenuOpen(false)}
                                        style={{
                                            width: '100%', padding: '13px 16px',
                                            backgroundColor: 'transparent', border: 'none',
                                            borderRadius: '8px', fontSize: '15px',
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            cursor: 'pointer', color: '#ccc', textAlign: 'left'
                                        }}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </button>
                                </Link>
                            ))}
                        </div>

                        <div style={{
                            marginTop: '20px', paddingTop: '20px',
                            borderTop: '1px solid #222', display: 'flex',
                            flexDirection: 'column', gap: '8px'
                        }}>
                            {isSignedIn ? (
                                <>
                                    <button style={menuBtn} onClick={() => { setMenuOpen(false); router.push('/perfil'); }}>
                                        <User size={16} /> Meu Perfil
                                    </button>
                                    <button style={menuBtn} onClick={() => { setMenuOpen(false); router.push('/perfil'); }}>
                                        <Settings size={16} /> Configurações
                                    </button>
                                    <div style={{ padding: '8px 16px' }}>
                                        <UserButton />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <SignInButton mode="modal">
                                        <button style={{
                                            width: '100%', padding: '14px', backgroundColor: '#DC2626',
                                            color: '#fff', border: 'none', borderRadius: '8px',
                                            fontSize: '15px', fontWeight: 'bold', cursor: 'pointer'
                                        }}>
                                            Entrar
                                        </button>
                                    </SignInButton>
                                    <SignUpButton mode="modal">
                                        <button style={{
                                            width: '100%', padding: '14px', backgroundColor: 'transparent',
                                            color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '8px', fontSize: '15px', fontWeight: '600',
                                            cursor: 'pointer'
                                        }}>
                                            Cadastrar
                                        </button>
                                    </SignUpButton>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

const iconBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
    display: 'flex', borderRadius: '50%'
}

const menuBtn: React.CSSProperties = {
    width: '100%', padding: '12px 16px', backgroundColor: 'transparent',
    border: 'none', borderRadius: '8px', fontSize: '14px', display: 'flex',
    alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#ccc',
    textAlign: 'left'
}