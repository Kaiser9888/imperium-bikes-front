"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    MessageCircle,
    Search,
    Share2,
    Volume2,
    VolumeX,
    Play,
    X,
} from "lucide-react";

import { VideoComments } from "@/components/videos/VideoComments";

const API_URL = "https://imperium-bikes.onrender.com";

interface MementoItem {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    durationSeconds: number;
    viewCount: number;
    likesCount: number;
    commentsCount: number;
    userName: string;
    userAvatarUrl: string;
    userId: string;
}

interface VideosResponse {
    content?: MementoItem[];
}

export default function MementoPage() {
    const {
        getToken,
        userId: currentUserId,
        isSignedIn,
    } = useAuth();

    const [momentos, setMomentos] = useState<MementoItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const [liked, setLiked] = useState<
      Record<string, boolean>
    >({});

    const [likeCounts, setLikeCounts] = useState<
      Record<string, number>
    >({});

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

    const touchStartY =
      useRef<number | null>(null);

    const touchStartX =
      useRef<number | null>(null);

    const isChangingVideo =
      useRef(false);

    /*
     * ============================================================
     * CARREGAR MEMENTOS
     * ============================================================
     */

    useEffect(() => {
        let cancelled = false;

        const controller = new AbortController();

        const timeout = window.setTimeout(() => {
            controller.abort();
        }, 10000);

        const fetchMomentos = async () => {
            try {
                setLoading(true);
                setLoadError(false);

                const response = await fetch(
                  `${API_URL}/api/videos?page=0&size=20&isShort=true`,
                  {
                      method: "GET",
                      headers: {
                          Accept: "application/json",
                      },
                      cache: "no-store",
                      signal: controller.signal,
                  }
                );

                if (!response.ok) {
                    throw new Error(
                      `Erro HTTP ${response.status}`
                    );
                }

                const data =
                  (await response.json()) as VideosResponse;

                if (cancelled) {
                    return;
                }

                const items = Array.isArray(data.content)
                  ? data.content
                  : [];

                setMomentos(items);

                const counts: Record<string, number> =
                  {};

                const initialLiked: Record<
                  string,
                  boolean
                > = {};

                for (const item of items) {
                    counts[item.id] =
                      Number(item.likesCount) || 0;

                    initialLiked[item.id] = false;
                }

                setLikeCounts(counts);
                setLiked(initialLiked);
                setCurrentIndex(0);
            } catch {
                if (!cancelled) {
                    setLoadError(true);
                    setMomentos([]);
                }
            } finally {
                window.clearTimeout(timeout);

                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void fetchMomentos();

        return () => {
            cancelled = true;
            controller.abort();
            window.clearTimeout(timeout);
        };
    }, []);

    /*
     * ============================================================
     * VÍDEO ATUAL
     * ============================================================
     */

    const currentVideo =
      momentos[currentIndex] ?? null;

    /*
     * ============================================================
     * PARAR VÍDEO
     * ============================================================
     */

    const stopCurrentVideo = useCallback(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        video.pause();

        try {
            video.currentTime = 0;
        } catch {
            // Alguns navegadores podem bloquear currentTime
        }

        setIsPlaying(false);
    }, []);

    /*
     * ============================================================
     * REPRODUZIR VÍDEO
     * ============================================================
     */

    const playCurrentVideo = useCallback(
      async (withSound = false) => {
          const video = videoRef.current;

          if (!video) {
              return;
          }

          try {
              video.muted = !withSound;

              if (withSound) {
                  setIsMuted(false);
              } else {
                  setIsMuted(true);
              }

              await video.play();

              setIsPlaying(true);
              setVideoError(false);
          } catch {
              setIsPlaying(false);
          }
      },
      []
    );

    /*
     * ============================================================
     * TROCAR VÍDEO
     * ============================================================
     */

    const changeVideo = useCallback(
      (newIndex: number) => {
          if (isChangingVideo.current) {
              return;
          }

          if (
            newIndex < 0 ||
            newIndex >= momentos.length
          ) {
              return;
          }

          if (newIndex === currentIndex) {
              return;
          }

          isChangingVideo.current = true;

          stopCurrentVideo();

          setVideoError(false);
          setIsMuted(true);
          setCurrentIndex(newIndex);

          window.setTimeout(() => {
              isChangingVideo.current = false;
          }, 250);
      },
      [
          momentos.length,
          currentIndex,
          stopCurrentVideo,
      ]
    );

    /*
     * ============================================================
     * PRÓXIMO
     * ============================================================
     */

    const nextVideo = useCallback(() => {
        if (
          currentIndex <
          momentos.length - 1
        ) {
            changeVideo(currentIndex + 1);
        }
    }, [
        currentIndex,
        momentos.length,
        changeVideo,
    ]);

    /*
     * ============================================================
     * ANTERIOR
     * ============================================================
     */

    const prevVideo = useCallback(() => {
        if (currentIndex > 0) {
            changeVideo(currentIndex - 1);
        }
    }, [currentIndex, changeVideo]);

    /*
     * ============================================================
     * PREPARAR NOVO VÍDEO
     * ============================================================
     */

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !currentVideo) {
            return;
        }

        setIsPlaying(false);
        setIsMuted(true);
        setVideoError(false);

        video.muted = true;

        const tryAutoplay = async () => {
            try {
                await video.play();
                setIsPlaying(true);
            } catch {
                /*
                 * O navegador pode bloquear autoplay.
                 * Nesse caso o usuário poderá tocar no vídeo.
                 */
                setIsPlaying(false);
            }
        };

        const handleCanPlay = () => {
            void tryAutoplay();
        };

        video.addEventListener(
          "canplay",
          handleCanPlay
        );

        if (video.readyState >= 2) {
            void tryAutoplay();
        }

        return () => {
            video.removeEventListener(
              "canplay",
              handleCanPlay
            );

            video.pause();
        };
    }, [currentVideo]);

    /*
     * ============================================================
     * PLAY / PAUSE
     * ============================================================
     */

    const togglePlayPause = useCallback(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        if (video.paused) {
            void playCurrentVideo(false);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, [playCurrentVideo]);

    /*
     * ============================================================
     * SOM
     * ============================================================
     */

    const toggleSound = useCallback(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        const nextMuted = !video.muted;

        video.muted = nextMuted;

        setIsMuted(nextMuted);

        /*
         * Quando o usuário ativa o som, também
         * garantimos que o vídeo esteja reproduzindo.
         */
        if (!nextMuted && video.paused) {
            video
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
     * LIKE
     * ============================================================
     */

    const toggleLike = useCallback(
      async (videoId: string) => {
          if (
            !isSignedIn ||
            !currentUserId
          ) {
              return;
          }

          const previousLiked =
            liked[videoId] ?? false;

          const previousCount =
            likeCounts[videoId] ?? 0;

          const nextLiked =
            !previousLiked;

          const nextCount = Math.max(
            0,
            previousCount +
            (nextLiked ? 1 : -1)
          );

          /*
           * Atualização otimista.
           */
          setLiked((previous) => ({
              ...previous,
              [videoId]: nextLiked,
          }));

          setLikeCounts((previous) => ({
              ...previous,
              [videoId]: nextCount,
          }));

          try {
              const token =
                await getToken();

              if (!token) {
                  throw new Error(
                    "Token de autenticação indisponível."
                  );
              }

              const response =
                await fetch(
                  `${API_URL}/api/videos/${encodeURIComponent(
                    videoId
                  )}/like`,
                  {
                      method: "POST",
                      headers: {
                          Authorization: `Bearer ${token}`,
                          Accept:
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
                (await response.json()) as {
                    liked?: boolean;
                    likesCount?: number;
                    count?: number;
                };

              const serverLiked =
                typeof data.liked ===
                "boolean"
                  ? data.liked
                  : nextLiked;

              const serverCount =
                typeof data.likesCount ===
                "number"
                  ? data.likesCount
                  : typeof data.count ===
                  "number"
                    ? data.count
                    : nextCount;

              setLiked((previous) => ({
                  ...previous,
                  [videoId]:
                  serverLiked,
              }));

              setLikeCounts((previous) => ({
                  ...previous,
                  [videoId]:
                    Math.max(
                      0,
                      serverCount
                    ),
              }));
          } catch {
              /*
               * Rollback.
               */
              setLiked((previous) => ({
                  ...previous,
                  [videoId]:
                  previousLiked,
              }));

              setLikeCounts((previous) => ({
                  ...previous,
                  [videoId]:
                  previousCount,
              }));
          }
      },
      [
          currentUserId,
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

    const shareVideo = useCallback(
      async () => {
          if (!currentVideo) {
              return;
          }

          const url =
            typeof window !==
            "undefined"
              ? `${window.location.origin}/videos/watch/${encodeURIComponent(
                currentVideo.id
              )}`
              : "";

          if (!url) {
              return;
          }

          try {
              if (
                typeof navigator !==
                "undefined" &&
                typeof navigator.share ===
                "function"
              ) {
                  await navigator.share({
                      title:
                      currentVideo.title,
                      text:
                        currentVideo.description ||
                        currentVideo.title,
                      url,
                  });

                  return;
              }

              if (
                navigator.clipboard &&
                typeof navigator.clipboard
                  .writeText ===
                "function"
              ) {
                  await navigator.clipboard.writeText(
                    url
                  );
              }
          } catch {
              /*
               * O usuário pode cancelar o compartilhamento.
               */
          }
      },
      [currentVideo]
    );

    /*
     * ============================================================
     * TOUCH / SWIPE
     * ============================================================
     */

    const handleTouchStart = (
      event: React.TouchEvent<HTMLDivElement>
    ) => {
        const touch = event.touches[0];

        if (!touch) {
            return;
        }

        touchStartY.current =
          touch.clientY;

        touchStartX.current =
          touch.clientX;
    };

    const handleTouchEnd = (
      event: React.TouchEvent<HTMLDivElement>
    ) => {
        if (
          touchStartY.current === null ||
          touchStartX.current === null
        ) {
            return;
        }

        const touch =
          event.changedTouches[0];

        if (!touch) {
            return;
        }

        const deltaY =
          touch.clientY -
          touchStartY.current;

        const deltaX =
          touch.clientX -
          touchStartX.current;

        touchStartY.current = null;
        touchStartX.current = null;

        /*
         * Ignora movimentos predominantemente horizontais.
         */
        if (
          Math.abs(deltaY) <=
          Math.abs(deltaX)
        ) {
            return;
        }

        /*
         * Swipe para cima = próximo.
         */
        if (deltaY < -60) {
            nextVideo();
            return;
        }

        /*
         * Swipe para baixo = anterior.
         */
        if (deltaY > 60) {
            prevVideo();
        }
    };

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
                return;
            }

            if (event.key === "ArrowDown") {
                event.preventDefault();
                nextVideo();
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                prevVideo();
            }

            if (event.key === " ") {
                event.preventDefault();
                togglePlayPause();
            }

            if (event.key === "m") {
                event.preventDefault();
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
        prevVideo,
        togglePlayPause,
        toggleSound,
        showComments,
    ]);

    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading) {
        return (
          <main className="flex h-screen w-full items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />

                  <span className="text-sm text-muted-foreground">
                        Carregando Mementos...
                    </span>
              </div>
          </main>
        );
    }

    /*
     * ============================================================
     * ERRO
     * ============================================================
     */

    if (
      loadError ||
      momentos.length === 0
    ) {
        return (
          <main className="flex h-screen w-full items-center justify-center bg-background px-6">
              <div className="text-center">
                  <h1 className="text-lg font-semibold text-foreground">
                      Nenhum Memento disponível
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                      Ainda não existem vídeos
                      disponíveis nesta área.
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-3">
                      <Link
                        href="/videos"
                        className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
                      >
                          Voltar aos vídeos
                      </Link>

                      <Link
                        href="/videos/memento/upload"
                        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                      >
                          Publicar Memento
                      </Link>
                  </div>
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
      <main className="fixed inset-0 flex flex-col overflow-hidden bg-background">
          {/* ====================================================
                TOPO
            ==================================================== */}

          <header className="z-40 flex shrink-0 items-center gap-2.5 border-b border-primary/15 bg-background/95 px-4 py-2 backdrop-blur-md">
              <Link
                href="/videos"
                className="shrink-0 text-lg tracking-wide"
                style={{
                    fontFamily:
                      "var(--font-caesar)",
                    color: "#ac0202",
                }}
              >
                  Imperium
              </Link>

              <Link
                href="/videos/buscar"
                className="ml-auto rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Buscar vídeos"
              >
                  <Search className="h-5 w-5 text-foreground" />
              </Link>

              <Link
                href="/videos/memento/upload"
                className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                  + Publicar
              </Link>
          </header>

          {/* ====================================================
                ÁREA DO MEMENTO
            ==================================================== */}

          <section
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
              {currentVideo && (
                <div className="relative h-full w-full max-w-[520px] overflow-hidden bg-black sm:max-w-[520px]">
                    {/* =================================================
                            VÍDEO
                        ================================================= */}

                    {!videoError &&
                    currentVideo.videoUrl ? (
                      <video
                        key={currentVideo.id}
                        ref={videoRef}
                        src={
                            currentVideo.videoUrl
                        }
                        poster={
                          currentVideo.thumbnailUrl ||
                          undefined
                        }
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
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
                        onCanPlay={() => {
                            if (
                              !isPlaying
                            ) {
                                void playCurrentVideo(
                                  false
                                );
                            }
                        }}
                        onWaiting={() =>
                          setIsPlaying(
                            false
                          )
                        }
                        onPlaying={() =>
                          setIsPlaying(
                            true
                          )
                        }
                        onError={() =>
                          setVideoError(
                            true
                          )
                        }
                      />
                    ) : currentVideo.thumbnailUrl ? (
                      <img
                        src={
                            currentVideo.thumbnailUrl
                        }
                        alt={
                            currentVideo.title
                        }
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-black">
                          <Play className="h-12 w-12 text-white/50" />
                      </div>
                    )}

                    {/* =================================================
                            CLIQUE PARA PLAY/PAUSE
                        ================================================= */}

                    <button
                      type="button"
                      className="absolute inset-0 z-10 cursor-pointer"
                      onClick={
                          togglePlayPause
                      }
                      aria-label={
                          isPlaying
                            ? "Pausar vídeo"
                            : "Reproduzir vídeo"
                      }
                    />

                    {/* =================================================
                            BOTÃO DE SOM
                        ================================================= */}

                    {currentVideo.videoUrl &&
                      !videoError && (
                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                              event.stopPropagation();
                              toggleSound();
                          }}
                          className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:bg-black/65 active:scale-95"
                          aria-label={
                              isMuted
                                ? "Ativar som"
                                : "Desativar som"
                          }
                          aria-pressed={
                              !isMuted
                          }
                        >
                            {isMuted ? (
                              <VolumeX className="h-5 w-5" />
                            ) : (
                              <Volume2 className="h-5 w-5" />
                            )}
                        </button>
                      )}

                    {/* =================================================
                            PLAY CENTRAL
                        ================================================= */}

                    {!isPlaying &&
                      currentVideo.videoUrl &&
                      !videoError && (
                        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 text-white shadow-xl backdrop-blur-md">
                                        <Play
                                          className="ml-1 h-8 w-8"
                                          fill="white"
                                        />
                                    </span>
                        </div>
                      )}

                    {/* =================================================
                            ERRO DO VÍDEO
                        ================================================= */}

                    {videoError && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
                          <div className="px-6 text-center">
                              <p className="text-sm font-medium text-white">
                                  Não foi possível
                                  reproduzir este
                                  vídeo.
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  setVideoError(
                                    false
                                  )
                                }
                                className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
                              >
                                  Tentar novamente
                              </button>
                          </div>
                      </div>
                    )}

                    {/* =================================================
                            GRADIENTE
                        ================================================= */}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-72 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

                    {/* =================================================
                            INFORMAÇÕES
                        ================================================= */}

                    <div className="absolute bottom-4 left-0 right-0 z-30 px-4 pb-1 sm:bottom-6">
                        <div className="flex items-end gap-3 pr-16">
                            <div className="min-w-0 flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                    {currentVideo.userAvatarUrl ? (
                                      <img
                                        src={
                                            currentVideo.userAvatarUrl
                                        }
                                        alt=""
                                        className="h-9 w-9 shrink-0 rounded-full border-2 border-white/40 bg-secondary object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-secondary text-sm font-semibold text-white">
                                          {currentVideo.userName
                                              ?.charAt(
                                                0
                                              )
                                              .toUpperCase() ||
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

                                    <span>
                                            •
                                        </span>

                                    <span>
                                            {
                                                likeCounts[
                                                  currentVideo
                                                    .id
                                                  ]
                                            }{" "}
                                        curtidas
                                        </span>

                                    <span>
                                            •
                                        </span>

                                    <span>
                                            {
                                                currentVideo.commentsCount
                                            }{" "}
                                        comentários
                                        </span>
                                </div>
                            </div>

                            {/* =================================================
                                    AÇÕES
                                ================================================= */}

                            <div
                              className="pointer-events-auto flex shrink-0 flex-col items-center gap-3"
                              onClick={(
                                event
                              ) =>
                                event.stopPropagation()
                              }
                            >
                                {/* LIKE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    void toggleLike(
                                      currentVideo.id
                                    )
                                  }
                                  disabled={
                                      !isSignedIn
                                  }
                                  className="flex flex-col items-center gap-1 disabled:opacity-60"
                                  aria-label="Curtir vídeo"
                                  aria-pressed={
                                    liked[
                                      currentVideo
                                        .id
                                      ] ?? false
                                  }
                                >
                                        <span
                                          className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition ${
                                            liked[
                                              currentVideo
                                                .id
                                              ]
                                              ? "border-red-500/60 bg-red-500/20"
                                              : "border-white/20 bg-black/40 hover:bg-black/60"
                                          }`}
                                        >
                                            <Heart
                                              className={`h-5 w-5 ${
                                                liked[
                                                  currentVideo
                                                    .id
                                                  ]
                                                  ? "fill-red-500 text-red-500"
                                                  : "text-white"
                                              }`}
                                            />
                                        </span>

                                    <span className="text-xs font-medium text-white">
                                            {
                                                likeCounts[
                                                  currentVideo
                                                    .id
                                                  ]
                                            }
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
                                  className="flex flex-col items-center gap-1"
                                  aria-label="Abrir comentários"
                                >
                                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60">
                                            <MessageCircle className="h-5 w-5" />
                                        </span>

                                    <span className="text-xs font-medium text-white">
                                            {
                                                currentVideo.commentsCount
                                            }
                                        </span>
                                </button>

                                {/* COMPARTILHAR */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    void shareVideo()
                                  }
                                  className="flex flex-col items-center gap-1"
                                  aria-label="Compartilhar vídeo"
                                >
                                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60">
                                            <Share2 className="h-5 w-5" />
                                        </span>

                                    <span className="text-[10px] font-medium text-white">
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
                          onClick={(
                            event
                          ) => {
                              event.stopPropagation();
                              prevVideo();
                          }}
                          className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-95"
                          aria-label="Memento anterior"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                      )}

                    {currentIndex <
                      momentos.length -
                      1 && (
                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                              event.stopPropagation();
                              nextVideo();
                          }}
                          className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-95"
                          aria-label="Próximo Memento"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                      )}

                    {/* =================================================
                            CONTADOR
                        ================================================= */}

                    <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
                        {currentIndex + 1} /{" "}
                        {momentos.length}
                    </div>
                </div>
              )}
          </section>

          {/* ========================================================
                COMENTÁRIOS
            ======================================================== */}

          {showComments &&
            currentVideo && (
              <div
                className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
                onClick={() =>
                  setShowComments(
                    false
                  )
                }
              >
                  <div
                    className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card px-4 pb-6 pt-4 shadow-2xl"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                      <div className="mb-4 flex items-center justify-between">
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
                            className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                            aria-label="Fechar comentários"
                          >
                              <X className="h-5 w-5" />
                          </button>
                      </div>

                      <VideoComments
                        videoId={
                            currentVideo.id
                        }
                      />
                  </div>
              </div>
            )}
      </main>
    );
}

/*
 * ================================================================
 * FORMATAÇÃO DE VISUALIZAÇÕES
 * ================================================================
 */

function formatViews(
  value: number
): string {
    const safeValue =
      Number.isFinite(value)
        ? Math.max(0, value)
        : 0;

    if (safeValue >= 1_000_000) {
        return `${(
          safeValue / 1_000_000
        ).toFixed(1)}M`;
    }

    if (safeValue >= 1_000) {
        return `${(
          safeValue / 1_000
        ).toFixed(1)}K`;
    }

    return String(safeValue);
}