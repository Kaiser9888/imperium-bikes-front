"use client";

import {
    Suspense,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    ChevronDown,
    ChevronUp,
    Heart,
    MessageSquare,
    Plus,
    Search,
    Share2,
    Volume2,
    VolumeX,
    X,
    Play,
} from "lucide-react";
import { toast } from "sonner";

import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";

import { VideoComments } from "@/components/videos/VideoComments";
import { GlitchButton } from "@/components/videos/GlitchButton";
import { SaveButton } from "@/components/videos/SaveButton";
import { VideoAvatar } from "@/components/videos/VideoAvatar";
import {
    fetchVideo,
    fetchVideoPage,
    likeVideo,
    playbackIdFrom,
} from "@/lib/videos/api";
import { formatViews } from "@/lib/videos/format";
import { useWatchHeartbeat } from "@/hooks/useWatchHeartbeat";

import type { VideoItem } from "@/lib/videos/types";

/** Tempo mínimo entre duas trocas por roda do mouse (um giro dispara vários eventos). */
const WHEEL_LOCK_MS = 650;
const SWIPE_MIN_PX = 60;

export default function MementoPage() {
    return (
        <Suspense fallback={<FeedSpinner />}>
            <MementoFeedView />
        </Suspense>
    );
}

function FeedSpinner() {
    return (
        <div className="flex h-full items-center justify-center bg-black">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
    );
}

function MementoFeedView() {
    const { getToken, isSignedIn, isLoaded } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    // Link compartilhado (/videos/memento?video=ID): lido só na primeira carga
    const initialVideoId = useRef(searchParams.get("video"));

    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [feedError, setFeedError] = useState<string | null>(null);

    const [liked, setLiked] = useState<Record<string, boolean>>({});
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

    const [showComments, setShowComments] = useState(false);

    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    // Guarda de qual vídeo é o progresso: trocar de vídeo zera sem setState no efeito
    const [progress, setProgress] = useState({ id: "", value: 0 });

    const [page, setPage] = useState(0);
    const [lastPage, setLastPage] = useState(false);

    const playerRef = useRef<MuxPlayerElement | null>(null);
    const pendingAdvance = useRef(false);
    const wheelLockedUntil = useRef(0);
    const touchStartY = useRef<number | null>(null);
    // O som escolhido vale para os próximos vídeos também
    const isMutedRef = useRef(isMuted);
    useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

    const rememberReactions = useCallback((items: VideoItem[]) => {
        setLikeCounts((current) => {
            const next = { ...current };
            for (const v of items) if (next[v.id] === undefined) next[v.id] = v.likesCount ?? 0;
            return next;
        });
        setLiked((current) => {
            const next = { ...current };
            for (const v of items) if (next[v.id] === undefined) next[v.id] = v.liked ?? false;
            return next;
        });
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setFeedError(null);
                // Com token, cada Memento já vem com o "curtido" de quem está vendo
                const token = await getToken().catch(() => null);
                const data = await fetchVideoPage(0, true, { token });
                if (cancelled) return;

                let items = data.content ?? [];
                let startIndex = 0;

                const sharedId = initialVideoId.current;
                if (sharedId) {
                    const found = items.findIndex((v) => v.id === sharedId);
                    if (found >= 0) {
                        startIndex = found;
                    } else {
                        const shared = await fetchVideo(sharedId, token);
                        if (cancelled) return;
                        if (shared) items = [shared, ...items];
                    }
                }

                setVideos(items);
                setCurrentIndex(startIndex);
                setLastPage(data.last ?? true);
                setPage(0);
                rememberReactions(items);
            } catch (error) {
                if (!cancelled) setFeedError(error instanceof Error ? error.message : "Não foi possível carregar os Mementos.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        void load();
        return () => { cancelled = true; };
    }, [rememberReactions, isLoaded, getToken]);

    const loadMore = useCallback(async () => {
        if (loadingMore || lastPage) return;

        const nextPage = page + 1;

        try {
            setLoadingMore(true);
            const token = await getToken().catch(() => null);
            const data = await fetchVideoPage(nextPage, true, { token });
            const newVideos = data.content ?? [];

            setVideos((current) => {
                const existingIds = new Set(current.map((v) => v.id));
                return [...current, ...newVideos.filter((v) => !existingIds.has(v.id))];
            });

            setPage(nextPage);
            setLastPage(data.last ?? true);
            rememberReactions(newVideos);
        } catch {
            pendingAdvance.current = false;
            toast.error("Não foi possível carregar mais Mementos.");
        } finally {
            setLoadingMore(false);
        }
    }, [lastPage, loadingMore, page, rememberReactions, getToken]);

    // Quem pediu "próximo" no fim da lista avança assim que a página nova chega
    useEffect(() => {
        if (pendingAdvance.current && currentIndex < videos.length - 1) {
            pendingAdvance.current = false;
            setCurrentIndex((i) => i + 1);
        }
    }, [videos.length, currentIndex]);

    const currentVideo = videos[currentIndex];
    const currentPlaybackId = playbackIdFrom(currentVideo?.videoUrl);
    useWatchHeartbeat(playerRef, currentPlaybackId ? currentVideo?.id : undefined);

    // Mantém a URL apontando pro vídeo atual: recarregar ou copiar a barra de endereço volta nele
    useEffect(() => {
        if (!currentVideo) return;
        window.history.replaceState(null, "", `/videos/memento?video=${currentVideo.id}`);
    }, [currentVideo]);

    useEffect(() => {
        const player = playerRef.current;
        if (!player || !currentVideo) return;

        let cancelled = false;

        const startPlayback = async () => {
            if (cancelled) return;
            try {
                player.muted = isMutedRef.current;
                await player.play();
                if (!cancelled) setIsPlaying(true);
            } catch {
                if (!cancelled) setIsPlaying(false);
            }
        };

        const handleCanPlay = () => { void startPlayback(); };
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTime = () => {
            if (player.duration) setProgress({ id: currentVideo.id, value: player.currentTime / player.duration });
        };

        player.addEventListener("canplay", handleCanPlay);
        player.addEventListener("play", handlePlay);
        player.addEventListener("pause", handlePause);
        player.addEventListener("timeupdate", handleTime);
        void startPlayback();

        return () => {
            cancelled = true;
            player.removeEventListener("canplay", handleCanPlay);
            player.removeEventListener("play", handlePlay);
            player.removeEventListener("pause", handlePause);
            player.removeEventListener("timeupdate", handleTime);
            try { player.pause(); } catch {}
        };
    }, [currentVideo]);


    const togglePlay = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;

        if (player.paused) {
            player.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else {
            player.pause();
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
            // Pré-carrega a próxima página quando faltam 2 vídeos
            if (currentIndex + 1 >= videos.length - 2) void loadMore();
            return;
        }
        if (!lastPage) {
            pendingAdvance.current = true;
            void loadMore();
        }
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
            const target = event.target as HTMLElement | null;
            if (target?.closest("input, textarea, [contenteditable='true']")) return;

            if (event.key === "ArrowDown") { event.preventDefault(); nextVideo(); }
            if (event.key === "ArrowUp") { event.preventDefault(); previousVideo(); }
            if (event.key === " ") { event.preventDefault(); togglePlay(); }
            if (event.key === "m") { toggleSound(); }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextVideo, previousVideo, togglePlay, toggleSound, showComments]);

    const handleWheel = (event: React.WheelEvent) => {
        if (showComments || Math.abs(event.deltaY) < 20) return;
        const now = Date.now();
        if (now < wheelLockedUntil.current) return;
        wheelLockedUntil.current = now + WHEEL_LOCK_MS;
        if (event.deltaY > 0) nextVideo();
        else previousVideo();
    };

    const handleTouchStart = (event: React.TouchEvent) => {
        touchStartY.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (event: React.TouchEvent) => {
        const start = touchStartY.current;
        touchStartY.current = null;
        if (start === null || showComments) return;
        const delta = start - (event.changedTouches[0]?.clientY ?? start);
        if (delta > SWIPE_MIN_PX) nextVideo();
        else if (delta < -SWIPE_MIN_PX) previousVideo();
    };

    const handleLike = useCallback(async (video: VideoItem) => {
        if (!isSignedIn) {
            toast("Entre para curtir Mementos", {
                action: { label: "Entrar", onClick: () => router.push("/sign-in") },
            });
            return;
        }

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

            // O servidor devolve o estado final (curtiu/descurtiu)
            setLiked((c) => ({ ...c, [videoId]: result.liked }));
            setLikeCounts((c) => ({ ...c, [videoId]: result.likesCount }));
        } catch {
            setLiked((c) => ({ ...c, [videoId]: previousLiked }));
            setLikeCounts((c) => ({ ...c, [videoId]: previousCount }));
            toast.error("Não foi possível curtir agora.");
        }
    }, [getToken, isSignedIn, liked, likeCounts, router]);

    const handleShare = useCallback(async () => {
        if (!currentVideo) return;

        const url = `${window.location.origin}/videos/memento?video=${currentVideo.id}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: currentVideo.title, url });
            } catch {
                // a pessoa fechou a folha de compartilhamento
            }
            return;
        }
        try {
            await navigator.clipboard.writeText(url);
            toast("Link copiado");
        } catch {
            toast.error("Não foi possível copiar o link");
        }
    }, [currentVideo]);

    if (loading) return <FeedSpinner />;

    if (!videos.length) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6 bg-black px-6 text-center">
                <MementoWordmark />
                <p role={feedError ? "alert" : undefined} className="max-w-xs text-sm text-white/60">
                    {feedError ?? "Nenhum Memento ainda. Grave um momento curto na vertical e seja o primeiro."}
                </p>
                <GlitchButton text="Publicar Memento" href="/videos/memento/upload" icon={<Plus aria-hidden="true" />} />
            </div>
        );
    }

    const likeCount = likeCounts[currentVideo.id] ?? currentVideo.likesCount ?? 0;
    const isLiked = liked[currentVideo.id] ?? false;

    return (
        <div
            className="relative flex h-full items-center justify-center overflow-hidden bg-black"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Fundo desfocado com a capa: preenche as laterais no desktop */}
            {currentVideo.thumbnailUrl && (
                <img
                    src={currentVideo.thumbnailUrl}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-30 blur-3xl"
                />
            )}

            {/* Coluna 9:16 */}
            <section
                aria-roledescription="feed de vídeos curtos"
                aria-label={`Memento ${currentIndex + 1} de ${videos.length}`}
                className="relative h-full w-full overflow-hidden bg-black sm:aspect-[9/16] sm:w-auto sm:max-w-full sm:rounded-2xl sm:my-3 sm:h-[calc(100%-1.5rem)] sm:ring-1 sm:ring-white/10"
            >
                {currentPlaybackId ? (
                    <MuxPlayer
                        key={currentVideo.id}
                        ref={playerRef}
                        playbackId={currentPlaybackId}
                        metadata={{ video_title: currentVideo.title }}
                        poster={currentVideo.thumbnailUrl || undefined}
                        autoPlay="muted"
                        muted={isMuted}
                        loop
                        playsInline
                        preload="auto"
                        accentColor="#d33a2c"
                        className="absolute inset-0 h-full w-full"
                        style={{ "--controls": "none", "--media-object-fit": "cover" }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Play className="size-12 text-white/40" aria-hidden="true" />
                    </div>
                )}

                {/* Toque no vídeo: play/pause */}
                {currentPlaybackId && (
                    <button
                        type="button"
                        onClick={togglePlay}
                        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
                        className="absolute inset-0 z-10 flex items-center justify-center"
                    >
                        {!isPlaying && (
                            <span className="flex size-16 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md">
                                <Play className="ml-1 size-8" fill="white" aria-hidden="true" />
                            </span>
                        )}
                    </button>
                )}

                {/* Topo */}
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/80 to-transparent" />
                <header className="absolute inset-x-0 top-0 z-30 flex items-center gap-2 px-3 pt-3">
                    <Link href="/videos" aria-label="Voltar para vídeos">
                        <MementoWordmark />
                    </Link>
                    <div className="ml-auto flex items-center gap-2">
                        <Link
                            href="/videos/buscar"
                            aria-label="Buscar vídeos"
                            className="flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                        >
                            <Search className="size-5" aria-hidden="true" />
                        </Link>
                        {currentPlaybackId && (
                            <button
                                type="button"
                                onClick={toggleSound}
                                aria-label={isMuted ? "Ativar som" : "Desativar som"}
                                className="flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                            >
                                {isMuted ? <VolumeX className="size-5" aria-hidden="true" /> : <Volume2 className="size-5" aria-hidden="true" />}
                            </button>
                        )}
                        <GlitchButton text="Publicar" href="/videos/memento/upload" size="sm" icon={<Plus aria-hidden="true" />} />
                    </div>
                </header>

                {/* Base */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-72 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 z-30 flex items-end gap-3 px-3 pb-5 sm:px-4">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <VideoAvatar name={currentVideo.userName} url={currentVideo.userAvatarUrl} className="size-9 border-2 border-white/40" />
                            <span className="truncate text-sm font-bold text-white">@{currentVideo.userName}</span>
                        </div>
                        <h1 className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-base">
                            {currentVideo.title}
                        </h1>
                        {currentVideo.description && currentVideo.description !== currentVideo.title && (
                            <p className="mt-1 line-clamp-2 text-xs text-white/75">{currentVideo.description}</p>
                        )}
                        <p className="mt-2 text-[0.6875rem] font-medium uppercase tracking-widest text-white/50">
                            {formatViews(currentVideo.viewCount)} visualizações
                        </p>
                    </div>

                    {/* Barra de ações */}
                    <div className="flex shrink-0 flex-col items-center gap-4">
                        <RailButton label="Curtir" count={formatViews(likeCount)} onClick={() => void handleLike(currentVideo)} pressed={isLiked}>
                            <Heart className={`size-5 ${isLiked ? "fill-primary text-primary" : ""}`} aria-hidden="true" />
                        </RailButton>
                        <RailButton label="Comentários" count={formatViews(currentVideo.commentsCount ?? 0)} onClick={() => setShowComments(true)}>
                            <MessageSquare className="size-5" aria-hidden="true" />
                        </RailButton>
                        <SaveButton videoId={currentVideo.id} iconOnly />
                        <RailButton label="Compartilhar" onClick={() => void handleShare()}>
                            <Share2 className="size-5" aria-hidden="true" />
                        </RailButton>
                    </div>
                </div>

                {/* Progresso */}
                <div className="absolute inset-x-0 bottom-0 z-30 h-0.5 bg-white/15" aria-hidden="true">
                    <div className="h-full bg-primary transition-[width] duration-200 ease-linear" style={{ width: `${progress.id === currentVideo.id ? progress.value * 100 : 0}%` }} />
                </div>
            </section>

            {/* Setas (desktop) */}
            <div className="absolute right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex">
                <button
                    type="button"
                    onClick={previousVideo}
                    disabled={currentIndex === 0}
                    aria-label="Memento anterior"
                    className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-30"
                >
                    <ChevronUp className="size-6" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={nextVideo}
                    disabled={currentIndex >= videos.length - 1 && lastPage}
                    aria-label="Próximo Memento"
                    className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-30"
                >
                    <ChevronDown className="size-6" aria-hidden="true" />
                </button>
            </div>

            {loadingMore && (
                <div className="pointer-events-none absolute bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                    Carregando...
                </div>
            )}

            {/* Comentários */}
            {showComments && (
                <div
                    className="absolute inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowComments(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="memento-comments-title"
                        className="relative max-h-[80%] w-full max-w-lg overflow-hidden rounded-t-2xl bg-card shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <h2 id="memento-comments-title" className="text-base font-semibold text-foreground">Comentários</h2>
                            <button
                                type="button"
                                onClick={() => setShowComments(false)}
                                aria-label="Fechar comentários"
                                className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary"
                            >
                                <X className="size-5" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="max-h-[calc(80dvh-4rem)] overflow-y-auto px-4 pb-6 pt-3">
                            <VideoComments videoId={currentVideo.id} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MementoWordmark() {
    return (
        <span className="flex items-center gap-2 text-white">
            <span aria-hidden="true" className="h-5 w-1 bg-primary" />
            <span className="text-sm font-extrabold uppercase tracking-[0.35em]">Memento</span>
        </span>
    );
}

function RailButton({
    label,
    count,
    pressed,
    onClick,
    children,
}: {
    label: string;
    count?: string;
    pressed?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={pressed}
            className="flex flex-col items-center gap-1 text-[0.6875rem] font-semibold text-white"
        >
            <span
                className={`flex size-11 items-center justify-center rounded-full border backdrop-blur-md transition active:scale-90 ${
                    pressed ? "border-primary/70 bg-primary/25" : "border-white/20 bg-black/40 hover:bg-black/60"
                }`}
            >
                {children}
            </span>
            {count !== undefined && <span className="tabular-nums">{count}</span>}
        </button>
    );
}
