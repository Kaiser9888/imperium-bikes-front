"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Play, Video, Bell } from "lucide-react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMemento = pathname.startsWith("/videos/memento");
  const isWatchPage = pathname.startsWith("/videos/watch/");
  const { isSignedIn } = useAuth();

  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  const navItems = [
    { icon: Home, label: "Início", href: "/videos" },
    { icon: Search, label: "Buscar", href: "/videos/buscar" },
    { icon: Plus, label: "Postar", href: "/videos/upload", highlight: true },
    { icon: Play, label: "Memento", href: "/videos/memento" },
    { icon: Video, label: "Central", href: "/videos/meus-videos" },
  ];

  const getHomeHref = () => {
    return pathname === "/videos" ? "/" : "/videos";
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Qualquer movimento para baixo (10px) → esconde
      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setShowNav(false);
      }
      // Qualquer movimento para cima (5px) → mostra
      else if (currentScrollY < lastScrollY.current - 5) {
        setShowNav(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Se for watch page, sem nav
  if (isWatchPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ===== TOP BAR ===== */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg transition-transform duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex h-14 items-center gap-2 px-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/videos" className="flex items-center gap-2 flex-shrink-0" aria-label="Página inicial de vídeos">
            <img src="/logo2.png" alt="Imperium" className="h-7 w-auto sm:h-8" />
            <span className="font-blackletter text-sm sm:text-2xl tracking-wide"
                  style={{ fontFamily: 'var(--font-blackletter)', color: '#ac0202' }}>
                            Imperium
                        </span>
          </Link>

          {/* Busca */}
          {!isMemento && (
            <div className="flex-1 max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <label htmlFor="main-search" className="sr-only">Buscar vídeos</label>
                <input id="main-search" type="search" placeholder="Buscar vídeos..."
                       className="w-full rounded-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background" />
              </div>
            </div>
          )}

          {/* Ícones */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Notificações">
              <Bell className="h-5 w-5" />
            </button>

            {isSignedIn ? <UserButton /> : (
              <SignInButton mode="modal">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" aria-label="Entrar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo - pt-14 compensa o header fixo */}
      <main className="flex-1 pt-14">{children}</main>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg transition-transform duration-300 ${
          showNav ? "translate-y-0" : "translate-y-full"
        }`}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.highlight) {
              return (
                <Link key={item.label} href={item.href}
                      className="flex flex-col items-center gap-0.5 py-2"
                      aria-label={item.label} aria-current={isActive ? "page" : undefined}>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95">
                                        <item.icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                </Link>
              );
            }

            const href = item.label === "Início" ? getHomeHref() : item.href;

            return (
              <Link key={item.label} href={href}
                    className={`flex min-w-[64px] flex-col items-center gap-0.5 py-2 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={item.label} aria-current={isActive ? "page" : undefined}>
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.5} aria-hidden="true" />
                <span className="text-[0.625rem] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}