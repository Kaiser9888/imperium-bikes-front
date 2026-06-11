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
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D] border-t border-[#8B0000]/30 z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center px-3 py-1 transition-colors ${
                                isActive ? 'text-[#DC143C]' : 'text-[#6B0000] hover:text-[#D4C5A9]'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}