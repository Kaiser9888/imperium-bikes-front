'use client';

import { useState } from 'react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { Menu, X, Bell, Shield } from 'lucide-react';

interface HeaderProps {
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
}

export default function Header({ menuOpen, setMenuOpen }: HeaderProps) {
    const { user, isSignedIn } = useUser();
    const [notifications] = useState(3);

    return (
        <header className="sticky top-0 z-50 bg-[#0D0D0D] border-b border-[#8B0000]/30">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo - ESQUERDA */}
                    <div className="flex items-center space-x-2">
                        <Shield className="w-6 h-6 text-[#8B0000]" />
                        <h1 className="text-lg font-bold text-[#D4C5A9] tracking-widest">
                            IMPERIUM <span className="text-[#8B0000]">BIKES</span>
                        </h1>
                    </div>

                    {/* Ícones - DIREITA */}
                    <div className="flex items-center space-x-1">
                        <button className="relative p-2 rounded hover:bg-[#2F2F2F] transition-colors">
                            <Bell className="w-5 h-5 text-[#D4C5A9]" />
                            {notifications > 0 && (
                                <span className="absolute top-1 right-1 bg-[#DC143C] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {notifications}
                </span>
                            )}
                        </button>

                        {isSignedIn ? (
                            <UserButton />
                        ) : (
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 bg-[#8B0000] text-[#D4C5A9] rounded text-sm font-medium hover:bg-[#DC143C] transition-colors">
                                    Entrar
                                </button>
                            </SignInButton>
                        )}

                        {/* Menu Hamburguer - DIREITA */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded hover:bg-[#2F2F2F] transition-colors"
                        >
                            {menuOpen ? (
                                <X className="w-5 h-5 text-[#D4C5A9]" />
                            ) : (
                                <Menu className="w-5 h-5 text-[#D4C5A9]" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Menu Mobile */}
                {menuOpen && (
                    <div className="border-t border-[#8B0000]/30 py-4">
                        <nav className="space-y-1">
                            {['Home', 'Buscar', 'Torneios', 'Chat', 'Perfil'].map((item) => (
                                <a
                                    key={item}
                                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                    className="block px-4 py-3 text-[#D4C5A9] hover:bg-[#2F2F2F] hover:text-[#DC143C] transition-colors text-sm font-medieval"
                                >
                                    {item}
                                </a>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}