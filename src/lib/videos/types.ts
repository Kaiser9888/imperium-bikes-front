export type VideoStatus = "UPLOADING" | "PROCESSING" | "READY" | "PUBLISHED" | "FAILED" | "REMOVED";

export interface VideoItem {
    id: string;
    userId?: string;
    title: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl: string;
    durationSeconds?: number;
    formattedDuration: string;
    viewCount: number;
    likesCount?: number;
    commentsCount: number;
    dislikesCount?: number;
    /** Reação de quem está vendo (só vem quando a requisição leva o token). */
    liked?: boolean;
    disliked?: boolean;
    hashtags?: string[];
    userName: string;
    userAvatarUrl?: string;
    createdAt: string;
    isShort?: boolean;
    /** Live criada (ainda não virou replay). */
    isLive?: boolean;
    /** Live transmitindo agora. */
    isLiveNow?: boolean;
    /** PROCESSING enquanto o Mux prepara o vídeo; PUBLISHED quando dá para assistir; READY = live aguardando. */
    status?: VideoStatus;
}

export interface VideoPage {
    content: VideoItem[];
    last: boolean;
}

export interface CommentItem {
    id: string;
    userName: string;
    userAvatarUrl?: string;
    text: string;
    createdAt: string;
}

export interface ReactionResponse {
    likesCount: number;
    dislikesCount: number;
    liked: boolean;
    disliked: boolean;
}

export interface LiveCredentials {
    videoId: string;
    ingestUrl: string;
    streamKey: string;
    isLiveNow: boolean;
}

/** recent = mais recentes (padrão); views = mais vistos. */
export type FeedOrder = "recent" | "views";
