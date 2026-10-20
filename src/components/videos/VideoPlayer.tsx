"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { ExternalLink, Loader2, SkipForward } from "lucide-react";

import { useWatchHeartbeat } from "@/hooks/useWatchHeartbeat";
import { buscarAnuncio, registrarExibicao, urlDaArte, type AdSlot } from "@/lib/ads";

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
  const { getToken, isLoaded } = useAuth();
  // undefined: ainda buscando; null: sem anúncio (ou já terminou)
  const [anuncio, setAnuncio] = useState<AdSlot | null | undefined>(live || !playbackId ? null : undefined);
  const [teveAnuncio, setTeveAnuncio] = useState(false);
  useWatchHeartbeat(playerRef, playbackId && anuncio === null ? videoId : undefined);

  useEffect(() => {
    if (live || !playbackId || !isLoaded) return;
    let ativo = true;
    void (async () => {
      const token = await getToken().catch(() => null);
      const slot = await buscarAnuncio(videoId, token);
      if (!ativo) return;
      setAnuncio(slot);
      if (slot) setTeveAnuncio(true);
    })();
    return () => {
      ativo = false;
    };
  }, [videoId, playbackId, live, isLoaded, getToken]);

  if (!playbackId) {
    return (
      <div className="aspect-video w-full flex items-center justify-center bg-black rounded-lg text-muted-foreground">
        Vídeo indisponível
      </div>
    );
  }

  if (anuncio === undefined) {
    return (
      <div className="grid aspect-video w-full place-items-center rounded-lg bg-black" aria-busy="true">
        <Loader2 className="size-7 animate-spin text-white/60" aria-hidden="true" />
      </div>
    );
  }

  if (anuncio) {
    return <AnuncioAntesDoVideo anuncio={anuncio} getToken={getToken} onFim={() => setAnuncio(null)} />;
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
        // Depois do anúncio a pessoa já escolheu assistir: o vídeo começa sozinho
        autoPlay={teveAnuncio}
        className="w-full aspect-video"
      />
    </div>
  );
}

/**
 * Arte do anunciante por alguns segundos antes do vídeo. A contagem só anda com a aba
 * visível; ao zerar, a exibição é registrada (é quando conta para o criador) e o
 * "Pular" aparece.
 */
function AnuncioAntesDoVideo({
  anuncio,
  getToken,
  onFim,
}: {
  anuncio: AdSlot;
  getToken: () => Promise<string | null>;
  onFim: () => void;
}) {
  const [restante, setRestante] = useState(anuncio.minSeconds);
  const registrado = useRef(false);

  const acabou = restante <= 0;

  useEffect(() => {
    if (acabou) return;
    // Só desconta com a aba visível: anúncio em aba escondida não conta como visto
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setRestante((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [acabou]);

  useEffect(() => {
    if (!acabou || registrado.current) return;
    registrado.current = true;
    void getToken()
      .catch(() => null)
      .then((token) => registrarExibicao(anuncio.token, token));
  }, [acabou, anuncio.token, getToken]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black" role="region" aria-label="Anúncio">
      {/* eslint-disable-next-line @next/next/no-img-element -- arte enviada pelo anunciante, domínio variável */}
      <img src={urlDaArte(anuncio.imageUrl)} alt={anuncio.title} className="size-full object-contain" />

      <span className="absolute left-3 top-3 rounded bg-black/75 px-2 py-1 text-xs font-semibold text-white">
        Anúncio · {anuncio.title}
      </span>

      <a
        href={anuncio.clickUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow transition hover:bg-white/90"
      >
        Saiba mais
        <ExternalLink className="size-4" aria-hidden="true" />
      </a>

      {restante > 0 ? (
        <span
          className="absolute bottom-3 right-3 rounded-md bg-black/75 px-3 py-2 text-sm font-medium tabular-nums text-white"
          aria-live="polite"
        >
          Pular em {restante}
        </span>
      ) : (
        <button
          type="button"
          onClick={onFim}
          autoFocus
          className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-white/40 bg-black/80 px-3 py-2 text-sm font-semibold text-white transition hover:bg-black"
        >
          Pular anúncio
          <SkipForward className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
