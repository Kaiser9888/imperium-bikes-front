// hooks/useVideoPlayer.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { useSession } from 'next-auth/react';

interface PlayerState {
    video: Video | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    playbackRate: number;
    quality: string;
    isFullscreen: boolean;
    isLiked: boolean;
    isSaved: boolean;
    relatedVideos: Video[];
    isLoading: boolean;
    error: string | null;
}

interface VideoProgress {
    videoId: string;
    currentTime: number;
    duration: number;
    watched: number; // porcentagem
}

export function useVideoPlayer(videoId: string) {
    const { data: session } = useSession();
    const playerRef = useRef<any>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout>();

    const [state, setState] = useState<PlayerState>({
        video: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.8,
        isMuted: false,
        playbackRate: 1,
        quality: 'auto',
        isFullscreen: false,
        isLiked: false,
        isSaved: false,
        relatedVideos: [],
        isLoading: true,
        error: null,
    });

    // Carregar dados do vídeo
    const fetchVideo = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await fetch(`/api/videos/${videoId}`);
            if (!response.ok) throw new Error('Vídeo não encontrado');

            const data = await response.json();

            setState(prev => ({
                ...prev,
                video: data.video,
                isLiked: data.isLiked || false,
                isSaved: data.isSaved || false,
                relatedVideos: data.relatedVideos || [],
                isLoading: false,
            }));

            // Registrar visualização
            await fetch(`/api/videos/${videoId}/view`, { method: 'POST' });

            // Carregar progresso salvo
            if (data.progress && data.progress.watched < 90) {
                setTimeout(() => {
                    if (playerRef.current) {
                        playerRef.current.currentTime = data.progress.currentTime;
                    }
                }, 1000);
            }
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message,
            }));
        }
    }, [videoId]);

    // Salvar progresso periodicamente
    const saveProgress = useCallback(async () => {
        if (!state.video || !state.currentTime) return;

        const progress: VideoProgress = {
            videoId: state.video.id,
            currentTime: state.currentTime,
            duration: state.duration,
            watched: (state.currentTime / state.duration) * 100,
        };

        try {
            await fetch(`/api/videos/${videoId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(progress),
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }, [videoId, state.currentTime, state.duration, state.video]);

    // Iniciar/parar salvamento de progresso
    useEffect(() => {
        if (state.isPlaying) {
            progressIntervalRef.current = setInterval(saveProgress, 10000); // A cada 10s
        } else {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                saveProgress(); // Salva ao pausar
            }
        }

        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                saveProgress(); // Salva ao sair
            }
        };
    }, [state.isPlaying, saveProgress]);

    useEffect(() => {
        fetchVideo();
    }, [fetchVideo]);

    // Controles do Player
    const controls = {
        play: () => playerRef.current?.play(),
        pause: () => playerRef.current?.pause(),
        togglePlay: () => {
            if (state.isPlaying) {
                playerRef.current?.pause();
            } else {
                playerRef.current?.play();
            }
        },
        seek: (time: number) => {
            if (playerRef.current) {
                playerRef.current.currentTime = time;
            }
        },
        skipForward: (seconds: number = 10) => {
            if (playerRef.current) {
                playerRef.current.currentTime += seconds;
            }
        },
        skipBackward: (seconds: number = 10) => {
            if (playerRef.current) {
                playerRef.current.currentTime -= seconds;
            }
        },
        setVolume: (volume: number) => {
            setState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
            if (playerRef.current) {
                playerRef.current.volume = volume;
            }
        },
        toggleMute: () => {
            const newMuted = !state.isMuted;
            setState(prev => ({ ...prev, isMuted: newMuted }));
            if (playerRef.current) {
                playerRef.current.muted = newMuted;
            }
        },
        setPlaybackRate: (rate: number) => {
            setState(prev => ({ ...prev, playbackRate: rate }));
            if (playerRef.current) {
                playerRef.current.playbackRate = rate;
            }
        },
        toggleFullscreen: () => {
            if (playerRef.current) {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    playerRef.current.requestFullscreen();
                }
            }
        },
    };

    // Ações sociais
    const toggleLike = async () => {
        try {
            const method = state.isLiked ? 'DELETE' : 'POST';
            await fetch(`/api/videos/${videoId}/like`, { method });
            setState(prev => ({ ...prev, isLiked: !prev.isLiked }));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const toggleSave = async () => {
        try {
            const method = state.isSaved ? 'DELETE' : 'POST';
            await fetch(`/api/videos/${videoId}/save`, { method });
            setState(prev => ({ ...prev, isSaved: !prev.isSaved }));
        } catch (error) {
            console.error('Error toggling save:', error);
        }
    };

    // Event handlers do Mux Player
    const handlePlayerReady = (event: any) => {
        setState(prev => ({
            ...prev,
            duration: event.target.duration,
        }));
    };

    const handleTimeUpdate = (event: any) => {
        setState(prev => ({
            ...prev,
            currentTime: event.target.currentTime,
        }));
    };

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleError = (error: any) => {
        console.error('Player error:', error);
        setState(prev => ({ ...prev, error: 'Erro ao carregar o vídeo' }));
    };

    return {
        ...state,
        playerRef,
        controls,
        toggleLike,
        toggleSave,
        handlePlayerReady,
        handleTimeUpdate,
        handlePlay,
        handlePause,
        handleError,
        isAuthenticated: !!session,
    };
}