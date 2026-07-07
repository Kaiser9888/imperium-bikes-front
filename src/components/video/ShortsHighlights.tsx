// components/video/ShortsHighlights.tsx
'use client'

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ShortsHighlightsProps {
    shorts: Video[];
}

export function ShortsHighlights({ shorts }: ShortsHighlightsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (!shorts.length) return null;

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Play className="w-4 h-4 text-white" fill="white" />
                        </div>
                        <h2 className="text-xl font-bold">Shorts</h2>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        Novo
                    </Badge>
                </div>

                <Link
                    href="/videos/shorts"
                    className="text-sm text-primary hover:underline font-medium"
                >
                    Ver todos
                </Link>
            </div>

            {/* Carrossel de Shorts */}
            <div className="relative group">
                {/* Botão Esquerda */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => scroll('left')}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                {/* Container Scrollável */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
                >
                    {shorts.map((short) => (
                        <Link
                            key={short.id}
                            href={`/videos/shorts?start=${short.id}`}
                            className="flex-shrink-0 w-[180px] group/short"
                        >
                            <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100">
                                <Image
                                    src={short.thumbnailUrl}
                                    alt={short.title}
                                    fill
                                    className="object-cover group-hover/short:scale-105 transition-transform duration-300"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/short:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                        <Play className="w-6 h-6 text-black" fill="black" />
                                    </div>
                                </div>

                                {/* Informações */}
                                <div className="absolute bottom-2 left-2 right-2">
                                    <h3 className="text-white text-sm font-medium line-clamp-2">
                                        {short.title}
                                    </h3>
                                    <p className="text-white/80 text-xs mt-1">
                                        {short.author.name}
                                    </p>
                                </div>

                                {/* Views */}
                                <Badge className="absolute top-2 right-2 bg-black/50 text-white border-0">
                                    {(short.views / 1000).toFixed(1)}K
                                </Badge>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Botão Direita */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => scroll('right')}
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}