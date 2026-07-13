"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

interface MementoItem {
    id: string;
    title: string;
    thumbnailUrl: string;
    durationSeconds: number;
    formattedDuration: string;
    viewCount: number;
    userName: string;
}

export default function MementoPage() {
    const { getToken } = useAuth();
    const [momentos, setMomentos] = useState<MementoItem[]>([]);
    const [loading, setLoading] = useState(true);

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

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return String(views);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="font-blackletter text-3xl text-primary">Memento</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Lembre-se de viver
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[9/16] rounded-xl bg-secondary" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {momentos.map((video) => (
                        <Link
                            key={video.id}
                            href={`/videos/watch/${video.id}`}
                            className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-secondary"
                        >
                            {video.thumbnailUrl ? (
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
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
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="text-white text-sm font-medium line-clamp-2">
                                    {video.title}
                                </h3>
                                <p className="text-white/70 text-xs mt-1">
                                    {video.userName} &middot; {formatViews(video.viewCount)} views
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}