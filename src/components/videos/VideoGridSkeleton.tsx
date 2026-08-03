export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div
            role="status"
            aria-label="Carregando vídeos"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-lg border border-border bg-card">
                    <div className="aspect-video bg-secondary" />
                    <div className="space-y-2 p-4">
                        <div className="h-4 w-3/4 rounded bg-secondary" />
                        <div className="h-3 w-1/2 rounded bg-secondary" />
                    </div>
                </div>
            ))}
        </div>
    );
}