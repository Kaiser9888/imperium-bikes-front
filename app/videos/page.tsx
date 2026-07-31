"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Play, Loader2, ArrowRight, RotateCcw } from "lucide-react";

interface VideoItem {
    id: string;
    title: string;
    thumbnailUrl: string;
    durationSeconds: number;
    formattedDuration: string;
    viewCount: number;
    userName: string;
    userAvatarUrl: string;
    createdAt: string;
}

interface VideoPage {
    content: VideoItem[];
    last: boolean;
}

const PAGE_SIZE = 12;
const INITIAL_PAGE = 0;

export default function VideosPage() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(false);
    const pageRef = useRef(INITIAL_PAGE);

    const fetchPage = useCallback(async (page: number): Promise<VideoPage> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/videos?page=${page}&size=${PAGE_SIZE}&isShort=false`
        );
        if (!res.ok) throw new Error(`Falha ao carregar vídeos (status ${res.status})`);
        return res.json();
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(false);
            try {
                const data = await fetchPage(INITIAL_PAGE);
                if (cancelled) return;
                setVideos(data.content);
                setHasMore(!data.last);
            } catch {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [fetchPage]);

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        const nextPage = pageRef.current + 1;
        setLoadingMore(true);
        try {
            const data = await fetchPage(nextPage);
            pageRef.current = nextPage;
            setVideos((prev) => [...prev, ...data.content]);
            setHasMore(!data.last);
        } catch {
            /* silencioso */
        } finally {
            setLoadingMore(false);
        }
    };

    const formatViews = (views: number) => {
        if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
        if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
        return String(views);
    };

    const timeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return "Hoje";
        if (diffDays === 1) return "Ontem";
        if (diffDays < 7) return `${diffDays}d`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
        return `${Math.floor(diffDays / 30)}m`;
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {loading ? (
                <div role="status" aria-label="Carregando vídeos" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-video rounded-lg border border-border bg-secondary" />
                            <div className="mt-4 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-secondary" />
                                <div className="h-3 w-1/2 rounded bg-secondary" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="mx-auto max-w-md rounded-lg border border-border bg-card px-8 py-14 text-center">
                    <p className="text-xl font-semibold text-foreground">Não foi possível carregar os vídeos</p>
                    <p className="mt-2 text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
                    <button
                        onClick={() => { setError(false); setLoading(true); fetchPage(0).then(d => { setVideos(d.content); setHasMore(!d.last); setLoading(false); }).catch(() => { setError(true); setLoading(false); }); }}
                        className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/60"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Tentar novamente
                    </button>
                </div>
            ) : videos.length === 0 ? (
                <div className="mx-auto max-w-md rounded-lg border border-border bg-card px-8 py-14 text-center">
                    <p className="text-xl font-semibold text-foreground">Nenhum vídeo publicado</p>
                    <p className="mt-2 text-sm text-muted-foreground">Seja o primeiro a publicar.</p>
                    <Link
                        href="/videos/upload"
                        className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        Publicar vídeo
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <>
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {videos.map((video, index) => (
                            <li key={video.id}>
                                <Link href={`/videos/watch/${video.id}`} className="group block rounded-lg outline-offset-4">
                                    <article className="overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 group-hover:border-primary/30">
                                        <div className="relative aspect-video overflow-hidden bg-secondary">
                                            {video.thumbnailUrl ? (
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt={video.title || "Miniatura do vídeo"}
                                                    loading={index < 3 ? "eager" : "lazy"}
                                                    decoding="async"
                                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center">
                                                    <Play className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-opacity duration-300 group-hover:bg-foreground/10 group-hover:opacity-100">
                        <span className="flex size-11 items-center justify-center rounded-full border border-background/70 bg-background/80 backdrop-blur-sm">
                          <Play className="ml-0.5 size-4 fill-foreground text-foreground" aria-hidden="true" />
                        </span>
                                            </div>
                                            <span className="absolute bottom-2.5 right-2.5 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
                        {video.formattedDuration || "00:00"}
                      </span>
                                        </div>
                                        <div className="p-4">
                                            <h2 className="line-clamp-2 min-h-10 font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                                                {video.title}
                                            </h2>
                                            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                          <Avatar name={video.userName} url={video.userAvatarUrl} />
                          <span className="truncate">{video.userName}</span>
                        </span>
                                                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="size-3.5" aria-hidden="true" />
                          <span>{formatViews(video.viewCount)}</span>
                          <span aria-hidden="true">&bull;</span>
                          <time dateTime={video.createdAt}>{timeAgo(video.createdAt)}</time>
                        </span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div aria-live="polite" className="sr-only">
                        {loadingMore ? "Carregando mais vídeos" : `${videos.length} vídeos carregados`}
                    </div>

                    {hasMore && (
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-7 py-2.5 text-sm font-medium transition-colors hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                        Carregando…
                                    </>
                                ) : (
                                    <>
                                        Ver mais vídeos
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
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

function Avatar({ name, url }: { name: string; url: string }) {
    const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
    return (
        <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
      {url ? (
          <img src={url} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
      ) : (
          <span className="text-[0.65rem] font-semibold text-primary">{initial}</span>
      )}
    </span>
    );
}
