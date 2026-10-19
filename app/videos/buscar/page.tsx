"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { ErrorState } from "@/components/videos/FeedStates";
import { ArrowRight, Loader2, Search } from "lucide-react";

/** Busca no servidor (título, descrição e criador), com espera curta enquanto a pessoa digita. */
export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { videos, loading, loadingMore, hasMore, error, loadMore, reload } = useVideoFeed({ query: debounced, enabled: !!debounced });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg px-4 py-3">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar..."
            aria-label="Pesquisar vídeos"
            autoFocus
            className="w-full rounded-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary/40 focus:bg-background transition-colors"
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Encontre vídeos, criadores e conteúdos
        </p>
      </div>

      <div className="px-4 py-6">
        {!debounced ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            Digite algo para buscar vídeos
          </p>
        ) : loading ? (
          <VideoGridSkeleton count={4} />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : videos.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            Nenhum resultado para &ldquo;{debounced}&rdquo;
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <li key={v.id}>
                  <VideoCard video={v} />
                </li>
              ))}
            </ul>
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button onClick={loadMore} disabled={loadingMore} variant="outline">
                  {loadingMore ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                  {loadingMore ? "Carregando..." : "Ver mais"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
