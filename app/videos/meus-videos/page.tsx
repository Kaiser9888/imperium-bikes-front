"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Trash2, Eye, Heart, Clock, Plus, Film } from "lucide-react";

const API_URL = "https://imperium-bikes.onrender.com";

interface MyVideo {
    id: string;
    title: string;
    thumbnailUrl: string;
    formattedDuration: string;
    viewCount: number;
    likesCount: number;
    status: string;
    createdAt: string;
}

export default function MeusVideosPage() {
    const { getToken } = useAuth();
    const [videos, setVideos] = useState<MyVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchMyVideos = useCallback(async () => {
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/videos/my-videos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setVideos(data.content || []);
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        let cancelled = false;
        fetchMyVideos();
        return () => { cancelled = true; };
    }, [fetchMyVideos]);

    const deleteVideo = async (videoId: string) => {
        if (!confirm("Tem certeza que deseja excluir este vídeo?")) return;
        setDeleting(videoId);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/videos/${videoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setVideos((prev) => prev.filter((v) => v.id !== videoId));
            } else {
                alert("Erro ao excluir vídeo");
                await fetchMyVideos();
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
            await fetchMyVideos();
        } finally {
            setDeleting(null);
        }
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return String(views);
    };

    const timeAgo = (date: string) => {
        if (!date) return "";
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return "Hoje";
        if (diffDays === 1) return "Ontem";
        if (diffDays < 7) return `${diffDays}d`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
        return `${Math.floor(diffDays / 30)}m`;
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-blackletter text-3xl text-primary">Meus Vídeos</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {videos.length} vídeo{videos.length !== 1 ? "s" : ""} publicado{videos.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    {videos.length > 0 && (
                        <Link
                            href="/videos/upload"
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            <Plus className="size-4" />
                            Novo vídeo
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-4">
                                <div className="flex gap-4">
                                    <div className="h-20 w-36 rounded-lg bg-secondary" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 rounded bg-secondary" />
                                        <div className="h-3 w-1/2 rounded bg-secondary" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card px-8 py-16 text-center">
                        <Film className="mx-auto size-10 text-muted-foreground/60" />
                        <p className="mt-4 font-serif text-lg text-foreground">Nenhum vídeo publicado</p>
                        <p className="mt-1 text-sm text-muted-foreground">Publique seu primeiro vídeo e veja-o aqui.</p>
                        <Link
                            href="/videos/upload"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                            Publicar vídeo
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                            >
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={`/videos/watch/${video.id}`}
                                        className="relative h-20 w-36 flex-shrink-0 overflow-hidden rounded-lg bg-secondary"
                                    >
                                        {video.thumbnailUrl ? (
                                            <img
                                                src={video.thumbnailUrl}
                                                alt=""
                                                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-muted-foreground">
                                                <Film className="size-5" />
                                            </div>
                                        )}
                                        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[0.6rem] font-medium text-white">
                                            {video.formattedDuration || "00:00"}
                                        </span>
                                    </Link>

                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/videos/watch/${video.id}`}
                                            className="font-medium leading-snug text-foreground transition-colors hover:text-primary line-clamp-1"
                                        >
                                            {video.title || "Sem título"}
                                        </Link>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Eye className="size-3" />
                                                {formatViews(video.viewCount)}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Heart className="size-3" />
                                                {video.likesCount}
                                            </span>
                                            {video.createdAt && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {timeAgo(video.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deleteVideo(video.id)}
                                        disabled={deleting === video.id}
                                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                        title="Excluir vídeo"
                                    >
                                        {deleting === video.id ? (
                                            <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                                        ) : (
                                            <Trash2 className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}