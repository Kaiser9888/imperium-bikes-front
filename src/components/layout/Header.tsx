'use client'

import { useState } from 'react'
import { Bell, ShoppingCart, Menu, X } from 'lucide-react'
import Image from 'next/image'

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <>
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                backgroundColor: '#000000',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <Image
                    src="/logo.png"
                    alt="Imperium"
                    width={500}
                    height={100}
                    style={{
                        objectFit: 'contain',
                        flexShrink: 0,
                        marginLeft: '-8px'
                    }}
                />

                {/* Ícones */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button style={iconBtn}>
                        <Bell size={19} color="#fff" />
                    </button>
                    <button style={iconBtn}>
                        <ShoppingCart size={19} color="#fff" />
                    </button>
                    <button style={iconBtn} onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={19} color="#fff" /> : <Menu size={19} color="#fff" />}
                    </button>
                </div>
            </header>

            {/* Menu Hamburguer */}
            {menuOpen && (
                <div style={overlay}>
                    <div style={overlayBg} onClick={() => setMenuOpen(false)} />
                    <div style={menuPanel}>
                        <h3 style={menuTitle}>Menu</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <button style={menuItem}>🌙 Modo Escuro</button>
                            <button style={menuItem}>⭐ Favoritos</button>
                            <button style={menuItem}>🎥 Videos</button>
                            <button style={menuItem}>💬 Forum</button>
                            <button style={menuItem}>🏆 Torneios</button>
                            <button style={menuItem}>⚙️ Configuracoes</button>
                            <button style={menuItem}>❓ Ajuda</button>
                        </div>
                        <div style={menuFooter}>
                            <button style={loginBtn}>Entrar / Cadastrar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

const iconBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.85,
    display: 'flex'
}

const overlay: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 60
}

const overlayBg: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)'
}

const menuPanel: React.CSSProperties = {
    position: 'absolute',
    top: 0, right: 0,
    width: '280px',
    height: '100%',
    backgroundColor: 'var(--bg-header)',
    padding: '20px',
    borderLeft: '1px solid #222'
}

const menuTitle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '24px'
}

const menuItem: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    color: '#ccc',
    textAlign: 'left'
}

const menuFooter: React.CSSProperties = {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #222'
}

const loginBtn: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#DC2626',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
}