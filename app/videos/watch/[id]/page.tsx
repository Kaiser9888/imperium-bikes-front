"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const API_URL = "https://imperium-bikes.onrender.com";

interface VideoData {
    id: string;
    title: string;
    description: string;
    playbackUrl: string;
    thumbnailUrl: string;
    viewCount: number;
    durationSeconds: number;
    createdAt: string;
    user: {
        id: string;
        fullName: string;
        avatarUrl: string;
    };
}

export default function WatchPage() {
    const { id } = useParams();
    const { getToken } = useAuth();
    const [video, setVideo] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const token = await getToken();
                const res = await fetch(`${API_URL}/api/videos/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
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

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-white text-lg">Carregando...</div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-white text-lg">Video nao encontrado</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Player */}
                    <div className="lg:col-span-2">
                        <div className="aspect-video rounded-xl overflow-hidden bg-black">
                            {video.playbackUrl ? (
                                <video
                                    src={video.playbackUrl}
                                    controls
                                    className="w-full h-full"
                                    poster={video.thumbnailUrl}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-500">
                                    Processando video...
                                </div>
                            )}
                        </div>

                        <h1 className="text-xl font-bold mt-4">{video.title}</h1>

                        <div className="flex items-center gap-4 mt-3">
                            {video.user?.avatarUrl && (
                                <img
                                    src={video.user.avatarUrl}
                                    alt={video.user.fullName}
                                    className="w-10 h-10 rounded-full"
                                />
                            )}
                            <div>
                                <p className="font-medium">{video.user?.fullName}</p>
                                <p className="text-sm text-neutral-400">
                                    {video.viewCount} visualizacoes
                                </p>
                            </div>
                        </div>

                        {video.description && (
                            <div className="mt-4 p-4 bg-neutral-900 rounded-lg">
                                <p className="text-sm text-neutral-300">{video.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <h2 className="text-lg font-semibold mb-4">Videos Relacionados</h2>
                        <p className="text-neutral-500 text-sm">
                            Em breve...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}