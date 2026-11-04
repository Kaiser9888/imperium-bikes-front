"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

// Segundo nível da área de vídeos; o primeiro (Início, Busca, Eventos, Vídeos, Perfil) é a barra do site
const ABAS = [
  { href: "/videos", label: "Para você" },
  { href: "/videos/memento", label: "Memento" },
  { href: "/videos/meus-videos", label: "Meus vídeos" },
];

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Só o feed é imersivo: sem cabeçalho, só a barra do site em versão escura
  if (pathname === "/videos/memento") {
    return (
      <div className="bg-black">
        {/* Sem flex-1: com ele a altura vinha do flex (indefinida) e o feed ficava com 0px
            no celular (o vídeo tocava invisível e o toque para play não pegava) */}
        <main className="h-dvh overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">{children}</main>
        <BottomNav escuro />
      </div>
    );
  }

  return (
    <AppShell>
      <nav aria-label="Vídeos" className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 lg:px-8">
          {ABAS.map(({ href, label }) => {
            // "Para você" só na própria /videos; as outras valem para as rotas filhas
            const ativa = href === "/videos" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={ativa ? "page" : undefined}
                className={cn(
                  "type-label flex h-11 shrink-0 items-center border-b-2 transition-colors",
                  ativa ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/videos/upload"
            className="type-label ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden="true" />
            Publicar
          </Link>
        </div>
      </nav>
      <main>{children}</main>
    </AppShell>
  );
}
