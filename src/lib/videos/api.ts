import type { ReactionResponse, VideoPage } from "./types";

// ...mantém tudo que já existe (fetchVideoPage, fetchVideo, fetchRelated, playbackIdFrom)...

/** Curte o vídeo (alterna). Se o usuário tinha descurtido, o backend deve desfazer o dislike. */
export async function likeVideo(id: string): Promise<ReactionResponse | null> {
    try {
        const res = await fetch(`${API_URL}/api/videos/${id}/like`, {
            method: "POST",
            credentials: "include",
            signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as ReactionResponse;
    } catch {
        return null;
    }
}

/** Descurte o vídeo (alterna). Se o usuário tinha curtido, o backend deve desfazer o like. */
export async function dislikeVideo(id: string): Promise<ReactionResponse | null> {
    try {
        const res = await fetch(`${API_URL}/api/videos/${id}/dislike`, {
            method: "POST",
            credentials: "include",
            signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as ReactionResponse;
    } catch {
        return null;
    }
}

/** Lista vídeos de uma hashtag específica (sem "#"). Endpoint ainda não existe no backend. */
export async function fetchVideosByHashtag(tag: string, page: number): Promise<VideoPage> {
    try {
        const res = await fetch(
          `${API_URL}/api/videos/hashtag/${encodeURIComponent(tag)}?page=${page}&size=${PAGE_SIZE}`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as VideoPage;
    } catch {
        // Sem fallback fictício aqui: se o endpoint não existir ainda, a página mostra "sem resultados".
        return { content: [], last: true };
    }
}