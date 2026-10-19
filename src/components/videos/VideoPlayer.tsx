"use client";

import { useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";

import { useWatchHeartbeat } from "@/hooks/useWatchHeartbeat";

interface VideoPlayerProps {
  videoId: string;
  playbackId: string;
  title: string;
  poster?: string;
  /** Live: player sem barra de tempo, colado no ao vivo. */
  live?: boolean;
}

export function VideoPlayer({ videoId, playbackId, title, poster, live = false }: VideoPlayerProps) {
  const playerRef = useRef<MuxPlayerElement | null>(null);
  useWatchHeartbeat(playerRef, playbackId ? videoId : undefined);

  if (!playbackId) {
    return (
      <div className="aspect-video w-full flex items-center justify-center bg-black rounded-lg text-muted-foreground">
        Vídeo indisponível
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-black">
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        streamType={live ? "live" : "on-demand"}
        metadata={{ video_id: videoId, video_title: title }}
        accentColor="#d33a2c"
        poster={poster}
        className="w-full aspect-video"
      />
    </div>
  );
}
