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

  // ============================================================
  // CONTROLE DAS PÁGINAS
  // ============================================================

  const isMemento = pathname.startsWith("/videos/memento");

  const isWatchPage = pathname.startsWith("/videos/watch/");

  const isSearchPage = pathname === "/videos/buscar";

  const { isSignedIn } = useAuth();

  // ============================================================
  // CONTROLE DA NAVEGAÇÃO AO ROLAR
  // ============================================================

  const [showNav, setShowNav] = useState(true);

  const lastScrollY = useRef(0);

  // ============================================================
  // ITENS DA NAVEGAÇÃO INFERIOR
  // ============================================================

  const navItems = [
    {
      icon: Home,
      label: "Início",
      href: "/videos",
    },
    {
      icon: Search,
      label: "Buscar",
      href: "/videos/buscar",
    },
    {
      icon: Plus,
      label: "Postar",
      href: "/videos/upload",
      highlight: true,
    },
    {
      icon: Play,
      label: "Memento",
      href: "/videos/memento",
    },
    {
      icon: Video,
      label: "Central",
      href: "/videos/meus-videos",
    },
  ];

  // ============================================================
  // LINK DO BOTÃO INÍCIO
  // ============================================================

  const getHomeHref = () => {
    return pathname === "/videos" ? "/" : "/videos";
  };

  // ============================================================
  // ESCONDER / MOSTRAR NAVEGAÇÃO AO ROLAR
  // ============================================================

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Movimento para baixo
      // Esconde a navegação
      if (
        currentScrollY > lastScrollY.current &&
        currentScrollY > 10
      ) {
        setShowNav(false);
      }

        // Movimento para cima
      // Mostra a navegação novamente
      else if (
        currentScrollY < lastScrollY.current - 5
      ) {
        setShowNav(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // ============================================================
  // WATCH PAGE
  // ============================================================
  //
  // Página de reprodução:
  // - sem TOP BAR
  // - sem BOTTOM NAVIGATION
  //
  // ============================================================

  if (isWatchPage) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  // ============================================================
  // LAYOUT PRINCIPAL
  // ============================================================

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* ======================================================
          TOP BAR
          ======================================================

          A página /videos/buscar não recebe esse TOP BAR.

          A página MEMENTO recebe uma versão simplificada:
          somente logo + nome Imperium.

          As demais páginas recebem:
          logo + lupa + notificações + usuário.
      ====================================================== */}

      {!isSearchPage && (
        <header
          className={`
            fixed
            top-0
            left-0
            right-0
            z-40
            border-b
            border-border
            bg-background/95
            backdrop-blur-lg
            transition-transform
            duration-300
            ${
            showNav
              ? "translate-y-0"
              : "-translate-y-full"
          }
          `}
        >
          <div
            className={`
              flex
              h-14
              items-center
              px-3
              sm:px-6
              lg:px-8
              ${
              isMemento
                ? "justify-start"
                : "gap-2"
            }
            `}
          >

            {/* ==================================================
                LOGO IMPERIUM
            ================================================== */}

            <Link
              href="/videos"
              className="
                flex
                flex-shrink-0
                items-center
                gap-2
              "
              aria-label="Página inicial de vídeos"
            >
              <img
                src="/logo2.png"
                alt="Imperium"
                className="h-7 w-auto sm:h-8"
              />

              <span
                className="
                  font-blackletter
                  text-sm
                  tracking-wide
                  sm:text-2xl
                "
                style={{
                  fontFamily:
                    "var(--font-blackletter)",
                  color: "#ac0202",
                }}
              >
                Imperium
              </span>
            </Link>

            {/* ==================================================
                ÁREA DIREITA DO TOP BAR
            ================================================== */}

            {!isMemento && (
              <div
                className="
                  ml-auto
                  flex
                  flex-shrink-0
                  items-center
                  gap-1
                "
              >

                {/* ==================================================
                    LUPA — REDIRECIONA PARA BUSCAR
                ================================================== */}

                <Link
                  href="/videos/buscar"
                  className="
                    rounded-full
                    p-2
                    text-muted-foreground
                    transition-colors
                    hover:bg-muted
                    hover:text-foreground
                    active:scale-95
                  "
                  aria-label="Buscar vídeos"
                  title="Buscar vídeos"
                >
                  <Search
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </Link>

                {/* ==================================================
                    NOTIFICAÇÕES
                ================================================== */}

                <button
                  type="button"
                  className="
                    rounded-md
                    p-2
                    text-muted-foreground
                    transition-colors
                    hover:bg-muted
                    hover:text-foreground
                  "
                  aria-label="Notificações"
                >
                  <Bell
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>

                {/* ==================================================
                    USUÁRIO / LOGIN
                ================================================== */}

                {isSignedIn ? (
                  <UserButton />
                ) : (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-muted
                        text-muted-foreground
                        transition-colors
                        hover:bg-primary/10
                        hover:text-primary
                      "
                      aria-label="Entrar"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />

                        <circle
                          cx="12"
                          cy="7"
                          r="4"
                        />
                      </svg>
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      {/* ======================================================
          CONTEÚDO PRINCIPAL
          ====================================================== */}

      <main
        className={`
          flex-1
          ${!isSearchPage ? "pt-14" : ""}
        `}
      >
        {children}
      </main>

      {/* ======================================================
          BOTTOM NAVIGATION
          ====================================================== */}

      <nav
        className={`
          fixed
          bottom-0
          left-0
          right-0
          z-50
          border-t
          border-border
          bg-background/95
          backdrop-blur-lg
          transition-transform
          duration-300
          ${
          showNav
            ? "translate-y-0"
            : "translate-y-full"
        }
        `}
        role="navigation"
        aria-label="Navegação principal"
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-around
            px-2
          "
        >
          {navItems.map((item) => {

            // ==================================================
            // PÁGINA ATIVA
            // ==================================================

            const isActive =
              pathname === item.href;

            // ==================================================
            // BOTÃO POSTAR
            // ==================================================

            if (item.highlight) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="
                    flex
                    flex-col
                    items-center
                    gap-0.5
                    py-2
                  "
                  aria-label={item.label}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                >
                  <span
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-primary
                      text-primary-foreground
                      shadow-md
                      transition-transform
                      hover:scale-105
                      active:scale-95
                    "
                  >
                    <item.icon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            }

            // ==================================================
            // LINK INÍCIO
            // ==================================================

            const href =
              item.label === "Início"
                ? getHomeHref()
                : item.href;

            return (
              <Link
                key={item.label}
                href={href}
                className={`
                  flex
                  min-w-[64px]
                  flex-col
                  items-center
                  gap-0.5
                  py-2
                  transition-colors
                  ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
                `}
                aria-label={item.label}
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
              >
                <item.icon
                  className="h-5 w-5"
                  strokeWidth={
                    isActive
                      ? 2.25
                      : 1.5
                  }
                  aria-hidden="true"
                />

                <span
                  className="
                    text-[0.625rem]
                    font-medium
                    leading-none
                  "
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