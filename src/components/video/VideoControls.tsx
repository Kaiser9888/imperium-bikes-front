// components/video/VideoControls.tsx
'use client'

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipForward,
    SkipBack,
    Settings,
    Subtitles,
    PictureInPicture2,
} from 'lucide-react';

interface VideoControlsProps {
    video: any;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isPlaying: boolean;
    playbackRate: number;
    isFullscreen: boolean;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onVolumeChange: (volume: number) => void;
    onMuteToggle: () => void;
    onPlaybackRateChange: (rate: number) => void;
    onFullscreenToggle: () => void;
    onSkipForward: () => void;
    onSkipBackward: () => void;
}

export function VideoControls({
                                  video,
                                  currentTime,
                                  duration,
                                  volume,
                                  isMuted,
                                  isPlaying,
                                  playbackRate,
                                  isFullscreen,
                                  onPlayPause,
                                  onSeek,
                                  onVolumeChange,
                                  onMuteToggle,
                                  onPlaybackRateChange,
                                  onFullscreenToggle,
                                  onSkipForward,
                                  onSkipBackward,
                              }: VideoControlsProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="px-4 pb-3 space-y-2">
            {/* Progress Bar */}
            <div className="relative group">
                <Slider
                    value={[progress]}
                    max={100}
                    step={0.1}
                    onValueChange={([value]) => onSeek((value / 100) * duration)}
                    onPointerDown={() => setIsDragging(true)}
                    onPointerUp={() => setIsDragging(false)}
                    className="cursor-pointer"
                />

                {/* Time Preview on Hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={onPlayPause}
                                >
                                    {isPlaying ? (
                                        <Pause className="w-5 h-5" />
                                    ) : (
                                        <Play className="w-5 h-5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isPlaying ? 'Pausar (k)' : 'Reproduzir (k)'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Skip Back */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={onSkipBackward}
                                >
                                    <SkipBack className="w-4 h-4" />
                                    <span className="text-xs ml-0.5">10</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Voltar 10s (←)</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Skip Forward */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={onSkipForward}
                                >
                                    <SkipForward className="w-4 h-4" />
                                    <span className="text-xs ml-0.5">10</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Avançar 10s (→)</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Volume */}
                    <div
                        className="relative flex items-center"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:bg-white/20"
                                        onClick={onMuteToggle}
                                    >
                                        {isMuted || volume === 0 ? (
                                            <VolumeX className="w-5 h-5" />
                                        ) : (
                                            <Volume2 className="w-5 h-5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isMuted ? 'Ativar som (m)' : 'Silenciar (m)'}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className={`transition-all duration-200 ${
                            showVolumeSlider ? 'w-20 opacity-100 ml-2' : 'w-0 opacity-0'
                        }`}>
                            <Slider
                                value={[isMuted ? 0 : volume * 100]}
                                max={100}
                                onValueChange={([value]) => onVolumeChange(value / 100)}
                                className="w-20"
                            />
                        </div>
                    </div>

                    {/* Time Display */}
                    <div className="text-white/80 text-sm ml-2">
                        <span>{formatTime(currentTime)}</span>
                        <span className="mx-1">/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Playback Rate */}
                    <DropdownMenu>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white hover:bg-white/20"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Configurações</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="font-semibold text-xs text-muted-foreground">
                                Velocidade
                            </DropdownMenuItem>
                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                <DropdownMenuItem
                                    key={rate}
                                    onClick={() => onPlaybackRateChange(rate)}
                                    className={playbackRate === rate ? 'bg-accent' : ''}
                                >
                                    {rate}x {playbackRate === rate && '✓'}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Picture in Picture */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={() => {
                                        if (document.pictureInPictureElement) {
                                            document.exitPictureInPicture();
                                        } else {
                                            const video = document.querySelector('mux-player')?.shadowRoot?.querySelector('video');
                                            video?.requestPictureInPicture();
                                        }
                                    }}
                                >
                                    <PictureInPicture2 className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Picture in Picture</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Fullscreen */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20"
                                    onClick={onFullscreenToggle}
                                >
                                    {isFullscreen ? (
                                        <Minimize className="w-5 h-5" />
                                    ) : (
                                        <Maximize className="w-5 h-5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isFullscreen ? 'Sair da tela cheia (f)' : 'Tela cheia (f)'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}