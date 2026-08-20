"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    MessageSquare,
    Search,
    Share2,
    Volume2,
    VolumeX,
    X,
    Play,
} from "lucide-react";

import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";

import { VideoComments } from "@/components/videos/VideoComments";
import {
    fetchVideoPage,
    likeVideo,
    playbackIdFrom,
} from "@/lib/videos/api";

import type { VideoItem } from "@/lib/videos/types";

export default function MementoPage() {
    const { getToken, isSignedIn } = useAuth();

    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [liked, setLiked] = useState<Record<string, boolean>>({});
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

    const [showComments, setShowComments] = useState(false);

    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    const [page, setPage] = useState(0);
    const [lastPage, setLastPage] = useState(false);

    const playerRef = useRef<MuxPlayerElement | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchVideoPage(0, true);
                if (cancelled) return;

                const items = data.content ?? [];
                setVideos(items);
                setLastPage(data.last ?? true);
                setPage(0);

                const counts: Record<string, number> = {};
                const states: Record<string, boolean> = {};

                for (const video of items) {
                    counts[video.id] = video.likesCount ?? 0;
                    states[video.id] = video.liked ?? false;
                }

                setLikeCounts(counts);
                setLiked(states);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => { cancelled = true; };
    }, []);

    const loadMore = useCallback(async () => {
        if (loadingMore || lastPage) return;

        const nextPage = page + 1;

        try {
            setLoadingMore(true);
            const data = await fetchVideoPage(nextPage, true);
            const newVideos = data.content ?? [];

            setVideos((current) => {
                const existingIds = new Set(current.map((v) => v.id));
                const unique = newVideos.filter((v) => !existingIds.has(v.id));
                return [...current, ...unique];
            });

            setPage(nextPage);
            setLastPage(data.last ?? true);

            setLikeCounts((current) => {
                const next = { ...current };
                for (const v of newVideos) {
                    if (next[v.id] === undefined) next[v.id] = v.likesCount ?? 0;
                }
                return next;
            });

            setLiked((current) => {
                const next = { ...current };
                for (const v of newVideos) {
                    if (next[v.id] === undefined) next[v.id] = v.liked ?? false;
                }
                return next;
            });
        } finally {
            setLoadingMore(false);
        }
    }, [lastPage, loadingMore, page]);

    const currentVideo = videos[currentIndex];
    const currentPlaybackId = playbackIdFrom(currentVideo?.videoUrl);

    useEffect(() => {
        const player = playerRef.current;
        if (!player || !currentVideo) return;

        let cancelled = false;

        const startPlayback = async () => {
            if (cancelled) return;
            try {
                player.muted = true;
                setIsMuted(true);
                await player.play();
                if (!cancelled) setIsPlaying(true);
            } catch {
                if (!cancelled) setIsPlaying(false);
            }
        };

        const handleCanPlay = () => { void startPlayback(); };
        player.addEventListener("canplay", handleCanPlay);
        void startPlayback();

        return () => {
            cancelled = true;
            player.removeEventListener("canplay", handleCanPlay);
            try { player.pause(); } catch {}
        };
    }, [currentIndex, currentVideo?.id]);

    useEffect(() => {
        const player = playerRef.current;
        if (!player) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        player.addEventListener("play", handlePlay);
        player.addEventListener("pause", handlePause);

        return () => {
            player.removeEventListener("play", handlePlay);
            player.removeEventListener("pause", handlePause);
        };
    }, [currentVideo?.id]);

    const togglePlay = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;

        if (player.paused) {
            player.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
            player.pause();
            setIsPlaying(false);
        }
    }, []);

    const toggleSound = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;

        const newMuted = !player.muted;
        player.muted = newMuted;
        setIsMuted(newMuted);

        if (!newMuted && player.paused) {
            player.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }, []);

    const nextVideo = useCallback(() => {
        if (currentIndex < videos.length - 1) {
            setCurrentIndex((v) => v + 1);
            return;
        }
        if (!lastPage) void loadMore();
    }, [currentIndex, videos.length, lastPage, loadMore]);

    const previousVideo = useCallback(() => {
        if (currentIndex > 0) setCurrentIndex((v) => v - 1);
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (showComments) {
                if (event.key === "Escape") setShowComments(false);
                return;
            }
            if (event.key === "ArrowDown") { event.preventDefault(); nextVideo(); }
            if (event.key === "ArrowUp") { event.preventDefault(); previousVideo(); }
            if (event.key === " ") { event.preventDefault(); togglePlay(); }
            if (event.key === "m") { toggleSound(); }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextVideo, previousVideo, togglePlay, toggleSound, showComments]);

    const handleLike = useCallback(async (video: VideoItem) => {
        if (!isSignedIn) return;

        const videoId = video.id;
        const previousLiked = liked[videoId] ?? video.liked ?? false;
        const previousCount = likeCounts[videoId] ?? video.likesCount ?? 0;

        setLiked((c) => ({ ...c, [videoId]: !previousLiked }));
        setLikeCounts((c) => ({ ...c, [videoId]: previousCount + (previousLiked ? -1 : 1) }));

        try {
            const token = await getToken();
            if (!token) throw new Error("Token não disponível");
            const result = await likeVideo(videoId, token);
            if (!result) throw new Error("Falha");

            setLiked((c) => ({ ...c, [videoId]: result.liked }));
            setLikeCounts((c) => ({ ...c, [videoId]: result.likesCount }));
        } catch {
            setLiked((c) => ({ ...c, [videoId]: previousLiked }));
            setLikeCounts((c) => ({ ...c, [videoId]: previousCount }));
        }
    }, [getToken, isSignedIn, liked, likeCounts]);

    const handleShare = useCallback(async () => {
        if (!currentVideo) return;

        const url = `${window.location.origin}/videos/memento?video=${currentVideo.id}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: currentVideo.title,
                    text: currentVideo.description ?? currentVideo.title,
                    url,
                });
                return;
            }
            await navigator.clipboard.writeText(url);
        } catch {}
    }, [currentVideo]);

    const formatNumber = (value: number) => {
        if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
        if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
        return String(value);
    };

    if (loading) {
        return (
          <main className="fixed inset-0 flex items-center justify-center bg-black">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </main>
        );
    }

    if (!videos.length) {
        return (
          <main className="fixed inset-0 flex items-center justify-center bg-background px-6">
              <div className="text-center">
                  <p className="text-lg text-muted-foreground">Nenhum Memento ainda</p>
                  <Link href="/videos/memento/upload" className="mt-4 inline-flex rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                      Publicar Memento
                  </Link>
              </div>
          </main>
        );
    }

    return (
      <main className="fixed inset-0 flex flex-col overflow-hidden bg-black">
          {/* ===== HEADER ===== */}
          <header className="relative z-50 flex h-14 shrink-0 items-center border-b border-white/10 bg-black/80 px-4 backdrop-blur-xl">
              <Link href="/videos" className="text-lg tracking-wide"
                    style={{ fontFamily: "var(--font-caesar)", color: "#FFFFFF" }}>
                  Imperium
              </Link>

              <div className="ml-auto flex items-center gap-1">
                  <Link href="/videos/buscar" aria-label="Buscar vídeos" className="rounded-full p-2 text-white transition hover:bg-white/10">
                      <Search className="size-5" />
                  </Link>
                  <Link href="/videos/memento/upload" className="ml-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90">
                      + Publicar
                  </Link>
              </div>
          </header>

          {/* ===== ÁREA DO VÍDEO ===== */}
          <section className="relative min-h-0 flex-1 overflow-hidden bg-black">
              {currentVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative h-full w-full overflow-hidden bg-black">
                        {currentPlaybackId ? (
                          <MuxPlayer
                            key={currentVideo.id}
                            ref={playerRef}
                            playbackId={currentPlaybackId}
                            metadata={{ video_title: currentVideo.title }}
                            poster={currentVideo.thumbnailUrl || undefined}
                            autoPlay="muted"
                            muted
                            loop
                            playsInline
                            preload="auto"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-black">
                              <Play className="size-12 text-white/40" />
                          </div>
                        )}

                        {/* Gradiente inferior */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-72 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                        {/* Botão som */}
                        {currentPlaybackId && (
                          <button type="button" onClick={toggleSound}
                                  aria-label={isMuted ? "Ativar som" : "Desativar som"}
                                  className="absolute right-3 top-3 z-40 flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white shadow-lg backdrop-blur-md transition hover:bg-black/70 active:scale-95">
                              {isMuted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
                          </button>
                        )}

                        {/* Play central */}
                        {!isPlaying && currentPlaybackId && (
                          <button type="button" onClick={togglePlay} aria-label="Reproduzir vídeo"
                                  className="absolute inset-0 z-30 flex items-center justify-center">
                                    <span className="flex size-16 items-center justify-center rounded-full bg-black/50 text-white shadow-xl backdrop-blur-md">
                                        <Play className="ml-1 size-8" fill="white" />
                                    </span>
                          </button>
                        )}

                        {/* ===== INFO INFERIOR ===== */}
                        <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-3 sm:px-4 sm:pb-4">
                            <div className="flex items-end gap-2 sm:gap-3">
                                {/* Texto */}
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1.5 flex items-center gap-2">
                                        {currentVideo.userAvatarUrl ? (
                                          <img src={currentVideo.userAvatarUrl} alt=""
                                               className="size-8 shrink-0 rounded-full border-2 border-white/40 bg-secondary object-cover" />
                                        ) : (
                                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-secondary text-sm font-semibold text-white">
                                              {currentVideo.userName?.charAt(0).toUpperCase() || "U"}
                                          </div>
                                        )}
                                        <span className="max-w-[150px] truncate text-xs font-semibold text-white sm:max-w-[200px] sm:text-sm">
                                                @{currentVideo.userName}
                                            </span>
                                    </div>

                                    <h1 className="line-clamp-1 text-sm font-bold text-white sm:line-clamp-2 sm:text-base">
                                        {currentVideo.title}
                                    </h1>

                                    {currentVideo.description && (
                                      <p className="mt-0.5 line-clamp-1 text-xs text-white/80 sm:text-sm">
                                          {currentVideo.description}
                                      </p>
                                    )}

                                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-white/60 sm:text-xs">
                                        <span>{formatNumber(currentVideo.viewCount)} visualizações</span>
                                        <span>•</span>
                                        <span>{formatNumber(likeCounts[currentVideo.id] ?? currentVideo.likesCount ?? 0)} curtidas</span>
                                        <span>•</span>
                                        <span>{formatNumber(currentVideo.commentsCount ?? 0)} comentários</span>
                                    </div>
                                </div>

                                {/* Ações */}
                                <div className="flex shrink-0 flex-col items-center gap-2 sm:gap-3">
                                    <button type="button" onClick={() => void handleLike(currentVideo)}
                                            disabled={!isSignedIn} aria-label="Curtir"
                                            className="flex flex-col items-center gap-0.5 text-[10px] text-white sm:text-xs">
                                            <span className={`flex size-9 items-center justify-center rounded-full border backdrop-blur-md transition active:scale-95 sm:size-11 ${
                                              liked[currentVideo.id] ? "border-red-500/60 bg-red-500/20" : "border-white/20 bg-black/40"
                                            }`}>
                                                <Heart className={`size-4 sm:size-5 ${liked[currentVideo.id] ? "fill-red-500 text-red-500" : "text-white"}`} />
                                            </span>
                                        <span>{formatNumber(likeCounts[currentVideo.id] ?? currentVideo.likesCount ?? 0)}</span>
                                    </button>

                                    <button type="button" onClick={() => setShowComments(true)} aria-label="Comentários"
                                            className="flex flex-col items-center gap-0.5 text-[10px] text-white sm:text-xs">
                                            <span className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md active:scale-95 sm:size-11">
                                                <MessageSquare className="size-4 sm:size-5" />
                                            </span>
                                        <span>{formatNumber(currentVideo.commentsCount ?? 0)}</span>
                                    </button>

                                    <button type="button" onClick={() => void handleShare()} aria-label="Compartilhar"
                                            className="flex flex-col items-center gap-0.5 text-[10px] text-white sm:text-xs">
                                            <span className="flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md active:scale-95 sm:size-11">
                                                <Share2 className="size-4 sm:size-5" />
                                            </span>
                                        <span>Compartilhar</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Navegação */}
                        {currentIndex > 0 && (
                          <button type="button" onClick={previousVideo} aria-label="Vídeo anterior"
                                  className="absolute left-2 top-1/2 z-40 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-95 sm:size-10">
                              <ChevronLeft className="size-5 sm:size-6" />
                          </button>
                        )}

                        {(currentIndex < videos.length - 1 || !lastPage) && (
                          <button type="button" onClick={nextVideo} aria-label="Próximo vídeo"
                                  className="absolute right-2 top-1/2 z-40 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-95 sm:size-10">
                              <ChevronRight className="size-5 sm:size-6" />
                          </button>
                        )}
                    </div>
                </div>
              )}
          </section>

          {/* Loading more */}
          {loadingMore && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                Carregando...
            </div>
          )}

          {/* ===== COMENTÁRIOS ===== */}
          {showComments && currentVideo && (
            <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
                 onClick={() => setShowComments(false)}>
                <div className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-t-2xl bg-card shadow-2xl"
                     onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h2 className="text-lg font-semibold text-foreground">Comentários</h2>
                        <button type="button" onClick={() => setShowComments(false)} aria-label="Fechar comentários"
                                className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary">
                            <X className="size-5" />
                        </button>
                    </div>
                    <div className="max-h-[calc(80vh-4rem)] overflow-y-auto px-4 pb-6">
                        <VideoComments videoId={currentVideo.id} />
                    </div>
                </div>
            </div>
          )}
      </main>
    );
}
