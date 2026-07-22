
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Play, Video, ChevronLeft, Crown } from "lucide-react";

export default function VideosLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: "Fórum", href: "/videos" },
        { icon: Search, label: "Buscar", href: "/videos" },
        { icon: Plus, label: "Postar", href: "/videos/upload", highlight: true },
        { icon: Play, label: "Memento", href: "/videos/memento" },
        { icon: Video, label: "Gestão", href: "/videos/meus-videos" },
    ];

    return (
        <div className="min-h-screen bg-imperial">
            {/* Cabeçalho */}
            <header className="sticky top-0 z-40 border-b border-border/70 bg-marble/95 backdrop-blur supports-[backdrop-filter]:bg-marble/85">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <Link href="/videos" className="group flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-full border border-accent/50 bg-background text-accent transition-colors group-hover:border-accent">
                            <Crown className="size-4" strokeWidth={1.75} />
                        </span>
                        <span className="flex flex-col leading-none">
                            <span className="font-serif text-xl tracking-wide text-foreground">
                                Imperium
                            </span>
                            <span className="mt-0.5 text-[0.62rem] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                                Arena Velocitas
                            </span>
                        </span>
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-accent/60 hover:text-foreground"
                    >
                        <ChevronLeft className="size-4" />
                        Voltar
                    </Link>
                </div>
            </header>

            <main className="pb-24">{children}</main>

            {/* Navegação inferior */}
            <nav
                aria-label="Navegação principal"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-marble/95 backdrop-blur supports-[backdrop-filter]:bg-marble/85"
            >
                <div className="mx-auto flex max-w-7xl items-stretch justify-around px-2 py-2 sm:px-6 lg:px-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        if (item.highlight) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="relative -mt-6 flex flex-col items-center gap-1"
                                >
                                    <span className="flex size-13 items-center justify-center rounded-full border border-primary bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95">
                                        <item.icon className="size-5" />
                                    </span>
                                    <span className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                className="group flex flex-1 flex-col items-center gap-1 px-2 py-1.5"
                            >
                                <item.icon
                                    className={`size-5 transition-colors ${
                                        isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                                    }`}
                                    strokeWidth={isActive ? 2.25 : 1.75}
                                />
                                <span
                                    className={`text-[0.6rem] uppercase tracking-wider transition-colors ${
                                        isActive
                                            ? "font-semibold text-accent"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    }`}
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
