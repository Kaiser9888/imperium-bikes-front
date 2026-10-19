"use client";
import { Button } from "@/components/ui/button"

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { fetchLiveVideos, fetchVideoPage } from "@/lib/videos/api";
import type { FeedOrder, VideoItem } from "@/lib/videos/types";
import { formatViews, timeAgo } from "@/lib/videos/format";
import { CategoryFilter } from "@/components/videos/CategoryFilter";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoAvatar } from "@/components/videos/VideoAvatar";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { GlitchButton } from "@/components/videos/GlitchButton";
import { SaveButton } from "@/components/videos/SaveButton";
import { ErrorState, EmptyState } from "@/components/videos/FeedStates";
import { ArrowRight, Loader2, Play, Plus, Radio } from "lucide-react";

const DEFAULT_CATEGORY = "recomendados";

/** Categoria → consulta no servidor (antes filtrava só os 12 vídeos já carregados). */
function feedFor(category: string): { order: FeedOrder; query: string } {
  if (category === "vistos") return { order: "views", query: "" };
  if (category === "recomendados" || category === "recentes") return { order: "recent", query: "" };
  return { order: "recent", query: category };
}

export default function VideosPage() {
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const { videos, loading, loadingMore, hasMore, error, loadMore, reload } = useVideoFeed(feedFor(category));
  const [featured, setFeatured] = useState<VideoItem | null>(null);
  const [featuredLoaded, setFeaturedLoaded] = useState(false);
  const [lives, setLives] = useState<VideoItem[]>([]);
  const [mementos, setMementos] = useState<VideoItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchLiveVideos().then((items) => !cancelled && setLives(items));
    fetchVideoPage(0, true)
      .then((page) => !cancelled && setMementos(page.content.slice(0, 12)))
      .catch(() => {});
    // Destaque: o vídeo mais visto de verdade, não o mais visto entre os 12 carregados
    fetchVideoPage(0, false, { order: "views" })
      .then((page) => !cancelled && setFeatured(page.content[0] ?? null))
      .catch(() => {})
      .finally(() => !cancelled && setFeaturedLoaded(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // O destaque já aparece no topo: não repete na grade de "Recomendados"
  const visible = useMemo(
    () => (category === DEFAULT_CATEGORY && featured ? videos.filter((v) => v.id !== featured.id) : videos),
    [videos, category, featured]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* Destaque */}
      {!featuredLoaded ? (
        <div className="mb-8 aspect-[16/10] w-full animate-pulse rounded-2xl bg-secondary sm:aspect-[21/9]" />
      ) : featured ? (
        <FeaturedHero video={featured} />
      ) : null}

      <LiveStrip lives={lives} />

      {mementos.length > 0 && <MementoRail mementos={mementos} />}

      {/* Filtros */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <SectionTitle>Vídeos</SectionTitle>
      </div>
      <div className="mb-6">
        <CategoryFilter value={category} onChange={setCategory} />
      </div>

      {/* Grade */}
      {loading ? (
        <VideoGridSkeleton />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nenhum vídeo encontrado"
          description="Tente outra categoria ou publique o primeiro vídeo."
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((video, i) => (
              <li key={video.id}>
                <VideoCard video={video} priority={i < 4} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <Button onClick={loadMore} disabled={loadingMore} variant="outline">
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
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
      <span aria-hidden="true" className="h-4 w-1 bg-primary" />
      {children}
    </h2>
  );
}

function FeaturedHero({ video }: { video: VideoItem }) {
  return (
    <section aria-label="Vídeo em destaque" className="relative mb-8 overflow-hidden rounded-2xl bg-black">
      <div className="relative aspect-[4/5] w-full sm:aspect-[21/9]">
        {video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" className="absolute inset-0 size-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent sm:bg-gradient-to-r sm:from-black sm:via-black/60" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:inset-y-0 sm:right-auto sm:max-w-xl sm:justify-center sm:p-10">
          <span className="inline-flex w-fit items-center gap-2 border-l-2 border-primary pl-2 text-[0.6875rem] font-bold uppercase tracking-[0.3em] text-white/80">
            Em destaque
          </span>
          <h1 className="line-clamp-3 text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            {video.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-white/75">
            <VideoAvatar name={video.userName} url={video.userAvatarUrl} className="size-7 border-white/30" />
            <span className="truncate font-medium text-white">{video.userName}</span>
            <span aria-hidden="true">·</span>
            <span>{formatViews(video.viewCount)} views</span>
            <span aria-hidden="true">·</span>
            <time dateTime={video.createdAt}>{timeAgo(video.createdAt)}</time>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-4">
            <GlitchButton text="Assistir" href={`/videos/watch/${video.id}`} icon={<Play aria-hidden="true" className="fill-current" />} />
            <SaveButton videoId={video.id} />
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveStrip({ lives }: { lives: VideoItem[] }) {
  return (
    <section aria-labelledby="live-title" className="mb-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="live-title" className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
          <span className="live-dot" aria-hidden="true" />
          Ao vivo
        </h2>
        <div className="flex items-center gap-4">
          <Link
            href="/videos/live"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary"
          >
            <Radio className="size-3.5" aria-hidden="true" />
            Fazer live
          </Link>
          <GlitchButton text="Publicar" href="/videos/upload" size="sm" icon={<Plus aria-hidden="true" />} />
        </div>
      </div>

      {lives.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
          <Radio className="size-5 shrink-0 text-primary" aria-hidden="true" />
          Nenhuma transmissão agora. As lives de pedal, torneios e oficinas aparecem aqui.
        </div>
      ) : (
        <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
          {lives.map((live) => (
            <li key={live.id} className="w-72 shrink-0 snap-start">
              <Link href={`/videos/watch/${live.id}`} className="group block">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-secondary ring-2 ring-primary">
                  {live.thumbnailUrl && (
                    <img src={live.thumbnailUrl} alt="" loading="lazy" className="size-full object-cover" />
                  )}
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded bg-primary px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-widest text-primary-foreground">
                    <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
                    Ao vivo
                  </span>
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-semibold group-hover:text-primary">{live.title}</p>
                <p className="truncate text-xs text-muted-foreground">{live.userName}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MementoRail({ mementos }: { mementos: VideoItem[] }) {
  return (
    <section aria-labelledby="memento-title" className="mb-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="memento-title" className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
          <span aria-hidden="true" className="h-4 w-1 bg-primary" />
          Memento
        </h2>
        <Link
          href="/videos/memento"
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary"
        >
          Ver todos
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
        {mementos.map((m) => (
          <li key={m.id} className="w-36 shrink-0 snap-start sm:w-44">
            <Link
              href={`/videos/memento?video=${m.id}`}
              className="group relative block aspect-[9/16] overflow-hidden rounded-xl bg-black ring-1 ring-border transition hover:ring-primary"
            >
              {m.thumbnailUrl && (
                <img
                  src={m.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2.5">
                <p className="line-clamp-2 text-xs font-semibold leading-snug text-white">{m.title}</p>
                <p className="mt-1 text-[0.625rem] text-white/70">{formatViews(m.viewCount)} views</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
