"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Heart,
  MessageSquare,
  Play,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";

import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";

import type { VideoItem } from "@/lib/videos/types";
import {
  playbackIdFrom,
} from "@/lib/videos/api";
import { formatViews } from "@/lib/videos/format";
import { VideoAvatar } from "./VideoAvatar";

interface MementoFeedProps {
  videos: VideoItem[];
  onEndReached?: () => void;
  onComment?: (
    video: VideoItem
  ) => void;
  onShare?: (
    video: VideoItem
  ) => void;
}

export function MementoFeed({
                              videos,
                              onEndReached,
                              onComment,
                              onShare,
                            }: MementoFeedProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const sentinelRef =
    useRef<HTMLDivElement | null>(null);

  const [activeId, setActiveId] =
    useState<string | null>(
      videos[0]?.id ?? null
    );

  /*
   * ============================================================
   * GARANTIR VÍDEO ATIVO
   * ============================================================
   */

  useEffect(() => {
    if (!videos.length) {
      setActiveId(null);
      return;
    }

    const exists = videos.some(
      (video) =>
        video.id === activeId
    );

    if (!exists) {
      setActiveId(videos[0].id);
    }
  }, [videos, activeId]);

  /*
   * ============================================================
   * PAGINAÇÃO
   * ============================================================
   */

  useEffect(() => {
    const root =
      containerRef.current;

    const sentinel =
      sentinelRef.current;

    if (
      !root ||
      !sentinel ||
      !onEndReached
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            entry?.isIntersecting
          ) {
            onEndReached();
          }
        },
        {
          root,
          threshold: 0.1,
        }
      );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [onEndReached]);

  /*
   * ============================================================
   * DETECTAR SLIDE ATIVO
   * ============================================================
   */

  useEffect(() => {
    const root =
      containerRef.current;

    if (!root || !videos.length) {
      return;
    }

    const slides =
      root.querySelectorAll<HTMLElement>(
        "[data-video-id]"
      );

    if (!slides.length) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          let best:
            | IntersectionObserverEntry
            | null = null;

          for (const entry of entries) {
            if (
              !entry.isIntersecting
            ) {
              continue;
            }

            if (
              !best ||
              entry.intersectionRatio >
              best.intersectionRatio
            ) {
              best = entry;
            }
          }

          if (
            best?.target instanceof
            HTMLElement
          ) {
            const id =
              best.target.dataset
                .videoId;

            if (id) {
              setActiveId(id);
            }
          }
        },
        {
          root,
          threshold: [
            0.25,
            0.5,
            0.75,
            0.9,
          ],
        }
      );

    slides.forEach((slide) => {
      observer.observe(slide);
    });

    return () => {
      observer.disconnect();
    };
  }, [videos]);

  return (
    <main
      ref={containerRef}
      className="
                h-full
                w-full
                overflow-y-auto
                overscroll-y-contain
                snap-y
                snap-mandatory
                bg-black
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
            "
    >
      {videos.map((video) => (
        <MementoSlide
          key={video.id}
          video={video}
          isActive={
            video.id ===
            activeId
          }
          onComment={onComment}
          onShare={onShare}
        />
      ))}

      <div
        ref={sentinelRef}
        className="h-1 w-full shrink-0"
        aria-hidden="true"
      />
    </main>
  );
}

/*
 * ================================================================
 * SLIDE
 * ================================================================
 */

interface MementoSlideProps {
  video: VideoItem;
  isActive: boolean;
  onComment?: (
    video: VideoItem
  ) => void;
  onShare?: (
    video: VideoItem
  ) => void;
}

function MementoSlide({
                        video,
                        isActive,
                        onComment,
                        onShare,
                      }: MementoSlideProps) {
  const playerRef =
    useRef<MuxPlayerElement | null>(
      null
    );

  const [liked, setLiked] =
    useState(
      video.liked ?? false
    );

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isMuted, setIsMuted] =
    useState(true);

  /*
   * ============================================================
   * PLAYBACK ID
   *
   * Nunca enviamos a URL .m3u8 para src.
   *
   * O Mux recebe somente:
   *
   * playbackId="D56..."
   * ============================================================
   */

  const playbackId =
    playbackIdFrom(
      video.videoUrl
    );

  /*
   * ============================================================
   * AUTOPLAY
   * ============================================================
   */

  useEffect(() => {
    const player =
      playerRef.current;

    if (!player) {
      return;
    }

    let cancelled = false;

    const play = async () => {
      if (cancelled) {
        return;
      }

      if (!isActive) {
        try {
          player.pause();
        } catch {
          // Player desmontando.
        }

        setIsPlaying(false);
        return;
      }

      try {
        /*
         * Autoplay sempre começa sem som.
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

    const handleCanPlay =
      () => {
        void play();
      };

    player.addEventListener(
      "canplay",
      handleCanPlay
    );

    void play();

    return () => {
      cancelled = true;

      player.removeEventListener(
        "canplay",
        handleCanPlay
      );

      try {
        player.pause();
      } catch {
        // Ignorar desmontagem.
      }
    };
  }, [isActive]);

  /*
   * ============================================================
   * EVENTOS DO PLAYER
   * ============================================================
   */

  useEffect(() => {
    const player =
      playerRef.current;

    if (!player) {
      return;
    }

    const handlePlay =
      () => {
        setIsPlaying(true);
      };

    const handlePause =
      () => {
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
  }, []);

  /*
   * ============================================================
   * PLAY / PAUSE
   * ============================================================
   */

  const togglePlay =
    useCallback(() => {
      const player =
        playerRef.current;

      if (!player) {
        return;
      }

      if (player.paused) {
        player
          .play()
          .then(() => {
            setIsPlaying(
              true
            );
          })
          .catch(() => {
            setIsPlaying(
              false
            );
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

  const toggleSound =
    useCallback(
      (
        event: React.MouseEvent
      ) => {
        event.stopPropagation();

        const player =
          playerRef.current;

        if (!player) {
          return;
        }

        const muted =
          !player.muted;

        player.muted = muted;

        setIsMuted(muted);

        if (
          !muted &&
          player.paused
        ) {
          player
            .play()
            .then(() => {
              setIsPlaying(
                true
              );
            })
            .catch(() => {
              setIsPlaying(
                false
              );
            });
        }
      },
      []
    );

  /*
   * ============================================================
   * LIKE
   * ============================================================
   */

  const handleLike =
    useCallback(
      (
        event: React.MouseEvent
      ) => {
        event.stopPropagation();

        setLiked(
          (value) =>
            !value
        );
      },
      []
    );

  /*
   * ============================================================
   * COMENTÁRIO
   * ============================================================
   */

  const handleComment =
    useCallback(
      (
        event: React.MouseEvent
      ) => {
        event.stopPropagation();

        onComment?.(video);
      },
      [onComment, video]
    );

  /*
   * ============================================================
   * COMPARTILHAR
   * ============================================================
   */

  const handleShare =
    useCallback(
      async (
        event: React.MouseEvent
      ) => {
        event.stopPropagation();

        if (onShare) {
          onShare(video);
          return;
        }

        const url =
          typeof window !==
          "undefined"
            ? `${window.location.origin}/videos/memento?video=${video.id}`
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
                video.title,
                text:
                  video.description ??
                  video.title,
                url,
              }
            );

            return;
          }

          await navigator.clipboard.writeText(
            url
          );
        } catch {
          // Compartilhamento cancelado.
        }
      },
      [onShare, video]
    );

  /*
   * ============================================================
   * SLIDE
   * ============================================================
   */

  return (
    <section
      data-video-id={video.id}
      className="
                relative
                flex
                h-full
                min-h-full
                w-full
                snap-start
                snap-always
                items-center
                justify-center
                bg-black
            "
    >
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
        onClick={togglePlay}
        role="button"
        tabIndex={0}
        aria-label={
          isPlaying
            ? "Pausar vídeo"
            : "Reproduzir vídeo"
        }
        onKeyDown={(
          event
        ) => {
          if (
            event.key ===
            "Enter" ||
            event.key ===
            " "
          ) {
            event.preventDefault();
            togglePlay();
          }
        }}
      >
        {/* =================================================
                    MUX
                ================================================= */}

        {playbackId ? (
          <MuxPlayer
            ref={playerRef}
            playbackId={
              playbackId
            }
            metadata={{
              video_title:
              video.title,
            }}
            poster={
              video.thumbnailUrl ||
              undefined
            }
            autoPlay="muted"
            muted
            loop
            playsInline
            preload={
              isActive
                ? "auto"
                : "metadata"
            }
            className="
                            h-full
                            w-full
                        "
          />
        ) : video.thumbnailUrl ? (
          <img
            src={
              video.thumbnailUrl
            }
            alt={video.title}
            className="
                            h-full
                            w-full
                            object-cover
                        "
          />
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

        {playbackId && (
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
                ================================================= */}

        {!isPlaying &&
          playbackId && (
            <div
              className="
                                pointer-events-none
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
            </div>
          )}

        {/* =================================================
                    CONTEÚDO
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
            {/* =================================================
                            INFORMAÇÕES
                        ================================================= */}

            <div
              className="
                                min-w-0
                                flex-1
                            "
            >
              <div
                className="
                                    mb-2
                                    flex
                                    items-center
                                    gap-2
                                "
              >
                <VideoAvatar
                  name={
                    video.userName
                  }
                  url={
                    video.userAvatarUrl
                  }
                  className="size-9"
                />

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
                    video.userName
                  }
                                </span>
              </div>

              <h2
                className="
                                    line-clamp-2
                                    text-sm
                                    font-bold
                                    text-white
                                    sm:text-base
                                "
              >
                {
                  video.title
                }
              </h2>

              {video.description && (
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
                    video.description
                  }
                </p>
              )}

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
                                    {formatViews(
                                      video.viewCount
                                    )}{" "}
                                  visualizações
                                </span>

                <span>
                                    •
                                </span>

                <span>
                                    {formatViews(
                                      video.likesCount ??
                                      0
                                    )}{" "}
                  curtidas
                                </span>

                <span>
                                    •
                                </span>

                <span>
                                    {formatViews(
                                      video.commentsCount ??
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
                                gap-4
                            "
              onClick={(
                event
              ) => {
                event.stopPropagation();
              }}
            >
              <FloatingAction
                label="Curtir"
                active={
                  liked
                }
                onClick={
                  handleLike
                }
                icon={
                  <Heart
                    className={
                      liked
                        ? "size-5 fill-red-500 text-red-500"
                        : "size-5 text-white"
                    }
                  />
                }
                value={formatViews(
                  (video.likesCount ??
                    0) +
                  (liked &&
                  !video.liked
                    ? 1
                    : 0)
                )}
              />

              <FloatingAction
                label="Comentar"
                onClick={
                  handleComment
                }
                icon={
                  <MessageSquare className="size-5 text-white" />
                }
                value={formatViews(
                  video.commentsCount ??
                  0
                )}
              />

              <FloatingAction
                label="Compartilhar"
                onClick={
                  handleShare
                }
                icon={
                  <Share2 className="size-5 text-white" />
                }
                value=""
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/*
 * ================================================================
 * BOTÃO FLUTUANTE
 * ================================================================
 */

interface FloatingActionProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  active?: boolean;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

function FloatingAction({
                          icon,
                          label,
                          value,
                          active,
                          onClick,
                        }: FloatingActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="
                flex
                flex-col
                items-center
                gap-1
                text-xs
                text-white
                transition
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
                    transition
                    hover:bg-black/60
                    active:scale-95
                "
            >
                {icon}
            </span>

      {value && (
        <span
          className="
                        tabular-nums
                        text-white
                    "
        >
                    {value}
                </span>
      )}
    </button>
  );
}