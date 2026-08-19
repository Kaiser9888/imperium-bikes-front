"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    MessageCircle,
    Play,
    Search,
    Share2,
    Volume2,
    VolumeX,
    X,
} from "lucide-react";
import MuxPlayer from "@mux/mux-player-react";

import { VideoComments } from "@/components/videos/VideoComments";

const API_URL = "https://imperium-bikes.onrender.com";

interface MementoItem {
    id: string;
    title: string;
    description?: string | null;
    videoUrl: string;
    thumbnailUrl?: string | null;
    durationSeconds?: number;
    viewCount: number;
    likesCount: number;
    commentsCount: number;
    userName: string;
    userAvatarUrl?: string | null;
    userId: string;
    liked?: boolean;
}

/* ================================================================
 * UTILITÁRIOS
 * ================================================================ */

function formatViews(value: number) {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
    }

    return String(value);
}

function isHlsUrl(url: string) {
    const value = url.toLowerCase();

    return (
      value.includes(".m3u8") ||
      value.includes("stream.mux.com") ||
      value.includes("mux.com")
    );
}

/*
 * Se o backend eventualmente retornar um playback ID do Mux
 * em vez da URL completa, conseguimos usar também.
 */
function extractMuxPlaybackId(url: string) {
    if (!url) {
        return null;
    }

    if (url.includes("stream.mux.com/")) {
        const match = url.match(
          /stream\.mux\.com\/([^/?#]+)/
        );

        return match?.[1] ?? null;
    }

    return null;
}

/* ================================================================
 * PÁGINA
 * ================================================================ */

export default function MementoPage() {
    const {
        getToken,
        userId: currentUserId,
        isSignedIn,
    } = useAuth();

    const [momentos, setMomentos] =
      useState<MementoItem[]>([]);

    const [currentIndex, setCurrentIndex] =
      useState(0);

    const [loading, setLoading] =
      useState(true);

    const [liked, setLiked] =
      useState<Record<string, boolean>>({});

    const [likeCounts, setLikeCounts] =
      useState<Record<string, number>>({});

    const [showComments, setShowComments] =
      useState(false);

    const [isPlaying, setIsPlaying] =
      useState(false);

    const [isMuted, setIsMuted] =
      useState(true);

    const [videoError, setVideoError] =
      useState(false);

    const videoRef =
      useRef<HTMLVideoElement | null>(null);

    const muxPlayerRef =
      useRef<any>(null);

    const currentVideo =
      momentos[currentIndex];

    /* ============================================================
     * BUSCAR VÍDEOS
     * ============================================================ */

    useEffect(() => {
        let cancelled = false;

        async function fetchMomentos() {
            try {
                setLoading(true);

                const response = await fetch(
                  `${API_URL}/api/videos?page=0&size=20&isShort=true`,
                  {
                      cache: "no-store",
                      signal: AbortSignal.timeout(10000),
                  }
                );

                if (!response.ok) {
                    throw new Error(
                      `Erro HTTP ${response.status}`
                    );
                }

                const data =
                  await response.json();

                if (cancelled) {
                    return;
                }

                const items =
                  Array.isArray(data)
                    ? data
                    : data.content ?? [];

                const validItems =
                  items.filter(
                    (item: MementoItem) =>
                      item &&
                      item.id &&
                      item.videoUrl
                  );

                setMomentos(validItems);

                const counts: Record<
                  string,
                  number
                > = {};

                const initialLikes: Record<
                  string,
                  boolean
                > = {};

                validItems.forEach(
                  (video: MementoItem) => {
                      counts[video.id] =
                        video.likesCount ?? 0;

                      initialLikes[video.id] =
                        video.liked ?? false;
                  }
                );

                setLikeCounts(counts);
                setLiked(initialLikes);
            } catch (error) {
                if (!cancelled) {
                    console.error(
                      "Erro ao carregar Mementos:",
                      error
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchMomentos();

        return () => {
            cancelled = true;
        };
    }, []);

    /* ============================================================
     * RESET DO PLAYER QUANDO TROCA DE VÍDEO
     * ============================================================ */

    useEffect(() => {
        setIsPlaying(false);
        setIsMuted(true);
        setVideoError(false);

        /*
         * Player nativo
         */
        const video =
          videoRef.current;

        if (video) {
            video.pause();
            video.currentTime = 0;
            video.muted = true;
        }

        /*
         * Mux
         */
        const mux =
          muxPlayerRef.current;

        if (mux) {
            try {
                mux.pause();
                mux.currentTime = 0;
                mux.muted = true;
            } catch {
                // Ignora limpeza do player.
            }
        }
    }, [currentIndex]);

    /* ============================================================
     * AUTOPLAY DO VÍDEO
     *
     * Começamos SEM SOM porque o navegador bloqueia
     * autoplay com áudio.
     * O usuário pode ativar o som pelo botão.
     * ============================================================ */

    useEffect(() => {
        if (!currentVideo) {
            return;
        }

        let cancelled = false;

        async function startPlayback() {
            if (cancelled) {
                return;
            }

            try {
                /*
                 * Mux / HLS
                 */
                if (
                  isHlsUrl(
                    currentVideo.videoUrl
                  )
                ) {
                    const player =
                      muxPlayerRef.current;

                    if (!player) {
                        return;
                    }

                    player.muted = true;

                    await player.play();

                    if (!cancelled) {
                        setIsPlaying(true);
                    }

                    return;
                }

                /*
                 * MP4 / vídeo tradicional
                 */
                const video =
                  videoRef.current;

                if (!video) {
                    return;
                }

                video.muted = true;

                await video.play();

                if (!cancelled) {
                    setIsPlaying(true);
                }
            } catch (error) {
                if (!cancelled) {
                    console.warn(
                      "Autoplay bloqueado ou vídeo ainda carregando:",
                      error
                    );
                }
            }
        }

        const timer =
          window.setTimeout(
            () => {
                void startPlayback();
            },
            150
          );

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [currentIndex, currentVideo]);

    /* ============================================================
     * PLAY / PAUSE
     * ============================================================ */

    const togglePlay = useCallback(
      async () => {
          if (!currentVideo) {
              return;
          }

          try {
              if (
                isHlsUrl(
                  currentVideo.videoUrl
                )
              ) {
                  const player =
                    muxPlayerRef.current;

                  if (!player) {
                      return;
                  }

                  if (player.paused) {
                      await player.play();
                  } else {
                      player.pause();
                  }

                  return;
              }

              const video =
                videoRef.current;

              if (!video) {
                  return;
              }

              if (video.paused) {
                  await video.play();
              } else {
                  video.pause();
              }
          } catch (error) {
              console.error(
                "Erro ao reproduzir vídeo:",
                error
              );
          }
      },
      [currentVideo]
    );

    /* ============================================================
     * SOM
     * ============================================================ */

    const toggleSound = useCallback(
      async (
        event: React.MouseEvent
      ) => {
          event.stopPropagation();

          try {
              const newMuted =
                !isMuted;

              /*
               * Mux
               */
              if (
                currentVideo &&
                isHlsUrl(
                  currentVideo.videoUrl
                )
              ) {
                  const player =
                    muxPlayerRef.current;

                  if (!player) {
                      return;
                  }

                  player.muted =
                    newMuted;

                  setIsMuted(newMuted);

                  /*
                   * Se ativou o som e estava pausado,
                   * tenta reproduzir.
                   */
                  if (
                    !newMuted &&
                    player.paused
                  ) {
                      await player.play();
                  }

                  return;
              }

              /*
               * Vídeo normal
               */
              const video =
                videoRef.current;

              if (!video) {
                  return;
              }

              video.muted =
                newMuted;

              setIsMuted(newMuted);

              if (
                !newMuted &&
                video.paused
              ) {
                  await video.play();
              }
          } catch (error) {
              console.error(
                "Erro ao alterar som:",
                error
              );
          }
      },
      [
          currentVideo,
          isMuted,
      ]
    );

    /* ============================================================
     * LIKE
     * ============================================================ */

    const toggleLike = async (
      videoId: string
    ) => {
        if (
          !isSignedIn ||
          !currentUserId
        ) {
            return;
        }

        const previousLiked =
          liked[videoId] ?? false;

        const previousCount =
          likeCounts[videoId] ??
          0;

        /*
         * Atualização otimista
         */
        setLiked((previous) => ({
            ...previous,
            [videoId]:
              !previousLiked,
        }));

        setLikeCounts(
          (previous) => ({
              ...previous,
              [videoId]:
                previousCount +
                (previousLiked
                  ? -1
                  : 1),
          })
        );

        try {
            const token =
              await getToken();

            if (!token) {
                throw new Error(
                  "Token de autenticação não disponível."
                );
            }

            const response =
              await fetch(
                `${API_URL}/api/videos/${videoId}/like`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                          `Bearer ${token}`,
                        "Content-Type":
                          "application/json",
                    },
                }
              );

            if (!response.ok) {
                throw new Error(
                  `Erro HTTP ${response.status}`
                );
            }

            const data =
              await response.json();

            setLiked((previous) => ({
                ...previous,
                [videoId]:
                  Boolean(
                    data.liked
                  ),
            }));

            setLikeCounts(
              (previous) => ({
                  ...previous,
                  [videoId]:
                    data.likesCount ??
                    data.count ??
                    previousCount,
              })
            );
        } catch (error) {
            console.error(
              "Erro ao curtir vídeo:",
              error
            );

            /*
             * Rollback
             */
            setLiked((previous) => ({
                ...previous,
                [videoId]:
                previousLiked,
            }));

            setLikeCounts(
              (previous) => ({
                  ...previous,
                  [videoId]:
                  previousCount,
              })
            );
        }
    };

    /* ============================================================
     * PRÓXIMO
     * ============================================================ */

    const nextVideo = () => {
        if (
          currentIndex <
          momentos.length - 1
        ) {
            setCurrentIndex(
              (previous) =>
                previous + 1
            );
        }
    };

    /* ============================================================
     * ANTERIOR
     * ============================================================ */

    const previousVideo = () => {
        if (currentIndex > 0) {
            setCurrentIndex(
              (previous) =>
                previous - 1
            );
        }
    };

    /* ============================================================
     * COMPARTILHAR
     * ============================================================ */

    const shareVideo = async () => {
        if (!currentVideo) {
            return;
        }

        const url =
          `${window.location.origin}/videos/memento`;

        try {
            if (
              navigator.share
            ) {
                await navigator.share({
                    title:
                    currentVideo.title,
                    text:
                      currentVideo.description ??
                      currentVideo.title,
                    url,
                });

                return;
            }

            await navigator.clipboard.writeText(
              url
            );
        } catch {
            /*
             * Usuário cancelou o compartilhamento.
             */
        }
    };

    /* ============================================================
     * TECLADO
     * ============================================================ */

    useEffect(() => {
        const handleKeyDown = (
          event: KeyboardEvent
        ) => {
            if (showComments) {
                return;
            }

            if (
              event.key ===
              "ArrowDown"
            ) {
                event.preventDefault();
                nextVideo();
            }

            if (
              event.key ===
              "ArrowUp"
            ) {
                event.preventDefault();
                previousVideo();
            }

            if (
              event.key ===
              " "
            ) {
                event.preventDefault();
                void togglePlay();
            }
        };

        window.addEventListener(
          "keydown",
          handleKeyDown
        );

        return () => {
            window.removeEventListener(
              "keydown",
              handleKeyDown
            );
        };
    }, [
        currentIndex,
        momentos.length,
        showComments,
        togglePlay,
    ]);

    /* ============================================================
     * LOADING
     * ============================================================ */

    if (loading) {
        return (
          <div className="flex h-dvh w-full items-center justify-center bg-background">
              <div
                className="
                        h-8
                        w-8
                        animate-spin
                        rounded-full
                        border-2
                        border-primary/30
                        border-t-primary
                    "
              />
          </div>
        );
    }

    /* ============================================================
     * VAZIO
     * ============================================================ */

    if (!momentos.length) {
        return (
          <div className="flex h-dvh w-full items-center justify-center bg-background px-6">
              <div className="text-center">
                  <p className="text-lg text-muted-foreground">
                      Nenhum Memento ainda
                  </p>

                  <Link
                    href="/videos/memento/upload"
                    className="
                            mt-4
                            inline-flex
                            rounded-full
                            bg-primary
                            px-6
                            py-2
                            text-sm
                            font-medium
                            text-primary-foreground
                            transition
                            hover:bg-primary/90
                        "
                  >
                      Publicar Memento
                  </Link>
              </div>
          </div>
        );
    }

    /* ============================================================
     * RENDER
     * ============================================================ */

    return (
      <div className="fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-black">
          {/* ====================================================
                HEADER
            ==================================================== */}

          <header
            className="
                    absolute
                    left-0
                    right-0
                    top-0
                    z-40
                    flex
                    h-14
                    items-center
                    border-b
                    border-white/10
                    bg-black/35
                    px-4
                    backdrop-blur-md
                "
          >
              <Link
                href="/videos"
                className="
                        shrink-0
                        text-lg
                        tracking-wide
                    "
                style={{
                    fontFamily:
                      "var(--font-caesar)",
                    color:
                      "#ac0202",
                }}
              >
                  Imperium
              </Link>

              <div className="ml-auto flex items-center gap-2">
                  <Link
                    href="/videos/buscar"
                    aria-label="Buscar vídeos"
                    className="
                            flex
                            size-10
                            items-center
                            justify-center
                            rounded-full
                            text-white
                            transition
                            hover:bg-white/10
                        "
                  >
                      <Search className="size-5" />
                  </Link>

                  <Link
                    href="/videos/memento/upload"
                    className="
                            rounded-full
                            bg-primary
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-primary-foreground
                            transition
                            hover:bg-primary/90
                        "
                  >
                      + Publicar
                  </Link>
              </div>
          </header>

          {/* ====================================================
                ÁREA PRINCIPAL
            ==================================================== */}

          <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
              <div
                className="
                        relative
                        h-full
                        w-full
                        overflow-hidden
                        bg-black

                        sm:h-full
                        sm:w-full

                        lg:h-[calc(100dvh-24px)]
                        lg:w-auto
                        lg:aspect-[9/16]
                        lg:max-w-[calc(100vw-260px)]
                        lg:rounded-2xl
                    "
              >
                  {/* =================================================
                        PLAYER
                    ================================================= */}

                  {currentVideo &&
                  isHlsUrl(
                    currentVideo.videoUrl
                  ) ? (
                    <MuxPlayer
                      key={
                          currentVideo.id
                      }
                      ref={
                          muxPlayerRef
                      }
                      src={
                          currentVideo.videoUrl
                      }
                      playbackId={
                        extractMuxPlaybackId(
                          currentVideo.videoUrl
                        ) ??
                        undefined
                      }
                      metadata={{
                          video_title:
                          currentVideo.title,
                      }}
                      poster={
                        currentVideo.thumbnailUrl ??
                        undefined
                      }
                      autoPlay="muted"
                      muted
                      loop
                      playsInline
                      preload="auto"
                      onPlay={() => {
                          setIsPlaying(
                            true
                          );
                          setVideoError(
                            false
                          );
                      }}
                      onPause={() => {
                          setIsPlaying(
                            false
                          );
                      }}
                      onError={() => {
                          console.error(
                            "Mux não conseguiu reproduzir:",
                            currentVideo.videoUrl
                          );

                          setVideoError(
                            true
                          );
                          setIsPlaying(
                            false
                          );
                      }}
                      className="
                                absolute
                                inset-0
                                h-full
                                w-full
                            "
                      style={{
                          objectFit:
                            "cover",
                      }}
                    />
                  ) : (
                    <video
                      key={
                          currentVideo.id
                      }
                      ref={
                          videoRef
                      }
                      src={
                          currentVideo.videoUrl
                      }
                      poster={
                        currentVideo.thumbnailUrl ??
                        undefined
                      }
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="
                                absolute
                                inset-0
                                h-full
                                w-full
                                bg-black
                                object-cover
                            "
                      onPlay={() => {
                          setIsPlaying(
                            true
                          );
                          setVideoError(
                            false
                          );
                      }}
                      onPause={() => {
                          setIsPlaying(
                            false
                          );
                      }}
                      onError={() => {
                          console.error(
                            "Vídeo não conseguiu carregar:",
                            currentVideo.videoUrl
                          );

                          setVideoError(
                            true
                          );
                          setIsPlaying(
                            false
                          );
                      }}
                      onClick={() => {
                          void togglePlay();
                      }}
                    />
                  )}

                  {/* =================================================
                        ERRO
                    ================================================= */}

                  {videoError && (
                    <div
                      className="
                                absolute
                                inset-0
                                z-30
                                flex
                                items-center
                                justify-center
                                bg-black/70
                                px-6
                                text-center
                                backdrop-blur-sm
                            "
                    >
                        <div className="max-w-xs">
                            <p className="text-sm font-semibold text-white">
                                Não foi possível reproduzir este vídeo.
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                  setVideoError(
                                    false
                                  );

                                  if (
                                    videoRef.current
                                  ) {
                                      videoRef.current.load();

                                      void videoRef.current.play();
                                  }

                                  if (
                                    muxPlayerRef.current
                                  ) {
                                      try {
                                          muxPlayerRef.current.load();
                                          void muxPlayerRef.current.play();
                                      } catch {
                                          // Ignora tentativa de recuperação.
                                      }
                                  }
                              }}
                              className="
                                        mt-4
                                        rounded-full
                                        bg-white
                                        px-5
                                        py-2
                                        text-sm
                                        font-medium
                                        text-black
                                        transition
                                        hover:bg-white/90
                                    "
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                  )}

                  {/* =================================================
                        PLAY CENTRAL
                    ================================================= */}

                  {!isPlaying &&
                    !videoError && (
                      <button
                        type="button"
                        onClick={() =>
                          void togglePlay()
                        }
                        aria-label="Reproduzir vídeo"
                        className="
                                    absolute
                                    inset-0
                                    z-20
                                    flex
                                    items-center
                                    justify-center
                                "
                      >
                                <span
                                  className="
                                        flex
                                        size-16
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-black/50
                                        text-white
                                        shadow-xl
                                        backdrop-blur-md
                                    "
                                >
                                    <Play
                                      className="ml-1 size-8"
                                      fill="white"
                                    />
                                </span>
                      </button>
                    )}

                  {/* =================================================
                        GRADIENTE
                    ================================================= */}

                  <div
                    className="
                            pointer-events-none
                            absolute
                            inset-x-0
                            bottom-0
                            z-10
                            h-72
                            bg-gradient-to-t
                            from-black/95
                            via-black/45
                            to-transparent
                        "
                  />

                  {/* =================================================
                        SOM
                    ================================================= */}

                  <button
                    type="button"
                    onClick={
                        toggleSound
                    }
                    aria-label={
                        isMuted
                          ? "Ativar som"
                          : "Desativar som"
                    }
                    className="
                            absolute
                            right-4
                            top-16
                            z-40
                            flex
                            size-11
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/20
                            bg-black/45
                            text-white
                            shadow-lg
                            backdrop-blur-md
                            transition
                            hover:bg-black/65
                            active:scale-95
                        "
                  >
                      {isMuted ? (
                        <VolumeX className="size-5" />
                      ) : (
                        <Volume2 className="size-5" />
                      )}
                  </button>

                  {/* =================================================
                        INFORMAÇÕES
                    ================================================= */}

                  <div
                    className="
                            absolute
                            bottom-0
                            left-0
                            right-0
                            z-20
                            px-4
                            pb-6
                            pr-20
                            sm:px-5
                            sm:pb-7
                            sm:pr-24
                        "
                  >
                      <div className="mb-2 flex items-center gap-2">
                          {currentVideo.userAvatarUrl ? (
                            <img
                              src={
                                  currentVideo.userAvatarUrl
                              }
                              alt=""
                              className="
                                        size-9
                                        shrink-0
                                        rounded-full
                                        border-2
                                        border-white/40
                                        bg-secondary
                                        object-cover
                                    "
                            />
                          ) : (
                            <div
                              className="
                                        flex
                                        size-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        border-2
                                        border-white/40
                                        bg-secondary
                                        text-sm
                                        font-semibold
                                        text-white
                                    "
                            >
                                {currentVideo.userName
                                    ?.charAt(
                                      0
                                    )
                                    .toUpperCase() ??
                                  "U"}
                            </div>
                          )}

                          <span className="truncate text-sm font-semibold text-white">
                                @
                              {
                                  currentVideo.userName
                              }
                            </span>
                      </div>

                      <h2 className="line-clamp-2 text-sm font-bold text-white sm:text-base">
                          {
                              currentVideo.title
                          }
                      </h2>

                      {currentVideo.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-white/80 sm:text-sm">
                            {
                                currentVideo.description
                            }
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                            <span>
                                {formatViews(
                                  currentVideo.viewCount
                                )}{" "}
                                visualizações
                            </span>

                          <span>•</span>

                          <span>
                                {formatViews(
                                  likeCounts[
                                    currentVideo
                                      .id
                                    ] ??
                                  currentVideo.likesCount ??
                                  0
                                )}{" "}
                              curtidas
                            </span>

                          <span>•</span>

                          <span>
                                {formatViews(
                                  currentVideo.commentsCount ??
                                  0
                                )}{" "}
                              comentários
                            </span>
                      </div>
                  </div>

                  {/* =================================================
                        AÇÕES
                    ================================================= */}

                  <div
                    className="
                            absolute
                            bottom-24
                            right-3
                            z-30
                            flex
                            flex-col
                            items-center
                            gap-4
                            sm:right-4
                            lg:bottom-8
                        "
                  >
                      {/* LIKE */}

                      <button
                        type="button"
                        onClick={() =>
                          void toggleLike(
                            currentVideo.id
                          )
                        }
                        aria-label="Curtir"
                        className="flex flex-col items-center gap-1 text-white"
                      >
                            <span
                              className={`
                                    flex
                                    size-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    backdrop-blur-md
                                    transition
                                    active:scale-95
                                    ${
                                liked[
                                  currentVideo
                                    .id
                                  ]
                                  ? "border-red-500/50 bg-red-500/20"
                                  : "border-white/20 bg-black/40"
                              }
                                `}
                            >
                                <Heart
                                  className={`
                                        size-5
                                        ${
                                    liked[
                                      currentVideo
                                        .id
                                      ]
                                      ? "fill-red-500 text-red-500"
                                      : "text-white"
                                  }
                                    `}
                                />
                            </span>

                          <span className="text-xs font-medium">
                                {formatViews(
                                  likeCounts[
                                    currentVideo
                                      .id
                                    ] ??
                                  currentVideo.likesCount ??
                                  0
                                )}
                            </span>
                      </button>

                      {/* COMENTÁRIOS */}

                      <button
                        type="button"
                        onClick={() =>
                          setShowComments(
                            true
                          )
                        }
                        aria-label="Comentários"
                        className="flex flex-col items-center gap-1 text-white"
                      >
                            <span
                              className="
                                    flex
                                    size-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-white/20
                                    bg-black/40
                                    backdrop-blur-md
                                    active:scale-95
                                "
                            >
                                <MessageCircle className="size-5" />
                            </span>

                          <span className="text-xs font-medium">
                                {formatViews(
                                  currentVideo.commentsCount ??
                                  0
                                )}
                            </span>
                      </button>

                      {/* COMPARTILHAR */}

                      <button
                        type="button"
                        onClick={() =>
                          void shareVideo()
                        }
                        aria-label="Compartilhar"
                        className="flex flex-col items-center gap-1 text-white"
                      >
                            <span
                              className="
                                    flex
                                    size-11
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-white/20
                                    bg-black/40
                                    backdrop-blur-md
                                    active:scale-95
                                "
                            >
                                <Share2 className="size-5" />
                            </span>

                          <span className="text-[10px]">
                                Compartilhar
                            </span>
                      </button>
                  </div>

                  {/* =================================================
                        NAVEGAÇÃO
                    ================================================= */}

                  {currentIndex >
                    0 && (
                      <button
                        type="button"
                        onClick={
                            previousVideo
                        }
                        aria-label="Vídeo anterior"
                        className="
                                absolute
                                left-3
                                top-1/2
                                z-30
                                hidden
                                -translate-y-1/2
                                rounded-full
                                bg-black/40
                                p-2
                                text-white
                                backdrop-blur-md
                                transition
                                hover:bg-black/60
                                md:flex
                            "
                      >
                          <ChevronLeft className="size-5" />
                      </button>
                    )}

                  {currentIndex <
                    momentos.length -
                    1 && (
                      <button
                        type="button"
                        onClick={
                            nextVideo
                        }
                        aria-label="Próximo vídeo"
                        className="
                                absolute
                                right-3
                                top-1/2
                                z-30
                                hidden
                                -translate-y-1/2
                                rounded-full
                                bg-black/40
                                p-2
                                text-white
                                backdrop-blur-md
                                transition
                                hover:bg-black/60
                                md:flex
                            "
                      >
                          <ChevronRight className="size-5" />
                      </button>
                    )}
              </div>
          </main>

          {/* ========================================================
                INDICADOR
            ======================================================== */}

          <div
            className="
                    pointer-events-none
                    absolute
                    bottom-2
                    left-1/2
                    z-40
                    -translate-x-1/2
                    rounded-full
                    bg-black/30
                    px-3
                    py-1
                    text-[10px]
                    text-white/60
                    backdrop-blur-sm
                "
          >
              {currentIndex + 1} /{" "}
              {momentos.length}
          </div>

          {/* ========================================================
                COMENTÁRIOS
            ======================================================== */}

          {showComments &&
            currentVideo && (
              <div
                className="
                            absolute
                            inset-0
                            z-[100]
                            flex
                            items-end
                            justify-center
                            bg-black/60
                            backdrop-blur-sm
                        "
                onClick={() =>
                  setShowComments(
                    false
                  )
                }
              >
                  <div
                    className="
                                relative
                                max-h-[85dvh]
                                w-full
                                max-w-lg
                                overflow-hidden
                                rounded-t-2xl
                                bg-card
                                shadow-2xl
                            "
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                          <h2 className="text-lg font-semibold text-foreground">
                              Comentários
                          </h2>

                          <button
                            type="button"
                            onClick={() =>
                              setShowComments(
                                false
                              )
                            }
                            aria-label="Fechar comentários"
                            className="
                                        flex
                                        size-9
                                        items-center
                                        justify-center
                                        rounded-full
                                        text-muted-foreground
                                        transition
                                        hover:bg-secondary
                                    "
                          >
                              <X className="size-5" />
                          </button>
                      </div>

                      <div className="max-h-[calc(85dvh-60px)] overflow-y-auto px-4 pb-6">
                          <VideoComments
                            videoId={
                                currentVideo.id
                            }
                          />
                      </div>
                  </div>
              </div>
            )}
      </div>
    );
}