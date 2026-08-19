"use client";

import {
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

import {
    Search,
    Heart,
    MessageCircle,
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
    description?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    viewCount: number;
    likesCount: number;
    commentsCount: number;
    userName: string;
    userAvatarUrl?: string;
    userId?: string;
}

const SWIPE_THRESHOLD = 50;
const WHEEL_THRESHOLD = 30;

export default function MementoPage() {
    const {
        getToken,
        userId: currentUserId,
        isSignedIn,
    } = useAuth();

    const [momentos, setMomentos] = useState<MementoItem[]>([]);

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

    const [shareFeedback, setShareFeedback] =
      useState<string | null>(null);

    /*
     * Controla se o usuário ativou o som
     * de cada vídeo.
     */
    const [soundEnabled, setSoundEnabled] =
      useState<Record<string, boolean>>({});

    /*
     * Controla visualmente se cada vídeo
     * está reproduzindo.
     */
    const [playing, setPlaying] =
      useState<Record<string, boolean>>({});

    const touchStartY =
      useRef(0);

    const touchStartX =
      useRef(0);

    const videoRefs =
      useRef<Map<string, HTMLVideoElement>>(
        new Map()
      );

    const wheelLocked =
      useRef(false);

    const [searchQuery, setSearchQuery] =
      useState("");

    /*
     * ============================================================
     * FILTRO
     * ============================================================
     */

    const feed = useCallback(() => {
        const q = searchQuery
          .trim()
          .toLowerCase();

        if (!q) {
            return momentos;
        }

        return momentos.filter((video) =>
          video.title
            ?.toLowerCase()
            .includes(q) ||
          video.userName
            ?.toLowerCase()
            .includes(q) ||
          video.description
            ?.toLowerCase()
            .includes(q)
        );
    }, [momentos, searchQuery])();

    /*
     * ============================================================
     * BUSCAR MEMENTOS
     * ============================================================
     */

    useEffect(() => {
        let cancelled = false;

        const fetchMomentos = async () => {
            try {
                const response = await fetch(
                  `${API_URL}/api/videos?page=0&size=20&isShort=true`,
                  {
                      signal:
                        AbortSignal.timeout(10000),
                  }
                );

                if (!response.ok) {
                    throw new Error(
                      `Status ${response.status}`
                    );
                }

                const data =
                  await response.json();

                if (cancelled) return;

                const items =
                  data.content || [];

                const normalized: MementoItem[] =
                  items.map(
                    (item: any) => ({
                        id: String(item.id),
                        title:
                          item.title ?? "",
                        description:
                          item.description ??
                          "",
                        videoUrl:
                          item.videoUrl ??
                          "",
                        thumbnailUrl:
                          item.thumbnailUrl ??
                          "",
                        durationSeconds:
                          Number(
                            item.durationSeconds ??
                            0
                          ),
                        viewCount:
                          Number(
                            item.viewCount ??
                            0
                          ),
                        likesCount:
                          Number(
                            item.likesCount ??
                            0
                          ),
                        commentsCount:
                          Number(
                            item.commentsCount ??
                            0
                          ),
                        userName:
                          item.userName ??
                          "Usuário",
                        userAvatarUrl:
                          item.userAvatarUrl ??
                          "",
                        userId:
                          item.userId ??
                          undefined,
                    })
                  );

                setMomentos(normalized);

                const counts: Record<
                  string,
                  number
                > = {};

                const initialLikes: Record<
                  string,
                  boolean
                > = {};

                normalized.forEach((video) => {
                    counts[video.id] =
                      video.likesCount;

                    /*
                     * Caso o backend envie liked,
                     * também pode ser usado.
                     */
                    if (
                      typeof (
                        items.find(
                          (item: any) =>
                            String(
                              item.id
                            ) ===
                            video.id
                        )?.liked
                      ) === "boolean"
                    ) {
                        initialLikes[
                          video.id
                          ] =
                          items.find(
                            (item: any) =>
                              String(
                                item.id
                              ) ===
                              video.id
                          )?.liked;
                    }
                });

                setLikeCounts(counts);
                setLiked(initialLikes);
            } catch (error) {
                console.error(
                  "Erro ao carregar Mementos:",
                  error
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchMomentos();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * ============================================================
     * RESETAR ÍNDICE QUANDO PESQUISA MUDAR
     * ============================================================
     */

    useEffect(() => {
        setCurrentIndex(0);
    }, [searchQuery]);

    /*
     * ============================================================
     * AUTOPLAY DO VÍDEO ATUAL
     *
     * O navegador não permite autoplay com som.
     * Portanto:
     *
     * 1. vídeo começa mutado;
     * 2. autoplay acontece;
     * 3. usuário pode apertar o botão de som;
     * 4. ao trocar de vídeo, o novo começa mutado.
     * ============================================================
     */

    useEffect(() => {
        const current =
          feed[currentIndex];

        if (!current) return;

        const currentVideo =
          videoRefs.current.get(
            current.id
          );

        /*
         * Pausa todos os outros vídeos.
         */
        videoRefs.current.forEach(
          (video, id) => {
              if (id !== current.id) {
                  video.pause();
              }
          }
        );

        /*
         * Novo vídeo começa mutado.
         */
        if (currentVideo) {
            currentVideo.currentTime = 0;

            currentVideo.muted = true;

            setSoundEnabled((previous) => ({
                ...previous,
                [current.id]: false,
            }));

            currentVideo
              .play()
              .then(() => {
                  setPlaying(
                    (previous) => ({
                        ...previous,
                        [current.id]: true,
                    })
                  );
              })
              .catch(() => {
                  setPlaying(
                    (previous) => ({
                        ...previous,
                        [current.id]: false,
                    })
                  );
              });
        }
    }, [currentIndex, feed]);

    /*
     * ============================================================
     * TECLADO
     * ============================================================
     */

    useEffect(() => {
        const handleKey = (
          event: KeyboardEvent
        ) => {
            if (showComments) return;

            if (
              event.key === "ArrowDown" &&
              currentIndex <
              feed.length - 1
            ) {
                event.preventDefault();

                setCurrentIndex(
                  (previous) =>
                    previous + 1
                );
            }

            if (
              event.key === "ArrowUp" &&
              currentIndex > 0
            ) {
                event.preventDefault();

                setCurrentIndex(
                  (previous) =>
                    previous - 1
                );
            }
        };

        window.addEventListener(
          "keydown",
          handleKey
        );

        return () => {
            window.removeEventListener(
              "keydown",
              handleKey
            );
        };
    }, [
        currentIndex,
        feed.length,
        showComments,
    ]);

    /*
     * ============================================================
     * TRAVAR SCROLL DA PÁGINA
     * ============================================================
     */

    useEffect(() => {
        const original =
          document.body.style.overflow;

        document.body.style.overflow =
          "hidden";

        return () => {
            document.body.style.overflow =
              original;
        };
    }, []);

    /*
     * ============================================================
     * WHEEL
     * ============================================================
     */

    const handleWheel = (
      event: React.WheelEvent
    ) => {
        if (showComments) return;

        if (wheelLocked.current) return;

        if (
          event.deltaY >
          WHEEL_THRESHOLD &&
          currentIndex <
          feed.length - 1
        ) {
            wheelLocked.current = true;

            setCurrentIndex(
              (previous) =>
                previous + 1
            );

            setTimeout(() => {
                wheelLocked.current = false;
            }, 450);
        } else if (
          event.deltaY <
          -WHEEL_THRESHOLD &&
          currentIndex > 0
        ) {
            wheelLocked.current = true;

            setCurrentIndex(
              (previous) =>
                previous - 1
            );

            setTimeout(() => {
                wheelLocked.current = false;
            }, 450);
        }
    };

    /*
     * ============================================================
     * TOUCH / SWIPE
     * ============================================================
     */

    const handleTouchStart = (
      event: React.TouchEvent
    ) => {
        if (showComments) return;

        const touch =
          event.touches[0];

        if (!touch) return;

        touchStartY.current =
          touch.clientY;

        touchStartX.current =
          touch.clientX;
    };

    const handleTouchEnd = (
      event: React.TouchEvent
    ) => {
        if (showComments) return;

        const touch =
          event.changedTouches[0];

        if (!touch) return;

        const diffY =
          touchStartY.current -
          touch.clientY;

        const diffX =
          touchStartX.current -
          touch.clientX;

        /*
         * Ignora movimentos predominantemente
         * horizontais.
         */
        if (
          Math.abs(diffY) <=
          Math.abs(diffX)
        ) {
            return;
        }

        if (
          Math.abs(diffY) <
          SWIPE_THRESHOLD
        ) {
            return;
        }

        if (
          diffY > 0 &&
          currentIndex <
          feed.length - 1
        ) {
            setCurrentIndex(
              (previous) =>
                previous + 1
            );
        } else if (
          diffY < 0 &&
          currentIndex > 0
        ) {
            setCurrentIndex(
              (previous) =>
                previous - 1
            );
        }
    };

    /*
     * ============================================================
     * PLAY / PAUSE
     * ============================================================
     */

    const togglePlayPause = (
      videoId: string
    ) => {
        const video =
          videoRefs.current.get(
            videoId
          );

        if (!video) return;

        if (video.paused) {
            video
              .play()
              .then(() => {
                  setPlaying(
                    (previous) => ({
                        ...previous,
                        [videoId]:
                          true,
                    })
                  );
              })
              .catch(() => {});
        } else {
            video.pause();

            setPlaying(
              (previous) => ({
                  ...previous,
                  [videoId]: false,
              })
            );
        }
    };

    /*
     * ============================================================
     * SOM
     * ============================================================
     */

    const toggleSound = (
      event: React.MouseEvent,
      videoId: string
    ) => {
        event.stopPropagation();

        const video =
          videoRefs.current.get(
            videoId
          );

        if (!video) return;

        const currentlyEnabled =
          soundEnabled[videoId] ??
          false;

        const next =
          !currentlyEnabled;

        /*
         * Ativa/desativa o áudio.
         */
        video.muted = !next;

        setSoundEnabled(
          (previous) => ({
              ...previous,
              [videoId]: next,
          })
        );

        /*
         * Se estava parado, aproveita
         * o clique do usuário para iniciar.
         */
        if (video.paused) {
            video
              .play()
              .then(() => {
                  setPlaying(
                    (previous) => ({
                        ...previous,
                        [videoId]:
                          true,
                    })
                  );
              })
              .catch(() => {});
        }
    };

    /*
     * ============================================================
     * LIKE
     * ============================================================
     */

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
          liked[videoId] ??
          false;

        const previousCount =
          likeCounts[videoId] ??
          0;

        /*
         * UI otimista.
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

            const response =
              await fetch(
                `${API_URL}/api/videos/${videoId}/like`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type":
                          "application/json",
                    },
                }
              );

            if (!response.ok) {
                throw new Error(
                  `Status ${response.status}`
                );
            }

            const data =
              await response.json();

            setLiked(
              (previous) => ({
                  ...previous,
                  [videoId]:
                  data.liked,
              })
            );

            setLikeCounts(
              (previous) => ({
                  ...previous,
                  [videoId]:
                    data.likesCount ??
                    data.count ??
                    previousCount,
              })
            );
        } catch {
            /*
             * Reverte se API falhar.
             */
            setLiked(
              (previous) => ({
                  ...previous,
                  [videoId]:
                  previousLiked,
              })
            );

            setLikeCounts(
              (previous) => ({
                  ...previous,
                  [videoId]:
                  previousCount,
              })
            );
        }
    };

    /*
     * ============================================================
     * COMPARTILHAR
     * ============================================================
     */

    const handleShare = async (
      video: MementoItem
    ) => {
        const url =
          `${window.location.origin}/videos/watch/${video.id}`;

        try {
            if (
              navigator.share
            ) {
                await navigator.share({
                    title: video.title,
                    text:
                      video.description ??
                      "",
                    url,
                });

                return;
            }

            if (
              navigator.clipboard
            ) {
                await navigator.clipboard.writeText(
                  url
                );

                setShareFeedback(
                  video.id
                );

                setTimeout(() => {
                    setShareFeedback(
                      null
                    );
                }, 2000);
            }
        } catch {
            /*
             * Usuário cancelou.
             */
        }
    };

    /*
     * ============================================================
     * FORMATAR VISUALIZAÇÕES
     * ============================================================
     */

    const formatViews = (
      value: number
    ) => {
        if (
          value >= 1_000_000
        ) {
            return `${(
              value / 1_000_000
            ).toFixed(1)}M`;
        }

        if (
          value >= 1_000
        ) {
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
          <div className="flex h-dvh items-center justify-center bg-background">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        );
    }

    /*
     * ============================================================
     * PÁGINA
     * ============================================================
     */

    return (
      <div className="fixed inset-0 flex h-dvh flex-col overflow-hidden bg-background">
          {/* =====================================================
                TOPO
            ====================================================== */}

          <header
            className="
                    z-40
                    flex
                    h-12
                    shrink-0
                    items-center
                    gap-2
                    border-b
                    border-primary/15
                    bg-background/95
                    px-3
                    backdrop-blur-md
                    sm:h-14
                    sm:px-4
                "
          >
              <Link
                href="/videos"
                className="
                        shrink-0
                        text-lg
                        tracking-wide
                        sm:text-xl
                    "
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
                className="
                        ml-auto
                        flex
                        size-9
                        items-center
                        justify-center
                        rounded-full
                        text-muted-foreground
                        transition-colors
                        hover:bg-secondary
                        hover:text-foreground
                    "
                aria-label="Buscar vídeos"
              >
                  <Search className="size-5 text-foreground" />
              </Link>

              <Link
                href="/videos/memento/upload"
                className="
                        shrink-0
                        rounded-full
                        bg-primary
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-primary-foreground
                        transition-colors
                        hover:bg-primary/90
                        sm:px-4
                        sm:text-sm
                    "
              >
                  + Publicar
              </Link>
          </header>

          {/* =====================================================
                ÁREA PRINCIPAL
            ====================================================== */}

          <main
            className="
                    relative
                    min-h-0
                    flex-1
                    overflow-hidden
                "
          >
              {/* =================================================
                    NENHUM VÍDEO
                ================================================== */}

              {momentos.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4">
                    <div className="text-center">
                        <p className="text-lg text-muted-foreground">
                            Nenhum Memento ainda
                        </p>

                        <Link
                          href="/videos/memento/upload"
                          className="
                                    mt-4
                                    inline-block
                                    rounded-full
                                    bg-primary
                                    px-6
                                    py-2
                                    text-sm
                                    font-medium
                                    text-primary-foreground
                                "
                        >
                            Publicar Memento
                        </Link>
                    </div>
                </div>
              ) : feed.length === 0 ? (
                <div className="flex h-full items-center justify-center px-4">
                    <p className="text-lg text-muted-foreground">
                        Nenhum Memento encontrado
                    </p>
                </div>
              ) : (
                /*
                 * =================================================
                 * FEED
                 * =================================================
                 */

                <div
                  className="
                            relative
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            overflow-hidden
                            touch-pan-y
                        "
                  onWheel={
                      handleWheel
                  }
                  onTouchStart={
                      handleTouchStart
                  }
                  onTouchEnd={
                      handleTouchEnd
                  }
                >
                    {feed.map(
                      (
                        video,
                        index
                      ) => {
                          const isActive =
                            index ===
                            currentIndex;

                          const isPlaying =
                            playing[
                              video.id
                              ] ??
                            false;

                          const hasSound =
                            soundEnabled[
                              video.id
                              ] ??
                            false;

                          return (
                            <div
                              key={
                                  video.id
                              }
                              className="
                                            absolute
                                            inset-0
                                            flex
                                            items-center
                                            justify-center
                                        "
                              style={{
                                  transform:
                                    `translate3d(0, ${
                                      (index -
                                        currentIndex) *
                                      100
                                    }%, 0)`,
                                  transition:
                                    "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
                              }}
                              aria-hidden={
                                  !isActive
                              }
                            >
                                {/* =================================
                                            VÍDEO VERTICAL 9:16
                                        ================================== */}

                                <div
                                  className="
                                                relative
                                                h-full
                                                max-h-full
                                                w-auto
                                                max-w-full
                                                aspect-[9/16]
                                                overflow-hidden
                                                bg-black
                                                shadow-2xl
                                                sm:rounded-xl
                                                sm:border
                                                sm:border-border/50
                                            "
                                  style={{
                                      /*
                                       * Garante que o vídeo
                                       * nunca fique maior
                                       * que a área disponível.
                                       */
                                      maxHeight:
                                        "100%",
                                      maxWidth:
                                        "100%",
                                  }}
                                >
                                    {/* ===========================
                                                VIDEO
                                            ============================ */}

                                    {video.videoUrl ? (
                                      <video
                                        ref={(
                                          element
                                        ) => {
                                            if (
                                              element
                                            ) {
                                                videoRefs.current.set(
                                                  video.id,
                                                  element
                                                );
                                            } else {
                                                videoRefs.current.delete(
                                                  video.id
                                                );
                                            }
                                        }}
                                        src={
                                            video.videoUrl
                                        }
                                        poster={
                                          video.thumbnailUrl ||
                                          undefined
                                        }
                                        className="
                                                        absolute
                                                        inset-0
                                                        h-full
                                                        w-full
                                                        object-cover
                                                    "
                                        loop
                                        playsInline
                                        muted={
                                            !hasSound
                                        }
                                        preload={
                                            isActive
                                              ? "auto"
                                              : "metadata"
                                        }
                                        onClick={() =>
                                          togglePlayPause(
                                            video.id
                                          )
                                        }
                                        onPlay={() =>
                                          setPlaying(
                                            (
                                              previous
                                            ) => ({
                                                ...previous,
                                                [video.id]:
                                                  true,
                                            })
                                          )
                                        }
                                        onPause={() =>
                                          setPlaying(
                                            (
                                              previous
                                            ) => ({
                                                ...previous,
                                                [video.id]:
                                                  false,
                                            })
                                          )
                                        }
                                        onEnded={() =>
                                          setPlaying(
                                            (
                                              previous
                                            ) => ({
                                                ...previous,
                                                [video.id]:
                                                  false,
                                            })
                                          )
                                        }
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-black">
                                          <Play className="size-12 text-white/50" />
                                      </div>
                                    )}

                                    {/* ===========================
                                                GRADIENTE
                                            ============================ */}

                                    <div
                                      className="
                                                    pointer-events-none
                                                    absolute
                                                    inset-x-0
                                                    bottom-0
                                                    z-10
                                                    h-1/2
                                                    bg-gradient-to-t
                                                    from-black/90
                                                    via-black/30
                                                    to-transparent
                                                "
                                    />

                                    {/* ===========================
                                                BOTÃO SOM
                                            ============================ */}

                                    {video.videoUrl && (
                                      <button
                                        type="button"
                                        onClick={(
                                          event
                                        ) =>
                                          toggleSound(
                                            event,
                                            video.id
                                          )
                                        }
                                        className="
                                                        absolute
                                                        right-3
                                                        top-3
                                                        z-30
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
                                                        sm:right-4
                                                        sm:top-4
                                                    "
                                        aria-label={
                                            hasSound
                                              ? "Desativar som"
                                              : "Ativar som"
                                        }
                                        aria-pressed={
                                            hasSound
                                        }
                                      >
                                          {hasSound ? (
                                            <Volume2 className="size-5" />
                                          ) : (
                                            <VolumeX className="size-5" />
                                          )}
                                      </button>
                                    )}

                                    {/* ===========================
                                                PLAY CENTRAL
                                            ============================ */}

                                    {video.videoUrl &&
                                      !isPlaying && (
                                        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                                            <div className="flex size-16 items-center justify-center rounded-full bg-black/45 shadow-xl backdrop-blur-md">
                                                <Play
                                                  className="ml-1 size-8 text-white"
                                                  fill="white"
                                                />
                                            </div>
                                        </div>
                                      )}

                                    {/* ===========================
                                                AÇÕES LATERAIS
                                            ============================ */}

                                    <div
                                      className="
                                                    absolute
                                                    bottom-28
                                                    right-3
                                                    z-30
                                                    flex
                                                    flex-col
                                                    items-center
                                                    gap-3
                                                    sm:bottom-28
                                                    sm:right-4
                                                    sm:gap-4
                                                "
                                      onClick={(
                                        event
                                      ) =>
                                        event.stopPropagation()
                                      }
                                      onTouchStart={(
                                        event
                                      ) =>
                                        event.stopPropagation()
                                      }
                                    >
                                        {/* LIKE */}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleLike(
                                              video.id
                                            )
                                          }
                                          className="flex flex-col items-center gap-1"
                                          aria-label="Curtir"
                                          aria-pressed={
                                            liked[
                                              video.id
                                              ] ??
                                            false
                                          }
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
                                                            active:scale-90
                                                            ${
                                                        liked[
                                                          video
                                                            .id
                                                          ]
                                                          ? "border-red-500 bg-red-500/20"
                                                          : "border-white/20 bg-black/40"
                                                      }
                                                        `}
                                                    >
                                                        <Heart
                                                          className={`
                                                                size-5
                                                                ${
                                                            liked[
                                                              video
                                                                .id
                                                              ]
                                                              ? "fill-red-500 text-red-500"
                                                              : "text-white"
                                                          }
                                                            `}
                                                        />
                                                    </span>

                                            <span className="text-xs font-medium text-white drop-shadow">
                                                        {likeCounts[
                                                            video
                                                              .id
                                                            ] ??
                                                          video.likesCount}
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
                                          aria-label="Comentários"
                                        >
                                                    <span className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition active:scale-90">
                                                        <MessageCircle className="size-5" />
                                                    </span>

                                            <span className="text-xs font-medium text-white drop-shadow">
                                                        {
                                                            video.commentsCount
                                                        }
                                                    </span>
                                        </button>

                                        {/* COMPARTILHAR */}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleShare(
                                              video
                                            )
                                          }
                                          className="flex flex-col items-center gap-1"
                                          aria-label="Compartilhar"
                                        >
                                                    <span className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition active:scale-90">
                                                        <Share2 className="size-5" />
                                                    </span>

                                            <span className="text-center text-[10px] font-medium text-white drop-shadow">
                                                        {shareFeedback ===
                                                        video.id
                                                          ? "Copiado"
                                                          : "Enviar"}
                                                    </span>
                                        </button>
                                    </div>

                                    {/* ===========================
                                                INFORMAÇÕES DO VÍDEO
                                            ============================ */}

                                    <div
                                      className="
                                                    absolute
                                                    bottom-0
                                                    left-0
                                                    right-16
                                                    z-20
                                                    p-4
                                                    pb-5
                                                    sm:right-20
                                                    sm:p-5
                                                "
                                    >
                                        <div className="flex items-center gap-2">
                                            {video.userAvatarUrl ? (
                                              <img
                                                src={
                                                    video.userAvatarUrl
                                                }
                                                alt=""
                                                className="
                                                                size-9
                                                                shrink-0
                                                                rounded-full
                                                                border-2
                                                                border-primary/60
                                                                bg-secondary
                                                                object-cover
                                                            "
                                              />
                                            ) : (
                                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/60 bg-secondary text-xs font-bold text-muted-foreground">
                                                  {video.userName
                                                    ?.charAt(
                                                      0
                                                    )
                                                    .toUpperCase()}
                                              </div>
                                            )}

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-white drop-shadow">
                                                    @
                                                    {
                                                        video.userName
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <h2 className="mt-2 line-clamp-2 text-sm font-bold text-white drop-shadow sm:text-base">
                                            {
                                                video.title
                                            }
                                        </h2>

                                        {video.description && (
                                          <p className="mt-1 line-clamp-2 text-xs text-white/80 drop-shadow sm:text-sm">
                                              {
                                                  video.description
                                              }
                                          </p>
                                        )}

                                        <div className="mt-2 flex items-center gap-2 text-[11px] text-white/65">
                                                    <span>
                                                        {formatViews(
                                                          video.viewCount
                                                        )}{" "}
                                                        views
                                                    </span>

                                            <span>
                                                        ·
                                                    </span>

                                            <span>
                                                        {likeCounts[
                                                            video
                                                              .id
                                                            ] ??
                                                          video.likesCount}{" "}
                                                likes
                                                    </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                          );
                      }
                    )}

                    {/* =============================================
                            INDICADOR LATERAL
                        ============================================== */}

                    {feed.length > 1 && (
                      <div
                        className="
                                    absolute
                                    right-1
                                    top-1/2
                                    z-30
                                    flex
                                    -translate-y-1/2
                                    flex-col
                                    gap-1
                                    sm:right-2
                                "
                      >
                          {feed.map(
                            (
                              video,
                              index
                            ) => (
                              <button
                                key={
                                    video.id
                                }
                                type="button"
                                onClick={() =>
                                  setCurrentIndex(
                                    index
                                  )
                                }
                                aria-label={`Ir para vídeo ${
                                  index +
                                  1
                                }`}
                                className={`
                                                h-5
                                                w-0.5
                                                rounded-full
                                                transition-all
                                                ${
                                  index ===
                                  currentIndex
                                    ? "bg-primary"
                                    : index <
                                    currentIndex
                                      ? "bg-primary/40"
                                      : "bg-primary/15"
                                }
                                            `}
                              />
                            )
                          )}
                      </div>
                    )}

                    {/* =============================================
                            INDICADOR DE SWIPE
                        ============================================== */}

                    {currentIndex ===
                      0 &&
                      feed.length >
                      1 && (
                        <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 hidden -translate-x-1/2 animate-bounce rounded-full bg-black/40 px-3 py-1 text-[10px] text-white/70 backdrop-blur sm:block">
                            ↑ deslize para
                            o próximo
                        </div>
                      )}
                </div>
              )}
          </main>

          {/* =====================================================
                COMENTÁRIOS
            ====================================================== */}

          {showComments &&
            feed[currentIndex] && (
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
                                flex
                                max-h-[85dvh]
                                w-full
                                max-w-lg
                                flex-col
                                overflow-hidden
                                rounded-t-2xl
                                bg-card
                                shadow-2xl
                            "
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                      {/* HEADER */}

                      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
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
                            aria-label="Fechar comentários"
                          >
                              <X className="size-5" />
                          </button>
                      </div>

                      {/* COMENTÁRIOS */}

                      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-2">
                          <VideoComments
                            videoId={
                                feed[
                                  currentIndex
                                  ].id
                            }
                          />
                      </div>
                  </div>
              </div>
            )}
      </div>
    );
}