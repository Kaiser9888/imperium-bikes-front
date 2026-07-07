// components/video/VideoGrid.tsx
'use client'

import { VideoCard } from './VideoCard';
import { Skeleton } from '@/components/ui/skeleton';

interface VideoGridProps {
    videos: Video[];
    isLoading?: boolean;
    layout?: 'grid' | 'horizontal';
}

export function VideoGrid({ videos, isLoading, layout = 'grid' }: VideoGridProps) {
    if (isLoading) {
        return (
            <div className={`grid gap-6 ${
                layout === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
            }`}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-video rounded-xl" />
                        <div className="flex gap-3">
                            <Skeleton className="w-9 h-9 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-2/3" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!videos.length) {
        return (
            <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                    Nenhum vídeo encontrado
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    Tente ajustar os filtros ou buscar por outra coisa
                </p>
            </div>
        );
    }

    return (
        <div className={`grid gap-6 ${
            layout === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
        }`}>
            {videos.map(video => (
                <VideoCard
                    key={video.id}
                    video={video}
                    layout={layout === 'horizontal' ? 'compact' : 'grid'}
                />
            ))}
        </div>
    );
}