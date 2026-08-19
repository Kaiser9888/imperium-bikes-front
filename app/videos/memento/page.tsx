"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    MessageSquare,
    Search,
    Share2,
    Volume2,
    VolumeX,
    X,
    Play,
} from "lucide-react";

import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";

import { VideoComments } from "@/components/videos/VideoComments";
import {
    fetchVideoPage,
    likeVideo,
    playbackIdFrom,
    PAGE_SIZE,
} from "@/lib/videos/api";

import type { VideoItem } from "@/lib/videos/types";

export default function MementoPage() {
    const {
        getToken,
        isSignedIn,
    } = useAuth();

    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [liked, setLiked] = useState<Record<string, boolean>>({});
    const [likeCounts, setLikeCounts] =
      useState<Record<string, number>>({});

    const [showComments, setShowComments] =
      useState(false);

    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);

    const [page, setPage] = useState(0);
    const [lastPage, setLastPage] = useState(false);

    const playerRef =
      useRef<MuxPlayerElement | null>(null);

    /*
     * ============================================================
     * CARREGAR PRIMEIRA PÁGINA
     * ============================================================
     */

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);

                const data = await fetchVideoPage(
                  0,
                  true
                );

                if (cancelled) {
                    return;
                }

                const items = data.content ?? [];

                setVideos(items);
                setLastPage(data.last ?? true);
                setPage(0);

                const counts: Record<string, number> = {};
                const states: Record<string, boolean> = {};

                for (const video of items) {
                    counts[video.id] =
                      video.likesCount ?? 0;

                    states[video.id] =
                      video.liked ?? false;
                }

                setLikeCounts(counts);
                setLiked(states);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * ============================================================
     * CARREGAR MAIS VÍDEOS
     * ============================================================
     */

    const loadMore = useCallback(async () => {
        if (loadingMore || lastPage) {
            return;
        }

        const nextPage = page + 1;

        try {
            setLoadingMore(true);

            const data = await fetchVideoPage(
              nextPage,
              true
            );

            const newVideos = data.content ?? [];

            setVideos((current) => {
                const existingIds = new Set(
                  current.map((video) => video.id)
                );

                const unique = newVideos.filter(
                  (video) =>
                    !existingIds.has(video.id)
                );

                return [...current, ...unique];
            });

            setPage(nextPage);
            setLastPage(data.last ?? true);

            setLikeCounts((current) => {
                const next = { ...current };

                for (const video of newVideos) {
                    if (
                      next[video.id] === undefined
                    ) {
                        next[video.id] =
                          video.likesCount ?? 0;
                    }
                }

                return next;
            });

            setLiked((current) => {
                const next = { ...current };

                for (const video of newVideos) {
                    if (
                      next[video.id] === undefined
                    ) {
                        next[video.id] =
                          video.liked ?? false;
                    }
                }

                return next;
            });
        } finally {
            setLoadingMore(false);
        }
    }, [
        lastPage,
        loadingMore,
        page,
    ]);

    /*
     * ============================================================
     * VÍDEO ATUAL
     * ============================================================
     */

    const currentVideo =
      videos[currentIndex];

    /*
     * ============================================================
     * PLAYBACK ID
     *
     * O backend pode retornar:
     *
     * D56....Js
     *
     * ou:
     *
     * https://stream.mux.com/D56....Js.m3u8
     *
     * playbackIdFrom() normaliza os dois.
     * ============================================================
     */

    const currentPlaybackId =
      playbackIdFrom(
        currentVideo?.videoUrl
      );

    /*
     * ============================================================
     * REPRODUÇÃO DO MUX
     * ============================================================
     */

    useEffect(() => {
        const player = playerRef.current;

        if (!player || !currentVideo) {
            return;
        }

        let cancelled = false;

        const startPlayback = async () => {
            if (cancelled) {
                return;
            }

            try {
                /*
                 * Autoplay sempre começa mutado.
                 * Isso evita bloqueio do navegador.
                 */
                player.muted = true;
                setIsMuted(true);

                await player.play();

                if (!cancelled) {
                    setIsPlaying(true);
                }
            } catch {
                if (!cancelled) {
                    setIsPlaying(false);
                }
            }
        };

        const handleCanPlay = () => {
            void startPlayback();
        };

        player.addEventListener(
          "canplay",
          handleCanPlay
        );

        /*
         * O elemento pode já estar pronto.
         */
        void startPlayback();

        return () => {
            cancelled = true;

            player.removeEventListener(
              "canplay",
              handleCanPlay
            );

            try {
                player.pause();
            } catch {
                // Mux ainda pode estar desmontando.
            }
        };
    }, [currentIndex, currentVideo?.id]);

    /*
     * ============================================================
     * EVENTOS DO PLAYER
     * ============================================================
     */

    useEffect(() => {
        const player = playerRef.current;

        if (!player) {
            return;
        }

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        player.addEventListener(
          "play",
          handlePlay
        );

        player.addEventListener(
          "pause",
          handlePause
        );

        return () => {
            player.removeEventListener(
              "play",
              handlePlay
            );

            player.removeEventListener(
              "pause",
              handlePause
            );
        };
    }, [currentVideo?.id]);

    /*
     * ============================================================
     * PLAY / PAUSE
     * ============================================================
     */

    const togglePlay = useCallback(() => {
        const player = playerRef.current;

        if (!player) {
            return;
        }

        if (player.paused) {
            player
              .play()
              .then(() => {
                  setIsPlaying(true);
              })
              .catch(() => {
                  setIsPlaying(false);
              });
        } else {
            player.pause();
            setIsPlaying(false);
        }
    }, []);

    /*
     * ============================================================
     * SOM
     * ============================================================
     */

    const toggleSound = useCallback(() => {
        const player = playerRef.current;

        if (!player) {
            return;
        }

        const newMuted = !player.muted;

        player.muted = newMuted;
        setIsMuted(newMuted);

        /*
         * Se o usuário ativou o som enquanto o vídeo
         * estava parado, tenta reproduzir.
         */
        if (!newMuted && player.paused) {
            player
              .play()
              .then(() => {
                  setIsPlaying(true);
              })
              .catch(() => {
                  setIsPlaying(false);
              });
        }
    }, []);

    /*
     * ============================================================
     * PRÓXIMO
     * ============================================================
     */

    const nextVideo = useCallback(() => {
        if (
          currentIndex <
          videos.length - 1
        ) {
            setCurrentIndex(
              (value) => value + 1
            );
            return;
        }

        if (!lastPage) {
            void loadMore();
        }
    }, [
        currentIndex,
        videos.length,
        lastPage,
        loadMore,
    ]);

    /*
     * ============================================================
     * ANTERIOR
     * ============================================================
     */

    const previousVideo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(
              (value) => value - 1
            );
        }
    }, [currentIndex]);

    /*
     * ============================================================
     * TECLADO
     * ============================================================
     */

    useEffect(() => {
        const handleKeyDown = (
          event: KeyboardEvent
        ) => {
            if (showComments) {
                if (event.key === "Escape") {
                    setShowComments(false);
                }

                return;
            }

            if (event.key === "ArrowDown") {
                event.preventDefault();
                nextVideo();
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                previousVideo();
            }

            if (event.key === " ") {
                event.preventDefault();
                togglePlay();
            }

            if (event.key === "m") {
                toggleSound();
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
        nextVideo,
        previousVideo,
        togglePlay,
        toggleSound,
        showComments,
    ]);

    /*
     * ============================================================
     * LIKE
     * ============================================================
     */

    const handleLike = useCallback(
      async (video: VideoItem) => {
          if (!isSignedIn) {
              return;
          }

          const videoId = video.id;

          const previousLiked =
            liked[videoId] ??
            video.liked ??
            false;

          const previousCount =
            likeCounts[videoId] ??
            video.likesCount ??
            0;

          /*
           * Atualização otimista.
           */
          setLiked((current) => ({
              ...current,
              [videoId]:
                !previousLiked,
          }));

          setLikeCounts((current) => ({
              ...current,
              [videoId]:
                previousCount +
                (previousLiked
                  ? -1
                  : 1),
          }));

          try {
              const token =
                await getToken();

              if (!token) {
                  throw new Error(
                    "Token não disponível"
                  );
              }

              const result =
                await likeVideo(
                  videoId,
                  token
                );

              if (!result) {
                  throw new Error(
                    "Não foi possível atualizar a curtida"
                  );
              }

              setLiked((current) => ({
                  ...current,
                  [videoId]:
                  result.liked,
              }));

              setLikeCounts(
                (current) => ({
                    ...current,
                    [videoId]:
                    result.likesCount,
                })
              );
          } catch {
              /*
               * Reverte caso a API falhe.
               */
              setLiked((current) => ({
                  ...current,
                  [videoId]:
                  previousLiked,
              }));

              setLikeCounts(
                (current) => ({
                    ...current,
                    [videoId]:
                    previousCount,
                })
              );
          }
      },
      [
          getToken,
          isSignedIn,
          liked,
          likeCounts,
      ]
    );

    /*
     * ============================================================
     * COMPARTILHAR
     * ============================================================
     */

    const handleShare = useCallback(
      async () => {
          if (!currentVideo) {
              return;
          }

          const url =
            typeof window !==
            "undefined"
              ? `${window.location.origin}/videos/memento?video=${currentVideo.id}`
              : "";

          if (!url) {
              return;
          }

          try {
              if (
                navigator.share
              ) {
                  await navigator.share(
                    {
                        title:
                        currentVideo.title,
                        text:
                          currentVideo.description ??
                          currentVideo.title,
                        url,
                    }
                  );

                  return;
              }

              await navigator.clipboard.writeText(
                url
              );
          } catch {
              /*
               * Compartilhamento cancelado
               * pelo usuário.
               */
          }
      },
      [currentVideo]
    );

    /*
     * ============================================================
     * FORMATAÇÃO
     * ============================================================
     */

    const formatNumber = (
      value: number
    ) => {
        if (value >= 1_000_000) {
            return `${(
              value / 1_000_000
            ).toFixed(1)}M`;
        }

        if (value >= 1_000) {
            return `${(
              value / 1_000
            ).toFixed(1)}K`;
        }

        return String(value);
    };

    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading) {
        return (
          <main className="fixed inset-0 flex items-center justify-center bg-background">
              <div
                className="
                        h-9
                        w-9
                        animate-spin
                        rounded-full
                        border-2
                        border-primary/20
                        border-t-primary
                    "
              />
          </main>
        );
    }

    /*
     * ============================================================
     * SEM VÍDEOS
     * ============================================================
     */

    if (!videos.length) {
        return (
          <main className="fixed inset-0 flex items-center justify-center bg-background px-6">
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
          </main>
        );
    }

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (
      <main
        className="
                fixed
                inset-0
                flex
                flex-col
                overflow-hidden
                bg-background
            "
      >
          {/* ====================================================
                TOPO
            ==================================================== */}

          <header
            className="
                    relative
                    z-50
                    flex
                    h-14
                    shrink-0
                    items-center
                    border-b
                    border-primary/10
                    bg-background/90
                    px-4
                    backdrop-blur-xl
                "
          >
              <Link
                href="/videos"
                className="
                        text-lg
                        tracking-wide
                    "
                style={{
                    fontFamily:
                      "var(--font-caesar)",
                    color: "#ac0202",
                }}
              >
                  Imperium
              </Link>

              <div className="ml-auto flex items-center gap-1">
                  <Link
                    href="/videos/buscar"
                    aria-label="Buscar vídeos"
                    className="
                            rounded-full
                            p-2
                            text-foreground
                            transition
                            hover:bg-secondary
                        "
                  >
                      <Search className="size-5" />
                  </Link>

                  <Link
                    href="/videos/memento/upload"
                    className="
                            ml-1
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
                ÁREA DO MEMENTO
            ==================================================== */}

          <section
            className="
                    relative
                    min-h-0
                    flex-1
                    overflow-hidden
                    bg-black
                "
          >
              {currentVideo && (
                <div
                  className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            bg-black
                        "
                >
                    {/* =================================================
                            CONTAINER RESPONSIVO

                            Mobile:
                            largura total / altura disponível

                            Desktop:
                            proporção 9:16
                        ================================================= */}

                    <div
                      className="
                                relative
                                h-full
                                w-full
                                overflow-hidden
                                bg-black

                                lg:h-full
                                lg:w-auto
                                lg:aspect-[9/16]
                                lg:max-w-[calc(100vw-2rem)]
                                lg:rounded-xl
                                lg:border
                                lg:border-white/10
                            "
                    >
                        {/* =================================================
                                MUX PLAYER

                                IMPORTANTE:
                                usamos playbackId e NÃO src.

                                Isso evita:
                                .m3u8.m3u8
                            ================================================= */}

                        {currentPlaybackId ? (
                          <MuxPlayer
                            key={currentVideo.id}
                            ref={playerRef}
                            playbackId={
                                currentPlaybackId
                            }
                            metadata={{
                                video_title:
                                currentVideo.title,
                            }}
                            poster={
                              currentVideo.thumbnailUrl ||
                              undefined
                            }
                            autoPlay="muted"
                            muted
                            loop
                            playsInline
                            preload="auto"
                            className="
                                        h-full
                                        w-full
                                    "
                          />
                        ) : currentVideo.videoUrl ? (
                          <div
                            className="
                                        flex
                                        h-full
                                        w-full
                                        items-center
                                        justify-center
                                        bg-black
                                        px-6
                                        text-center
                                        text-white
                                    "
                          >
                              <div>
                                  <p className="text-sm font-medium">
                                      Não foi possível identificar o vídeo.
                                  </p>
                              </div>
                          </div>
                        ) : (
                          <div
                            className="
                                        flex
                                        h-full
                                        w-full
                                        items-center
                                        justify-center
                                        bg-black
                                    "
                          >
                              <Play className="size-12 text-white/40" />
                          </div>
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
                                    z-20
                                    h-72
                                    bg-gradient-to-t
                                    from-black/95
                                    via-black/50
                                    to-transparent
                                "
                        />

                        {/* =================================================
                                SOM
                            ================================================= */}

                        {currentPlaybackId && (
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
                                        top-4
                                        z-40
                                        flex
                                        size-11
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-white/20
                                        bg-black/50
                                        text-white
                                        shadow-lg
                                        backdrop-blur-md
                                        transition
                                        hover:bg-black/70
                                        active:scale-95
                                    "
                          >
                              {isMuted ? (
                                <VolumeX className="size-5" />
                              ) : (
                                <Volume2 className="size-5" />
                              )}
                          </button>
                        )}

                        {/* =================================================
                                PLAY CENTRAL

                                O clique no vídeo continua funcionando.
                            ================================================= */}

                        {!isPlaying &&
                          currentPlaybackId && (
                            <button
                              type="button"
                              onClick={
                                  togglePlay
                              }
                              aria-label="Reproduzir vídeo"
                              className="
                                            absolute
                                            inset-0
                                            z-30
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
                                              className="
                                                    ml-1
                                                    size-8
                                                "
                                              fill="white"
                                            />
                                        </span>
                            </button>
                          )}

                        {/* =================================================
                                INFORMAÇÕES
                            ================================================= */}

                        <div
                          className="
                                    absolute
                                    bottom-0
                                    left-0
                                    right-0
                                    z-30
                                    p-4
                                    pb-6
                                    sm:p-5
                                    sm:pb-7
                                "
                        >
                            <div
                              className="
                                        flex
                                        items-end
                                        gap-3
                                    "
                            >
                                <div
                                  className="
                                            min-w-0
                                            flex-1
                                        "
                                >
                                    {/* USUÁRIO */}

                                    <div
                                      className="
                                                mb-2
                                                flex
                                                items-center
                                                gap-2
                                            "
                                    >
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
                                                  .toUpperCase() ||
                                                "U"}
                                          </div>
                                        )}

                                        <span
                                          className="
                                                    max-w-[200px]
                                                    truncate
                                                    text-sm
                                                    font-semibold
                                                    text-white
                                                "
                                        >
                                                @
                                            {
                                                currentVideo.userName
                                            }
                                            </span>
                                    </div>

                                    {/* TÍTULO */}

                                    <h1
                                      className="
                                                line-clamp-2
                                                text-sm
                                                font-bold
                                                text-white
                                                sm:text-base
                                            "
                                    >
                                        {
                                            currentVideo.title
                                        }
                                    </h1>

                                    {/* DESCRIÇÃO */}

                                    {currentVideo.description && (
                                      <p
                                        className="
                                                    mt-1
                                                    line-clamp-2
                                                    text-xs
                                                    text-white/80
                                                    sm:text-sm
                                                "
                                      >
                                          {
                                              currentVideo.description
                                          }
                                      </p>
                                    )}

                                    {/* ESTATÍSTICAS */}

                                    <div
                                      className="
                                                mt-2
                                                flex
                                                flex-wrap
                                                items-center
                                                gap-2
                                                text-xs
                                                text-white/60
                                            "
                                    >
                                            <span>
                                                {formatNumber(
                                                  currentVideo.viewCount
                                                )}{" "}
                                                visualizações
                                            </span>

                                        <span>
                                                •
                                            </span>

                                        <span>
                                                {formatNumber(
                                                  likeCounts[
                                                    currentVideo
                                                      .id
                                                    ] ??
                                                  currentVideo.likesCount ??
                                                  0
                                                )}{" "}
                                            curtidas
                                            </span>

                                        <span>
                                                •
                                            </span>

                                        <span>
                                                {formatNumber(
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
                                            flex
                                            shrink-0
                                            flex-col
                                            items-center
                                            gap-3
                                        "
                                >
                                    {/* LIKE */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleLike(
                                          currentVideo
                                        )
                                      }
                                      disabled={
                                          !isSignedIn
                                      }
                                      aria-label="Curtir"
                                      className="
                                                flex
                                                flex-col
                                                items-center
                                                gap-1
                                                text-xs
                                                text-white
                                            "
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
                                                  ? "border-red-500/60 bg-red-500/20"
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

                                        <span>
                                                {formatNumber(
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
                                      className="
                                                flex
                                                flex-col
                                                items-center
                                                gap-1
                                                text-xs
                                                text-white
                                            "
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
                                                <MessageSquare className="size-5" />
                                            </span>

                                        <span>
                                                {formatNumber(
                                                  currentVideo.commentsCount ??
                                                  0
                                                )}
                                            </span>
                                    </button>

                                    {/* COMPARTILHAR */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleShare()
                                      }
                                      aria-label="Compartilhar"
                                      className="
                                                flex
                                                flex-col
                                                items-center
                                                gap-1
                                                text-xs
                                                text-white
                                            "
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

                                        <span>
                                                Compartilhar
                                            </span>
                                    </button>
                                </div>
                            </div>
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
                                        z-40
                                        flex
                                        size-10
                                        -translate-y-1/2
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-black/40
                                        text-white
                                        backdrop-blur-md
                                        transition
                                        hover:bg-black/60
                                        active:scale-95
                                    "
                            >
                                <ChevronLeft className="size-6" />
                            </button>
                          )}

                        {(currentIndex <
                          videos.length -
                          1 ||
                          !lastPage) && (
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
                                        z-40
                                        flex
                                        size-10
                                        -translate-y-1/2
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-black/40
                                        text-white
                                        backdrop-blur-md
                                        transition
                                        hover:bg-black/60
                                        active:scale-95
                                    "
                          >
                              <ChevronRight className="size-6" />
                          </button>
                        )}
                    </div>
                </div>
              )}
          </section>

          {/* ====================================================
                LOADING MAIS
            ==================================================== */}

          {loadingMore && (
            <div
              className="
                        pointer-events-none
                        absolute
                        bottom-3
                        left-1/2
                        z-[60]
                        -translate-x-1/2
                        rounded-full
                        bg-black/60
                        px-3
                        py-1.5
                        text-xs
                        text-white
                        backdrop-blur-md
                    "
            >
                Carregando...
            </div>
          )}

          {/* ====================================================
                COMENTÁRIOS
            ==================================================== */}

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
                  setShowComments(false)
                }
              >
                  <div
                    className="
                                relative
                                max-h-[80vh]
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
                      <div
                        className="
                                    flex
                                    items-center
                                    justify-between
                                    border-b
                                    border-border
                                    px-4
                                    py-3
                                "
                      >
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
                                        rounded-full
                                        p-2
                                        text-muted-foreground
                                        transition
                                        hover:bg-secondary
                                    "
                          >
                              <X className="size-5" />
                          </button>
                      </div>

                      <div className="max-h-[calc(80vh-4rem)] overflow-y-auto px-4 pb-6">
                          <VideoComments
                            videoId={
                                currentVideo.id
                            }
                          />
                      </div>
                  </div>
              </div>
            )}
      </main>
    );
}