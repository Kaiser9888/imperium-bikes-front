"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Play, Video } from "lucide-react";

export default function VideosLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: "Início", href: "/videos" },
        { icon: Search, label: "Buscar", href: "/videos/buscar" },
        { icon: Plus, label: "Postar", href: "/videos/upload", highlight: true },
        { icon: Play, label: "Memento", href: "/videos/memento" },
        { icon: Video, label: "Gestão", href: "/videos/meus-videos" },
    ];

    return (
      <div className="min-h-screen bg-background">
          {/* ===== TOP BAR - DESKTOP ===== */}
          <header className="sticky top-0 z-40 hidden border-b border-border bg-background/95 backdrop-blur-lg lg:block">
              <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                  {/* Logo */}
                  <Link href="/videos" className="flex items-center gap-2 font-bold text-lg">
                      <Video className="h-6 w-6 text-primary" />
                      <span>Imperium</span>
                  </Link>

                  {/* Links de navegação */}
                  <nav className="flex items-center gap-1">
                      {navItems.map((item) => {
                          const isActive = pathname === item.href;
                          if (item.highlight) {
                              return (
                                <Link
                                  key={item.label}
                                  href={item.href}
                                  className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span>{item.label}</span>
                                </Link>
                              );
                          }
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                isActive
                                  ? "bg-muted text-primary"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                                <item.icon className="h-4 w-4" strokeWidth={isActive ? 2.25 : 1.75} />
                                <span>{item.label}</span>
                            </Link>
                          );
                      })}
                  </nav>
              </div>
          </header>

          {/* Conteúdo principal */}
          <main className="pb-16 lg:pb-0">
              {children}
          </main>

          {/* ===== BOTTOM NAVIGATION - MOBILE ===== */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg lg:hidden">
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
      </div>
    );
}