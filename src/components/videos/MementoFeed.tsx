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
  Share2,
  Play,
} from "lucide-react";

import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";

import type { VideoItem } from "@/lib/videos/types";
import { formatViews } from "@/lib/videos/format";
import { VideoAvatar } from "./VideoAvatar";

interface MementoFeedProps {
  videos: VideoItem[];
  onEndReached?: () => void;
}

export function MementoFeed({
                              videos,
                              onEndReached,
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
   * MANTER ACTIVE ID CORRETO QUANDO A LISTA MUDA
   * ============================================================
   */

  useEffect(() => {
    if (!videos.length) {
      setActiveId(null);
      return;
    }

    const activeStillExists = videos.some(
      (video) => video.id === activeId
    );

    if (!activeStillExists) {
      setActiveId(videos[0].id);
    }
  }, [videos, activeId]);

  /*
   * ============================================================
   * PAGINAÇÃO
   * ============================================================
   */

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = containerRef.current;

    if (!sentinel || !root || !onEndReached) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (entry?.isIntersecting) {
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
   * DESCOBRIR VÍDEO ATIVO
   * ============================================================
   */

  useEffect(() => {
    const root = containerRef.current;

    if (!root) {
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
          let bestEntry:
            | IntersectionObserverEntry
            | null = null;

          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }

            if (
              !bestEntry ||
              entry.intersectionRatio >
              bestEntry.intersectionRatio
            ) {
              bestEntry = entry;
            }
          }

          if (
            bestEntry?.target instanceof HTMLElement
          ) {
            const id =
              bestEntry.target.dataset.videoId;

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

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div
      ref={containerRef}
      className="
        h-full
        w-full
        snap-y
        snap-mandatory
        overflow-y-auto
        overscroll-y-contain
        bg-black
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {videos.map((video) => (
        <MementoSlide
          key={video.id}
          video={video}
          isActive={video.id === activeId}
        />
      ))}

      <div
        ref={sentinelRef}
        className="h-1 w-full shrink-0"
        aria-hidden="true"
      />
    </div>
  );
}

/*
 * ================================================================
 * MEMENTO SLIDE
 * ================================================================
 */

function MementoSlide({
                        video,
                        isActive,
                      }: {
  video: VideoItem;
  isActive: boolean;
}) {
  const playerRef =
    useRef<MuxPlayerElement>(null);

  const [liked, setLiked] =
    useState(video.liked ?? false);

  const [isPlaying, setIsPlaying] =
    useState(false);

  /*
   * ============================================================
   * AUTOPLAY DO MUX
   * ============================================================
   *
   * Quando o slide fica ativo:
   *
   * 1. muted = true
   * 2. tenta play()
   * 3. se ainda estiver carregando, canplay tenta novamente
   *
   * Quando deixa de ser ativo:
   *
   * pause()
   */

  useEffect(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    let cancelled = false;

    const attemptPlay = async () => {
      if (cancelled) {
        return;
      }

      if (!isActive) {
        player.pause();
        setIsPlaying(false);
        return;
      }

      try {
        player.muted = true;

        await player.play();

        if (!cancelled) {
          setIsPlaying(true);
        }
      } catch {
        /*
         * O Mux pode ainda estar carregando.
         * canplay fará nova tentativa.
         */
      }
    };

    const handleCanPlay = () => {
      if (!isActive || cancelled) {
        return;
      }

      player.muted = true;

      player
        .play()
        .then(() => {
          if (!cancelled) {
            setIsPlaying(true);
          }
        })
        .catch(() => {
          /*
           * Sem erro fatal.
           */
        });
    };

    if (isActive) {
      player.muted = true;

      player.addEventListener(
        "canplay",
        handleCanPlay
      );

      attemptPlay();
    } else {
      player.pause();
      setIsPlaying(false);
    }

    return () => {
      cancelled = true;

      player.removeEventListener(
        "canplay",
        handleCanPlay
      );

      if (!isActive) {
        player.pause();
      }
    };
  }, [isActive]);

  /*
   * ============================================================
   * SINCRONIZAR ESTADO COM MUX
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
  }, []);

  /*
   * ============================================================
   * PLAY / PAUSE MANUAL
   * ============================================================
   */

  const togglePlayPause =
    useCallback(() => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      player.muted = true;

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
   * RENDER
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
          lg:rounded-xl
          lg:border
          lg:border-border
        "
        onClick={togglePlayPause}
        role="button"
        tabIndex={0}
        aria-label={
          isPlaying
            ? "Pausar vídeo"
            : "Reproduzir vídeo"
        }
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            togglePlayPause();
          }
        }}
      >
        {video.videoUrl ? (
          <MuxPlayer
            ref={playerRef}
            src={video.videoUrl}
            metadata={{
              video_title: video.title,
            }}
            poster={video.thumbnailUrl}
            loop
            playsInline
            muted
            autoPlay={
              isActive ? "muted" : false
            }
            preload={
              isActive
                ? "auto"
                : "metadata"
            }
            className="
              mux-player-cover
              h-full
              w-full
            "
          />
        ) : video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt=""
            className="
              h-full
              w-full
              object-cover
            "
            loading="lazy"
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-secondary
            "
          >
            <Play
              className="
                size-10
                text-muted-foreground
              "
              aria-hidden="true"
            />
          </div>
        )}

        {/* =====================================================
            PLAY CENTRAL
        ===================================================== */}

        {!isPlaying &&
          video.videoUrl && (
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                z-10
                flex
                items-center
                justify-center
              "
            >
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-black/50
                  backdrop-blur
                "
              >
                <Play
                  className="
                    h-8
                    w-8
                    text-white
                  "
                  fill="white"
                />
              </div>
            </div>
          )}

        {/* =====================================================
            GRADIENTE
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-20
            bg-gradient-to-t
            from-black/90
            via-black/40
            to-transparent
            p-5
            pb-8
          "
        >
          <div className="flex items-center gap-2">
            <VideoAvatar
              name={video.userName}
              url={video.userAvatarUrl}
              className="size-8"
            />

            <span className="text-sm font-medium text-white">
              {video.userName}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 max-w-lg text-sm text-white/85">
            {video.description ??
              video.title}
          </p>
        </div>

        {/* =====================================================
            AÇÕES
        ===================================================== */}

        <div
          className="
            absolute
            bottom-24
            right-4
            z-30
            flex
            flex-col
            items-center
            gap-4
            lg:bottom-8
          "
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <FloatingAction
            label="Curtir"
            active={liked}
            onClick={() =>
              setLiked(
                (value) => !value
              )
            }
            icon={
              <Heart
                className={
                  liked
                    ? "size-5 fill-primary text-primary"
                    : "size-5"
                }
              />
            }
            value={formatViews(
              (video.likesCount ?? 0) +
              (liked &&
              !video.liked
                ? 1
                : 0)
            )}
          />

          <FloatingAction
            label="Comentar"
            icon={
              <MessageSquare className="size-5" />
            }
            value=""
          />

          <FloatingAction
            label="Compartilhar"
            icon={
              <Share2 className="size-5" />
            }
            value=""
          />
        </div>
      </div>
    </section>
  );
}

/*
 * ================================================================
 * BOTÃO
 * ================================================================
 */

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
      className="
        flex
        flex-col
        items-center
        gap-1
        text-xs
        text-white
        transition-colors
        hover:text-white
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
          backdrop-blur-sm
        "
      >
        {icon}
      </span>

      {value && (
        <span className="tabular-nums">
          {value}
        </span>
      )}
    </button>
  );
}
