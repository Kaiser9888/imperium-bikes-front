"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface MementoItem {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    playbackUrl: string;
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
    const [following, setFollowing] = useState<Record<string, boolean>>({});
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    const fetchMomentos = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/videos?page=0&size=20`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await res.json();
            const shorts = data.content.filter(
                (v: MementoItem) => v.durationSeconds <= 60
            );
            setMomentos(shorts);
        } catch (error) {
            console.error("Erro ao carregar:", error);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchMomentos();
    }, [fetchMomentos]);

    useEffect(() => {
        const currentVideo = videoRefs.current.get(momentos[currentIndex]?.id);
        if (currentVideo) {
            currentVideo.currentTime = 0;
            currentVideo.play().catch(() => {});

            videoRefs.current.forEach((video, id) => {
                if (id !== momentos[currentIndex]?.id) {
                    video.pause();
                }
            });
        }
    }, [currentIndex, momentos]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndY.current = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY.current;

        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < momentos.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else if (diff < 0 && currentIndex > 0) {
                setCurrentIndex((prev) => prev - 1);
            }
        }
    };

    const toggleLike = async (videoId: string) => {
        const newLiked = !liked[videoId];
        setLiked((prev) => ({ ...prev, [videoId]: newLiked }));

        try {
            const token = await getToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/like`, {
                method: newLiked ? "POST" : "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            setLiked((prev) => ({ ...prev, [videoId]: !newLiked }));
        }
    };

    const toggleFollow = async (creatorId: string) => {
        const newFollowing = !following[creatorId];
        setFollowing((prev) => ({ ...prev, [creatorId]: newFollowing }));

        try {
            const token = await getToken();
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${creatorId}/follow`,
                {
                    method: newFollowing ? "POST" : "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
        } catch (error) {
            setFollowing((prev) => ({ ...prev, [creatorId]: !newFollowing }));
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

    if (momentos.length === 0) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60 text-lg">Nenhum Memento ainda</p>
                    <p className="text-white/40 text-sm mt-2">
                        Seja o primeiro a publicar um video vertical
                    </p>
                </div>
            </div>
        );
    }

    const current = momentos[currentIndex];

    return (
        <div
            className="h-screen bg-black relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {momentos.map((video, index) => (
                <div
                    key={video.id}
                    className="absolute inset-0 transition-transform duration-300"
                    style={{
                        transform: `translateY(${(index - currentIndex) * 100}%)`,
                    }}
                >
                    <video
                        ref={(el) => {
                            if (el) {
                                videoRefs.current.set(video.id, el);
                            } else {
                                videoRefs.current.delete(video.id);
                            }
                        }}
                        src={video.videoUrl || video.playbackUrl}
                        poster={video.thumbnailUrl}
                        className="w-full h-full object-cover"
                        loop
                        playsInline
                        muted={false}
                    />

                    {/* Gradiente inferior */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pb-20 pt-32 px-4">
                        {/* Info do criador */}
                        <div className="flex items-end justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src={video.userAvatarUrl || "/default-avatar.png"}
                                        alt={video.userName}
                                        className="w-10 h-10 rounded-full border-2 border-white/30"
                                    />
                                    <div>
                                        <p className="text-white font-semibold text-sm">
                                            {video.userName}
                                        </p>
                                        {video.description && (
                                            <p className="text-white/80 text-xs mt-0.5 line-clamp-2">
                                                {video.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <h2 className="text-white font-bold text-base line-clamp-2 mb-1">
                                    {video.title}
                                </h2>

                                <div className="flex items-center gap-2 text-white/50 text-xs">
                                    <span>{formatViews(video.viewCount)} views</span>
                                    <span>&middot;</span>
                                    <span>{video.likesCount} likes</span>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex flex-col items-center gap-5 ml-3">
                                {/* Like */}
                                <button
                                    onClick={() => toggleLike(video.id)}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill={liked[video.id] ? "#ef4444" : "none"}
                                        stroke={liked[video.id] ? "#ef4444" : "white"}
                                        strokeWidth="2"
                                    >
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    <span className="text-white text-xs">
                    {video.likesCount}
                  </span>
                                </button>

                                {/* Comentários */}
                                <Link
                                    href={`/videos/watch/${video.id}`}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <svg
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2"
                                    >
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <span className="text-white text-xs">
                    {video.commentsCount}
                  </span>
                                </Link>

                                {/* Seguir */}
                                {video.userId !== currentUserId && (
                                    <button
                                        onClick={() => toggleFollow(video.userId)}
                                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                                            following[video.userId]
                                                ? "bg-white/20 text-white"
                                                : "bg-white text-black"
                                        }`}
                                    >
                                        {following[video.userId] ? "Seguindo" : "Seguir"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Indicador de progresso */}
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 z-10">
                {momentos.map((_, index) => (
                    <div
                        key={index}
                        className={`h-0.5 rounded-full transition-all duration-300 ${
                            index === currentIndex
                                ? "w-6 bg-white"
                                : index < currentIndex
                                    ? "w-4 bg-white/60"
                                    : "w-4 bg-white/30"
                        }`}
                    />
                ))}
            </div>

            {/* Indicador de navegação */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-xs">
                {currentIndex + 1}/{momentos.length}
            </div>
        </div>
    );
}