"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, MessageSquare, Share2, Play } from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { VideoItem } from "@/lib/videos/types";
import { formatViews } from "@/lib/videos/format";
import { VideoAvatar } from "./VideoAvatar";

// NOTE: as custom properties do player (esconder controles, object-fit)
// vão via classe CSS "mux-player-cover" (ver comentário no fim do arquivo),
// e não via prop `style`, porque o tipo MuxCSSProperties do pacote é
// instável entre versões e quebra o build com facilidade.

interface MementoFeedProps {
  videos: VideoItem[];
  onEndReached?: () => void;
}

export function MementoFeed({ videos, onEndReached }: MementoFeedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(videos[0]?.id ?? null);

  // Paginação: dispara onEndReached quando o sentinel entra na tela
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !onEndReached) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onEndReached();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [onEndReached]);

  // Detecta qual slide está realmente visível -> só esse toca.
  // Evita N vídeos carregando/tocando ao mesmo tempo (causa do travamento).
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (mostVisible?.target instanceof HTMLElement) {
          setActiveId(mostVisible.target.dataset.videoId ?? null);
        }
      },
      { root, threshold: [0.6] }
    );

    const slides = root.querySelectorAll<HTMLElement>("[data-video-id]");
    slides.forEach((slide) => io.observe(slide));
    return () => io.disconnect();
  }, [videos]);

  return (
    <div
      ref={containerRef}
      className="h-[calc(100dvh-3.5rem)] snap-y snap-mandatory overflow-y-auto lg:h-[calc(100dvh-4rem)]"
    >
      {videos.map((video) => (
        <MementoSlide key={video.id} video={video} isActive={video.id === activeId} />
      ))}
      <div ref={sentinel} className="h-1" />
    </div>
  );
}

function MementoSlide({ video, isActive }: { video: VideoItem; isActive: boolean }) {
  const [liked, setLiked] = useState(video.liked ?? false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [debugMsg, setDebugMsg] = useState("aguardando...");
  const playerRef = useRef<MuxPlayerElement>(null);

  // Toca somente quando o slide vira o ativo; pausa os demais.
  // O play em si é feito pelo atributo nativo autoPlay="muted" do mux-player
  // (mais confiável que chamar .play() na mão — ele já trata as políticas
  // de autoplay do navegador internamente). Aqui só garantimos a pausa
  // dos slides que saíram de foco.
  useEffect(() => {
    const player = playerRef.current;
    if (!player || isActive) return;
    player.pause();
    setIsPlaying(false);
  }, [isActive]);

  // Sincroniza isPlaying com o estado real do player via eventos nativos,
  // em vez de depender só da promise do .play() (que pode não refletir
  // pausas/retomadas feitas pelo próprio navegador).
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setDebugMsg("play disparado ✅");
    };
    const handlePause = () => {
      setIsPlaying(false);
      setDebugMsg("pause disparado");
    };
    const handleWaiting = () => setDebugMsg("waiting (buffering)...");
    const handleStalled = () => setDebugMsg("stalled ⚠️");
    const handleCanPlay = () => setDebugMsg((prev) => (prev === "aguardando..." ? "canplay, mas sem play ainda" : prev));
    const handleError = () => {
      const err = (player as unknown as { error?: { message?: string; code?: number } }).error;
      setDebugMsg(`ERRO: ${err?.message ?? "desconhecido"} (code ${err?.code ?? "?"})`);
    };

    player.addEventListener("play", handlePlay);
    player.addEventListener("pause", handlePause);
    player.addEventListener("waiting", handleWaiting);
    player.addEventListener("stalled", handleStalled);
    player.addEventListener("canplay", handleCanPlay);
    player.addEventListener("error", handleError);
    return () => {
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("pause", handlePause);
      player.removeEventListener("waiting", handleWaiting);
      player.removeEventListener("stalled", handleStalled);
      player.removeEventListener("canplay", handleCanPlay);
      player.removeEventListener("error", handleError);
    };
  }, []);

  const togglePlayPause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (player.paused) {
      player.muted = true;
      player.play()?.then(() => setIsPlaying(true)).catch(() => {
        // autoplay/gesto bloqueado — mantém estado pausado sem quebrar a UI
        setIsPlaying(false);
      });
    } else {
      player.pause();
      setIsPlaying(false);
    }
  }, []);

  return (
    <section
      data-video-id={video.id}
      className="flex h-full snap-start items-center justify-center px-0 py-0 lg:px-6 lg:py-6"
    >
      <div
        className="relative h-full w-full overflow-hidden bg-secondary lg:h-full lg:w-auto lg:aspect-[9/16] lg:rounded-xl lg:border lg:border-border"
        onClick={togglePlayPause}
        role="button"
        aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
      >
        {/* ===== PLAYER (Mux) ===== */}
        {video.videoUrl ? (
          <MuxPlayer
            ref={playerRef}
            src={video.videoUrl}
            metadata={{ video_title: video.title }}
            poster={video.thumbnailUrl}
            loop
            playsInline
            muted
            autoPlay={isActive ? "muted" : false}
            preload={isActive ? "auto" : "metadata"}
            className="mux-player-cover h-full w-full"
          />
        ) : video.thumbnailUrl ? (
          <img src={video.thumbnailUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Play className="size-10 text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        {/* ===== DEBUG TEMPORÁRIO — remover depois de resolver o bug ===== */}
        <div className="pointer-events-none absolute left-2 top-2 z-50 max-w-[90%] rounded bg-black/80 p-2 font-mono text-[10px] leading-tight text-lime-400">
          <div>ativo: {String(isActive)}</div>
          <div>tocando: {String(isPlaying)}</div>
          <div>status: {debugMsg}</div>
          <div className="break-all">
            url: {video.videoUrl ? video.videoUrl.slice(0, 60) + "..." : "❌ VAZIO/UNDEFINED"}
          </div>
        </div>

        {/* ===== ÍCONE CENTRAL PLAY ===== */}
        {!isPlaying && video.videoUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        )}

        {/* ===== GRADIENTE ===== */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-5 pb-24 lg:pb-6">
          <div className="flex items-center gap-2">
            <VideoAvatar name={video.userName} url={video.userAvatarUrl} className="size-8" />
            <span className="text-sm font-medium text-foreground">{video.userName}</span>
          </div>
          <p className="mt-2 line-clamp-2 max-w-lg text-sm text-muted-foreground">
            {video.description ?? video.title}
          </p>
        </div>

        {/* ===== AÇÕES ===== */}
        <div
          className="absolute bottom-28 right-4 flex flex-col items-center gap-4 lg:bottom-8"
          onClick={(e) => e.stopPropagation()}
        >
          <FloatingAction
            label="Curtir"
            active={liked}
            onClick={() => setLiked((v) => !v)}
            icon={<Heart className={`size-5 ${liked ? "fill-primary text-primary" : ""}`} />}
            value={formatViews((video.likesCount ?? 0) + (liked && !video.liked ? 1 : 0))}
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