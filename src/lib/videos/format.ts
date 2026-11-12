/** Número curto em português: 950, 1,2 mil, 3,4 mi. */
export function formatViews(views: number): string {
    const n = views ?? 0;
    const curto = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    if (n >= 1_000_000) return `${curto(n / 1_000_000)} mi`;
    if (n >= 1_000) return `${curto(n / 1_000)} mil`;
    return String(n);
}

/** "1 visualização", "2 visualizações", "1,2 mil visualizações". */
export function visualizacoes(views: number): string {
    return `${formatViews(views)} ${(views ?? 0) === 1 ? "visualização" : "visualizações"}`;
}

export function timeAgo(date: string): string {
    if (!date) return "";
    const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
    if (diffDays <= 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    return `${Math.floor(diffDays / 365)}a`;
}

export function formatBytes(bytes: number): string {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Number((bytes / Math.pow(1024, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}
