import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Play, Clapperboard, Plus, Search, User } from "lucide-react";

export const NAV_ITEMS = [
    { icon: Home, label: "Início", href: "/videos" as const },
    { icon: Play, label: "Longos", href: "/videos/longos" as const },
    { icon: Clapperboard, label: "Memento", href: "/videos/memento" as const },
    { icon: Plus, label: "Publicar", href: "/videos/upload" as const, highlight: true },
    { icon: Search, label: "Buscar", href: "/videos/buscar" as const },
    { icon: User, label: "Perfil", href: "/videos/perfil" as const },
];

function useActivePath() {
    return useRouterState({ select: (s) => s.location.pathname });
}

export function VideosHeader() {
    const pathname = useActivePath();

    return (
        <header className="sticky top-0 z-50 hidden border-b border-border bg-background/80 backdrop-blur-md lg:block">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-6">
                <Link to="/videos" className="flex items-baseline gap-3">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            IMPERIUM <span className="text-primary">BIKES</span>
          </span>
                    <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Vídeos</span>
                </Link>

                <nav aria-label="Navegação de vídeos" className="flex items-center gap-1">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                to={item.href}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                    item.highlight
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                        : active
                                            ? "bg-secondary text-primary"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                            >
                                <item.icon className="size-4" aria-hidden="true" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}

export function MobileNav() {
    const pathname = useActivePath();

    return (
        <nav
            aria-label="Navegação principal"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur-md lg:hidden"
        >
            <ul className="grid grid-cols-6">
                {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <li key={item.label}>
                            <Link
                                to={item.href}
                                className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                                    active ? "text-primary" : "text-muted-foreground"
                                }`}
                            >
                                {item.highlight ? (
                                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <item.icon className="size-5" aria-hidden="true" />
                  </span>
                                ) : (
                                    <item.icon className="size-5" aria-hidden="true" />
                                )}
                                <span className="text-[10px] leading-none">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}