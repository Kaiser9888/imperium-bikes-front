"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { VideoComments } from "@/components/video/VideoComments";

const API_URL = "https://imperium-bikes.onrender.com";

interface MementoItem {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    durationSeconds: number;
    viewCount: number;
    likesCount: number;
    commentsCount: number;
    userName: string;
    userAvatarUrl: string;
    userId: string;
}

export default function MementoPage() {
    const { getToken, userId: currentUserId } = useAuth();
    const [momentos, setMomentos] = useState<MementoItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState<Record<string, boolean>>({});
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
    const [showComments, setShowComments] = useState(false);
    const touchStartY = useRef(0);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    useEffect(() => {
        let cancelled = false;
        const fetchMomentos = async () => {
            try {
                const res = await fetch(`${API_URL}/api/videos?page=0&size=20&isShort=true`);
                const data = await res.json();
                if (!cancelled) {
                    const items = data.content || [];
                    setMomentos(items);
                    // Inicializar contadores
                    const counts: Record<string, number> = {};
                    items.forEach((v: MementoItem) => {
                        counts[v.id] = v.likesCount;
                    });
                    setLikeCounts(counts);
                    setLoading(false);
                }
            } catch { if (!cancelled) setLoading(false); }
        };
        fetchMomentos();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const current = momentos[currentIndex];
        if (!current) return;
        const cv = videoRefs.current.get(current.id);
        if (cv) {
            cv.currentTime = 0;
            cv.play().catch(() => {});
            videoRefs.current.forEach((v, id) => { if (id !== current.id) v.pause(); });
        }
    }, [currentIndex, momentos]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (showComments) return;
            if (e.key === "ArrowDown" && currentIndex < momentos.length - 1) {
                e.preventDefault(); setCurrentIndex((p) => p + 1);
            } else if (e.key === "ArrowUp" && currentIndex > 0) {
                e.preventDefault(); setCurrentIndex((p) => p - 1);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [currentIndex, momentos.length, showComments]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        if (showComments) return;
        if (e.deltaY > 30 && currentIndex < momentos.length - 1) setCurrentIndex((p) => p + 1);
        else if (e.deltaY < -30 && currentIndex > 0) setCurrentIndex((p) => p - 1);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (showComments) return;
        touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (showComments) return;
        const diff = touchStartY.current - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < momentos.length - 1) setCurrentIndex((p) => p + 1);
            else if (diff < 0 && currentIndex > 0) setCurrentIndex((p) => p - 1);
        }
    };

    const togglePlayPause = (videoId: string) => {
        const v = videoRefs.current.get(videoId);
        if (!v) return;
        v.paused ? v.play().catch(() => {}) : v.pause();
    };

    const toggleLike = async (videoId: string) => {
        if (!currentUserId) return;
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/videos/${videoId}/like`, {
                method: "POST", headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setLiked((p) => ({ ...p, [videoId]: data.liked }));
                setLikeCounts((p) => ({ ...p, [videoId]: data.count }));
            }
        } catch { /* silencioso */ }
    };

    const formatViews = (v: number) => {
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
        if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
        return String(v);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black">
            {momentos.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4">
                    <p className="text-lg text-white/60">Nenhum Memento ainda</p>
                </div>
            ) : (
                <div
                    className="relative h-full overflow-hidden"
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {momentos.map((video, index) => (
                        <div
                            key={video.id}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                                transform: `translateY(${(index - currentIndex) * 100}%)`,
                                transition: "transform 0.3s ease-out",
                            }}
                        >
                            {/* Vídeo com borda arredondada estilo TikTok/Shorts */}
                            <div className="relative mx-auto h-full w-full max-w-[420px] px-2 py-4">
                                <video
                                    ref={(el) => {
                                        if (el) videoRefs.current.set(video.id, el);
                                        else videoRefs.current.delete(video.id);
                                    }}
                                    src={video.videoUrl}
                                    poster={video.thumbnailUrl}
                                    className="h-full w-full rounded-2xl object-cover"
                                    loop
                                    playsInline
                                    muted={false}
                                    onClick={() => togglePlayPause(video.id)}
                                />

                                {/* Overlay inferior */}
                                <div className="absolute bottom-6 left-0 right-0 px-4">
                                    <div className="flex items-end justify-between">
                                        <div className="mr-3 min-w-0 flex-1">
                                            <div className="mb-3 flex items-center gap-3">
                                                <img
                                                    src={video.userAvatarUrl || ""}
                                                    alt=""
                                                    className="h-10 w-10 rounded-full border-2 border-white/30 bg-secondary"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-white">@{video.userName}</p>
                                                    {video.description && (
                                                        <p className="mt-0.5 line-clamp-1 text-xs text-white/80">{video.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <h2 className="mb-1 line-clamp-2 text-sm font-bold text-white">{video.title}</h2>
                                            <div className="flex items-center gap-2 text-xs text-white/50">
                                                <span>{formatViews(video.viewCount)} views</span>
                                                <span>&middot;</span>
                                                <span>{likeCounts[video.id] ?? video.likesCount} likes</span>
                                            </div>
                                        </div>

                                        {/* Ações à direita */}
                                        <div className="flex flex-col items-center gap-5">
                                            <button onClick={() => toggleLike(video.id)} className="flex flex-col items-center gap-1">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${liked[video.id] ? "bg-red-500/20" : "bg-white/10"} backdrop-blur transition-colors hover:bg-white/20`}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24"
                                                         fill={liked[video.id] ? "#ef4444" : "none"}
                                                         stroke={liked[video.id] ? "#ef4444" : "white"} strokeWidth="2">
                                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-medium text-white">{likeCounts[video.id] ?? video.likesCount}</span>
                                            </button>

                                            <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-medium text-white">{video.commentsCount}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Indicador de progresso na direita */}
                    <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5">
                        {momentos.map((_, i) => (
                            <div
                                key={i}
                                className={`h-6 w-0.5 rounded-full transition-all duration-300 ${
                                    i === currentIndex ? "bg-white" : i < currentIndex ? "bg-white/40" : "bg-white/20"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de comentários */}
            {showComments && momentos[currentIndex] && (
                <div
                    className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowComments(false)}
                >
                    <div
                        className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card px-4 pb-6 pt-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-foreground">Comentários</h2>
                            <button
                                onClick={() => setShowComments(false)}
                                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <VideoComments videoId={momentos[currentIndex].id} />
                    </div>
                </div>
            )}
        </div>
    );
}