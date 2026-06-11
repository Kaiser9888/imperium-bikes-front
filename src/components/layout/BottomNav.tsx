// src/components/layout/BottomNav.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Trophy, MessageCircle, User } from 'lucide-react';

const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Buscar', href: '/buscar', icon: Search },
    { label: 'Torneios', href: '/torneios', icon: Trophy },
    { label: 'Chat', href: '/chat', icon: MessageCircle },
    { label: 'Perfil', href: '/perfil', icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
            <div className="max-w-7xl mx-auto px-2">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
                                    isActive
                                        ? 'text-[#C9A96E]'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium mt-1">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}