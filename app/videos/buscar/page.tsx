"use client";

import { useMemo, useState } from "react";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { Search } from "lucide-react";

export default function BuscarPage() {
  const { videos, loading } = useVideoFeed(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return videos.filter((v) =>
      `${v.title} ${v.userName}`.toLowerCase().includes(q)
    );
  }, [videos, query]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg px-4 py-3">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar..."
            autoFocus
            className="w-full rounded-full border border-border bg-muted/50 py-2 pl-10 pr-4 text-sm outline-none focus:border-primary/40 focus:bg-background transition-colors"
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Encontre vídeos, criadores e conteúdos
        </p>
      </div>

      <div className="px-4 py-6">
        {loading ? (
          <VideoGridSkeleton count={4} />
        ) : !query.trim() ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            Digite algo para buscar vídeos
          </p>
        ) : results.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            Nenhum resultado para &ldquo;{query}&rdquo;
          </p>
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
