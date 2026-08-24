"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Plus,
  Play,
  Video,
  Bell,
} from "lucide-react";
import {
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { useState, useEffect, useRef } from "react";

export default function VideosLayout({
                                       children,
                                     }: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isMemento = pathname.startsWith("/videos/memento");
  const isSearchPage = pathname === "/videos/buscar";

  const { isSignedIn } = useAuth();

  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  const navItems = [
    { icon: Home, label: "Início", href: "/videos" },
    { icon: Search, label: "Pesquisar", href: "/videos/buscar" },
    { icon: Plus, label: "Upload", href: "/videos/upload", highlight: true },
    { icon: Play, label: "Memento", href: "/videos/memento" },
    { icon: Video, label: "Central", href: "/videos/meus-videos" },
  ];

  const getHomeHref = () => {
    return pathname === "/videos" ? "/" : "/videos";
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setShowNav(false);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setShowNav(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`flex min-h-screen flex-col ${isMemento ? "bg-black" : "bg-background"}`}>
      {/* ===== TOP BAR ===== */}
      {!isSearchPage && (
        <header
          className={`
            fixed top-0 left-0 right-0 z-40 h-14
            border-b backdrop-blur-lg transition-transform duration-300
            ${
            isMemento
              ? "border-white/10 bg-black/80"
              : "border-border bg-background/95"
          }
            ${showNav ? "translate-y-0" : "-translate-y-full"}
          `}
        >
          <div className={`flex h-full items-center px-3 sm:px-6 lg:px-8 ${isMemento ? "justify-start" : "gap-2"}`}>
            {/* LOGO */}
            <Link href="/videos" className="flex shrink-0 items-center gap-2" aria-label="Página inicial de vídeos">
              <img src="/logo.png" alt="Imperium" className="h-7 w-auto sm:h-8" />
              <span
                className="font-blackletter text-sm tracking-wide sm:text-2xl"
                style={{
                  fontFamily: "var(--font-caesar)",
                  color: isMemento ? "#FFFFFF" : "#0b0F19",
                  textShadow: isMemento ? "none" : "0 0 1px #FFF, 1px 1px 0px #FFF, 2px 2px 4px rgba(11, 15, 25, 0.3)",
                  letterSpacing: "0.05em",
                }}
              >
                Imperium
              </span>
            </Link>

            {/* ÁREA DIREITA */}
            <div className="ml-auto flex shrink-0 items-center gap-1">
              {/* BUSCA */}
              <Link
                href="/videos/buscar"
                className={`rounded-full p-2 transition-colors active:scale-95 ${
                  isMemento ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted hover:text-primary"
                }`}
                aria-label="Buscar vídeos"
                title="Buscar vídeos"
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </Link>

              {/* NOTIFICAÇÕES + LOGIN */}
              {!isMemento && (
                <>
                  <button
                    type="button"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Notificações"
                  >
                    <Bell className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {isSignedIn ? (
                    <UserButton />
                  ) : (
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        aria-label="Entrar"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </button>
                    </SignInButton>
                  )}
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ===== CONTEÚDO ===== */}
      <main
        className={`
          flex-1
          ${
          isMemento
            ? "h-[calc(100dvh-7.5rem)] overflow-hidden pt-14 pb-20"
            : `${!isSearchPage ? "pt-14" : ""} pb-16`
        }
        `}
      >
        {children}
      </main>

      {/* ===== BOTTOM NAVIGATION ===== */}
      <nav
        className={`
          fixed bottom-0 left-0 right-0 z-50 h-16
          border-t backdrop-blur-lg transition-transform duration-300
          ${
          isMemento
            ? "border-white/10 bg-black/80"
            : "border-border bg-background/95"
        }
          ${showNav ? "translate-y-0" : "translate-y-full"}
        `}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.highlight) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-0.5"
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </Link>
              );
            }

            const href = item.label === "Início" ? getHomeHref() : item.href;

            return (
              <Link
                key={item.label}
                href={href}
                className={`
                  flex min-w-[64px] flex-col items-center justify-center gap-0.5 transition-colors
                  ${
                  isActive
                    ? "text-primary"
                    : isMemento
                      ? "text-white/50 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                }
                `}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.25 : 1.5}
                  aria-hidden="true"
                />
                <span className="text-[0.625rem] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}