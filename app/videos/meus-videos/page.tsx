"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

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

    useEffect(() => {
        let cancelled = false;

        const fetchMyVideos = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_URL}/api/videos/user/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!cancelled) {
                    setVideos(data.content || []);
                    setLoading(false);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Erro:", error);
                    setLoading(false);
                }
            }
        };

        fetchMyVideos();

        return () => {
            cancelled = true;
        };
    }, [getToken]);

    const deleteVideo = async (videoId: string) => {
        if (!confirm("Tem certeza que deseja excluir este video?")) return;
        try {
            const token = await getToken();
            await fetch(`${API_URL}/api/videos/${videoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setVideos((prev) => prev.filter((v) => v.id !== videoId));
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return String(views);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-6">
                <h1 className="font-blackletter text-3xl text-primary mb-6">Meus Videos</h1>
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="font-blackletter text-3xl text-primary mb-6">Meus Videos</h1>

            {videos.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">Voce ainda nao publicou nenhum video</p>
                    <Link
                        href="/videos/upload"
                        className="inline-block mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-medium"
                    >
                        Publicar video
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {videos.map((video) => (
                        <div key={video.id} className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl">
                            <Link href={`/videos/watch/${video.id}`} className="relative w-40 aspect-video rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                                {video.thumbnailUrl ? (
                                    <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sem capa</div>
                                )}
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[0.6rem] px-1 rounded">
                  {video.formattedDuration || "00:00"}
                </span>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link href={`/videos/watch/${video.id}`} className="font-medium text-sm line-clamp-1 hover:text-primary">
                                    {video.title || "Sem titulo"}
                                </Link>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatViews(video.viewCount)} views &middot; {video.likesCount} likes &middot; {video.status}
                                </p>
                            </div>
                            <button
                                onClick={() => deleteVideo(video.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors p-2"
                                title="Excluir video"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}