"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Play, Video, ArrowLeft } from "lucide-react";

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
      <div className="flex min-h-screen flex-col bg-background">
          {/* ===== TOP BAR ===== */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
              <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                  {/* Esquerda: Logo + Voltar Marketplace */}
                  <div className="flex items-center gap-4">
                      <Link
                        href="/"
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Voltar para Marketplace"
                      >
                          <ArrowLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">Marketplace</span>
                      </Link>
                      <Link
                        href="/videos"
                        className="flex items-center gap-2"
                        aria-label="Página inicial de vídeos"
                      >
                          <Video className="h-6 w-6 text-primary" aria-hidden="true" />
                          <span className="text-lg font-bold hidden sm:inline">Imperium</span>
                      </Link>
                  </div>

                  {/* Centro: Busca (apenas desktop, não duplica com a página) */}
                  {!isMemento && (
                    <div className="hidden sm:block w-full max-w-md mx-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <label htmlFor="desktop-search" className="sr-only">
                                Buscar vídeos
                            </label>
                            <input
                              id="desktop-search"
                              type="search"
                              placeholder="Buscar vídeos..."
                              className="w-full rounded-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background"
                            />
                        </div>
                    </div>
                  )}

                  {/* Direita: Link para busca no mobile */}
                  <Link
                    href="/videos/buscar"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
                    aria-label="Buscar vídeos"
                  >
                      <Search className="h-5 w-5" />
                  </Link>
              </div>
          </header>

          {/* Conteúdo principal */}
          <main className="flex-1">
              {children}
          </main>

          {/* ===== BOTTOM NAVIGATION ===== */}
          <nav
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg"
            role="navigation"
            aria-label="Navegação principal"
          >
              <div className="mx-auto flex max-w-7xl items-center justify-around px-2">
                  {navItems.map((item) => {
                      const isActive = pathname === item.href;

                      if (item.highlight) {
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex flex-col items-center gap-0.5 py-2"
                              aria-label={item.label}
                              aria-current={isActive ? "page" : undefined}
                            >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95">
                                        <item.icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                            </Link>
                          );
                      }

                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`flex min-w-[64px] flex-col items-center gap-0.5 py-2 transition-colors ${
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          aria-label={item.label}
                          aria-current={isActive ? "page" : undefined}
                        >
                            <item.icon
                              className="h-5 w-5"
                              strokeWidth={isActive ? 2.25 : 1.5}
                              aria-hidden="true"
                            />
                            <span className="text-[0.625rem] font-medium leading-none">
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