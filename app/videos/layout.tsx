"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Play, Video } from "lucide-react";

export default function VideosLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMemento = pathname.startsWith("/videos/memento");

    const navItems = [
        { icon: Home, label: "Início", href: "/videos" },
        { icon: Search, label: "Buscar", href: "/videos" },
        { icon: Plus, label: "Postar", href: "/videos/upload", highlight: true },
        { icon: Play, label: "Memento", href: "/videos/memento" },
        { icon: Video, label: "Gestão", href: "/videos/meus-videos" },
    ];

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar esquerda - navegação fixa sem aspecto de barra */}
            <aside className="fixed left-0 top-0 z-40 flex h-screen w-14 flex-col items-center py-4">
                <nav className="flex flex-1 flex-col items-center justify-center gap-5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        if (item.highlight) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex flex-col items-center gap-1"
                                    title={item.label}
                                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95">
                    <item.icon className="h-4 w-4" />
                  </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className={`flex flex-col items-center gap-1 transition-colors ${
                                    isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                                title={item.label}
                            >
                                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                                <span className="text-[0.55rem] font-medium uppercase tracking-wider">
                  {item.label}
                </span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Conteúdo principal */}
            <main className={`flex-1 ${isMemento ? "ml-0" : "ml-14"}`}>
                {children}
            </main>
        </div>
    );
}