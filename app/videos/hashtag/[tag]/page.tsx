"use client";
import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { fetchVideosByHashtag } from "@/lib/videos/api";
import { normalizeHashtag } from "@/lib/videos/hashtags";
import type { VideoItem } from "@/lib/videos/types";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { ErrorState, EmptyState } from "@/components/videos/FeedStates";

import { BackButton } from "@/components/ui/back-button"

/** Resultado guardado junto com a tag: trocar de tag já vira "carregando" sem setState no efeito. */
interface TagState {
  tag: string;
  videos: VideoItem[];
  page: number;
  hasMore: boolean;
  error: boolean;
}

export default function HashtagPage() {
  const { tag: rawTag } = useParams<{ tag: string }>();
  const tag = normalizeHashtag(rawTag);

  const [state, setState] = useState<TagState | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchVideosByHashtag(tag, 0)
      .then((data) => !cancelled && setState({ tag, videos: data.content, page: 0, hasMore: !data.last, error: false }))
      .catch(() => !cancelled && setState({ tag, videos: [], page: 0, hasMore: false, error: true }));
    return () => {
      cancelled = true;
    };
  }, [tag, attempt]);

  const current = state?.tag === tag ? state : null;

  async function loadMore() {
    if (!current || loadingMore) return;
    setLoadingMore(true);
    try {
      const next = current.page + 1;
      const data = await fetchVideosByHashtag(tag, next);
      setState((s) =>
        s && s.tag === tag
          ? { ...s, videos: [...s.videos, ...data.content], page: next, hasMore: !data.last }
          : s
      );
    } catch {
      // mantém o que já está na tela
    } finally {
      setLoadingMore(false);
    }
  }

  function reload() {
    setState(null);
    setAttempt((n) => n + 1);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <BackButton href="/videos" className="mb-6" />

      <h1 className="text-xl font-semibold text-foreground">#{tag}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Vídeos publicados com essa hashtag</p>

      <div className="mt-8">
        {!current ? (
          <VideoGridSkeleton />
        ) : current.error ? (
          <ErrorState onRetry={reload} />
        ) : current.videos.length === 0 ? (
          <EmptyState
            title="Nenhum vídeo encontrado"
            description={`Ainda não há vídeos publicados com a hashtag #${tag}.`}
          />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {current.videos.map((video, i) => (
                <li key={video.id}>
                  <VideoCard video={video} priority={i < 4} />
                </li>
              ))}
            </ul>

            {current.hasMore && (
              <div className="mt-10 flex justify-center">
                <Button onClick={loadMore} disabled={loadingMore} variant="outline">
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
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
