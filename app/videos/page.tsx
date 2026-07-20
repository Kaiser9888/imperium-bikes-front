"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

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

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="font-blackletter text-3xl text-primary">Videos</h1>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-video rounded-xl bg-secondary" />
                            <div className="mt-3 space-y-2">
                                <div className="h-4 bg-secondary rounded w-3/4" />
                                <div className="h-3 bg-secondary rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                        Nenhum video publicado ainda
                    </p>
                    <Link
                        href="/videos/upload"
                        className="inline-block mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Seja o primeiro a publicar
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {videos.map((video) => (
                            <Link
                                key={video.id}
                                href={`/videos/watch/${video.id}`}
                                className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
                            >
                                <div className="relative aspect-video bg-secondary overflow-hidden">
                                    {video.thumbnailUrl ? (
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                                            <svg
                                                width="32"
                                                height="32"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                className="text-muted-foreground"
                                            >
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                                        {video.formattedDuration || "00:00"}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                        <span>{video.userName}</span>
                                        <span>
                      {formatViews(video.viewCount)} views &middot;{" "}
                                            {timeAgo(video.createdAt)}
                    </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {hasMore && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={loadMore}
                                className="bg-card border border-border text-foreground px-8 py-3 rounded-full text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                Carregar mais videos
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}