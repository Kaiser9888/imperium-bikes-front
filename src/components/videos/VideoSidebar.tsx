import Link from "next/link";
import { Play } from "lucide-react";
import type { VideoItem } from "@/lib/videos/types";
import { formatViews, timeAgo } from "@/lib/videos/format";

interface VideoSidebarProps {
    videos: VideoItem[];
}

export function VideoSidebar({ videos }: VideoSidebarProps) {
    return (
        <aside aria-label="Vídeos relacionados" className="lg:sticky lg:top-24">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Relacionados</h2>
            {videos.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">Nenhum vídeo encontrado.</p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {videos.map((v) => (
                        <li key={v.id}>
                            <Link
                                href={`/videos/watch/${v.id}`}
                                className="group flex gap-3 rounded-lg border border-border bg-card p-2 transition-colors hover:border-primary/40"
                            >
                                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-secondary">
                                    {v.thumbnailUrl ? (
                                        <img src={v.thumbnailUrl} alt="" loading="lazy" className="size-full object-cover" />
                                    ) : (
                                        <span className="flex size-full items-center justify-center">
                                            <Play className="size-4 text-muted-foreground" aria-hidden="true" />
                                        </span>
                                    )}
                                    <span className="absolute bottom-1 right-1 rounded bg-background/90 px-1 text-[10px] tabular-nums">
                                        {v.formattedDuration || "00:00"}
                                    </span>
                                </div>
                                <div className="min-w-0 py-0.5">
                                    <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-primary">
                                        {v.title}
                                    </p>
                                    <p className="mt-1 truncate text-xs text-muted-foreground">{v.userName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatViews(v.viewCount)} views · {timeAgo(v.createdAt)}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
}