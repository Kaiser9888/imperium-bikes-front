"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, MessageSquare, Share2, Play } from "lucide-react";
import type { VideoItem } from "@/lib/videos/types";
import { formatViews } from "@/lib/videos/format";
import { VideoAvatar } from "./VideoAvatar";

interface MementoFeedProps {
  videos: VideoItem[];
  onEndReached?: () => void;
}

export function MementoFeed({ videos, onEndReached }: MementoFeedProps) {
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !onEndReached) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onEndReached();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [onEndReached]);

  return (
    <div className="h-[calc(100dvh-3.5rem)] snap-y snap-mandatory overflow-y-auto lg:h-[calc(100dvh-4rem)]">
      {videos.map((video) => (
        <MementoSlide key={video.id} video={video} />
      ))}
      <div ref={sentinel} className="h-1" />
    </div>
  );
}

function MementoSlide({ video }: { video: VideoItem }) {
  const [liked, setLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackId = video.videoUrl?.split("/").pop()?.replace(".m3u8", "") ?? "";
  const streamUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : "";

  // ===== DEBUG =====
  console.log("🎥 playbackId:", playbackId);
  console.log("🎥 videoUrl completo:", video.videoUrl);
  console.log("🎥 streamUrl:", streamUrl);

  // Autoplay forçado
  useEffect(() => {
    if (videoRef.current && streamUrl) {
      videoRef.current.play().catch((err) => {
        console.log("❌ Erro ao dar play:", err.message);
        setTimeout(() => {
          videoRef.current?.play().catch((err2) => {
            console.log("❌ Erro 2ª tentativa:", err2.message);
          });
        }, 500);
      });
    }
  }, [streamUrl]);

  return (
    <section className="flex h-full snap-start items-center justify-center px-0 py-0 lg:px-6 lg:py-6">
      <div className="relative h-full w-full overflow-hidden bg-secondary lg:h-full lg:w-auto lg:aspect-[9/16] lg:rounded-xl lg:border lg:border-border">

        {/* ===== PLAYER DE VÍDEO ===== */}
        {streamUrl ? (
          <video
            ref={videoRef}
            src={streamUrl}
            poster={video.thumbnailUrl}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="h-full w-full object-cover"
          />
        ) : video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Play className="size-10 text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        {/* Gradiente */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-5 pb-24 lg:pb-6">
          <div className="flex items-center gap-2">
            <VideoAvatar name={video.userName} url={video.userAvatarUrl} className="size-8" />
            <span className="text-sm font-medium text-foreground">{video.userName}</span>
          </div>
          <p className="mt-2 line-clamp-2 max-w-lg text-sm text-muted-foreground">
            {video.description ?? video.title}
          </p>
        </div>

        {/* Ações */}
        <div className="absolute bottom-28 right-4 flex flex-col items-center gap-4 lg:bottom-8">
          <FloatingAction
            label="Curtir"
            active={liked}
            onClick={() => setLiked((v) => !v)}
            icon={<Heart className={`size-5 ${liked ? "fill-primary text-primary" : ""}`} />}
            value={formatViews((video.likesCount ?? 0) + (liked ? 1 : 0))}
          />
          <FloatingAction label="Comentar" icon={<MessageSquare className="size-5" />} value="" />
          <FloatingAction label="Compartilhar" icon={<Share2 className="size-5" />} value="" />
        </div>
      </div>
    </section>
  );
}

function FloatingAction({
                          icon,
                          label,
                          value,
                          active,
                          onClick,
                        }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="flex flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
            <span className="flex size-11 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur-sm">
                {icon}
            </span>
      {value && <span className="tabular-nums">{value}</span>}
    </button>
  );
}