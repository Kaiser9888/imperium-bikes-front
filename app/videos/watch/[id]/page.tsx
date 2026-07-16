"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import MuxPlayer from "@mux/mux-player-react";

const API_URL = "https://imperium-bikes.onrender.com";

interface VideoData {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    viewCount: number;
    durationSeconds: number;
    formattedDuration: string;
    createdAt: string;
    userName: string;
    userAvatarUrl: string;
}

export default function WatchPage() {
    const { id } = useParams();
    const { getToken } = useAuth();
    const [video, setVideo] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_URL}/api/videos/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();
                setVideo(data);
            } catch (error) {
                console.error("Erro ao carregar video:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [id, getToken]);

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return String(views);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground text-lg">Video nao encontrado</p>
            </div>
        );
    }

    const playbackId = video.videoUrl?.split("/").pop()?.replace(".m3u8", "") || "";

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Player + Info */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Mux Player */}
                        <div className="rounded-2xl overflow-hidden bg-black">
                            {playbackId ? (
                                <MuxPlayer
                                    playbackId={playbackId}
                                    metadata={{
                                        video_id: video.id,
                                        video_title: video.title,
                                    }}
                                    accentColor="#9e2b25"
                                    poster={video.thumbnailUrl}
                                    className="w-full aspect-video"
                                />
                            ) : (
                                <div className="aspect-video flex items-center justify-center text-muted-foreground bg-secondary">
                                    Processando video...
                                </div>
                            )}
                        </div>

                        {/* Titulo */}
                        <h1 className="text-xl font-bold text-foreground">{video.title}</h1>

                        {/* Autor + Stats */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {video.userAvatarUrl && (
                                    <img
                                        src={video.userAvatarUrl}
                                        alt={video.userName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                )}
                                <div>
                                    <p className="font-medium text-foreground">{video.userName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatViews(video.viewCount)} visualizacoes &middot; {video.formattedDuration}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botao Ver Mais */}
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl hover:bg-secondary transition-colors"
                        >
                            <span className="text-sm font-medium text-foreground">Ver mais</span>
                            <svg
                                width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2"
                                className={`transition-transform ${showMore ? "rotate-180" : ""}`}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {/* Descricao + Hashtags (escondido) */}
                        {showMore && video.description && (
                            <div className="p-4 bg-card border border-border rounded-xl space-y-3">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {video.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <h2 className="text-lg font-semibold text-foreground mb-4">
                            Videos Relacionados
                        </h2>
                        <p className="text-sm text-muted-foreground">Em breve...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}