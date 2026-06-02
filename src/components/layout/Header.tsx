'use client'

import { useState } from 'react'
import { Bell, Menu, X, User, LogOut, Settings, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'

interface UserInfo {
    fullName: string
    email: string
    avatarUrl?: string | null
}

function getAuthState() {
    if (typeof window === 'undefined') {
        return { isAuthenticated: false, usuario: null }
    }
    const token = authService.getToken()
    const user = authService.getUsuario()
    return {
        isAuthenticated: !!token,
        usuario: user ? {
            fullName: user.fullName || '',
            email: user.email || '',
            avatarUrl: user.avatarUrl || null
        } : null
    }
}

export function Header() {
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)
    const [authState, setAuthState] = useState(getAuthState)

    const refreshAuth = () => {
        setAuthState(getAuthState())
    }

    const handleMenuToggle = () => {
        if (!menuOpen) refreshAuth()
        setMenuOpen(prev => !prev)
    }

    const handleLogout = () => {
        authService.logout()
        setMenuOpen(false)
        setAuthState({ isAuthenticated: false, usuario: null })
        router.push('/')
    }

    const { isAuthenticated, usuario } = authState
    const nomeInicial = usuario?.fullName?.charAt(0)?.toUpperCase() || '?'

    return (
        <>
            <header style={headerStyle}>
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

                <div style={iconsContainer}>
                    {isAuthenticated && (
                        <>
                            <button style={iconBtn} onClick={() => router.push('/notificacoes')} aria-label="Notificações">
                                <Bell size={19} color="#fff" />
                            </button>
                            <button style={iconBtn} onClick={() => router.push('/chat')} aria-label="Mensagens">
                                <MessageCircle size={19} color="#fff" />
                            </button>
                        </>
                    )}
                    <button style={iconBtn} onClick={handleMenuToggle} aria-label="Menu">
                        {menuOpen ? <X size={19} color="#fff" /> : <Menu size={19} color="#fff" />}
                    </button>
                </div>
            </header>

            {menuOpen && (
                <div style={overlay}>
                    <div style={overlayBg} onClick={() => setMenuOpen(false)} />
                    <div style={menuPanel}>
                        {isAuthenticated && usuario && (
                            <div style={userSection}>
                                <div style={avatarStyle}>
                                    {usuario.avatarUrl ? (
                                        <img src={usuario.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        nomeInicial
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={userName}>{usuario.fullName}</p>
                                    <p style={userEmail}>{usuario.email}</p>
                                </div>
                            </div>
                        )}

                        <div style={menuItems}>
                            <MenuItem icon="🎥" label="Vídeos" href="/videos" onClick={() => setMenuOpen(false)} />
                            <MenuItem icon="💬" label="Fórum" href="/forum" onClick={() => setMenuOpen(false)} />
                            <MenuItem icon="🏆" label="Torneios" href="/torneios" onClick={() => setMenuOpen(false)} />
                            <MenuItem icon="⭐" label="Favoritos" href="/favoritos" onClick={() => setMenuOpen(false)} />
                            <MenuItem icon="🏷️" label="Meus Anúncios" href="/meus-anuncios" onClick={() => setMenuOpen(false)} />
                        </div>

                        <div style={menuFooter}>
                            {isAuthenticated ? (
                                <>
                                    <button style={menuFooterBtn} onClick={() => { setMenuOpen(false); router.push('/perfil'); }}>
                                        <User size={16} /> Meu Perfil
                                    </button>
                                    <button style={menuFooterBtn} onClick={() => { setMenuOpen(false); router.push('/perfil'); }}>
                                        <Settings size={16} /> Configurações
                                    </button>
                                    <button style={{ ...menuFooterBtn, color: '#EF4444' }} onClick={handleLogout}>
                                        <LogOut size={16} /> Sair
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button style={loginBtn} onClick={() => { setMenuOpen(false); router.push('/login'); }}>
                                        Entrar
                                    </button>
                                    <button style={registerBtn} onClick={() => { setMenuOpen(false); router.push('/cadastro'); }}>
                                        Cadastrar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

function MenuItem({ icon, label, href, onClick }: { icon: string; label: string; href: string; onClick: () => void }) {
    return (
        <button style={menuItemStyle} onClick={() => { onClick(); window.location.href = href; }}>
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    )
}

const headerStyle: React.CSSProperties = {
    position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#000000',
    borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '6px 12px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
}

const iconsContainer: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0
}

const iconBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
    opacity: 0.85, display: 'flex', borderRadius: '50%', transition: 'opacity 0.2s'
}

const overlay: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 60
}

const overlayBg: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)'
}

const menuPanel: React.CSSProperties = {
    position: 'absolute', top: 0, right: 0, width: '300px', height: '100%',
    backgroundColor: '#0a0a0a', padding: '20px', borderLeft: '1px solid #222',
    overflowY: 'auto', display: 'flex', flexDirection: 'column'
}

const userSection: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0 20px',
    borderBottom: '1px solid #222', marginBottom: '20px'
}

const avatarStyle: React.CSSProperties = {
    width: '44px', height: '44px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #DC2626, #991b1b)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: 'bold', color: '#fff', flexShrink: 0, overflow: 'hidden'
}

const userName: React.CSSProperties = {
    fontSize: '15px', fontWeight: '600', color: '#fff', margin: 0,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
}

const userEmail: React.CSSProperties = {
    fontSize: '12px', color: '#888', margin: '2px 0 0',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
}

const menuItems: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '2px', flex: 1
}

const menuItemStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px', backgroundColor: 'transparent',
    border: 'none', borderRadius: '8px', fontSize: '15px', display: 'flex',
    alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#ccc',
    textAlign: 'left' as const, transition: 'background-color 0.15s'
}

const menuFooter: React.CSSProperties = {
    marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #222',
    display: 'flex', flexDirection: 'column', gap: '8px'
}

const menuFooterBtn: React.CSSProperties = {
    width: '100%', padding: '12px 16px', backgroundColor: 'transparent',
    border: 'none', borderRadius: '8px', fontSize: '14px', display: 'flex',
    alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#ccc',
    textAlign: 'left' as const
}

const loginBtn: React.CSSProperties = {
    width: '100%', padding: '14px', backgroundColor: '#DC2626', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer'
}

const registerBtn: React.CSSProperties = {
    width: '100%', padding: '14px', backgroundColor: 'transparent', color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer'
}