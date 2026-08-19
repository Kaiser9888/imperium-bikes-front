"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MementoFeed } from "@/components/videos/MementoFeed";
import type { VideoItem } from "@/lib/videos/types";

const API_URL = "https://imperium-bikes.onrender.com";

interface ApiMementoItem {
    id: string;
    title?: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    viewCount?: number;
    likesCount?: number;
    commentsCount?: number;
    userName?: string;
    userAvatarUrl?: string;
    userId?: string;
    liked?: boolean;
    formattedDuration?: string;
    createdAt?: string;
}

interface ApiResponse {
    content?: ApiMementoItem[];
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
}

function formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) {
        return "0:00";
    }

    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function normalizeVideo(item: ApiMementoItem): VideoItem {
    const durationSeconds = Number(item.durationSeconds ?? 0);

    return {
        id: item.id,

        title: item.title ?? "Memento",

        description: item.description ?? "",

        videoUrl: item.videoUrl ?? "",

        thumbnailUrl: item.thumbnailUrl ?? "",

        durationSeconds,

        formattedDuration:
          item.formattedDuration ??
          formatDuration(durationSeconds),

        viewCount: Number(item.viewCount ?? 0),

        likesCount: Number(item.likesCount ?? 0),

        commentsCount: Number(item.commentsCount ?? 0),

        userName: item.userName ?? "Usuário",

        userAvatarUrl: item.userAvatarUrl ?? "",

        

        liked: Boolean(item.liked),

        createdAt:
          item.createdAt ??
          new Date().toISOString(),
    };
}

export default function MementoPage() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    /*
     * ============================================================
     * BUSCAR MEMENTOS
     * ============================================================
     */

    const fetchMementos = useCallback(
      async (pageNumber: number) => {
          try {
              setError(null);

              const response = await fetch(
                `${API_URL}/api/videos?page=${pageNumber}&size=10&isShort=true`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                    cache: "no-store",
                }
              );

              if (!response.ok) {
                  throw new Error(
                    `Não foi possível carregar os Mementos. Status: ${response.status}`
                  );
              }

              const data: ApiResponse = await response.json();

              const content = Array.isArray(data.content)
                ? data.content
                : [];

              const normalizedVideos =
                content
                  .filter((item) => item?.id)
                  .map(normalizeVideo);

              setVideos((previous) => {
                  /*
                   * Primeira página substitui o conteúdo.
                   * Próximas páginas são adicionadas.
                   */
                  if (pageNumber === 0) {
                      return normalizedVideos;
                  }

                  const existingIds = new Set(
                    previous.map((video) => video.id)
                  );

                  const newVideos =
                    normalizedVideos.filter(
                      (video) => !existingIds.has(video.id)
                    );

                  return [...previous, ...newVideos];
              });

              /*
               * Determina se ainda existem páginas.
               */
              if (
                typeof data.totalPages === "number" &&
                typeof data.number === "number"
              ) {
                  setHasMore(
                    data.number + 1 < data.totalPages
                  );
              } else if (
                typeof data.totalElements === "number" &&
                typeof data.size === "number"
              ) {
                  const loaded =
                    (pageNumber + 1) * data.size;

                  setHasMore(
                    loaded < data.totalElements
                  );
              } else {
                  /*
                   * Fallback:
                   * se vier menos que o tamanho solicitado,
                   * provavelmente chegou ao fim.
                   */
                  setHasMore(
                    normalizedVideos.length >= 10
                  );
              }
          } catch (err) {
              console.error(
                "Erro ao carregar Mementos:",
                err
              );

              setError(
                err instanceof Error
                  ? err.message
                  : "Não foi possível carregar os Mementos."
              );
          } finally {
              setLoading(false);
          }
      },
      []
    );

    /*
     * ============================================================
     * PRIMEIRA CARGA
     * ============================================================
     */

    useEffect(() => {
        fetchMementos(0);
    }, [fetchMementos]);

    /*
     * ============================================================
     * PAGINAÇÃO
     * ============================================================
     */

    const handleEndReached = useCallback(() => {
        if (loading || !hasMore) {
            return;
        }

        setPage((currentPage) => {
            const nextPage = currentPage + 1;

            fetchMementos(nextPage);

            return nextPage;
        });
    }, [
        fetchMementos,
        hasMore,
        loading,
    ]);

    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading && videos.length === 0) {
        return (
          <div className="flex h-full w-full items-center justify-center bg-black">
              <div
                className="
            h-9
            w-9
            animate-spin
            rounded-full
            border-2
            border-white/20
            border-t-primary
          "
                aria-label="Carregando Mementos"
              />
          </div>
        );
    }

    /*
     * ============================================================
     * ERRO
     * ============================================================
     */

    if (error && videos.length === 0) {
        return (
          <div className="flex h-full w-full items-center justify-center bg-background px-6">
              <div className="max-w-md text-center">
                  <h1 className="text-lg font-semibold text-foreground">
                      Não foi possível carregar os Mementos
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                      Verifique sua conexão e tente novamente.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                        setLoading(true);
                        setError(null);
                        setPage(0);
                        fetchMementos(0);
                    }}
                    className="
              mt-5
              rounded-full
              bg-primary
              px-5
              py-2
              text-sm
              font-medium
              text-primary-foreground
              transition
              hover:bg-primary/90
            "
                  >
                      Tentar novamente
                  </button>
              </div>
          </div>
        );
    }

    /*
     * ============================================================
     * NENHUM MEMENTO
     * ============================================================
     */

    if (videos.length === 0) {
        return (
          <div className="flex h-full w-full items-center justify-center bg-background px-6">
              <div className="text-center">
                  <h1 className="text-lg font-semibold text-foreground">
                      Nenhum Memento ainda
                  </h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                      Seja o primeiro a publicar um vídeo curto.
                  </p>

                  <Link
                    href="/videos/memento/upload"
                    className="
              mt-5
              inline-flex
              rounded-full
              bg-primary
              px-6
              py-2.5
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

    /*
     * ============================================================
     * FEED
     * ============================================================
     */

    return (
      <div className="h-full w-full overflow-hidden bg-black">
          <MementoFeed
            videos={videos}
            onEndReached={handleEndReached}
          />
      </div>
    );
}