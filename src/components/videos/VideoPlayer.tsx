"use client";

import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string;
  title: string;
  poster?: string;
}

export function VideoPlayer({ playbackId, title, poster }: VideoPlayerProps) {
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
        playbackId={playbackId}
        metadata={{ video_title: title }}
        accentColor="#9e2b25"
        poster={poster}
        className="w-full aspect-video"
      />
    </div>
  );
}
