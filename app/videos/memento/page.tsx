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

import type { VideoItem } from "@/lib/videos/types";
import { formatViews } from "@/lib/videos/format";

interface MementoFeedProps {
    videos: VideoItem[];
    onEndReached?: () => void;
    onComment?: (video: VideoItem) => void;
    onShare?: (video: VideoItem) => void;
}

export function MementoFeed({
                                videos,
                                onEndReached,
                                onComment,
                                onShare,
                            }: MementoFeedProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const [activeId, setActiveId] = useState<string | null>(
      videos[0]?.id ?? null
    );

    /*
     * ============================================================
     * GARANTE QUE O VÍDEO ATIVO EXISTE
     * ============================================================
     */

    useEffect(() => {
        if (videos.length === 0) {
            setActiveId(null);
            return;
        }

        const exists = videos.some(
          (video) => video.id === activeId
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
        const container = containerRef.current;
        const sentinel = sentinelRef.current;

        if (!container || !sentinel || !onEndReached) {
            return;
        }

        const observer = new IntersectionObserver(
          (entries) => {
              const entry = entries[0];

              if (entry?.isIntersecting) {
                  onEndReached();
              }
          },
          {
              root: container,
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
     * DETECTA O SLIDE VISÍVEL
     * ============================================================
     */

    useEffect(() => {
        const container = containerRef.current;

        if (!container || videos.length === 0) {
            return;
        }

        const slides =
          container.querySelectorAll<HTMLElement>(
            "[data-video-id]"
          );

        if (slides.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
          (entries) => {
              let bestEntry: IntersectionObserverEntry | null =
                null;

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
                bestEntry &&
                bestEntry.target instanceof HTMLElement
              ) {
                  const id =
                    bestEntry.target.dataset.videoId;

                  if (id) {
                      setActiveId(id);
                  }
              }
          },
          {
              root: container,
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
      <main
        ref={containerRef}
        className="
                h-full
                w-full
                overflow-y-auto
                overscroll-y-contain
                snap-y
                snap-mandatory
                bg-background
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
            "
      >
          {videos.map((video) => (
            <MementoSlide
              key={video.id}
              video={video}
              isActive={video.id === activeId}
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
    onComment?: (video: VideoItem) => void;
    onShare?: (video: VideoItem) => void;
}

function MementoSlide({
                          video,
                          isActive,
                          onComment,
                          onShare,
                      }: MementoSlideProps) {
    const videoRef =
      useRef<HTMLVideoElement | null>(null);

    const [isPlaying, setIsPlaying] =
      useState(false);

    const [isMuted, setIsMuted] =
      useState(true);

    const [liked, setLiked] =
      useState(video.liked ?? false);

    /*
     * ============================================================
     * AUTOPLAY
     * ============================================================
     */

    useEffect(() => {
        const element = videoRef.current;

        if (!element) {
            return;
        }

        if (!isActive) {
            element.pause();
            setIsPlaying(false);
            return;
        }

        element.muted = true;
        setIsMuted(true);

        let cancelled = false;

        const playVideo = async () => {
            if (cancelled) {
                return;
            }

            try {
                await element.play();

                if (!cancelled) {
                    setIsPlaying(true);
                }
            } catch {
                if (!cancelled) {
                    setIsPlaying(false);
                }
            }
        };

        if (element.readyState >= 2) {
            void playVideo();
        } else {
            const handleCanPlay = () => {
                void playVideo();
            };

            element.addEventListener(
              "canplay",
              handleCanPlay,
              { once: true }
            );

            return () => {
                cancelled = true;

                element.removeEventListener(
                  "canplay",
                  handleCanPlay
                );
            };
        }

        return () => {
            cancelled = true;
        };
    }, [isActive]);

    /*
     * ============================================================
     * LIMPEZA
     * ============================================================
     */

    useEffect(() => {
        return () => {
            const element = videoRef.current;

            if (element) {
                element.pause();
            }
        };
    }, []);

    /*
     * ============================================================
     * PLAY / PAUSE
     * ============================================================
     */

    const togglePlayPause = useCallback(
      (event?: React.MouseEvent) => {
          event?.stopPropagation();

          const element = videoRef.current;

          if (!element) {
              return;
          }

          if (element.paused) {
              element
                .play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(() => {
                    setIsPlaying(false);
                });
          } else {
              element.pause();
              setIsPlaying(false);
          }
      },
      []
    );

    /*
     * ============================================================
     * SOM
     * ============================================================
     */

    const toggleSound = useCallback(
      (event: React.MouseEvent) => {
          event.stopPropagation();

          const element = videoRef.current;

          if (!element) {
              return;
          }

          const newMuted = !element.muted;

          element.muted = newMuted;
          setIsMuted(newMuted);

          /*
           * Se o usuário ativar o som e o vídeo estiver
           * pausado, inicia a reprodução.
           */

          if (!newMuted && element.paused) {
              element
                .play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(() => {
                    setIsPlaying(false);
                });
          }
      },
      []
    );

    /*
     * ============================================================
     * LIKE
     *
     * Aqui mantém apenas o estado visual.
     * A API real de like continua podendo ser controlada
     * pela página.
     * ============================================================
     */

    const handleLike = useCallback(
      (event: React.MouseEvent) => {
          event.stopPropagation();

          setLiked((current) => !current);
      },
      []
    );

    /*
     * ============================================================
     * COMENTÁRIOS
     * ============================================================
     */

    const handleComment = useCallback(
      (event: React.MouseEvent) => {
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

    const handleShare = useCallback(
      async (event: React.MouseEvent) => {
          event.stopPropagation();

          if (onShare) {
              onShare(video);
              return;
          }

          const url =
            typeof window !== "undefined"
              ? `${window.location.origin}/videos/watch/${video.id}`
              : "";

          if (!url) {
              return;
          }

          try {
              if (navigator.share) {
                  await navigator.share({
                      title: video.title,
                      text:
                        video.description ??
                        video.title,
                      url,
                  });

                  return;
              }

              if (navigator.clipboard) {
                  await navigator.clipboard.writeText(
                    url
                  );
              }
          } catch {
              /*
               * Usuário cancelou o compartilhamento.
               */
          }
      },
      [onShare, video]
    );

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
                h-full
                min-h-full
                w-full
                snap-start
                snap-always
                flex
                items-center
                justify-center
            "
      >
          <div
            className="
                    relative
                    h-full
                    w-full
                    overflow-hidden
                    bg-black

                    sm:h-full
                    sm:w-full

                    lg:h-full
                    lg:w-auto
                    lg:aspect-[9/16]
                    lg:max-h-full
                    lg:rounded-xl
                    lg:border
                    lg:border-border
                "
          >
              {/* =================================================
                    VÍDEO
                ================================================= */}

              {video.videoUrl ? (
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            bg-black
                            object-cover
                        "
                  playsInline
                  loop
                  muted
                  preload={
                      isActive
                        ? "auto"
                        : "metadata"
                  }
                  onClick={
                      togglePlayPause
                  }
                  onPlay={() =>
                    setIsPlaying(true)
                  }
                  onPause={() =>
                    setIsPlaying(false)
                  }
                />
              ) : video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="
                            absolute
                            inset-0
                            h-full
                            w-full
                            object-cover
                        "
                />
              ) : (
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
                    <Play className="size-10 text-white/60" />
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
                        z-10
                        h-72
                        bg-gradient-to-t
                        from-black/95
                        via-black/50
                        to-transparent
                    "
              />

              {/* =================================================
                    BOTÃO DE SOM
                ================================================= */}

              {video.videoUrl && (
                <button
                  type="button"
                  onClick={toggleSound}
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
                video.videoUrl && (
                  <button
                    type="button"
                    onClick={
                        togglePlayPause
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
                                  className="ml-1 size-8"
                                  fill="white"
                                />
                            </span>
                  </button>
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
                        z-20
                        p-4
                        pb-6

                        sm:p-5
                        sm:pb-7

                        lg:p-5
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
                          {/* USUÁRIO */}

                          <div
                            className="
                                    mb-2
                                    flex
                                    items-center
                                    gap-2
                                "
                          >
                              <div
                                className="
                                        size-9
                                        shrink-0
                                        overflow-hidden
                                        rounded-full
                                        border-2
                                        border-white/40
                                        bg-secondary
                                    "
                              >
                                  {video.userAvatarUrl ? (
                                    <img
                                      src={
                                          video.userAvatarUrl
                                      }
                                      alt=""
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
                                                text-sm
                                                font-semibold
                                                text-white
                                            "
                                    >
                                        {video.userName
                                            ?.charAt(
                                              0
                                            )
                                            .toUpperCase() ||
                                          "U"}
                                    </div>
                                  )}
                              </div>

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
                                  {video.userName}
                                </span>
                          </div>

                          {/* TÍTULO */}

                          <h2
                            className="
                                    line-clamp-2
                                    text-sm
                                    font-bold
                                    text-white

                                    sm:text-base
                                "
                          >
                              {video.title}
                          </h2>

                          {/* DESCRIÇÃO */}

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
                                {video.description}
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
                                    {formatViews(
                                      video.viewCount
                                    )}{" "}
                                    visualizações
                                </span>

                              <span>•</span>

                              <span>
                                    {formatViews(
                                      video.likesCount ??
                                      0
                                    )}{" "}
                                  curtidas
                                </span>

                              <span>•</span>

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
                      >
                          {/* LIKE */}

                          <FloatingAction
                            label="Curtir"
                            active={liked}
                            onClick={
                                handleLike
                            }
                            icon={
                                <Heart
                                  className={
                                      liked
                                        ? "size-5 fill-primary text-primary"
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

                          {/* COMENTÁRIOS */}

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

                          {/* COMPARTILHAR */}

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