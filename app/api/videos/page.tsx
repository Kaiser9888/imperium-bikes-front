// app/videos/page.tsx
'use client'

import { useVideoFeed } from '@/hooks/useVideoFeed';
import { VideoGrid } from '@/components/video/VideoGrid';
import { VideoFilters } from '@/components/video/VideoFilters';
import { ShortsHighlights } from '@/components/video/ShortsHighlights';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Bike, Flame, Clock, Compass } from 'lucide-react';
import Link from 'next/link';

export default function VideosPage() {
    const {
        videos,
        shorts,
        isLoading,
        hasMore,
        activeFilters,
        applyFilters,
        searchVideos,
        loadMoreRef,
    } = useVideoFeed();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="bg-gradient-to-b from-primary/5 to-background pt-8 pb-12">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                            <Bike className="w-10 h-10 text-primary" />
                            Bike Videos
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Descubra tutoriais, reviews, trilhas e muito mais do mundo bike.
                            Compartilhe sua paixão com a comunidade!
                        </p>

                        <div className="flex items-center justify-center gap-4 mt-6">
                            <Link href="/videos/upload">
                                <Button size="lg" className="gap-2">
                                    <Upload className="w-5 h-5" />
                                    Publicar Vídeo
                                </Button>
                            </Link>
                            <Link href="/videos/shorts">
                                <Button variant="outline" size="lg" className="gap-2">
                                    <Flame className="w-5 h-5" />
                                    Ver Shorts
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Rápidas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                        {[
                            { label: 'Vídeos', value: '2.5K+', icon: Flame },
                            { label: 'Criadores', value: '500+', icon: Bike },
                            { label: 'Visualizações', value: '1M+', icon: Clock },
                            { label: 'Comunidade', value: '10K+', icon: Compass },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-4 rounded-xl bg-background border">
                                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-8">
                {/* Shorts em Destaque */}
                {shorts.length > 0 && (
                    <section>
                        <ShortsHighlights shorts={shorts} />
                    </section>
                )}

                {/* Filtros */}
                <section className="sticky top-4 z-20 bg-background/95 backdrop-blur-sm rounded-xl border p-4">
                    <VideoFilters
                        onFilterChange={applyFilters}
                        onSearch={searchVideos}
                        activeFilters={activeFilters}
                    />
                </section>

                {/* Tabs de Conteúdo */}
                <section>
                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="all">
                                <Flame className="w-4 h-4 mr-2" />
                                Em Alta
                            </TabsTrigger>
                            <TabsTrigger value="recent">
                                <Clock className="w-4 h-4 mr-2" />
                                Recentes
                            </TabsTrigger>
                            <TabsTrigger value="tutorial">
                                <Bike className="w-4 h-4 mr-2" />
                                Tutoriais
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </section>

                {/* Grid de Vídeos */}
                <section>
                    <VideoGrid videos={videos} isLoading={isLoading} />

                    {/* Load More Trigger */}
                    {hasMore && (
                        <div ref={loadMoreRef} className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    )}

                    {/* End Message */}
                    {!hasMore && videos.length > 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                Você chegou ao fim! Que tal publicar seu próprio vídeo?
                            </p>
                            <Link href="/videos/upload">
                                <Button variant="outline" className="mt-4">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Publicar Vídeo
                                </Button>
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}