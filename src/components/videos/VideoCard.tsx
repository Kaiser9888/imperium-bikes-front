import Link from "next/link";
import { Eye, Play } from "lucide-react";
import type { VideoItem } from "@/lib/videos/types";
import { formatViews, timeAgo } from "@/lib/videos/format";
import { VideoAvatar } from "./VideoAvatar";

interface VideoCardProps {
    video: VideoItem;
    priority?: boolean;
}

export function VideoCard({ video, priority = false }: VideoCardProps) {
    return (
        <Link
            href={`/videos/watch/${video.id}`}
            className="group block rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
        >
            <article className="overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 group-hover:border-primary/40">
                <div className="relative aspect-video overflow-hidden bg-secondary">
                    {video.thumbnailUrl ? (
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title || "Miniatura do vídeo"}
                            loading={priority ? "eager" : "lazy"}
                            decoding="async"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-secondary">
                            <Play className="size-7 text-muted-foreground" aria-hidden="true" />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="flex size-11 items-center justify-center rounded-full border border-border bg-background/85 backdrop-blur-sm">
                            <Play className="ml-0.5 size-4 fill-primary text-primary" aria-hidden="true" />
                        </span>
                    </div>
                    <span className="absolute bottom-2.5 right-2.5 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
                        {video.formattedDuration || "00:00"}
                    </span>
                </div>

                <div className="p-4">
                    <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                        {video.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                        <span className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                            <VideoAvatar name={video.userName} url={video.userAvatarUrl} />
                            <span className="truncate">{video.userName}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="size-3.5" aria-hidden="true" />
                            {formatViews(video.viewCount)}
                            <span aria-hidden="true">·</span>
                            <time dateTime={video.createdAt}>{timeAgo(video.createdAt)}</time>
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}