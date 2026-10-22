import Link from "next/link";
import { Play } from "lucide-react";
import type { VideoItem } from "@/lib/videos/types";
import { formatViews, timeAgo } from "@/lib/videos/format";
import { VideoAvatar } from "./VideoAvatar";
import { SaveButton } from "./SaveButton";

type CardVideo = Pick<
    VideoItem,
    "id" | "title" | "thumbnailUrl" | "formattedDuration" | "viewCount" | "userName" | "userAvatarUrl" | "createdAt" | "hashtags"
>;

interface VideoCardProps {
    video: CardVideo;
    priority?: boolean;
}

export function VideoCard({ video, priority = false }: VideoCardProps) {
    return (
        <article className="group relative">
            <Link
                href={`/videos/watch/${video.id}`}
                className="block rounded-xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
            >
                <div className="relative aspect-video overflow-hidden rounded-xl bg-secondary ring-1 ring-border transition duration-300 group-hover:ring-primary/60">
                    {video.thumbnailUrl ? (
                        <img
                            src={video.thumbnailUrl}
                            alt=""
                            loading={priority ? "eager" : "lazy"}
                            decoding="async"
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-secondary">
                            <Play className="size-7 text-muted-foreground" aria-hidden="true" />
                        </div>
                    )}

                    {/* Faixa vermelha que corre embaixo no hover: assinatura visual dos cards */}
                    <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100"
                    />

                    {/* Duração como cronômetro de prova: canto reto e filete vermelho */}
                    {video.formattedDuration && (
                        <span className="absolute bottom-2 left-2 border-l-2 border-primary bg-black/80 px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums tracking-wider text-white">
                            {video.formattedDuration}
                        </span>
                    )}
                </div>

                <div className="mt-3 min-w-0">
                    {video.hashtags?.[0] && (
                        <p className="truncate text-[0.6875rem] font-semibold text-primary">#{video.hashtags[0]}</p>
                    )}
                    <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {video.title}
                    </h3>
                    <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                        <VideoAvatar name={video.userName} url={video.userAvatarUrl} className="size-5" />
                        <span className="truncate">{video.userName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="shrink-0">{formatViews(video.viewCount)} views</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={video.createdAt} className="shrink-0">{timeAgo(video.createdAt)}</time>
                    </p>
                </div>
            </Link>

            {/* Fora do link: salvar não abre o vídeo */}
            <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 max-sm:opacity-100">
                <SaveButton videoId={video.id} iconOnly />
            </div>
        </article>
    );
}
