// src/components/layout/Header.tsx
'use client';

import { useState } from 'react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { Menu, X, Bell } from 'lucide-react';

interface HeaderProps {
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
}

export default function Header({ menuOpen, setMenuOpen }: HeaderProps) {
    const { user, isSignedIn } = useUser();
    const [notifications] = useState(3); // Mock - depois virá da API

    return (
        <header className="sticky top-0 z-50 bg-[#1E1F22] border-b border-[#3A3D42]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Menu Hamburguer */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-lg hover:bg-[#3A3D42] transition-colors"
                        aria-label="Menu"
                    >
                        {menuOpen ? (
                            <X className="w-6 h-6 text-[#EFEDE6]" />
                        ) : (
                            <Menu className="w-6 h-6 text-[#EFEDE6]" />
                        )}
                    </button>

                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">🚲</span>
                        <h1 className="text-xl font-bold text-[#EFEDE6]">Imperium</h1>
                    </div>

                    {/* Notificações e Perfil */}
                    <div className="flex items-center space-x-3">
                        {/* Botão Notificações */}
                        <button className="relative p-2 rounded-lg hover:bg-[#3A3D42] transition-colors">
                            <Bell className="w-6 h-6 text-[#EFEDE6]" />
                            {notifications > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {notifications}
                </span>
                            )}
                        </button>

                        {/* Perfil/Auth */}
                        {isSignedIn ? (
                                <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 rounded-full ring-2 ring-[#6B7077] hover:ring-[#C9C7C2] transition-all"
                                    }
                                }}
                            />
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 bg-[#3A3D42] text-[#EFEDE6] rounded-lg hover:bg-[#6B7077] transition-colors text-sm font-medium">
                                    Entrar
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>

                {/* Menu Mobile */}
                {menuOpen && (
                    <div className="lg:hidden border-t border-[#3A3D42] py-4">
                        <nav className="space-y-2">
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'Buscar', href: '/buscar' },
                                { label: 'Torneios', href: '/torneios' },
                                { label: 'Chat', href: '/chat' },
                                { label: 'Perfil', href: '/perfil' },
                                { label: 'Vídeos', href: '/videos' },
                                { label: 'Fórum', href: '/forum' },
                                { label: 'Favoritos', href: '/favoritos' },
                            ].map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="block px-4 py-3 text-[#C9C7C2] hover:bg-[#3A3D42] hover:text-[#EFEDE6] rounded-lg transition-colors"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}