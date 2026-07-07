// components/video/VideoCard.tsx
'use client'

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Heart,
    MessageCircle,
    Eye,
    Clock,
    Bookmark,
    Share2,
    MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VideoCardProps {
    video: Video;
    layout?: 'grid' | 'horizontal' | 'compact';
}

export function VideoCard({ video, layout = 'grid' }: VideoCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleLike = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLiked(!isLiked);

        try {
            await fetch(`/api/videos/${video.id}/like`, {
                method: isLiked ? 'DELETE' : 'POST'
            });
        } catch (error) {
            setIsLiked(!isLiked); // Reverte em caso de erro
        }
    }, [video.id, isLiked]);

    const handleSave = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaved(!isSaved);

        try {
            await fetch(`/api/videos/${video.id}/save`, {
                method: isSaved ? 'DELETE' : 'POST'
            });
        } catch (error) {
            setIsSaved(!isSaved);
        }
    }, [video.id, isSaved]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        if (mins >= 60) {
            const hours = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            TUTORIAL: 'bg-blue-500',
            REVIEW: 'bg-yellow-500',
            TRAIL: 'bg-green-500',
            COMPETITION: 'bg-red-500',
            VLOG: 'bg-purple-500',
            UNBOXING: 'bg-orange-500',
            MAINTENANCE: 'bg-cyan-500',
        };
        return colors[category] || 'bg-gray-500';
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            TUTORIAL: ' Tutorial',
            REVIEW: ' Review',
            TRAIL: ' Trilha',
            COMPETITION: ' Competição',
            VLOG: ' Vlog',
            UNBOXING: ' Unboxing',
            MAINTENANCE: ' Manutenção',
        };
        return labels[category] || category;
    };

    if (layout === 'compact') {
        return (
            <Link
                href={`/videos/watch/${video.id}`}
                className="group block"
            >
                <div className="flex gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                    <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                            src={video.thumbnailUrl}
                            alt={video.title}
                            fill
                            className="object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
              {formatDuration(video.duration)}
            </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {video.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            {video.author.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{formatViews(video.views)} views</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(video.createdAt), { locale: ptBR, addSuffix: true })}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/videos/watch/${video.id}`}
            className="group block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="space-y-3">
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Overlay com informações */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-white hover:text-white hover:bg-white/20"
                                onClick={handleSave}
                            >
                                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white hover:text-white hover:bg-white/20"
                                        onClick={(e) => e.preventDefault()}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Compartilhar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Denunciar</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Duração */}
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>

                    {/* Badge de Categoria */}
                    <Badge className={`absolute top-2 left-2 ${getCategoryColor(video.category)}`}>
                        {getCategoryLabel(video.category)}
                    </Badge>
                </div>

                {/* Informações do Vídeo */}
                <div className="flex gap-3">
                    <Link href={`/creators/${video.author.username}`} className="flex-shrink-0">
                        <Avatar className="w-9 h-9">
                            <AvatarImage src={video.author.avatar} />
                            <AvatarFallback>
                                {video.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {video.title}
                        </h3>

                        <Link
                            href={`/creators/${video.author.username}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors block"
                        >
                            {video.author.name}
                            {video.author.isVerified && ' ✓'}
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatViews(video.views)} visualizações</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(video.createdAt), { locale: ptBR, addSuffix: true })}</span>
                        </div>

                        {/* Tags */}
                        {video.tags && video.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {video.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}