"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

const API_URL = "https://imperium-bikes.onrender.com";

interface Video {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    durationSeconds: number;
    viewCount: number;
    isShort: boolean;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        avatarUrl: string;
    };
}

export default function VideosPage() {
    const { getToken } = useAuth();
    const [videos, setVideos] = useState<Video[]>([]);
    const [shorts, setShorts] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchVideos = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(
                `${API_URL}/api/videos?page=${page}&size=12&search=${search}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await res.json();

            if (page === 0) {
                setVideos(data.content);
            } else {
                setVideos((prev) => [...prev, ...data.content]);
            }
            setHasMore(!data.last);
        } catch (error) {
            console.error("Erro ao carregar videos:", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, getToken]);

    const fetchShorts = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/videos/shorts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            setShorts(data);
        } catch (error) {
            console.error("Erro ao carregar shorts:", error);
        }
    }, [getToken]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    useEffect(() => {
        fetchShorts();
    }, [fetchShorts]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setVideos([]);
        fetchVideos();
    };

    const loadMore = () => {
        setPage((prev) => prev + 1);
    };

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            {/* Header */}
            <div className="border-b border-neutral-800">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
                            <p className="text-neutral-400 mt-1">
                                Tutoriais, reviews, trilhas e muito mais
                            </p>
                        </div>
                        <Link
                            href="/videos/upload"
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            Publicar Video
                        </Link>
                    </div>

                    {/* Busca */}
                    <form onSubmit={handleSearch} className="max-w-md">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar videos..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Shorts Section */}
                {shorts.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold mb-4">Shorts</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {shorts.map((short) => (
                                <Link
                                    key={short.id}
                                    href={`/videos/shorts/${short.id}`}
                                    className="flex-shrink-0 w-48 group"
                                >
                                    <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-800">
                                        {short.thumbnailUrl ? (
                                            <img
                                                src={short.thumbnailUrl}
                                                alt={short.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-neutral-700">
                                                <span className="text-neutral-500">Sem thumbnail</span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                                            {formatDuration(short.durationSeconds)}
                                        </div>
                                    </div>
                                    <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-red-400 transition-colors">
                                        {short.title}
                                    </h3>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {formatViews(short.viewCount)} views
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Videos Grid */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">Em Alta</h2>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-video rounded-xl bg-neutral-800" />
                                    <div className="mt-3 space-y-2">
                                        <div className="h-4 bg-neutral-800 rounded w-3/4" />
                                        <div className="h-3 bg-neutral-800 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {videos.map((video) => (
                                    <Link
                                        key={video.id}
                                        href={`/videos/watch/${video.id}`}
                                        className="group"
                                    >
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-800">
                                            {video.thumbnailUrl ? (
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-neutral-700">
                          <span className="text-neutral-500">
                            Sem thumbnail
                          </span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                                                {formatDuration(video.durationSeconds)}
                                            </div>
                                        </div>
                                        <div className="mt-3 flex gap-3">
                                            {video.user?.avatarUrl && (
                                                <img
                                                    src={video.user.avatarUrl}
                                                    alt={video.user.fullName}
                                                    className="w-9 h-9 rounded-full flex-shrink-0"
                                                />
                                            )}
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
                                                    {video.title}
                                                </h3>
                                                <p className="text-xs text-neutral-500 mt-1">
                                                    {video.user?.fullName}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {formatViews(video.viewCount)} views
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {hasMore && (
                                <div className="flex justify-center mt-10">
                                    <button
                                        onClick={loadMore}
                                        className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Carregar mais
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}