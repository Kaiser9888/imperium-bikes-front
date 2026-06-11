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
    const [notifications] = useState(3);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Menu Hamburguer */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        aria-label="Menu"
                    >
                        {menuOpen ? (
                            <X className="w-5 h-5 text-gray-700" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-700" />
                        )}
                    </button>

                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">
                            IMPERIUM <span className="text-[#C9A96E]">BIKES</span>
                        </h1>
                    </div>

                    {/* Notificações e Perfil */}
                    <div className="flex items-center space-x-2">
                        <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <Bell className="w-5 h-5 text-gray-600" />
                            {notifications > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                  {notifications}
                </span>
                            )}
                        </button>

                        {isSignedIn ? (
                            <UserButton />
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 bg-[#1A1A1A] text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                                    Entrar
                                </button>
                            </SignInButton>
                        )}
                    </div>
                </div>

                {/* Menu Mobile */}
                {menuOpen && (
                    <div className="lg:hidden border-t border-gray-100 py-4">
                        <nav className="space-y-1">
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'Buscar', href: '/buscar' },
                                { label: 'Torneios', href: '/torneios' },
                                { label: 'Chat', href: '/chat' },
                                { label: 'Perfil', href: '/perfil' },
                            ].map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="block px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-[#1A1A1A] rounded-lg transition-colors text-sm"
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