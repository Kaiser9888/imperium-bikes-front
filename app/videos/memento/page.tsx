"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

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
    const touchStartY = useRef(0);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    useEffect(() => {
        let cancelled = false;

        const fetchMomentos = async () => {
            try {
                const res = await fetch(`${API_URL}/api/videos?page=0&size=20`);
                const data = await res.json();
                if (!cancelled) {
                    const shorts = (data.content || []).filter(
                        (v: MementoItem) => v.durationSeconds <= 60
                    );
                    setMomentos(shorts);
                    setLoading(false);
                }
            } catch (error) {
                if (!cancelled) setLoading(false);
            }
        };

        fetchMomentos();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const current = momentos[currentIndex];
        if (!current) return;

        const currentVideo = videoRefs.current.get(current.id);
        if (currentVideo) {
            currentVideo.currentTime = 0;
            currentVideo.play().catch(() => {});

            videoRefs.current.forEach((video, id) => {
                if (id !== current.id) {
                    video.pause();
                }
            });
        }
    }, [currentIndex, momentos]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (currentIndex < momentos.length - 1) setCurrentIndex((prev) => prev + 1);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, momentos.length]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartY.current - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < momentos.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else if (diff < 0 && currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1);
            }
        }
    };

    const togglePlayPause = (videoId: string) => {
        const video = videoRefs.current.get(videoId);
        if (!video) return;
        if (video.paused) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
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
            setLiked((prev) => ({ ...prev, [videoId]: data.liked }));
            setLikeCounts((prev) => ({ ...prev, [videoId]: data.count }));
        } catch (error) {
            console.error("Erro ao curtir:", error);
        }
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return String(views);
    };

    if (loading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen bg-black relative">
            {momentos.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                        <p className="text-white/60 text-lg">Nenhum Memento ainda</p>
                        <Link
                            href="/videos/upload?mode=memento"
                            className="inline-block mt-4 bg-white text-black px-6 py-2 rounded-full text-sm font-medium"
                        >
                            Publicar Memento
                        </Link>
                    </div>
                </div>
            ) : (
                <div
                    className="h-full relative overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {momentos.map((video, index) => (
                        <div
                            key={video.id}
                            className="absolute inset-0 transition-transform duration-300"
                            style={{ transform: `translateY(${(index - currentIndex) * 100}%)` }}
                        >
                            <video
                                ref={(el) => {
                                    if (el) videoRefs.current.set(video.id, el);
                                    else videoRefs.current.delete(video.id);
                                }}
                                src={video.videoUrl}
                                poster={video.thumbnailUrl}
                                className="w-full h-full object-cover"
                                loop
                                playsInline
                                muted={false}
                                onClick={() => togglePlayPause(video.id)}
                            />

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pb-20 pt-32 px-4">
                                <div className="flex items-end justify-between">
                                    <div className="flex-1 mr-3">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img
                                                src={video.userAvatarUrl || ""}
                                                alt=""
                                                className="w-10 h-10 rounded-full border-2 border-white/30 bg-secondary"
                                            />
                                            <div>
                                                <p className="text-white font-semibold text-sm">{video.userName}</p>
                                                {video.description && (
                                                    <p className="text-white/80 text-xs mt-0.5 line-clamp-2">{video.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <h2 className="text-white font-bold text-base line-clamp-2 mb-1">{video.title}</h2>
                                        <div className="flex items-center gap-2 text-white/50 text-xs">
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
                                            <span className="text-white text-xs">{likeCounts[video.id] ?? video.likesCount}</span>
                                        </button>

                                        <Link href={`/videos/watch/${video.id}`} className="flex flex-col items-center gap-1">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                            </svg>
                                            <span className="text-white text-xs">{video.commentsCount}</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Botão Publicar Memento no topo */}
                    <div className="absolute top-4 right-4 z-10">
                        <Link
                            href="/videos/memento/upload"
                            className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
                        >
                            + Memento
                        </Link>
                    </div>

                    {/* Indicador de progresso */}
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 z-10">
                        {momentos.map((_, index) => (
                            <div
                                key={index}
                                className={`h-0.5 rounded-full transition-all duration-300 ${
                                    index === currentIndex ? "w-6 bg-white" : index < currentIndex ? "w-4 bg-white/60" : "w-4 bg-white/30"
                                }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}