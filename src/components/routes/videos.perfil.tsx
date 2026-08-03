import { createFileRoute, Link } from "@tanstack/react-router";
import { useVideoFeed } from "@/hooks/useVideoFeed";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { VideoAvatar } from "@/components/videos/VideoAvatar";

export const Route = createFileRoute("/videos/perfil")({
    head: () => ({
        meta: [
            { title: "Perfil — Imperium Bikes" },
            { name: "description", content: "Seus vídeos publicados e atividade na comunidade Imperium Bikes." },
            { property: "og:title", content: "Perfil — Imperium Bikes" },
            { property: "og:description", content: "Seus vídeos publicados na Imperium Bikes." },
        ],
    }),
    component: ProfilePage,
});

function ProfilePage() {
    const { videos, loading } = useVideoFeed(false);
    const mine = videos.slice(0, 4);

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-4">
                    <VideoAvatar name="Você" className="size-14" />
                    <div>
                        <p className="text-base font-semibold text-foreground">Seu perfil</p>
                        <p className="text-xs text-muted-foreground">{mine.length} vídeos publicados</p>
                    </div>
                </div>
                <Link
                    to="/videos/upload"
                    className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Publicar
                </Link>
            </header>

            <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Publicações</h2>
            <div className="mt-4">
                {loading ? (
                    <VideoGridSkeleton count={4} />
                ) : (
                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {mine.map((v) => (
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
