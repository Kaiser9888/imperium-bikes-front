import { createFileRoute } from "@tanstack/react-router";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { MementoFeed } from "@/components/videos/MementoFeed";

export const Route = createFileRoute("/videos/memento")({
    head: () => ({
        meta: [
            { title: "Memento — Imperium Bikes" },
            { name: "description", content: "Clipes verticais e rápidos da comunidade Imperium Bikes." },
            { property: "og:title", content: "Memento — Imperium Bikes" },
            { property: "og:description", content: "Clipes verticais e rápidos da comunidade Imperium Bikes." },
        ],
    }),
    component: MementoPage,
});

function MementoPage() {
    const { videos, loading, loadMore } = useVideoFeed(true);

    if (loading) {
        return <div className="h-[calc(100dvh-8rem)] animate-pulse bg-card" />;
    }

    return <MementoFeed videos={videos} onEndReached={() => void loadMore()} />;
}
