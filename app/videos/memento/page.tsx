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
                    items.forEach((v: MementoItem) => { counts[v.id] = v.likesCount; });
                    setLikeCounts(counts);
                    setLoading(false);
                }
            } catch { if (!cancelled) setLoading(false); }
        };
        fetchMomentos();
        return () => { cancelled = true; };
    }, []);

    // Feed exibido: aplica o filtro de busca sobre a lista carregada
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
            videoRefs.current.forEach((v, id) => { if (id !== current.id) v.pause(); });
        }
    }, [currentIndex, feed]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (showComments) return;
            if (e.key === "ArrowDown" && currentIndex < feed.length - 1) {
                e.preventDefault(); setCurrentIndex((p) => p + 1);
            } else if (e.key === "ArrowUp" && currentIndex > 0) {
                e.preventDefault(); setCurrentIndex((p) => p - 1);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [currentIndex, feed.length, showComments]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
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
                method: "POST", headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setLiked((p) => ({ ...p, [videoId]: data.liked }));
                setLikeCounts((p) => ({ ...p, [videoId]: data.count }));
            }
        } catch { /* silencioso */ }
    };

    const handleShare = async (video: MementoItem) => {
        const url = typeof window !== "undefined"
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
        } catch { /* usuário cancelou o compartilhamento */ }
    };

    const formatViews = (v: number) => {
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
        if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
        return String(v);
    };

    if (loading) {
        return (
          <div className="flex h-screen items-center justify-center bg-[#0F0C09]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A227]/25 border-t-[#C9A227]" />
          </div>
        );
    }

    return (
      <div className="fixed inset-0 bg-[#0F0C09]">
          <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
                .font-imperial-display { font-family: 'Cinzel', serif; }
                .font-imperial-body { font-family: 'EB Garamond', serif; }
            `}</style>

          {/* Barra superior fixa: logo + busca + publicar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent px-4 pb-6 pt-4">
              <div className="pointer-events-auto mx-auto flex max-w-[420px] items-center gap-2.5">
                  <Link
                    href="/videos"
                    className="font-blackletter shrink-0 text-lg tracking-wide text-[#C9A227] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                  >
                      Imperium
                  </Link>

                  <div className="relative flex-1">
                      <svg
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#C9A227" strokeWidth="2"
                      >
                          <circle cx="11" cy="11" r="7" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar no império..."
                        className="font-imperial-body w-full rounded-full border border-[#C9A227]/30 bg-black/50 py-2 pl-8 pr-3 text-sm text-[#EDE3CF] placeholder:text-[#8A7A5C] backdrop-blur-sm outline-none transition-colors focus:border-[#C9A227]/70"
                      />
                  </div>

                  <Link
                    href="/videos/memento/upload"
                    className="font-imperial-display shrink-0 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 px-3 py-1.5 text-[11px] tracking-wider text-[#C9A227] backdrop-blur-sm transition-colors hover:bg-[#C9A227]/20"
                  >
                      + PUBLICAR
                  </Link>
              </div>
          </div>

          {momentos.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4">
                <div className="text-center">
                    <p className="font-imperial-display text-sm tracking-[0.2em] text-[#8A7A5C]">A ARENA ESTÁ VAZIA</p>
                    <p className="font-imperial-body mt-2 text-lg text-[#EDE3CF]">Nenhum Memento publicado ainda</p>
                    <Link
                      href="/videos/memento/upload"
                      className="font-imperial-display mt-5 inline-block rounded-full bg-[#C9A227] px-6 py-2 text-xs tracking-wider text-[#0F0C09] hover:bg-[#E0B93C]"
                    >
                        PUBLICAR MEMENTO
                    </Link>
                </div>
            </div>
          ) : feed.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4">
                <div className="text-center">
                    <p className="font-imperial-body text-lg text-[#EDE3CF]">Nenhum Memento encontrado para &ldquo;{searchQuery}&rdquo;</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="font-imperial-display mt-4 rounded-full border border-[#C9A227]/40 px-5 py-2 text-xs tracking-wider text-[#C9A227] hover:bg-[#C9A227]/10"
                    >
                        LIMPAR BUSCA
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
                            className="h-full w-full rounded-2xl border border-[#C9A227]/20 object-cover"
                            loop
                            playsInline
                            muted={false}
                            onClick={() => togglePlayPause(video.id)}
                          />

                          {/* Véu para legibilidade do texto inferior */}
                          <div className="pointer-events-none absolute inset-x-2 bottom-4 top-1/2 rounded-b-2xl bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                          {/* Overlay inferior */}
                          <div className="absolute bottom-6 left-0 right-0 px-4">
                              <div className="flex items-end justify-between">
                                  <div className="mr-3 min-w-0 flex-1">
                                      <div className="mb-3 flex items-center gap-3">
                                          <img
                                            src={video.userAvatarUrl || ""}
                                            alt=""
                                            className="h-10 w-10 rounded-full border-2 border-[#C9A227]/50 bg-[#1A140D]"
                                          />
                                          <div className="min-w-0">
                                              <p className="font-imperial-display text-sm tracking-wide text-[#EDE3CF]">@{video.userName}</p>
                                              {video.description && (
                                                <p className="font-imperial-body mt-0.5 line-clamp-1 text-xs italic text-[#C9BBA0]">{video.description}</p>
                                              )}
                                          </div>
                                      </div>
                                      <h2 className="font-imperial-body mb-1 line-clamp-2 text-sm font-semibold text-[#EDE3CF]">{video.title}</h2>
                                      <div className="flex items-center gap-2 text-xs text-[#8A7A5C]">
                                          <span>{formatViews(video.viewCount)} visualizações</span>
                                          <span>&middot;</span>
                                          <span>{likeCounts[video.id] ?? video.likesCount} curtidas</span>
                                      </div>
                                  </div>

                                  {/* Trilho de ações: curtir, comentar, compartilhar */}
                                  <div className="flex flex-col items-center gap-4">
                                      <button onClick={() => toggleLike(video.id)} className="flex flex-col items-center gap-1">
                                          <div
                                            className={`flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur transition-all duration-300 ${
                                              liked[video.id]
                                                ? "border-[#C9A227]/60 bg-[#C9A227]/15 shadow-[0_0_14px_rgba(201,162,39,0.35)]"
                                                : "border-white/10 bg-black/30 hover:border-[#C9A227]/30"
                                            }`}
                                          >
                                              {/* Polegar do veredito — pollice verso: para cima ao curtir */}
                                              <svg
                                                width="20" height="20" viewBox="0 0 24 24"
                                                className={`transition-transform duration-300 ${liked[video.id] ? "rotate-0" : "rotate-180"}`}
                                                fill={liked[video.id] ? "#C9A227" : "none"}
                                                stroke={liked[video.id] ? "#C9A227" : "#EDE3CF"}
                                                strokeWidth="1.7"
                                              >
                                                  <path d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm3.6-7.4L9 11v9h8.6a2 2 0 0 0 1.98-1.7l1.2-8A2 2 0 0 0 18.8 8H14l.9-4.3a1.5 1.5 0 0 0-2.8-1.1z" />
                                              </svg>
                                          </div>
                                          <span className="font-imperial-body text-xs font-medium text-[#EDE3CF]">{likeCounts[video.id] ?? video.likesCount}</span>
                                      </button>

                                      <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
                                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30 backdrop-blur transition-colors hover:border-[#C9A227]/30">
                                              {/* Pergaminho — os comentários como um rolo a ser desenrolado */}
                                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EDE3CF" strokeWidth="1.6">
                                                  <path d="M7 4.5h10a2 2 0 0 1 2 2v12.5a1 1 0 0 1-1.53.85L15 18.2l-2.47 1.65a1 1 0 0 1-1.06 0L9 18.2l-2.47 1.65A1 1 0 0 1 5 19V6.5a2 2 0 0 1 2-2z" />
                                                  <ellipse cx="7" cy="4.5" rx="2" ry="1.4" />
                                              </svg>
                                          </div>
                                          <span className="font-imperial-body text-xs font-medium text-[#EDE3CF]">{video.commentsCount}</span>
                                      </button>

                                      <button onClick={() => handleShare(video)} className="flex flex-col items-center gap-1">
                                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30 backdrop-blur transition-colors hover:border-[#C9A227]/30">
                                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EDE3CF" strokeWidth="1.6">
                                                  <circle cx="18" cy="5" r="2.4" />
                                                  <circle cx="6" cy="12" r="2.4" />
                                                  <circle cx="18" cy="19" r="2.4" />
                                                  <line x1="8.2" y1="10.8" x2="15.8" y2="6.2" />
                                                  <line x1="8.2" y1="13.2" x2="15.8" y2="17.8" />
                                              </svg>
                                          </div>
                                          <span className="font-imperial-body text-xs font-medium text-[#EDE3CF]">
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
                          i === currentIndex ? "bg-[#C9A227]" : i < currentIndex ? "bg-[#C9A227]/40" : "bg-[#C9A227]/15"
                        }`}
                      />
                    ))}
                </div>
            </div>
          )}

          {/* Modal de comentários */}
          {showComments && feed[currentIndex] && (
            <div
              className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setShowComments(false)}
            >
                <div
                  className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-t border-[#C9A227]/20 bg-[#15110C] px-4 pb-6 pt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-imperial-display text-sm tracking-[0.15em] text-[#C9A227]">COMENTÁRIOS</h2>
                        <button
                          onClick={() => setShowComments(false)}
                          className="rounded-full p-2 text-[#8A7A5C] hover:bg-[#C9A227]/10 hover:text-[#EDE3CF]"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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