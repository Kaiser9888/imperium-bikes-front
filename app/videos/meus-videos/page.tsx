"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Eye, Heart, Clock, Plus, Film, BarChart3, MessageSquare, Radio, Loader2, ArrowRight, CircleDollarSign } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/videos/FeedStates";
import { CopyLinkButton } from "@/components/videos/CopyLinkButton";
import { deleteVideo, fetchMyVideos } from "@/lib/videos/api";
import { formatViews, timeAgo } from "@/lib/videos/format";
import type { VideoItem } from "@/lib/videos/types";

/** Selo de estado: o criador precisa saber se o vídeo está processando, falhou ou é uma live. */
function StatusBadge({ video }: { video: VideoItem }) {
  let label: string | null = null;
  let tone = "bg-secondary text-muted-foreground";
  if (video.isLiveNow) {
    label = "Ao vivo";
    tone = "bg-primary text-primary-foreground";
  } else if (video.isLive) {
    label = "Live aguardando";
  } else if (video.status === "PROCESSING") {
    label = "Processando";
  } else if (video.status === "FAILED") {
    label = "Falhou";
    tone = "bg-destructive/15 text-destructive";
  }
  if (!label) return null;
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider ${tone}`}>
      {label}
    </span>
  );
}

export default function MeusVideosPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(
    async (target: number) => {
      const token = await getToken();
      if (!token) throw new Error("Sessão expirada");
      return fetchMyVideos(token, target);
    },
    [getToken]
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    load(0)
      .then((data) => {
        if (cancelled) return;
        setVideos(data.content);
        setPage(0);
        setHasMore(!data.last);
        setError(false);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, load, attempt]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const data = await load(page + 1);
      setVideos((prev) => [...(prev ?? []), ...data.content]);
      setPage((p) => p + 1);
      setHasMore(!data.last);
    } catch {
      toast.error("Não foi possível carregar mais vídeos.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleDelete(videoId: string) {
    if (!window.confirm("Tem certeza que deseja excluir este vídeo permanentemente?")) return;
    setDeleting(videoId);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sua sessão expirou.");
      await deleteVideo(token, videoId);
      setVideos((prev) => prev?.filter((v) => v.id !== videoId) ?? prev);
      toast("Vídeo excluído");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir vídeo");
    } finally {
      setDeleting(null);
    }
  }

  if (isLoaded && !isSignedIn) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Entre para gerenciar seus vídeos.</p>
        <Button asChild className="mt-4">
          <Link href="/sign-in">Entrar</Link>
        </Button>
      </div>
    );
  }

  const list = videos ?? [];
  const published = list.filter((v) => v.status === "PUBLISHED");
  const totalViews = published.reduce((sum, v) => sum + (v.viewCount ?? 0), 0);
  const totalLikes = published.reduce((sum, v) => sum + (v.likesCount ?? 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <h1 className="text-3xl tracking-wide text-foreground">Central de Vídeos</h1>
          <p className="mt-1 text-start text-muted-foreground">Gerencie todos os seus vídeos em um só lugar</p>
        </div>

        {published.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat icon={<Film className="h-5 w-5 text-primary" />} value={String(published.length)} label="Publicados" />
            <Stat icon={<Eye className="h-5 w-5 text-primary" />} value={formatViews(totalViews)} label="Visualizações" />
            <Stat icon={<Heart className="h-5 w-5 text-primary" />} value={formatViews(totalLikes)} label="Curtidas" />
            <Stat
              icon={<BarChart3 className="h-5 w-5 text-primary" />}
              value={formatViews(Math.round(totalViews / published.length))}
              label="Média de views"
            />
          </div>
        )}

        {list.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/videos/upload">
                <Plus className="size-4" />
                Novo vídeo
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/videos/live">
                <Radio className="size-4" />
                Fazer live
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/videos/monetizacao">
                <CircleDollarSign className="size-4" />
                Monetização
              </Link>
            </Button>
          </div>
        )}

        {error ? (
          <ErrorState onRetry={() => { setError(false); setVideos(null); setAttempt((n) => n + 1); }} />
        ) : videos === null ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
                <div className="flex gap-4">
                  <div className="h-24 w-40 rounded-lg bg-secondary" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-secondary" />
                    <div className="h-4 w-1/2 rounded bg-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-8 py-20 text-center">
            <Film className="mx-auto size-12 text-muted-foreground/40" />
            <h2 className="mt-4 text-xl">Nenhum vídeo publicado</h2>
            <p className="mt-2 text-sm text-muted-foreground">Comece a criar conteúdo agora mesmo</p>
            <Button asChild className="mt-6">
              <Link href="/videos/upload">
                <Plus className="size-4" />
                Publicar primeiro vídeo
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="space-y-4">
              {list.map((video) => {
                const href = video.isLive ? `/videos/live?id=${video.id}` : `/videos/watch/${video.id}`;
                return (
                  <li
                    key={video.id}
                    className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <Link href={href} className="relative h-24 w-full flex-shrink-0 overflow-hidden rounded-lg bg-secondary sm:w-44">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <Film className="size-6" />
                          </div>
                        )}
                        {video.formattedDuration && (
                          <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                            {video.formattedDuration}
                          </span>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={href} className="line-clamp-1 text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary">
                            {video.title || "Sem título"}
                          </Link>
                          <StatusBadge video={video} />
                          {video.isShort && <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">Memento</span>}
                        </div>

                        {video.description && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{video.description}</p>}

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5"><Eye className="size-3.5" />{formatViews(video.viewCount)} views</span>
                          <span className="inline-flex items-center gap-1.5"><Heart className="size-3.5" />{video.likesCount ?? 0} curtidas</span>
                          <span className="inline-flex items-center gap-1.5"><MessageSquare className="size-3.5" />{video.commentsCount} comentários</span>
                          <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{timeAgo(video.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        {video.status === "PUBLISHED" && <CopyLinkButton path={`/videos/watch/${video.id}`} />}
                        <button
                          type="button"
                          onClick={() => void handleDelete(video.id)}
                          disabled={deleting === video.id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          aria-label="Excluir vídeo"
                          title="Excluir vídeo"
                        >
                          {deleting === video.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
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

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {icon}
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
