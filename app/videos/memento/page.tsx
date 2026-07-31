"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
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
                    setMomentos(data.content || []);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) setLoading(false);
            }
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
                e.preventDefault();
                setCurrentIndex((p) => p + 1);
            } else if (e.key === "ArrowUp" && currentIndex > 0) {
                e.preventDefault();
                setCurrentIndex((p) => p - 1);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [currentIndex, momentos.length, showComments]);

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
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setLiked((p) => ({ ...p, [videoId]: data.liked }));
            setLikeCounts((p) => ({ ...p, [videoId]: data.count }));
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
        <div className="relative h-screen bg-black">
            {momentos.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4">
                    <div className="text-center">
                        <p className="text-lg text-white/60">Nenhum Memento ainda</p>
                        <Link
                            href="/videos/memento/upload"
                            className="mt-4 inline-block rounded-full bg-white px-6 py-2 text-sm font-medium text-black"
                        >
                            Publicar Memento
                        </Link>
                    </div>
                </div>
            ) : (
                <div
                    className="relative h-full overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {momentos.map((video, index) => (
                        <div
                            key={video.id}
                            className="absolute inset-0 transition-transform duration-300"
                            style={{ transform: `translateY(${(index - currentIndex) * 100}%)` }}
                        >
                            <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center px-4">
                                <video
                                    ref={(el) => {
                                        if (el) videoRefs.current.set(video.id, el);
                                        else videoRefs.current.delete(video.id);
                                    }}
                                    src={video.videoUrl}
                                    poster={video.thumbnailUrl}
                                    className="max-h-[85vh] w-full rounded-xl object-contain"
                                    loop
                                    playsInline
                                    muted={false}
                                    onClick={() => togglePlayPause(video.id)}
                                />
                            </div>

                            {/* Overlay inferior */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-4 pb-6 pt-24">
                                <div className="mx-auto max-w-lg">
                                    <div className="flex items-end justify-between">
                                        <div className="mr-3 min-w-0 flex-1">
                                            <div className="mb-3 flex items-center gap-3">
                                                <img
                                                    src={video.userAvatarUrl || ""}
                                                    alt=""
                                                    className="h-10 w-10 rounded-full border-2 border-white/30 bg-secondary"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-white">{video.userName}</p>
                                                    {video.description && (
                                                        <p className="mt-0.5 line-clamp-2 text-xs text-white/80">{video.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <h2 className="mb-1 line-clamp-2 text-base font-bold text-white">{video.title}</h2>
                                            <div className="flex items-center gap-2 text-xs text-white/50">
                                                <span>{formatViews(video.viewCount)} views</span>
                                                <span>&middot;</span>
                                                <span>{likeCounts[video.id] ?? video.likesCount} likes</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center gap-5">
                                            <button onClick={() => toggleLike(video.id)} className="flex flex-col items-center gap-1">
                                                <svg width="28" height="28" viewBox="0 0 24 24"
                                                     fill={liked[video.id] ? "#ef4444" : "none"}
                                                     stroke={liked[video.id] ? "#ef4444" : "white"} strokeWidth="2">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                </svg>
                                                <span className="text-xs text-white">{likeCounts[video.id] ?? video.likesCount}</span>
                                            </button>

                                            <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                </svg>
                                                <span className="text-xs text-white">{video.commentsCount}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Botão Publicar */}
                    <div className="absolute right-4 top-4 z-10">
                        <Link
                            href="/videos/memento/upload"
                            className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/30"
                        >
                            + Memento
                        </Link>
                    </div>

                    {/* Indicador */}
                    <div className="absolute left-0 right-0 top-4 z-10 flex justify-center gap-1">
                        {momentos.map((_, i) => (
                            <div
                                key={i}
                                className={`h-0.5 rounded-full transition-all duration-300 ${
                                    i === currentIndex ? "w-6 bg-white" : i < currentIndex ? "w-4 bg-white/60" : "w-4 bg-white/30"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de comentários */}
            {showComments && momentos[currentIndex] && (
                <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card px-4 pb-6 pt-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-foreground">Comentários</h2>
                            <button
                                onClick={() => setShowComments(false)}
                                className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                            >
                                ✕
                            </button>
                        </div>
                        <VideoComments videoId={momentos[currentIndex].id} />
                    </div>
                </div>
            )}
        </div>
    );
}