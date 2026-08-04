"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Play, Video, ArrowLeft, Store } from "lucide-react";

export default function VideosLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMemento = pathname.startsWith("/videos/memento");

    const navItems = [
        { icon: Home, label: "Início", href: "/videos" },
        { icon: Search, label: "Buscar", href: "/videos/buscar" },
        { icon: Plus, label: "Postar", href: "/videos/upload", highlight: true },
        { icon: Play, label: "Memento", href: "/videos/memento" },
        { icon: Video, label: "Gestão", href: "/videos/meus-videos" },
    ];

    return (
      <div className="min-h-screen bg-background">
          {/* ===== TOP BAR ===== */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
              <div className="flex h-14 items-center justify-between px-4">
                  {/* Esquerda: Logo + Voltar Marketplace */}
                  <div className="flex items-center gap-3">
                      <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                          <ArrowLeft className="h-5 w-5" />
                          <span className="text-sm font-medium hidden sm:inline">Marketplace</span>
                      </Link>
                      <Link href="/videos" className="flex items-center gap-2 font-bold text-lg">
                          <Video className="h-6 w-6 text-primary" />
                          <span className="hidden sm:inline">Imperium</span>
                      </Link>
                  </div>

                  {/* Centro: Busca (desktop) */}
                  <div className="hidden sm:block flex-1 max-w-md mx-4">
                      <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="search"
                            placeholder="Buscar vídeos..."
                            className="w-full rounded-full border border-border bg-muted/50 pl-10 pr-4 py-2 text-sm outline-none focus:border-primary/40 focus:bg-background transition-colors"
                          />
                      </div>
                  </div>

                  {/* Direita: Ícone de busca (mobile) */}
                  <Link href="/videos/buscar" className="sm:hidden text-muted-foreground hover:text-foreground">
                      <Search className="h-5 w-5" />
                  </Link>
              </div>
          </header>

          {/* Conteúdo principal - Memento sem padding bottom */}
          <main className={isMemento ? "" : "pb-16"}>
              {children}
          </main>

          {/* ===== BOTTOM NAVIGATION - Não aparece no Memento ===== */}
          {!isMemento && (
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg">
                <div className="flex items-center justify-around px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        if (item.highlight) {
                            return (
                              <Link
                                key={item.label}
                                href={item.href}
                                className="flex flex-col items-center gap-0.5 py-2"
                              >
                                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95">
                                            <item.icon className="h-5 w-5" />
                                        </span>
                              </Link>
                            );
                        }
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            className={`flex min-w-[60px] flex-col items-center gap-0.5 py-2 transition-colors ${
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.5} />
                              <span className="text-[0.6rem] font-medium leading-none">
                                        {item.label}
                                    </span>
                          </Link>
                        );
                    })}
                </div>
            </nav>
          )}
      </div>
    );
}