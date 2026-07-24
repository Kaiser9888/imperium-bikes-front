"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";
import { VideoComments } from "@/components/video/VideoComments";
import { Heart, ChevronDown } from "lucide-react";

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
    if (!date) return "";
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
                if (!cancelled) { setVideo(data); setLikesCount(data.likesCount || 0); setLoading(false); }
            } catch { if (!cancelled) setLoading(false); }
        };
        const fetchRelated = async () => {
            try {
                const res = await fetch(`${API_URL}/api/videos?page=0&size=6`);
                const data = await res.json();
                if (!cancelled) setRelated((data.content || []).filter((v: RelatedVideo) => v.id !== id));
            } catch { /* silencioso */ }
        };
        fetchVideo(); fetchRelated();
        return () => { cancelled = true; };
    }, [id]);

    useEffect(() => {
        if (!currentUserId || !id) return;
        let cancelled = false;
        const checkLiked = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_URL}/api/videos/${id}/liked`, { headers: { Authorization: `Bearer ${token}` } });
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
            const res = await fetch(`${API_URL}/api/videos/${id}/like`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setLiked(data.liked); setLikesCount(data.count);
        } catch (error) { console.error("Erro ao curtir:", error); }
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
                <p className="text-muted-foreground">Vídeo não encontrado</p>
            </div>
        );
    }

    const playbackId = video.videoUrl?.split("/").pop()?.replace(".m3u8", "") || "";

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Coluna principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Player */}
                        <div className="overflow-hidden rounded-2xl bg-black shadow-lg">
                            {playbackId ? (
                                <MuxPlayer
                                    playbackId={playbackId}
                                    metadata={{ video_id: video.id, video_title: video.title }}
                                    accentColor="#9e2b25"
                                    poster={video.thumbnailUrl}
                                    className="w-full aspect-video"
                                />
                            ) : (
                                <div className="aspect-video flex items-center justify-center bg-secondary text-muted-foreground">
                                    Processando vídeo...
                                </div>
                            )}
                        </div>

                        {/* Título */}
                        <h1 className="text-xl font-bold text-foreground">{video.title}</h1>

                        {/* Autor + Like */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                {video.userAvatarUrl && (
                                    <img src={video.userAvatarUrl} alt="" className="h-10 w-10 rounded-full ring-2 ring-border/50" />
                                )}
                                <div>
                                    <p className="font-medium text-foreground">{video.userName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatViews(video.viewCount)} visualizações &middot; {timeAgo(video.createdAt)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={toggleLike}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    liked
                                        ? "bg-red-50 text-red-600 border border-red-200 shadow-sm"
                                        : "border border-border bg-card text-muted-foreground hover:border-red-300 hover:text-red-500"
                                }`}
                            >
                                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                                <span>{likesCount}</span>
                            </button>
                        </div>

                        {/* Ver mais */}
                        <button
                            onClick={() => setShowMore(!showMore)}
                            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
                        >
                            <span>Ver mais</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
                        </button>

                        {showMore && video.description && (
                            <div className="rounded-xl border border-border bg-card p-4">
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{video.description}</p>
                            </div>
                        )}

                        {/* Comentários */}
                        <div className="rounded-xl border border-border bg-card p-4">
                            <VideoComments videoId={video.id} />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Vídeos Relacionados</h2>
                            {related.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nenhum vídeo encontrado</p>
                            ) : (
                                <div className="space-y-3">
                                    {related.map((v) => (
                                        <Link key={v.id} href={`/videos/watch/${v.id}`} className="group flex gap-3">
                                            <div className="relative h-20 w-36 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                                                {v.thumbnailUrl ? (
                                                    <img src={v.thumbnailUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Sem capa</div>
                                                )}
                                                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[0.6rem] text-white">
                          {v.formattedDuration || "00:00"}
                        </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary">{v.title}</h3>
                                                <p className="mt-1 text-xs text-muted-foreground">{v.userName}</p>
                                                <p className="text-xs text-muted-foreground">{formatViews(v.viewCount)} views &middot; {timeAgo(v.createdAt)}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}