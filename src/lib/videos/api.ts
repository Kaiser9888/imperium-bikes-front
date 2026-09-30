import type {
    VideoItem,
    VideoPage,
    ReactionResponse,
} from "./types";
import { API_BASE_URL } from "@/lib/api-config";

export const API_URL = API_BASE_URL;

export const PAGE_SIZE = 12;

/* ================================================================
 * HELPERS
 * ================================================================ */

/**
 * Remove espaços e normaliza uma URL de vídeo.
 */
function normalizeVideoUrl(
  videoUrl?: string | null
): string | undefined {
    if (!videoUrl) {
        return undefined;
    }

    const value = videoUrl.trim();

    if (!value) {
        return undefined;
    }

    return value;
}

/**
 * Extrai o playback ID do Mux.
 *
 * Aceita:
 *
 * https://stream.mux.com/ABC123.m3u8
 * ABC123
 * ABC123.m3u8
 *
 * E evita:
 *
 * ABC123.m3u8.m3u8
 */
export function playbackIdFrom(
  videoUrl?: string | null
): string {
    if (!videoUrl) {
        return "";
    }

    let value = videoUrl.trim();

    if (!value) {
        return "";
    }

    /*
     * Remove query string e hash.
     *
     * Exemplo:
     *
     * ABC123.m3u8?foo=bar
     *
     * vira:
     *
     * ABC123.m3u8
     */
    value = value.split("?")[0] ?? value;
    value = value.split("#")[0] ?? value;

    /*
     * Se for uma URL completa, pega somente o último
     * segmento do caminho.
     */
    try {
        if (
          value.startsWith("http://") ||
          value.startsWith("https://")
        ) {
            const url = new URL(value);

            value =
              url.pathname
                .split("/")
                .filter(Boolean)
                .pop() ?? "";
        }
    } catch {
        /*
         * Se não for uma URL válida, continua tratando
         * o valor como playback ID.
         */
    }

    /*
     * Remove TODAS as extensões .m3u8 do final.
     *
     * Isso protege contra:
     *
     * ABC.m3u8.m3u8
     */
    value = value.replace(
      /(?:\.m3u8)+$/i,
      ""
    );

    /*
     * Remove barras restantes.
     */
    value = value.replace(/^\/+|\/+$/g, "");

    return value;
}

/**
 * Constrói uma URL de playback Mux válida.
 *
 * Nunca gera:
 *
 * .m3u8.m3u8
 */
export function muxPlaybackUrl(
  videoUrl?: string | null
): string {
    const playbackId = playbackIdFrom(videoUrl);

    if (!playbackId) {
        return "";
    }

    /*
     * Se o backend já retornar uma URL Mux,
     * podemos devolver uma URL Mux limpa.
     *
     * Se retornar somente o playback ID,
     * construímos a URL.
     */
    return `https://stream.mux.com/${encodeURIComponent(
      playbackId
    )}.m3u8`;
}

/**
 * Normaliza um VideoItem recebido do backend.
 *
 * O backend continua sendo a fonte da verdade.
 * Apenas corrigimos campos relacionados ao playback.
 */
function normalizeVideo(
  video: VideoItem
): VideoItem {
    return {
        ...video,
        videoUrl: normalizeVideoUrl(video.videoUrl),
        thumbnailUrl: video.thumbnailUrl ?? "",
        description: video.description ?? undefined,
        likesCount: video.likesCount ?? 0,
        commentsCount: video.commentsCount ?? 0,
        dislikesCount: video.dislikesCount ?? 0,
        userAvatarUrl:
          video.userAvatarUrl ?? undefined,
        hashtags: video.hashtags ?? [],
        isShort: video.isShort ?? false,
    };
}

/* ================================================================
 * LISTAR VÍDEOS
 * ================================================================ */

/**
 * Lista vídeos paginados.
 *
 * Mantém o endpoint original.
 *
 * Se a API estiver indisponível, propaga o erro para a tela exibir
 * o estado de falha em vez de inventar vídeos.
 */
export async function fetchVideoPage(
  page: number,
  isShort = false
): Promise<VideoPage> {
    try {
        const params = new URLSearchParams({
            page: String(page),
            size: String(PAGE_SIZE),
            isShort: String(isShort),
        });

        const res = await fetch(
          `${API_URL}/api/videos?${params.toString()}`,
          {
              signal: AbortSignal.timeout(8000),

              /*
               * Evita problemas de cache durante
               * desenvolvimento e atualização dos vídeos.
               */
              cache: "no-store",
          }
        );

        if (!res.ok) {
            throw new Error(
              `HTTP ${res.status}`
            );
        }

        const data =
          (await res.json()) as VideoPage;

        if (
          !data ||
          !Array.isArray(data.content)
        ) {
            throw new Error(
              "Resposta inválida da API"
            );
        }

        /*
         * A API respondeu, mas não há conteúdo.
         *
         * Não precisamos inventar vídeos reais.
         */
        if (data.content.length === 0) {
            return {
                content: [],
                last: true,
            };
        }

        return {
            ...data,
            content: data.content.map(
              normalizeVideo
            ),
        };
    } catch (error) {
        throw error instanceof Error ? error : new Error("Não foi possível carregar os vídeos.");
    }
}

/* ================================================================
 * BUSCAR UM VÍDEO
 * ================================================================ */

export async function fetchVideo(
  id: string
): Promise<VideoItem | null> {
    if (!id) {
        return null;
    }

    try {
        const res = await fetch(
          `${API_URL}/api/videos/${encodeURIComponent(
            id
          )}`,
          {
              signal: AbortSignal.timeout(8000),
              cache: "no-store",
          }
        );

        if (!res.ok) {
            throw new Error(
              `HTTP ${res.status}`
            );
        }

        const data =
          (await res.json()) as VideoItem;

        if (!data) {
            return null;
        }

        return normalizeVideo(data);
    } catch {
        return null;
    }
}

/* ================================================================
 * VÍDEOS RELACIONADOS
 * ================================================================ */

export async function fetchRelated(
  id: string
): Promise<VideoItem[]> {
    const page =
      await fetchVideoPage(0, false);

    return page.content
      .filter(
        (video) => video.id !== id
      )
      .slice(0, 8);
}

/* ================================================================
 * LIKE
 * ================================================================ */

/**
 * Curte/descurte o vídeo.
 *
 * Exige token do Clerk.
 *
 * O backend valida:
 *
 * Authorization: Bearer <token>
 */
export async function likeVideo(
  id: string,
  token: string
): Promise<ReactionResponse | null> {
    if (!id || !token) {
        return null;
    }

    try {
        const res = await fetch(
          `${API_URL}/api/videos/${encodeURIComponent(
            id
          )}/like`,
          {
              method: "POST",

              headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
              },

              signal: AbortSignal.timeout(
                8000
              ),
          }
        );

        if (!res.ok) {
            throw new Error(
              `HTTP ${res.status}`
            );
        }

        return (await res.json()) as ReactionResponse;
    } catch {
        return null;
    }
}

/* ================================================================
 * DISLIKE
 * ================================================================ */

/**
 * Marca/desmarca dislike.
 *
 * Exige token do Clerk.
 */
export async function dislikeVideo(
  id: string,
  token: string
): Promise<ReactionResponse | null> {
    if (!id || !token) {
        return null;
    }

    try {
        const res = await fetch(
          `${API_URL}/api/videos/${encodeURIComponent(
            id
          )}/dislike`,
          {
              method: "POST",

              headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
              },

              signal: AbortSignal.timeout(
                8000
              ),
          }
        );

        if (!res.ok) {
            throw new Error(
              `HTTP ${res.status}`
            );
        }

        return (await res.json()) as ReactionResponse;
    } catch {
        return null;
    }
}

/* ================================================================
 * HASHTAGS
 * ================================================================ */

/**
 * Lista vídeos de uma hashtag específica.
 *
 * O endpoint precisa existir no backend.
 */
export async function fetchVideosByHashtag(
  tag: string,
  page: number
): Promise<VideoPage> {
    const cleanTag = tag
      .trim()
      .replace(/^#/, "");

    if (!cleanTag) {
        return {
            content: [],
            last: true,
        };
    }

    try {
        const params = new URLSearchParams({
            page: String(page),
            size: String(PAGE_SIZE),
        });

        const res = await fetch(
          `${API_URL}/api/videos/hashtag/${encodeURIComponent(
            cleanTag
          )}?${params.toString()}`,
          {
              signal: AbortSignal.timeout(
                8000
              ),
              cache: "no-store",
          }
        );

        if (!res.ok) {
            throw new Error(
              `HTTP ${res.status}`
            );
        }

        const data =
          (await res.json()) as VideoPage;

        if (
          !data ||
          !Array.isArray(data.content)
        ) {
            return {
                content: [],
                last: true,
            };
        }

        return {
            ...data,
            content: data.content.map(
              normalizeVideo
            ),
        };
    } catch {
        return {
            content: [],
            last: true,
        };
    }
}

/* ================================================================
 * EXPORTA URL MUX LIMPA
 * ================================================================ */

/**
 * Retorna uma URL Mux pronta para reprodução.
 *
 * Exemplo:
 *
 * entrada:
 * https://stream.mux.com/ABC123.m3u8
 *
 * saída:
 * https://stream.mux.com/ABC123.m3u8
 *
 * entrada:
 * ABC123
 *
 * saída:
 * https://stream.mux.com/ABC123.m3u8
 *
 * entrada problemática:
 * ABC123.m3u8.m3u8
 *
 * saída:
 * https://stream.mux.com/ABC123.m3u8
 */
export function getMuxVideoUrl(
  videoUrl?: string | null
): string {
    return muxPlaybackUrl(videoUrl);
}
