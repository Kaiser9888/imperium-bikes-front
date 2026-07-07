// components/video/VideoInfo.tsx
'use client'

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Heart,
    Bookmark,
    Share2,
    Flag,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Copy,
    Twitter,
    Facebook,
    Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface VideoInfoProps {
    video: Video;
    isLiked: boolean;
    isSaved: boolean;
    onLike: () => void;
    onSave: () => void;
}

export function VideoInfo({ video, isLiked, isSaved, onLike, onSave }: VideoInfoProps) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    const formatViews = (views: number) => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
    };

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/videos/watch/${video.id}`;

    const handleShare = async (platform?: string) => {
        const text = `Confira "${video.title}" no Bike Marketplace!`;

        if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`);
        } else if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        } else if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`);
        } else {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copiado!');
        }
    };

    const handleReport = async (reason: string) => {
        try {
            await fetch(`/api/videos/${video.id}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            toast.success('Denúncia enviada com sucesso');
            setReportOpen(false);
        } catch (error) {
            toast.error('Erro ao enviar denúncia');
        }
    };

    return (
        <div className="p-6 space-y-4 bg-background">
            {/* Título e Estatísticas */}
            <div>
                <h1 className="text-xl font-bold mb-2">{video.title}</h1>

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatViews(video.views)} visualizações</span>
                        <span>•</span>
                        <span>
              {formatDistanceToNow(new Date(video.createdAt), {
                  locale: ptBR,
                  addSuffix: true,
              })}
            </span>
                        {video.tags?.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="ml-2">
                                #{tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-1">
                        {/* Like */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-2 ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
                            onClick={onLike}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{video.likesCount || 0}</span>
                        </Button>

                        {/* Save */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={onSave}
                        >
                            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                            <span>Salvar</span>
                        </Button>

                        {/* Share */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Share2 className="w-5 h-5" />
                                    <span>Compartilhar</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleShare()}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copiar link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShare('twitter')}>
                                    <Twitter className="w-4 h-4 mr-2" />
                                    Twitter
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShare('facebook')}>
                                    <Facebook className="w-4 h-4 mr-2" />
                                    Facebook
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                                    <Send className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Report */}
                        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Flag className="w-4 h-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Denunciar Vídeo</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2">
                                    {[
                                        'Conteúdo impróprio',
                                        'Violência',
                                        'Spam',
                                        'Direitos autorais',
                                        'Outro motivo',
                                    ].map((reason) => (
                                        <Button
                                            key={reason}
                                            variant="outline"
                                            className="w-full justify-start"
                                            onClick={() => handleReport(reason)}
                                        >
                                            {reason}
                                        </Button>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Autor e Descrição */}
            <div className="space-y-4">
                {/* Autor Info */}
                <div className="flex items-center justify-between">
                    <Link
                        href={`/creators/${video.author.username}`}
                        className="flex items-center gap-3 group"
                    >
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={video.author.avatar} />
                            <AvatarFallback>
                                {video.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <div className="flex items-center gap-1">
                <span className="font-semibold group-hover:text-primary transition-colors">
                  {video.author.name}
                </span>
                                {video.author.isVerified && (
                                    <Badge variant="secondary" className="text-xs">
                                        ✓ Verificado
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {video.author.followersCount || 0} seguidores
                            </p>
                        </div>
                    </Link>

                    <Button>
                        Seguir
                    </Button>
                </div>

                {/* Description */}
                <div className="bg-muted/50 rounded-xl p-4">
                    <div className={`text-sm whitespace-pre-wrap ${
                        !showFullDescription && video.description?.length > 300
                            ? 'line-clamp-3'
                            : ''
                    }`}>
                        {video.description}
                    </div>

                    {video.description?.length > 300 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => setShowFullDescription(!showFullDescription)}
                        >
                            {showFullDescription ? (
                                <>
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    Mostrar menos
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4 mr-1" />
                                    Mostrar mais
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Monetization Info */}
                {video.monetization?.isEnabled && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <span className="text-lg">💰</span>
                        <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                Criador Monetizado
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Tier {video.monetization.tier} • Revenue Share: {video.monetization.revenueShare}%
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}