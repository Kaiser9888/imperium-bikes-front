"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { ErrorState } from "@/components/videos/FeedStates";
import { ArrowRight, Loader2 } from "lucide-react";

/** Resultados da busca de vídeos (título, descrição e criador); o termo vem da busca do cabeçalho (?q=). */
export default function BuscarPage() {
  return (
    <Suspense fallback={<div className="px-4 py-6"><VideoGridSkeleton count={4} /></div>}>
      <Resultados />
    </Suspense>
  );
}

function Resultados() {
  const termo = (useSearchParams().get("q") ?? "").trim();
  const { videos, loading, loadingMore, hasMore, error, loadMore, reload } = useVideoFeed({ query: termo, enabled: !!termo });

  // Sem termo (ex.: lupa do Memento): já deixa o cursor na busca do cabeçalho
  useEffect(() => {
    if (!termo) document.querySelector<HTMLInputElement>("form[role=search] input")?.focus();
  }, [termo]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {!termo ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Digite na busca acima para encontrar vídeos e criadores.
        </p>
      ) : loading ? (
        <VideoGridSkeleton count={4} />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : videos.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum vídeo para &ldquo;{termo}&rdquo;
        </p>
      ) : (
        <>
          <h1 className="type-label mb-4 text-muted-foreground">Resultados para &ldquo;{termo}&rdquo;</h1>
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
  );
}
