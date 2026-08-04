"use client";

import { useMemo, useState } from "react";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { SearchBar } from "@/components/videos/SearchBar";
import { CategoryFilter } from "@/components/videos/CategoryFilter";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { ErrorState, EmptyState } from "@/components/videos/FeedStates";
import { ArrowRight, Loader2 } from "lucide-react";

const DEFAULT_CATEGORY = "recomendados";

export default function VideosPage() {
  const { videos, loading, loadingMore, hasMore, error, loadMore, reload } = useVideoFeed(false);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = q
      ? videos.filter((v) => `${v.title} ${v.userName}`.toLowerCase().includes(q))
      : videos;
    if (category === "vistos") return [...filtered].sort((a, b) => b.viewCount - a.viewCount);
    if (category === "recentes")
      return [...filtered].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return filtered;
  }, [videos, query, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="space-y-4">
        <SearchBar value={query} onChange={setQuery} />
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      <div className="mt-8">
        {loading ? (
          <VideoGridSkeleton />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : visible.length === 0 ? (
          <EmptyState
            title={query ? "Nada encontrado" : "Nenhum vídeo publicado"}
            description={query ? "Tente outros termos ou remova os filtros." : "Seja o primeiro a publicar."}
          />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((video, i) => (
                <li key={video.id}>
                  <VideoCard video={video} priority={i < 4} />
                </li>
              ))}
            </ul>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-7 py-2.5 text-sm font-medium transition-colors hover:border-primary/60 disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Carregando…
                    </>
                  ) : (
                    <>
                      Ver mais vídeos
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}