"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Search,
    Plus,
    Play,
    User,
} from "lucide-react";

export default function VideosLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        {
            icon: Home,
            label: "Início",
            href: "/videos",
        },
        {
            icon: Play,
            label: "Longos",
            href: "/videos",
        },
        {
            icon: Video,
            label: "Memento",
            href: "/videos/memento",
        },
        {
            icon: Plus,
            label: "Publicar",
            href: "/videos/upload",
            highlight: true,
        },
        {
            icon: Search,
            label: "Buscar",
            href: "/videos/buscar",
        },
        {
            icon: User,
            label: "Perfil",
            href: "/perfil",
        },
    ];

    return (
        <div className="min-h-screen bg-background">

            {/* ========================= */}
            {/* HEADER DESKTOP */}
            {/* ========================= */}

            <header className="sticky top-0 z-50 hidden border-b border-border bg-background/95 backdrop-blur lg:block">

                <div className="mx-auto max-w-7xl">

                    <div className="flex h-16 items-center justify-between">

                        <div>

                            <h1 className="font-blackletter text-2xl text-primary">
                                Imperium Bikes
                            </h1>

                            <p className="text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
                                Vídeos
                            </p>

                        </div>

                        <nav className="flex items-center gap-7">

                            {navItems.map((item) => {

                                const Active =
                                    pathname === item.href;

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors

                                        ${
                                            Active
                                                ? "text-primary"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <item.icon
                                            className="h-5 w-5"
                                        />

                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                </div>

            </header>

            {/* ========================= */}
            {/* CONTEÚDO */}
            {/* ========================= */}

            <main className="pb-20 lg:pb-0">
                {children}
            </main>

            {/* ========================= */}
            {/* MOBILE */}
            {/* ========================= */}

            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur lg:hidden">

                <div className="grid grid-cols-6">

                    {navItems.map((item) => {

                        const Active =
                            pathname === item.href;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 py-3 transition-colors

                                ${
                                    Active
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {item.highlight ? (
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                                        <item.icon className="h-5 w-5" />
                                    </span>
                                ) : (
                                    <item.icon className="h-5 w-5" />
                                )}

                                <span className="text-[10px]">
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