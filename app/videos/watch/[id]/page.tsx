"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";

const API_URL = "https://imperium-bikes.onrender.com";

interface VideoData {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    viewCount: number;
    likesCount: number;
    formattedDuration: string;
    createdAt: string;
    userName: string;
    userAvatarUrl: string;
}

interface RelatedVideo {
    id: string;
    title: string;
    thumbnailUrl: string;
    formattedDuration: string;
    viewCount: number;
    userName: string;
    createdAt: string;
}

function timeAgo(date: string) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    return `${Math.floor(diffDays / 365)}a`;
}

function formatViews(views: number) {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return String(views);
}

export default function WatchPage() {
    const { id } = useParams();
    const { getToken, userId: currentUserId } = useAuth();
    const [video, setVideo] = useState<VideoData | null>(null);
    const [related, setRelated] = useState<RelatedVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const fetchVideo = async () => {
            try {
                const res = await fetch(`${API_URL}/api/videos/${id}`);
                const data = await res.json();
                if (!cancelled) {
                    setVideo(data);
                    setLikesCount(data.likesCount || 0);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) setLoading(false);
            }
        };

        const fetchRelated = async () => {
            try {
                const res = await fetch(`${API_URL}/api/videos?page=0&size=6`);
                const data = await res.json();
                if (!cancelled) {
                    setRelated((data.content || []).filter((v: RelatedVideo) => v.id !== id));
                }
            } catch { /* silencioso */ }
        };

        fetchVideo();
        fetchRelated();

        return () => { cancelled = true; };
    }, [id]);

    useEffect(() => {
        if (!currentUserId || !id) return;
        let cancelled = false;

        const checkLiked = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_URL}/api/videos/${id}/liked`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!cancelled) setLiked(data.liked);
            } catch { /* silencioso */ }
        };

        checkLiked();

        return () => { cancelled = true; };
    }, [id, currentUserId, getToken]);

    const toggleLike = async () => {
        if (!currentUserId) return;
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/videos/${id}/like`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setLiked(data.liked);
            setLikesCount(data.count);
        } catch (error) {
            console.error("Erro ao curtir:", error);
        }
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
                <p className="text-muted-foreground">Video nao encontrado</p>
            </div>
        );
    }

    const playbackId = video.videoUrl?.split("/").pop()?.replace(".m3u8", "") || "";

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-2xl overflow-hidden bg-black">
                            {playbackId ? (
                                <MuxPlayer
                                    playbackId={playbackId}
                                    metadata={{ video_id: video.id, video_title: video.title }}
                                    accentColor="#9e2b25"
                                    poster={video.thumbnailUrl}
                                    className="w-full aspect-video"
                                />
                            ) : (
                                <div className="aspect-video flex items-center justify-center text-muted-foreground bg-secondary">Processando...</div>
                            )}
                        </div>

                        <h1 className="text-xl font-bold text-foreground">{video.title}</h1>

                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                {video.userAvatarUrl && <img src={video.userAvatarUrl} alt="" className="w-10 h-10 rounded-full" />}
                                <div>
                                    <p className="font-medium text-foreground">{video.userName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatViews(video.viewCount)} visualizacoes &middot; {timeAgo(video.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleLike}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    liked ? "bg-red-50 text-red-600 border border-red-200" : "bg-card border border-border text-muted-foreground hover:text-red-500"
                                }`}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                                {likesCount}
                            </button>
                        </div>

                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl hover:bg-secondary transition-colors"
                        >
                            <span className="text-sm font-medium">Ver mais</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                 className={`transition-transform ${showMore ? "rotate-180" : ""}`}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {showMore && video.description && (
                            <div className="p-4 bg-card border border-border rounded-xl">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{video.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">Videos Relacionados</h2>
                        {related.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum video encontrado</p>
                        ) : (
                            related.map((v) => (
                                <Link key={v.id} href={`/videos/watch/${v.id}`} className="flex gap-3 group">
                                    <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                                        {v.thumbnailUrl ? (
                                            <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sem capa</div>
                                        )}
                                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[0.6rem] px-1 rounded">
                      {v.formattedDuration || "00:00"}
                    </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{v.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">{v.userName}</p>
                                        <p className="text-xs text-muted-foreground">{formatViews(v.viewCount)} views &middot; {timeAgo(v.createdAt)}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}