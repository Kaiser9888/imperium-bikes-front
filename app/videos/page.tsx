"use client";

import { useMemo, useState } from "react";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { CategoryFilter } from "@/components/videos/CategoryFilter";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { ErrorState, EmptyState } from "@/components/videos/FeedStates";
import { ArrowRight, Loader2 } from "lucide-react";

const DEFAULT_CATEGORY = "recomendados";

export default function VideosPage() {
  const { videos, loading, loadingMore, hasMore, error, loadMore, reload } = useVideoFeed(false);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);

  const visible = useMemo(() => {
    let filtered = videos;

    if (category && category !== "recomendados") {
      if (category === "recentes") {
        filtered = [...filtered].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );
      } else if (category === "vistos") {
        filtered = [...filtered].sort((a, b) => b.viewCount - a.viewCount);
      } else {
        const tagLower = category.toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.title.toLowerCase().includes(tagLower) ||
            v.description?.toLowerCase().includes(`#${tagLower}`) ||
            v.description?.toLowerCase().includes(tagLower) ||
            v.hashtags?.some((tag: string) => tag.toLowerCase() === tagLower)
        );
      }
    }

    return filtered;
  }, [videos, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* Filtros de categoria */}
      <div className="mb-6">
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      {/* Grid de vídeos */}
      {loading ? (
        <VideoGridSkeleton />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nenhum vídeo encontrado"
          description="Tente selecionar outra categoria ou publique o primeiro vídeo."
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((video, i) => (
              <li key={video.id}>
                <VideoCard video={video} priority={i < 4} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando...</span>
                  </>
                ) : (
                  <>
                    <span>Ver mais</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}