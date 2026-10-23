import type {
    FeedOrder,
    LiveCredentials,
    ReactionResponse,
    VideoItem,
    VideoPage,
} from "./types";
import { API_BASE_URL } from "@/lib/api-config";

export const API_URL = API_BASE_URL;

export const PAGE_SIZE = 12;

const TIMEOUT_MS = 8000;

/* ================================================================
 * HELPERS
 * ================================================================ */

function authHeaders(token?: string | null): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Lê a mensagem de erro do backend ({ message }) quando houver. */
async function errorFrom(res: Response): Promise<Error> {
    try {
        const body = await res.json();
        const message = body?.message || body?.details || body?.error;
        if (typeof message === "string" && message) return new Error(message);
    } catch {
        // corpo vazio ou não-JSON
    }
    return new Error(`HTTP ${res.status}`);
}

async function getJson<T>(path: string, token?: string | null): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { Accept: "application/json", ...authHeaders(token) },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
    });
    if (!res.ok) throw await errorFrom(res);
    return (await res.json()) as T;
}

function normalizeVideoUrl(videoUrl?: string | null): string | undefined {
    const value = videoUrl?.trim();
    return value || undefined;
}

/**
 * Extrai o playback ID do Mux. Aceita URL completa, "ABC123" ou "ABC123.m3u8"
 * (e protege contra "ABC123.m3u8.m3u8").
 */
export function playbackIdFrom(videoUrl?: string | null): string {
    let value = videoUrl?.trim() ?? "";
    if (!value) return "";

    value = value.split("?")[0] ?? value;
    value = value.split("#")[0] ?? value;

    if (value.startsWith("http://") || value.startsWith("https://")) {
        try {
            value = new URL(value).pathname.split("/").filter(Boolean).pop() ?? "";
        } catch {
            // não é URL válida: trata como playback ID
        }
    }

    return value.replace(/(?:\.m3u8)+$/i, "").replace(/^\/+|\/+$/g, "");
}

/** URL Mux limpa: nunca gera .m3u8.m3u8. */
export function muxPlaybackUrl(videoUrl?: string | null): string {
    const playbackId = playbackIdFrom(videoUrl);
    return playbackId ? `https://stream.mux.com/${encodeURIComponent(playbackId)}.m3u8` : "";
}

export const getMuxVideoUrl = muxPlaybackUrl;

/** O backend é a fonte da verdade; aqui só preenchemos valores ausentes. */
function normalizeVideo(video: VideoItem): VideoItem {
    return {
        ...video,
        videoUrl: normalizeVideoUrl(video.videoUrl),
        thumbnailUrl: video.thumbnailUrl ?? "",
        formattedDuration: video.formattedDuration ?? "",
        description: video.description ?? undefined,
        likesCount: video.likesCount ?? 0,
        commentsCount: video.commentsCount ?? 0,
        dislikesCount: video.dislikesCount ?? 0,
        viewCount: video.viewCount ?? 0,
        userAvatarUrl: video.userAvatarUrl ?? undefined,
        hashtags: video.hashtags ?? [],
        isShort: video.isShort ?? false,
        isLive: video.isLive ?? false,
        isLiveNow: video.isLiveNow ?? false,
    };
}

function normalizePage(data: VideoPage): VideoPage {
    if (!data || !Array.isArray(data.content)) throw new Error("Resposta inválida da API");
    return { content: data.content.map(normalizeVideo), last: data.last ?? true };
}

/* ================================================================
 * LISTAGENS
 * ================================================================ */

export interface FeedOptions {
    order?: FeedOrder;
    /** Com token, cada vídeo já vem com liked/disliked de quem está vendo. */
    token?: string | null;
}

/** Feed paginado. Propaga o erro para a tela mostrar o estado de falha. */
export async function fetchVideoPage(
    page: number,
    isShort = false,
    { order = "recent", token }: FeedOptions = {}
): Promise<VideoPage> {
    const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        isShort: String(isShort),
        order,
    });
    return normalizePage(await getJson<VideoPage>(`/api/videos?${params}`, token));
}

/** Busca no servidor (título, descrição e nome do criador), não só no que já foi carregado. */
export async function searchVideos(query: string, page: number, token?: string | null): Promise<VideoPage> {
    const q = query.trim();
    if (!q) return { content: [], last: true };
    const params = new URLSearchParams({ query: q, page: String(page), size: String(PAGE_SIZE) });
    return normalizePage(await getJson<VideoPage>(`/api/videos/search?${params}`, token));
}

export async function fetchVideosByHashtag(tag: string, page: number): Promise<VideoPage> {
    const cleanTag = tag.trim().replace(/^#/, "");
    if (!cleanTag) return { content: [], last: true };
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    return normalizePage(
        await getJson<VideoPage>(`/api/videos/hashtag/${encodeURIComponent(cleanTag)}?${params}`)
    );
}

/** Lives no ar agora. Falha silenciosa: a faixa "Ao vivo" só mostra "nenhuma live". */
export async function fetchLiveVideos(): Promise<VideoItem[]> {
    try {
        const data = await getJson<VideoPage>("/api/videos/live?size=8");
        return Array.isArray(data?.content) ? data.content.map(normalizeVideo) : [];
    } catch {
        return [];
    }
}

/** Vídeos marcados com o evento, para a página dele. */
export async function fetchTournamentVideos(tournamentId: string, page = 0): Promise<VideoPage> {
    const params = new URLSearchParams({ page: String(page), size: "12" });
    return normalizePage(
        await getJson<VideoPage>(`/api/videos/tournament/${encodeURIComponent(tournamentId)}?${params}`)
    );
}

/** Todos os vídeos de quem está logado, em qualquer estado (Central de Vídeos e Perfil). */
export async function fetchMyVideos(token: string, page: number): Promise<VideoPage> {
    const params = new URLSearchParams({ page: String(page), size: String(PAGE_SIZE) });
    return normalizePage(await getJson<VideoPage>(`/api/videos/my-videos?${params}`, token));
}

/** Vídeos publicados de um usuário (perfil público). */
export async function fetchUserVideos(userId: string, page = 0): Promise<VideoPage> {
    const params = new URLSearchParams({ page: String(page), size: "24" });
    return normalizePage(await getJson<VideoPage>(`/api/videos/user/${encodeURIComponent(userId)}?${params}`));
}

/* ================================================================
 * UM VÍDEO
 * ================================================================ */

/** Com token, vem com liked/disliked e o dono vê os próprios vídeos privados. */
export async function fetchVideo(id: string, token?: string | null): Promise<VideoItem | null> {
    if (!id) return null;
    try {
        return normalizeVideo(await getJson<VideoItem>(`/api/videos/${encodeURIComponent(id)}`, token));
    } catch {
        return null;
    }
}

/** Mesmo autor primeiro, depois os mais recentes do mesmo formato. */
export async function fetchRelated(id: string): Promise<VideoItem[]> {
    try {
        const list = await getJson<VideoItem[]>(`/api/videos/${encodeURIComponent(id)}/related?limit=8`);
        return Array.isArray(list) ? list.map(normalizeVideo) : [];
    } catch {
        return [];
    }
}

/* ================================================================
 * LIKE / DISLIKE
 * ================================================================ */

async function react(id: string, token: string, kind: "like" | "dislike"): Promise<ReactionResponse | null> {
    if (!id || !token) return null;
    try {
        const res = await fetch(`${API_URL}/api/videos/${encodeURIComponent(id)}/${kind}`, {
            method: "POST",
            headers: { Accept: "application/json", ...authHeaders(token) },
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) return null;
        return (await res.json()) as ReactionResponse;
    } catch {
        return null;
    }
}

export const likeVideo = (id: string, token: string) => react(id, token, "like");
export const dislikeVideo = (id: string, token: string) => react(id, token, "dislike");

/* ================================================================
 * TEMPO ASSISTIDO (views)
 * ================================================================ */

/**
 * Heartbeat do player. O backend só conta a view depois de ~30s assistidos,
 * uma vez por pessoa a cada 24h. `keepalive` deixa o último envio sair ao fechar a aba.
 */
export function sendWatchTime(id: string, seconds: number, token?: string | null): void {
    const whole = Math.min(120, Math.round(seconds));
    if (!id || whole < 1) return;
    fetch(`${API_URL}/api/videos/${encodeURIComponent(id)}/watch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ seconds: whole }),
        keepalive: true,
    }).catch(() => {
        // métrica: perder um heartbeat não pode atrapalhar quem está assistindo
    });
}

/* ================================================================
 * LIVES
 * ================================================================ */

/** Com `tournamentId`, a live aparece no topo da página do evento (só o organizador pode). */
export async function createLive(token: string, title: string, description: string, tournamentId?: string | null): Promise<LiveCredentials> {
    const res = await fetch(`${API_URL}/api/videos/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ title, description, tournamentId: tournamentId || null }),
        // O backend grátis dorme e leva ~50s para acordar; com 20s a live "não ia"
        signal: AbortSignal.timeout(75000),
    });
    if (!res.ok) throw await errorFrom(res);
    return (await res.json()) as LiveCredentials;
}

/** Live do organizador no ar agora na página do evento; null quando não há. */
export async function fetchTournamentLive(tournamentId: string): Promise<VideoItem | null> {
    try {
        const res = await fetch(`${API_URL}/api/tournaments/${encodeURIComponent(tournamentId)}/live`, {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(TIMEOUT_MS),
            cache: "no-store",
        });
        if (res.status === 204 || !res.ok) return null;
        return normalizeVideo((await res.json()) as VideoItem);
    } catch {
        return null;
    }
}

export function fetchLiveCredentials(token: string, videoId: string): Promise<LiveCredentials> {
    return getJson<LiveCredentials>(`/api/videos/${encodeURIComponent(videoId)}/live/credentials`, token);
}

export async function endLive(token: string, videoId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/videos/${encodeURIComponent(videoId)}/live/end`, {
        method: "POST",
        headers: authHeaders(token),
        signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw await errorFrom(res);
}

/* ================================================================
 * EXCLUIR
 * ================================================================ */

export async function deleteVideo(token: string, videoId: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/videos/${encodeURIComponent(videoId)}`, {
        method: "DELETE",
        headers: authHeaders(token),
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw await errorFrom(res);
}
