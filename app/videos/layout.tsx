"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Plus } from "lucide-react";

import api from "@/lib/api";

import { AppShell } from "@/components/layout/app-shell";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

// Segundo nível da área de vídeos; o primeiro (Início, Busca, Eventos, Vídeos, Perfil) é a barra do site
const ABAS = [
  { href: "/videos", label: "Para você" },
  { href: "/videos/memento", label: "Memento" },
  { href: "/videos/seguindo", label: "Seguindo" },
  { href: "/videos/meus-videos", label: "Meus vídeos" },
];

export default function VideosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  // Vídeos novos dos canais seguidos: selo só aqui, nunca no sino principal
  const [naoVistos, setNaoVistos] = useState(0);
  useEffect(() => {
    if (!isSignedIn) return;
    api.get("/api/notifications/videos/unread/count")
      .then((r) => setNaoVistos(Number(r.data?.count ?? 0)))
      .catch(() => {});
  }, [isSignedIn, pathname]);

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
        {/* Celular: as 4 abas dividem a largura (antes "Meus vídeos" ficava cortada na borda) */}
        <div className="mx-auto grid max-w-7xl grid-cols-4 items-center gap-1.5 px-4 py-2.5 sm:flex sm:gap-2 sm:px-6 lg:px-8">
          {ABAS.map(({ href, label }) => {
            // "Para você" só na própria /videos; as outras valem para as rotas filhas
            const ativa = href === "/videos" ? pathname === href : pathname.startsWith(href);
            const selo = href === "/videos/seguindo" && naoVistos > 0 && !ativa;
            return (
              <Link
                key={href}
                href={href}
                aria-current={ativa ? "page" : undefined}
                className={cn(
                  "type-label inline-flex h-9 min-w-0 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl border px-1 transition-colors sm:gap-1.5 sm:px-3.5",
                  ativa
                    ? "border-primary bg-primary/12 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {label}
                {selo && (
                  <span className="grid min-w-5 place-items-center rounded-md bg-primary px-1 text-[0.6875rem] font-bold tabular-nums text-primary-foreground">
                    {naoVistos > 9 ? "9+" : naoVistos}
                    <span className="sr-only"> vídeos novos</span>
                  </span>
                )}
              </Link>
            );
          })}
          <Link
            href="/videos/upload"
            // No celular publicar fica em "Meus vídeos" e no Memento (aqui não cabia, ficava fora da tela)
            className="type-label ml-auto hidden h-9 shrink-0 sm:inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 text-primary-foreground transition-opacity hover:opacity-90"
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
