import type { VideoItem, VideoPage, ReactionResponse } from "./types";

export const API_URL = "https://imperium-bikes.onrender.com";
export const PAGE_SIZE = 12;

const DEMO_TITLES = [
    "Trilha completa na Serra do Cipó — 42km de puro MTB",
    "Como regular suspensão dianteira em 10 minutos",
    "Speed no amanhecer: 80km pela estrada velha",
    "Gravel: a rota secreta entre as fazendas",
    "Manutenção de transmissão sem oficina",
    "Downhill técnico — leitura de linha na pedreira",
    "Urbano noturno: pedal seguro na cidade",
    "Review: bike elétrica na subida mais dura da região",
    "BMX street — sessão de 3 horas no centro",
    "Bikepacking de fim de semana com pouco peso",
    "Treino de cadência para ganhar fôlego",
    "Reparo de pneu tubeless na trilha",
];

const DEMO_AUTHORS = ["Rafael Moura", "Bianca Torres", "Imperium Crew", "Lucas Prado", "Marina Reis"];

function demoPage(page: number, isShort: boolean): VideoPage {
    const content: VideoItem[] = Array.from({ length: PAGE_SIZE }).map((_, i) => {
        const n = page * PAGE_SIZE + i;
        const mins = 3 + (n % 22);
        return {
            id: `${isShort ? "m" : "v"}-${n}`,
            title: DEMO_TITLES[n % DEMO_TITLES.length]!,
            description:
              "Registro completo do pedal, com detalhes de rota, equipamento utilizado e as passagens mais técnicas do percurso.",
            thumbnailUrl: "",
            formattedDuration: isShort
              ? `0:${String(20 + (n % 39)).padStart(2, "0")}`
              : `${mins}:${String(10 + (n % 49)).padStart(2, "0")}`,
            durationSeconds: mins * 60,
            viewCount: 320 + n * 617,
            likesCount: 12 + n * 7,
            userName: DEMO_AUTHORS[n % DEMO_AUTHORS.length]!,
            createdAt: new Date(Date.now() - n * 86_400_000 * 2).toISOString(),
            isShort,
        };
    });
    return { content, last: page >= 2 };
}

/** Lista paginada. Mantém o endpoint original; usa conteúdo de demonstração se a API não responder. */
export async function fetchVideoPage(page: number, isShort = false): Promise<VideoPage> {
    try {
        const res = await fetch(`${API_URL}/api/videos?page=${page}&size=${PAGE_SIZE}&isShort=${isShort}`, {
            signal: AbortSignal.timeout(4000),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as VideoPage;
        if (!data?.content?.length) return demoPage(page, isShort);
        return data;
    } catch {
        return demoPage(page, isShort);
    }
}

export async function fetchVideo(id: string): Promise<VideoItem | null> {
    try {
        const res = await fetch(`${API_URL}/api/videos/${id}`, { signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as VideoItem;
    } catch {
        const fallback = demoPage(0, false).content.find((v) => v.id === id);
        return fallback ?? { ...demoPage(0, false).content[0]!, id };
    }
}

export async function fetchRelated(id: string): Promise<VideoItem[]> {
    const page = await fetchVideoPage(0, false);
    return page.content.filter((v) => v.id !== id).slice(0, 8);
}

export function playbackIdFrom(videoUrl?: string): string {
    return videoUrl?.split("/").pop()?.replace(".m3u8", "") ?? "";
}

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
        return { content: [], last: true };
    }
}
