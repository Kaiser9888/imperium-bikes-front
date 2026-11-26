"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Plus, Search } from "lucide-react";

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
    // Vídeos: lupa no lugar da barra de busca e cabeçalho que some ao rolar (sobra tela para os vídeos).
    // Na própria busca a barra fica, porque é nela que se digita.
    <AppShell busca={pathname.startsWith("/videos/buscar") ? true : "compacta"} someAoRolar>
      <nav aria-label="Vídeos" className="border-b border-border">
        {/* Abas sublinhadas e finas (os botões com borda ocupavam uma faixa grande no celular) */}
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Só as abas rolam; o + fica sempre visível na direita */}
          {/* Esfumado na ponta direita (celular): mostra que as abas continuam arrastando */}
          <div className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto pr-6 scrollbar-none [mask-image:linear-gradient(to_right,black_80%,transparent)] sm:gap-7 sm:pr-0 sm:[mask-image:none]">
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
                  "type-label -mb-px inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors",
                  ativa
                    ? "border-primary font-semibold text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
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
          </div>
          {/* Celular: a busca vira lupa aqui (no cabeçalho os ícones não cabiam numa linha) */}
          <Link
            href="/videos/buscar"
            aria-label="Buscar vídeos"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <Search className="size-5" aria-hidden="true" />
          </Link>
          <Link
            href="/videos/upload"
            aria-label="Publicar vídeo"
            // Celular: só o "+" redondo, cabe ao lado das abas
            className="type-label inline-flex size-8 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 sm:h-8 sm:w-auto sm:px-3.5"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Publicar</span>
          </Link>
        </div>
      </nav>
      <main>{children}</main>
    </AppShell>
  );
}
