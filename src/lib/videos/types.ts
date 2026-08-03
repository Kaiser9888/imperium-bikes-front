export interface VideoItem {
    id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl: string;
    durationSeconds?: number;
    formattedDuration: string;
    viewCount: number;
    likesCount?: number;
    userName: string;
    userAvatarUrl?: string;
    createdAt: string;
    isShort?: boolean;
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
