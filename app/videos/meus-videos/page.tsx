"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Trash2, Eye, Heart, Clock, Plus, Film, BarChart3, Copy } from "lucide-react";

const API_URL = "https://imperium-bikes.onrender.com";

interface MyVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  formattedDuration: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  status: string;
  createdAt: string;
}

export default function MeusVideosPage() {
  const { getToken } = useAuth();
  const [videos, setVideos] = useState<MyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    fetchMyVideos();
  }, [fetchMyVideos]);

  const deleteVideo = async (videoId: string) => {
    if (!confirm("Tem certeza que deseja excluir este vídeo permanentemente?")) return;
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

  const copyLink = async (videoId: string) => {
    const url = `${window.location.origin}/videos/watch/${videoId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(videoId);
    setTimeout(() => setCopiedId(null), 2000);
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

  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likesCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">

        {/* CABEÇALHO */}
        <div className="mb-8">
          <h1
            className="text-3xl tracking-wide"
            style={{ fontFamily: 'var(--font-caesar)', color: '#212529' }}
          >
            Central de Vídeos
          </h1>
          <p className="mt-1 text-start text-muted-foreground">
            Gerencie todos os seus vídeos em um só lugar
          </p>
        </div>

        {/* CARDS DE ESTATÍSTICAS */}
        {!loading && videos.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <Film className="h-5 w-5 text-primary" />
              <p className="mt-2 text-2xl font-bold">{videos.length}</p>
              <p className="text-xs text-muted-foreground">Vídeos</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Eye className="h-5 w-5 text-blue-500" />
              <p className="mt-2 text-2xl font-bold">{formatViews(totalViews)}</p>
              <p className="text-xs text-muted-foreground">Visualizações</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Heart className="h-5 w-5 text-red-500" />
              <p className="mt-2 text-2xl font-bold">{formatViews(totalLikes)}</p>
              <p className="text-xs text-muted-foreground">Curtidas</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <BarChart3 className="h-5 w-5 text-green-500" />
              <p className="mt-2 text-2xl font-bold">
                {videos.length > 0 ? Math.round(totalViews / videos.length) : 0}
              </p>
              <p className="text-xs text-muted-foreground">Média de views</p>
            </div>
          </div>
        )}

        {/* BOTÃO NOVO VÍDEO */}
        {videos.length > 0 && (
          <div className="mb-6">
            <Link
              href="/videos/upload"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Novo vídeo
            </Link>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
                <div className="flex gap-4">
                  <div className="h-24 w-40 rounded-lg bg-secondary" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-secondary" />
                    <div className="h-4 w-1/2 rounded bg-secondary" />
                    <div className="h-3 w-1/3 rounded bg-secondary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          /* VAZIO */
          <div className="rounded-xl border border-border bg-card px-8 py-20 text-center">
            <Film className="mx-auto size-12 text-muted-foreground/40" />
            <h2
              className="mt-4 text-xl"
              style={{ fontFamily: 'var(--font-caesar)' }}
            >
              Nenhum vídeo publicado
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Comece a criar conteúdo agora mesmo
            </p>
            <Link
              href="/videos/upload"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              Publicar primeiro vídeo
            </Link>
          </div>
        ) : (
          /* LISTA DE VÍDEOS */
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                  {/* Thumbnail */}
                  <Link
                    href={`/videos/watch/${video.id}`}
                    className="relative h-24 w-full flex-shrink-0 overflow-hidden rounded-lg bg-secondary sm:w-44"
                  >
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <Film className="size-6" />
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
                                            {video.formattedDuration || "00:00"}
                                        </span>
                  </Link>

                  {/* Informações */}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/videos/watch/${video.id}`}
                      className="text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary line-clamp-1"
                    >
                      {video.title || "Sem título"}
                    </Link>

                    {video.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {video.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Eye className="size-3.5" />
                                              {formatViews(video.viewCount)} views
                                            </span>
                      <span className="inline-flex items-center gap-1.5">
                                                <Heart className="size-3.5" />
                        {video.likesCount} curtidas
                                            </span>
                      {video.commentsCount !== undefined && (
                        <span className="inline-flex items-center gap-1.5">
                                                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                    </svg>
                          {video.commentsCount} comentários
                                                </span>
                      )}
                      {video.createdAt && (
                        <span className="inline-flex items-center gap-1.5">
                                                    <Clock className="size-3.5" />
                          {timeAgo(video.createdAt)}
                                                </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 sm:flex-col">
                    <button
                      onClick={() => copyLink(video.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      title="Copiar link"
                    >
                      {copiedId === video.id ? (
                        <span className="text-xs font-medium text-green-500">✓</span>
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      disabled={deleting === video.id}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}