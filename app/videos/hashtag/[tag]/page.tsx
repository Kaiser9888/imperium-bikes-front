"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { fetchVideosByHashtag } from "@/lib/videos/api";
import { normalizeHashtag } from "@/lib/videos/hashtags";
import type { VideoItem } from "@/lib/videos/types";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { ErrorState, EmptyState } from "@/components/videos/FeedStates";

export default function HashtagPage() {
  const { tag: rawTag } = useParams<{ tag: string }>();
  const tag = normalizeHashtag(rawTag);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  async function load(targetPage: number, replace: boolean) {
    try {
      const data = await fetchVideosByHashtag(tag, targetPage);
      setVideos((prev) => (replace ? data.content : [...prev, ...data.content]));
      setHasMore(!data.last);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setPage(0);
    load(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  function loadMore() {
    const next = page + 1;
    setLoadingMore(true);
    setPage(next);
    load(next, false);
  }

  function reload() {
    setLoading(true);
    setPage(0);
    load(0, true);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/videos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar
      </Link>

      <h1 className="text-xl font-semibold text-foreground">#{tag}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Vídeos publicados com essa hashtag</p>

      <div className="mt-8">
        {loading ? (
          <VideoGridSkeleton />
        ) : error ? (
          <ErrorState onRetry={reload} />
        ) : videos.length === 0 ? (
          <EmptyState
            title="Nenhum vídeo encontrado"
            description={`Ainda não há vídeos publicados com a hashtag #${tag}.`}
          />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video, i) => (
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