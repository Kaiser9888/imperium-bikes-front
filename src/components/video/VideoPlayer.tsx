// components/video/VideoPlayer.tsx
'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { VideoControls } from './VideoControls';
import { VideoInfo } from './VideoInfo';
import { VideoComments } from './VideoComments';
import { VideoSidebar } from './VideoSidebar';
import { ShortsPlayer } from './ShortsPlayer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Bike, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface VideoPlayerProps {
    videoId: string;
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
    const {
        video,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        isFullscreen,
        isLiked,
        isSaved,
        relatedVideos,
        isLoading,
        error,
        playerRef,
        controls,
        toggleLike,
        toggleSave,
        handlePlayerReady,
        handleTimeUpdate,
        handlePlay,
        handlePause,
        handleError,
    } = useVideoPlayer(videoId);

    const containerRef = useRef<HTMLDivElement>(null);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    // Auto-hide controls
    const handleMouseMove = useCallback(() => {
        setShowControls(true);

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignorar se estiver digitando em inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    controls.togglePlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    controls.skipForward(e.shiftKey ? 30 : 10);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    controls.skipBackward(e.shiftKey ? 30 : 10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    controls.setVolume(Math.min(1, volume + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    controls.setVolume(Math.max(0, volume - 0.1));
                    break;
                case 'm':
                    e.preventDefault();
                    controls.toggleMute();
                    break;
                case 'f':
                    e.preventDefault();
                    controls.toggleFullscreen();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    e.preventDefault();
                    const num = parseInt(e.key);
                    if (duration) {
                        controls.seek((num / 10) * duration);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [controls, volume, duration]);

    if (isLoading) {
        return <PlayerSkeleton />;
    }

    if (error || !video) {
        return (
            <div className="container mx-auto p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>
                        {error || 'Vídeo não encontrado'}
                    </AlertDescription>
                </Alert>
                <Link href="/videos">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Vídeos
                    </Button>
                </Link>
            </div>
        );
    }

    // Se for Short, renderiza o player vertical
    if (video.isShort) {
        return <ShortsPlayer videoId={videoId} initialVideo={video} />;
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1800px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-0">
                    {/* Player Principal */}
                    <div className="flex-1 min-w-0">
                        <div
                            ref={containerRef}
                            className="relative bg-black"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => isPlaying && setShowControls(false)}
                        >
                            {/* Mux Player */}
                            <MuxPlayer
                                ref={playerRef}
                                playbackId={video.muxPlaybackId}
                                metadata={{
                                    video_id: video.id,
                                    video_title: video.title,
                                    viewer_user_id: video.author.id,
                                }}
                                streamType="on-demand"
                                autoPlay={false}
                                muted={isMuted}
                                accentColor="#hsl(var(--primary))"
                                onReady={handlePlayerReady}
                                onTimeUpdate={handleTimeUpdate}
                                onPlay={handlePlay}
                                onPause={handlePause}
                                onError={handleError}
                                className="w-full aspect-video"
                                style={{
                                    '--controls': 'none',
                                    '--media-object-fit': 'contain',
                                } as any}
                            />

                            {/* Overlay de Controles Customizados */}
                            <div
                                className={`absolute inset-0 transition-opacity duration-300 ${
                                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                }`}
                            >
                                {/* Gradiente superior */}
                                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

                                {/* Botão Play/Pause central */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <button
                                        onClick={controls.togglePlay}
                                        className="pointer-events-auto transform transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            {isPlaying ? (
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <rect x="6" y="4" width="4" height="16" />
                                                    <rect x="14" y="4" width="4" height="16" />
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Controls Bar */}
                                <div className="absolute bottom-0 left-0 right-0">
                                    <VideoControls
                                        video={video}
                                        currentTime={currentTime}
                                        duration={duration}
                                        volume={volume}
                                        isMuted={isMuted}
                                        isPlaying={isPlaying}
                                        playbackRate={playbackRate}
                                        isFullscreen={isFullscreen}
                                        onPlayPause={controls.togglePlay}
                                        onSeek={controls.seek}
                                        onVolumeChange={controls.setVolume}
                                        onMuteToggle={controls.toggleMute}
                                        onPlaybackRateChange={controls.setPlaybackRate}
                                        onFullscreenToggle={controls.toggleFullscreen}
                                        onSkipForward={() => controls.skipForward(10)}
                                        onSkipBackward={() => controls.skipBackward(10)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Informações do Vídeo */}
                        <div className="bg-background">
                            <VideoInfo
                                video={video}
                                isLiked={isLiked}
                                isSaved={isSaved}
                                onLike={toggleLike}
                                onSave={toggleSave}
                            />

                            {/* Comentários */}
                            <VideoComments videoId={video.id} />
                        </div>
                    </div>

                    {/* Sidebar - Vídeos Relacionados */}
                    <div className="lg:w-[400px] bg-background border-l">
                        <VideoSidebar videos={relatedVideos} currentVideoId={videoId} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Skeleton Loading
function PlayerSkeleton() {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1800px] mx-auto">
                <div className="flex flex-col lg:flex-row">
                    <div className="flex-1">
                        <Skeleton className="aspect-video w-full" />
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-10 w-20" />
                            </div>
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                    <div className="lg:w-[400px] p-4 space-y-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="w-40 h-24" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}