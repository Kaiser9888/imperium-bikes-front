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
    Volume2,
    VolumeX,
} from "lucide-react";

import type { VideoItem } from "@/lib/videos/types";
import { formatViews } from "@/lib/videos/format";

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
     * PAGINAÇÃO
     * ============================================================
     */

    useEffect(() => {
        const container = containerRef.current;
        const sentinel = sentinelRef.current;

        if (
          !container ||
          !sentinel ||
          !onEndReached
        ) {
            return;
        }

        const observer =
          new IntersectionObserver(
            (entries) => {
                if (
                  entries[0]?.isIntersecting
                ) {
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
     * DESCOBRE QUAL VÍDEO ESTÁ VISÍVEL
     * ============================================================
     */

    useEffect(() => {
        const container =
          containerRef.current;

        if (
          !container ||
          videos.length === 0
        ) {
            return;
        }

        const slides =
          container.querySelectorAll<HTMLElement>(
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
                    if (
                      !entry.isIntersecting
                    ) {
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
                  bestEntry?.target instanceof
                  HTMLElement
                ) {
                    const id =
                      bestEntry.target.dataset
                        .videoId;

                    if (id) {
                        setActiveId(id);
                    }
                }
            },
            {
                root: container,
                threshold: [
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
     * GARANTE QUE O ACTIVE ID CONTINUE VÁLIDO
     * ============================================================
     */

    useEffect(() => {
        if (
          !activeId ||
          !videos.some(
            (video) =>
              video.id === activeId
          )
        ) {
            setActiveId(
              videos[0]?.id ?? null
            );
        }
    }, [videos, activeId]);

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
                bg-background

                [scrollbar-width:none]

                [&::-webkit-scrollbar]:hidden
            "
      >
          {videos.map((video) => (
            <MementoSlide
              key={video.id}
              video={video}
              isActive={
                video.id === activeId
              }
            />
          ))}

          <div
            ref={sentinelRef}
            className="
                    h-1
                    w-full
                    shrink-0
                "
            aria-hidden="true"
          />
      </div>
    );
}

/*
 * ================================================================
 * SLIDE
 * ================================================================
 */

function MementoSlide({
                          video,
                          isActive,
                      }: {
    video: VideoItem;
    isActive: boolean;
}) {
    const videoRef =
      useRef<HTMLVideoElement | null>(
        null
      );

    const [isPlaying, setIsPlaying] =
      useState(false);

    const [isMuted, setIsMuted] =
      useState(true);

    const [liked, setLiked] =
      useState(
        video.liked ?? false
      );

    /*
     * ============================================================
     * AUTOPLAY
     *
     * SOMENTE O VÍDEO ATIVO TOCA.
     *
     * Não usamos currentTime = 0.
     * Não reiniciamos o vídeo repetidamente.
     * ============================================================
     */

    useEffect(() => {
        const videoElement =
          videoRef.current;

        if (!videoElement) {
            return;
        }

        /*
         * Se deixou de ser o vídeo ativo,
         * pausa.
         */

        if (!isActive) {
            videoElement.pause();
            setIsPlaying(false);
            return;
        }

        /*
         * Autoplay sempre começa mutado.
         */

        videoElement.muted = true;

        setIsMuted(true);

        const playVideo = async () => {
            try {
                await videoElement.play();

                setIsPlaying(true);
            } catch {
                /*
                 * Alguns navegadores podem
                 * bloquear autoplay.
                 *
                 * Nesse caso o botão central
                 * continua disponível.
                 */

                setIsPlaying(false);
            }
        };

        /*
         * Se já temos dados suficientes,
         * tenta tocar imediatamente.
         */

        if (
          videoElement.readyState >= 2
        ) {
            void playVideo();

            return;
        }

        /*
         * Caso contrário, espera o vídeo
         * estar pronto.
         */

        const handleCanPlay =
          () => {
              void playVideo();
          };

        videoElement.addEventListener(
          "canplay",
          handleCanPlay,
          {
              once: true,
          }
        );

        return () => {
            videoElement.removeEventListener(
              "canplay",
              handleCanPlay
            );
        };
    }, [isActive]);

    /*
     * ============================================================
     * LIMPEZA
     * ============================================================
     */

    useEffect(() => {
        return () => {
            const videoElement =
              videoRef.current;

            if (videoElement) {
                videoElement.pause();
            }
        };
    }, []);

    /*
     * ============================================================
     * PLAY / PAUSE
     * ============================================================
     */

    const togglePlayPause =
      useCallback(() => {
          const videoElement =
            videoRef.current;

          if (!videoElement) {
              return;
          }

          if (
            videoElement.paused
          ) {
              videoElement
                .play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(() => {
                    setIsPlaying(false);
                });
          } else {
              videoElement.pause();

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

            const videoElement =
              videoRef.current;

            if (!videoElement) {
                return;
            }

            const newMuted =
              !videoElement.muted;

            videoElement.muted =
              newMuted;

            setIsMuted(newMuted);

            /*
             * Se o usuário ativou o som
             * enquanto estava pausado,
             * inicia o vídeo.
             */

            if (
              !newMuted &&
              videoElement.paused
            ) {
                videoElement
                  .play()
                  .then(() => {
                      setIsPlaying(
                        true
                      );
                  })
                  .catch(() => {});
            }
        },
        []
      );

    /*
     * ============================================================
     * LIKE
     *
     * Aqui é apenas o estado visual.
     * Sua API de like pode continuar sendo
     * integrada no page.
     * ============================================================
     */

    const handleLike =
      useCallback(
        (
          event: React.MouseEvent
        ) => {
            event.stopPropagation();

            setLiked(
              (value) => !value
            );
        },
        []
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
                flex
                h-full
                w-full
                snap-start
                snap-always
                items-center
                justify-center
            "
      >
          {/*
             * ==================================================
             * CONTAINER VERTICAL
             *
             * Celular:
             * ocupa toda a área.
             *
             * Desktop:
             * mantém 9:16.
             * ==================================================
             */}

          <div
            className="
                    relative
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    overflow-hidden
                    bg-black

                    lg:h-full
                    lg:w-auto
                    lg:aspect-[9/16]
                    lg:max-h-full
                    lg:rounded-xl
                    lg:border
                    lg:border-border
                "
          >
              {/*
                 * ==================================================
                 * VÍDEO
                 * ==================================================
                 */}

              {video.videoUrl ? (
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  poster={
                      video.thumbnailUrl
                  }
                  className="
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
                    setIsPlaying(
                      true
                    )
                  }
                  onPause={() =>
                    setIsPlaying(
                      false
                    )
                  }
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
                    <Play className="size-10 text-white/60" />
                </div>
              )}

              {/*
                 * ==================================================
                 * GRADIENTE
                 * ==================================================
                 */}

              <div
                className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        bottom-0
                        z-10
                        h-64
                        bg-gradient-to-t
                        from-black/90
                        via-black/40
                        to-transparent
                    "
              />

              {/*
                 * ==================================================
                 * BOTÃO DE SOM
                 *
                 * IMPORTANTE:
                 * este botão NÃO pausa o vídeo.
                 * ==================================================
                 */}

              {video.videoUrl && (
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
                            z-30
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

              {/*
                 * ==================================================
                 * BOTÃO PLAY CENTRAL
                 *
                 * Só aparece quando pausado.
                 * ==================================================
                 */}

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

              {/*
                 * ==================================================
                 * CONTEÚDO INFERIOR
                 * ==================================================
                 */}

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
                    "
              >
                  <div
                    className="
                            flex
                            items-end
                            gap-3
                        "
                  >
                      {/*
                         * ==================================================
                         * INFORMAÇÕES DO VÍDEO
                         * ==================================================
                         */}

                      <div
                        className="
                                min-w-0
                                flex-1
                            "
                      >
                          {/*
                             * USUÁRIO
                             */}

                          <div
                            className="
                                    mb-2
                                    flex
                                    items-center
                                    gap-2
                                "
                          >
                              {/*
                                 * AVATAR SEM COMPONENTE EXTERNO
                                 */}

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

                          {/*
                             * TÍTULO
                             */}

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

                          {/*
                             * DESCRIÇÃO
                             */}

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

                          {/*
                             * ESTATÍSTICAS
                             */}

                          <div
                            className="
                                    mt-2
                                    flex
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
                          </div>
                      </div>

                      {/*
                         * ==================================================
                         * AÇÕES
                         * ==================================================
                         */}

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
                        ) =>
                          event.stopPropagation()
                        }
                      >
                          {/*
                             * LIKE
                             */}

                          <FloatingAction
                            label="Curtir"
                            active={liked}
                            onClick={
                                handleLike
                            }
                            icon={
                                <Heart
                                  className={`
                                            size-5

                                            ${
                                    liked
                                      ? "fill-primary text-primary"
                                      : "text-white"
                                  }
                                        `}
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

                          {/*
                             * COMENTÁRIOS
                             */}

                          <FloatingAction
                            label="Comentar"
                            icon={
                                <MessageSquare
                                  className="
                                            size-5
                                            text-white
                                        "
                                />
                            }
                            value={formatViews(
                              video.commentsCount ??
                              0
                            )}
                          />

                          {/*
                             * COMPARTILHAR
                             */}

                          <FloatingAction
                            label="Compartilhar"
                            icon={
                                <Share2
                                  className="
                                            size-5
                                            text-white
                                        "
                                />
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
    onClick?: (
      event: React.MouseEvent
    ) => void;
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