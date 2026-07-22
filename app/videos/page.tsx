"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Eye, Play, Crown, ArrowRight } from "lucide-react";

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

const INITIAL_PAGE = 0;

export default function VideosPage() {
    const { getToken } = useAuth();
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const pageRef = useRef(INITIAL_PAGE);

    useEffect(() => {
        let cancelled = false;

        const loadVideos = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/videos?page=${INITIAL_PAGE}&size=12&isShort=false`
                );
                const data = await res.json();

                if (!cancelled) {
                    setVideos(data.content);
                    setHasMore(!data.last);
                    setLoading(false);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Erro ao carregar videos:", error);
                    setLoading(false);
                }
            }
        };

        loadVideos();

        return () => {
            cancelled = true;
        };
    }, [getToken]);

    const loadMore = async () => {
        pageRef.current += 1;
        const nextPage = pageRef.current;

        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/videos?page=${nextPage}&size=12`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();

            setVideos((prev) => [...prev, ...data.content]);
            setHasMore(!data.last);
        } catch (error) {
            console.error("Erro ao carregar mais videos:", error);
        }
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return String(views);
    };

    const timeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Hoje";
        if (diffDays === 1) return "Ontem";
        if (diffDays < 7) return `${diffDays}d`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
        return `${Math.floor(diffDays / 30)}m`;
    };

    const featured = videos[0];
    const rest = videos.slice(1);

    return (
        <div className="bg-imperial min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Masthead imperial */}
                <header className="mb-12 text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <span className="h-px w-10 bg-gold/50" />
                        <span className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-gold">
              <Crown className="size-3.5" />
              Arena Imperium
            </span>
                        <span className="h-px w-10 bg-gold/50" />
                    </div>
                    <h1 className="font-blackletter text-5xl leading-none text-foreground sm:text-6xl lg:text-7xl text-balance">
                        O Coliseu das Trilhas
                    </h1>
                    <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                        Descidas, manobras e conquistas sobre duas rodas. Assista aos feitos
                        dos gladiadores da montanha e reivindique sua glória.
                    </p>
                    {/* Filete dourado com losango */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <span className="rule-gold h-px w-24 sm:w-40" />
                        <span className="size-2 rotate-45 border border-gold/70 bg-gold/20" />
                        <span className="rule-gold h-px w-24 sm:w-40" />
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-video rounded-t-[2.5rem] rounded-b-xl border border-border bg-secondary" />
                                <div className="mt-4 space-y-2 px-2">
                                    <div className="h-4 w-3/4 rounded bg-secondary" />
                                    <div className="h-3 w-1/2 rounded bg-secondary" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="mx-auto max-w-md rounded-t-[4rem] rounded-b-2xl border border-gold/25 bg-marble px-8 py-16 text-center">
                        <Crown className="mx-auto mb-5 size-10 text-gold/70" />
                        <p className="font-blackletter text-2xl text-foreground">
                            A arena aguarda seu primeiro campeão
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Nenhum vídeo foi consagrado ainda. Seja o primeiro a inscrever seu
                            nome na história.
                        </p>
                        <Link
                            href="/videos/upload"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                        >
                            Publicar meu vídeo
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Vídeo em destaque */}
                        {featured && (
                            <Link
                                href={`/videos/watch/${featured.id}`}
                                className="group mb-14 block"
                            >
                                <article className="relative overflow-hidden rounded-t-[5rem] rounded-b-2xl border border-gold/30 bg-card shadow-xl shadow-black/30">
                                    <div className="relative aspect-[16/7] w-full overflow-hidden">
                                        {featured.thumbnailUrl ? (
                                            <img
                                                src={featured.thumbnailUrl || "/placeholder.svg"}
                                                alt={featured.title}
                                                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center bg-secondary">
                                                <Play className="size-10 text-muted-foreground" />
                                            </div>
                                        )}
                                        {/* Véu escuro para leitura */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                                        {/* Selo de destaque */}
                                        <div className="absolute left-6 top-8 flex items-center gap-2 rounded-full border border-gold/40 bg-background/70 px-4 py-1.5 backdrop-blur-sm">
                                            <Crown className="size-3.5 text-gold" />
                                            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold">
                        Em destaque
                      </span>
                                        </div>

                                        {/* Botão de play central */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-16 items-center justify-center rounded-full border border-gold/50 bg-background/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary">
                        <Play className="ml-1 size-6 fill-foreground text-foreground transition-colors group-hover:fill-primary-foreground group-hover:text-primary-foreground" />
                      </span>
                                        </div>

                                        {/* Duração */}
                                        <span className="absolute bottom-6 right-6 rounded-md border border-gold/30 bg-background/80 px-2.5 py-1 text-xs font-medium tabular-nums text-gold">
                      {featured.formattedDuration || "00:00"}
                    </span>

                                        {/* Conteúdo sobreposto */}
                                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                                            <h2 className="max-w-3xl font-blackletter text-3xl leading-tight text-foreground text-balance sm:text-4xl">
                                                {featured.title}
                                            </h2>
                                            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Avatar
                              name={featured.userName}
                              url={featured.userAvatarUrl}
                          />
                          <span className="font-medium text-foreground">
                            {featured.userName}
                          </span>
                        </span>
                                                <span className="flex items-center gap-1.5">
                          <Eye className="size-4 text-gold/70" />
                                                    {formatViews(featured.viewCount)}
                        </span>
                                                <span className="text-gold/50">&bull;</span>
                                                <span>{timeAgo(featured.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        )}

                        {/* Título da seção */}
                        {rest.length > 0 && (
                            <div className="mb-6 flex items-center gap-4">
                                <h3 className="font-blackletter text-2xl text-foreground">
                                    Feitos recentes
                                </h3>
                                <span className="rule-gold h-px flex-1" />
                            </div>
                        )}

                        {/* Grid de vídeos */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {rest.map((video) => (
                                <Link
                                    key={video.id}
                                    href={`/videos/watch/${video.id}`}
                                    className="group block"
                                >
                                    <article className="overflow-hidden rounded-t-[2.5rem] rounded-b-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl hover:shadow-primary/10">
                                        <div className="relative aspect-video overflow-hidden">
                                            {video.thumbnailUrl ? (
                                                <img
                                                    src={video.thumbnailUrl || "/placeholder.svg"}
                                                    alt={video.title}
                                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex size-full items-center justify-center bg-secondary">
                                                    <Play className="size-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                            {/* Play no hover */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="flex size-12 items-center justify-center rounded-full border border-gold/50 bg-background/60 backdrop-blur-sm">
                          <Play className="ml-0.5 size-5 fill-foreground text-foreground" />
                        </span>
                                            </div>

                                            {/* Duração */}
                                            <span className="absolute bottom-3 right-3 rounded border border-gold/25 bg-background/85 px-2 py-0.5 text-xs font-medium tabular-nums text-gold">
                        {video.formattedDuration || "00:00"}
                      </span>
                                        </div>

                                        <div className="bg-marble p-4">
                                            <h3 className="line-clamp-2 min-h-10 font-medium leading-snug text-foreground transition-colors group-hover:text-gold">
                                                {video.title}
                                            </h3>
                                            <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="flex items-center gap-2 truncate text-sm text-muted-foreground">
                          <Avatar name={video.userName} url={video.userAvatarUrl} />
                          <span className="truncate">{video.userName}</span>
                        </span>
                                                <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                          <Eye className="size-3.5 text-gold/60" />
                                                    {formatViews(video.viewCount)}
                                                    <span className="text-gold/40">&bull;</span>
                                                    {timeAgo(video.createdAt)}
                        </span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={loadMore}
                                    className="group inline-flex items-center gap-2 rounded-full border border-gold/40 bg-marble px-8 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold hover:bg-card"
                                >
                                    Revelar mais feitos
                                    <ArrowRight className="size-4 text-gold transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

/* Avatar com moldura dourada e fallback com inicial */
function Avatar({ name, url }: { name: string; url: string }) {
    const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";
    return (
        <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/40 bg-secondary">
      {url ? (
          <img
              src={url || "/placeholder.svg"}
              alt={name}
              className="size-full object-cover"
          />
      ) : (
          <span className="text-xs font-semibold text-gold">{initial}</span>
      )}
    </span>
    );
}