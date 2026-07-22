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
            {/* Masthead imperial */}
            <header className="sticky top-0 z-40 bg-marble/95 backdrop-blur supports-[backdrop-filter]:bg-marble/80">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <Link href="/videos" className="group flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-full border border-gold/40 bg-background/40 text-gold shadow-inner transition-colors group-hover:border-gold/70">
                            <Crown className="size-4.5" strokeWidth={1.75} />
                        </span>
                        <span className="flex flex-col leading-none">
                            <span className="font-blackletter text-2xl text-primary">Imperium</span>
                            <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
                                Arena Velocitas
                            </span>
                        </span>
                    </Link>

                    <Link
                        href="/"
                        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
                    >
                        <ChevronLeft className="size-4" />
                        Voltar
                    </Link>
                </div>
                {/* Filete dourado com losango central */}
                <div className="relative h-px w-full rule-gold">
                    <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold/80" />
                </div>
            </header>

            <main className="pb-28">{children}</main>

            {/* Navegação inferior — pórtico de mármore */}
            <nav className="fixed inset-x-0 bottom-0 z-40 bg-marble/95 backdrop-blur supports-[backdrop-filter]:bg-marble/80">
                <div className="h-px w-full rule-gold" />
                <div className="mx-auto flex max-w-7xl items-stretch justify-around px-2 py-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        if (item.highlight) {
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="relative -mt-7 flex flex-col items-center gap-1"
                                >
                                    <span className="flex size-14 items-center justify-center rounded-full border-2 border-gold/60 bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
                                        <item.icon className="size-6" />
                                    </span>
                                    <span className="text-[0.6rem] font-medium uppercase tracking-wider text-gold">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="group flex flex-1 flex-col items-center gap-1 px-2 py-1.5"
                            >
                                <item.icon
                                    className={`size-5 transition-colors ${
                                        isActive ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
                                    }`}
                                    strokeWidth={isActive ? 2.25 : 1.75}
                                />
                                <span
                                    className={`text-[0.6rem] uppercase tracking-wider transition-colors ${
                                        isActive
                                            ? "font-semibold text-gold"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    }`}
                                >
                                    {item.label}
                                </span>
                                {isActive && <span className="size-1 rounded-full bg-gold" />}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}