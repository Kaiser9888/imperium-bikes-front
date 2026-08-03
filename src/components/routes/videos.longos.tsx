import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { EmptyState } from "@/components/videos/FeedStates";

export const Route = createFileRoute("/videos/longos")({
    head: () => ({
        meta: [
            { title: "Vídeos longos — Imperium Bikes" },
            { name: "description", content: "Trilhas completas, tutoriais e reviews em formato longo." },
            { property: "og:title", content: "Vídeos longos — Imperium Bikes" },
            { property: "og:description", content: "Trilhas completas, tutoriais e reviews em formato longo." },
        ],
    }),
    component: LongVideosPage,
});

function LongVideosPage() {
    const { videos, loading } = useVideoFeed(false);
    const longs = useMemo(() => videos.filter((v) => (v.durationSeconds ?? 0) >= 300 || !v.isShort), [videos]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Longos</h1>
            <p className="mt-1 text-sm text-muted-foreground">Conteúdo completo, sem pressa.</p>

            <div className="mt-8">
                {loading ? (
                    <VideoGridSkeleton />
                ) : longs.length === 0 ? (
                    <EmptyState />
                ) : (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {longs.map((v, i) => (
                            <li key={v.id}>
                                <VideoCard video={v} priority={i < 4} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
