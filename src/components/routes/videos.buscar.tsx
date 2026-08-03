import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { SearchBar } from "@/components/videos/SearchBar";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";

export const Route = createFileRoute("/videos/buscar")({
    head: () => ({
        meta: [
            { title: "Buscar vídeos — Imperium Bikes" },
            { name: "description", content: "Encontre vídeos por título, autor ou modalidade na Imperium Bikes." },
            { property: "og:title", content: "Buscar vídeos — Imperium Bikes" },
            { property: "og:description", content: "Encontre vídeos por título, autor ou modalidade." },
        ],
    }),
    component: SearchPage,
});

function SearchPage() {
    const { videos, loading } = useVideoFeed(false);
    const [query, setQuery] = useState("");

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return videos.filter((v) => `${v.title} ${v.userName}`.toLowerCase().includes(q));
    }, [videos, query]);

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Buscar</h1>
            <div className="mt-4">
                <SearchBar value={query} onChange={setQuery} autoFocus />
            </div>

            <div className="mt-8">
                {loading ? (
                    <VideoGridSkeleton count={4} />
                ) : !query.trim() ? (
                    <p className="text-sm text-muted-foreground">Digite para encontrar vídeos, autores ou modalidades.</p>
                ) : results.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum resultado para “{query}”.</p>
                ) : (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {results.map((v) => (
                            <li key={v.id}>
                                <VideoCard video={v} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
