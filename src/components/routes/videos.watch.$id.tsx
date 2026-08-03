import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { fetchRelated, fetchVideo, playbackIdFrom } from "@/lib/videos/api";
import type { VideoItem } from "@/lib/videos/types";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { VideoActions } from "@/components/videos/VideoActions";
import { VideoStats } from "@/components/videos/VideoStats";
import { VideoComments } from "@/components/videos/VideoComments";
import { VideoSidebar } from "@/components/videos/VideoSidebar";
import { VideoAvatar } from "@/components/videos/VideoAvatar";

export const Route = createFileRoute("/videos/watch/$id")({
    head: () => ({
        meta: [
            { title: "Assistir — Imperium Bikes" },
            { name: "description", content: "Assista ao vídeo e acompanhe a comunidade Imperium Bikes." },
            { property: "og:title", content: "Assistir — Imperium Bikes" },
            { property: "og:description", content: "Assista ao vídeo e acompanhe a comunidade Imperium Bikes." },
        ],
    }),
    component: WatchPage,
});

function WatchPage() {
    const { id } = useParams({ from: "/videos/watch/$id" });
    const [video, setVideo] = useState<VideoItem | null>(null);
    const [related, setRelated] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMore, setShowMore] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        void (async () => {
            const data = await fetchVideo(id);
            if (cancelled) return;
            setVideo(data);
            setLikesCount(data?.likesCount ?? 0);
            setLoading(false);
        })();
        void fetchRelated(id).then((r) => !cancelled && setRelated(r));
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8">
                <div className="aspect-video w-full rounded-lg bg-card" />
                <div className="mt-4 h-6 w-2/3 rounded bg-card" />
            </div>
        );
    }

    if (!video) {
        return <p className="px-6 py-20 text-center text-muted-foreground">Vídeo não encontrado</p>;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-5">
                    <VideoPlayer playbackId={playbackIdFrom(video.videoUrl)} title={video.title} />

                    <div>
                        <h1 className="text-lg font-semibold leading-snug text-foreground lg:text-xl">{video.title}</h1>
                        <div className="mt-2">
                            <VideoStats viewCount={video.viewCount} createdAt={video.createdAt} />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
                        <div className="flex items-center gap-3">
                            <VideoAvatar name={video.userName} url={video.userAvatarUrl} className="size-10" />
                            <div>
                                <p className="text-sm font-medium text-foreground">{video.userName}</p>
                                <p className="text-xs text-muted-foreground">Criador Imperium</p>
                            </div>
                        </div>
                        <VideoActions liked={liked} likesCount={likesCount} onToggleLike={() => {
                            setLiked((v) => !v);
                            setLikesCount((c) => c + (liked ? -1 : 1));
                        }} />
                    </div>

                    {video.description && (
                        <div className="rounded-lg border border-border bg-card">
                            <button
                                type="button"
                                onClick={() => setShowMore((v) => !v)}
                                aria-expanded={showMore}
                                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
                            >
                                Descrição
                                <ChevronDown className={`size-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
                            </button>
                            {showMore && (
                                <p className="whitespace-pre-wrap border-t border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground">
                                    {video.description}
                                </p>
                            )}
                        </div>
                    )}

                    <VideoComments videoId={video.id} />
                </div>

                <VideoSidebar videos={related} />
            </div>
        </div>
    );
}
