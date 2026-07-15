"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Play, User } from "lucide-react";

export default function VideosLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: "Home", href: "/videos" },
        { icon: Search, label: "Buscar", href: "/schear" },
        { icon: Plus, label: "Postar", href: "/videos/upload", highlight: true },
        { icon: Play, label: "Memento", href: "/videos/memento" },
        { icon: User, label: "Perfil", href: "/perfil" },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <span className="font-blackletter text-2xl text-primary">Imperium</span>
                        </Link>
                    </div>
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Voltar
                    </Link>
                </div>
            </header>

            {/* Conteúdo */}
            <main className="pb-20">{children}</main>

            {/* Barra Inferior */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
                <div className="max-w-7xl mx-auto flex items-center justify-around py-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                                    item.highlight
                                        ? "relative -mt-6"
                                        : ""
                                }`}
                            >
                                {item.highlight ? (
                                    <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors">
                                        <item.icon className="size-5" />
                                    </div>
                                ) : (
                                    <item.icon
                                        className={`size-5 ${
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        }`}
                                    />
                                )}
                                <span
                                    className={`text-[0.6rem] ${
                                        isActive
                                            ? "text-primary font-medium"
                                            : "text-muted-foreground"
                                    } ${item.highlight ? "mt-1" : ""}`}
                                >
                  {item.label}
                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}