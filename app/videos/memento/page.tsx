"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { VideoComments } from "@/components/videos/VideoComments";

const API_URL = "https://imperium-bikes.onrender.com";

interface MementoItem {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    durationSeconds: number;
    viewCount: number;
    likesCount: number;
    commentsCount: number;
    userName: string;
    userAvatarUrl: string;
    userId: string;
}

export default function MementoPage() {
    const { getToken, userId: currentUserId } = useAuth();
    const [momentos, setMomentos] = useState<MementoItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState<Record<string, boolean>>({});
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
    const [showComments, setShowComments] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [shareFeedback, setShareFeedback] = useState<string | null>(null);
    const touchStartY = useRef(0);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    useEffect(() => {
        let cancelled = false;
        const fetchMomentos = async () => {
            try {
                const res = await fetch(`${API_URL}/api/videos?page=0&size=20&isShort=true`);
                const data = await res.json();
                if (!cancelled) {
                    const items = data.content || [];
                    setMomentos(items);
                    const counts: Record<string, number> = {};
                    items.forEach((v: MementoItem) => {
                        counts[v.id] = v.likesCount;
                    });
                    setLikeCounts(counts);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) setLoading(false);
            }
        };
        fetchMomentos();
        return () => { cancelled = true; };
    }, []);

    const feed = searchQuery.trim()
      ? momentos.filter((v) => {
          const q = searchQuery.trim().toLowerCase();
          return (
            v.title?.toLowerCase().includes(q) ||
            v.userName?.toLowerCase().includes(q) ||
            v.description?.toLowerCase().includes(q)
          );
      })
      : momentos;

    useEffect(() => {
        setCurrentIndex(0);
    }, [searchQuery]);

    useEffect(() => {
        const current = feed[currentIndex];
        if (!current) return;
        const cv = videoRefs.current.get(current.id);
        if (cv) {
            cv.currentTime = 0;
            cv.play().catch(() => {});
            videoRefs.current.forEach((v, id) => {
                if (id !== current.id) v.pause();
            });
        }
    }, [currentIndex, feed]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (showComments) return;
            if (e.key === "ArrowDown" && currentIndex < feed.length - 1) {
                e.preventDefault();
                setCurrentIndex((p) => p + 1);
            } else if (e.key === "ArrowUp" && currentIndex > 0) {
                e.preventDefault();
                setCurrentIndex((p) => p - 1);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [currentIndex, feed.length, showComments]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleWheel = (e: React.WheelEvent) => {
        if (showComments) return;
        if (e.deltaY > 30 && currentIndex < feed.length - 1) setCurrentIndex((p) => p + 1);
        else if (e.deltaY < -30 && currentIndex > 0) setCurrentIndex((p) => p - 1);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (showComments) return;
        touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (showComments) return;
        const diff = touchStartY.current - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < feed.length - 1) setCurrentIndex((p) => p + 1);
            else if (diff < 0 && currentIndex > 0) setCurrentIndex((p) => p - 1);
        }
    };

    const togglePlayPause = (videoId: string) => {
        const v = videoRefs.current.get(videoId);
        if (!v) return;
        v.paused ? v.play().catch(() => {}) : v.pause();
    };

    const toggleLike = async (videoId: string) => {
        if (!currentUserId) return;
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/videos/${videoId}/like`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setLiked((p) => ({ ...p, [videoId]: data.liked }));
                setLikeCounts((p) => ({ ...p, [videoId]: data.count }));
            }
        } catch {
            /* silencioso */
        }
    };

    const handleShare = async (video: MementoItem) => {
        const url =
          typeof window !== "undefined"
            ? `${window.location.origin}/videos/memento?v=${video.id}`
            : "";
        try {
            if (typeof navigator !== "undefined" && navigator.share) {
                await navigator.share({ title: video.title, text: video.description, url });
                return;
            }
            if (typeof navigator !== "undefined" && navigator.clipboard) {
                await navigator.clipboard.writeText(url);
                setShareFeedback(video.id);
                setTimeout(() => setShareFeedback(null), 2000);
            }
        } catch {
            /* usuário cancelou */
        }
    };

    const formatViews = (v: number) => {
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
        if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
        return String(v);
    };

    if (loading) {
        return (
          <div className="flex h-screen items-center justify-center bg-background">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        );
    }

    return (
      <div className="fixed inset-0 flex flex-col bg-background">
          {/* Barra superior */}
          <div className="z-30 flex shrink-0 items-center gap-2.5 border-b border-primary/15 bg-background/95 px-4 py-3 backdrop-blur-sm">
              <Link
                href="/videos"
                className="font-blackletter shrink-0 text-lg tracking-wide text-primary"
              >
                  Imperium
              </Link>

              <div className="relative flex-1">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary/70"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                      <circle cx="11" cy="11" r="7" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar no império..."
                    className="w-full rounded-full border border-primary/25 bg-secondary py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/60"
                  />
              </div>

              <Link
                href="/videos/memento/upload"
                className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-medium tracking-wide text-primary-foreground hover:bg-primary/90"
              >
                  + Publicar
              </Link>
          </div>

          {/* Área de vídeos */}
          <div className="relative flex-1 overflow-hidden">
              {momentos.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4">
                    <div className="text-center">
                        <p className="text-lg text-muted-foreground">Nenhum Memento ainda</p>
                        <Link
                          href="/videos/memento/upload"
                          className="mt-4 inline-block rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Publicar Memento
                        </Link>
                    </div>
                </div>
              ) : feed.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4">
                    <div className="text-center">
                        <p className="text-lg text-muted-foreground">
                            Nenhum Memento encontrado para &ldquo;{searchQuery}&rdquo;
                        </p>
                        <button
                          onClick={() => setSearchQuery("")}
                          className="mt-4 rounded-full border border-primary/40 px-5 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                        >
                            Limpar busca
                        </button>
                    </div>
                </div>
              ) : (
                <div
                  className="relative h-full overflow-hidden"
                  onWheel={handleWheel}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                    {feed.map((video, index) => (
                      <div
                        key={video.id}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                            transform: `translateY(${(index - currentIndex) * 100}%)`,
                            transition: "transform 0.3s ease-out",
                        }}
                      >
                          <div className="relative mx-auto h-full w-full max-w-[420px] px-2 py-4">
                              <video
                                ref={(el) => {
                                    if (el) videoRefs.current.set(video.id, el);
                                    else videoRefs.current.delete(video.id);
                                }}
                                src={video.videoUrl}
                                poster={video.thumbnailUrl}
                                className="h-full w-full rounded-2xl border border-primary/15 object-cover"
                                loop
                                playsInline
                                muted={false}
                                onClick={() => togglePlayPause(video.id)}
                              />

                              {/* Gradiente inferior */}
                              <div className="pointer-events-none absolute inset-x-2 bottom-4 top-1/2 rounded-b-2xl bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                              {/* Overlay inferior */}
                              <div className="absolute bottom-6 left-0 right-0 px-4">
                                  <div className="flex items-end justify-between">
                                      <div className="mr-3 min-w-0 flex-1">
                                          <div className="mb-3 flex items-center gap-3">
                                              <img
                                                src={video.userAvatarUrl || ""}
                                                alt=""
                                                className="h-10 w-10 rounded-full border-2 border-primary/50 bg-secondary"
                                              />
                                              <div className="min-w-0">
                                                  <p className="text-sm font-semibold text-white">
                                                      @{video.userName}
                                                  </p>
                                                  {video.description && (
                                                    <p className="mt-0.5 line-clamp-1 text-xs text-white/80">
                                                        {video.description}
                                                    </p>
                                                  )}
                                              </div>
                                          </div>
                                          <h2 className="mb-1 line-clamp-2 text-sm font-bold text-white">
                                              {video.title}
                                          </h2>
                                          <div className="flex items-center gap-2 text-xs text-white/60">
                                              <span>{formatViews(video.viewCount)} views</span>
                                              <span>&middot;</span>
                                              <span>
                            {likeCounts[video.id] ?? video.likesCount} likes
                          </span>
                                          </div>
                                      </div>

                                      {/* Ações */}
                                      <div className="flex flex-col items-center gap-4">
                                          {/* Like (coração) */}
                                          <button
                                            onClick={() => toggleLike(video.id)}
                                            className="flex flex-col items-center gap-1"
                                          >
                                              <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur transition-all duration-300 ${
                                                  liked[video.id]
                                                    ? "border-red-500 bg-red-500/20 shadow-lg shadow-red-500/30"
                                                    : "border-white/20 bg-black/30 hover:border-red-400"
                                                }`}
                                              >
                                                  <svg
                                                    width="22"
                                                    height="22"
                                                    viewBox="0 0 24 24"
                                                    fill={liked[video.id] ? "#ef4444" : "none"}
                                                    stroke={liked[video.id] ? "#ef4444" : "white"}
                                                    strokeWidth="2"
                                                  >
                                                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                  </svg>
                                              </div>
                                              <span className="text-xs font-medium text-white">
                            {likeCounts[video.id] ?? video.likesCount}
                          </span>
                                          </button>

                                          {/* Comentários (balão) */}
                                          <button
                                            onClick={() => setShowComments(true)}
                                            className="flex flex-col items-center gap-1"
                                          >
                                              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur transition-colors hover:border-primary/40">
                                                  <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="white"
                                                    strokeWidth="1.6"
                                                  >
                                                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                  </svg>
                                              </div>
                                              <span className="text-xs font-medium text-white">
                            {video.commentsCount}
                          </span>
                                          </button>

                                          {/* Compartilhar */}
                                          <button
                                            onClick={() => handleShare(video)}
                                            className="flex flex-col items-center gap-1"
                                          >
                                              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur transition-colors hover:border-primary/40">
                                                  <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="white"
                                                    strokeWidth="1.6"
                                                  >
                                                      <circle cx="18" cy="5" r="2.4" />
                                                      <circle cx="6" cy="12" r="2.4" />
                                                      <circle cx="18" cy="19" r="2.4" />
                                                      <line x1="8.2" y1="10.8" x2="15.8" y2="6.2" />
                                                      <line x1="8.2" y1="13.2" x2="15.8" y2="17.8" />
                                                  </svg>
                                              </div>
                                              <span className="text-xs font-medium text-white">
                            {shareFeedback === video.id ? "Copiado" : "Compartilhar"}
                          </span>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                    ))}

                    {/* Indicador de progresso */}
                    <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5">
                        {feed.map((_, i) => (
                          <div
                            key={i}
                            className={`h-6 w-0.5 rounded-full transition-all duration-300 ${
                              i === currentIndex
                                ? "bg-primary"
                                : i < currentIndex
                                  ? "bg-primary/40"
                                  : "bg-primary/15"
                            }`}
                          />
                        ))}
                    </div>
                </div>
              )}
          </div>

          {/* Modal de comentários */}
          {showComments && feed[currentIndex] && (
            <div
              className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowComments(false)}
            >
                <div
                  className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card px-4 pb-6 pt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Comentários</h2>
                        <button
                          onClick={() => setShowComments(false)}
                          className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
                        >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                    <VideoComments videoId={feed[currentIndex].id} />
                </div>
            </div>
          )}
      </div>
    );
}