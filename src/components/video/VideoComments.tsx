// components/video/VideoComments.tsx
'use client'

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { StreamChat } from 'stream-chat';
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageInput,
    MessageList,
    Thread,
    Window,
} from 'stream-chat-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import 'stream-chat-react/dist/css/index.css';

interface VideoCommentsProps {
    videoId: string;
}

export function VideoComments({ videoId }: VideoCommentsProps) {
    const { data: session } = useSession();
    const [client, setClient] = useState<StreamChat | null>(null);
    const [channel, setChannel] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initChat = async () => {
            if (!session?.user) return;

            try {
                // Inicializar Stream Chat
                const streamClient = StreamChat.getInstance(
                    process.env.NEXT_PUBLIC_STREAM_API_KEY!
                );

                // Gerar token do usuário (via backend)
                const response = await fetch('/api/chat/token', {
                    method: 'POST',
                });
                const { token } = await response.json();

                await streamClient.connectUser(
                    {
                        id: session.user.id,
                        name: session.user.name,
                        image: session.user.image,
                    },
                    token
                );

                // Criar/entrar no canal do vídeo
                const videoChannel = streamClient.channel('messaging', `video-${videoId}`, {
                    name: `Comentários do Vídeo`,
                    members: [session.user.id],
                });

                await videoChannel.watch();

                setClient(streamClient);
                setChannel(videoChannel);
                setIsLoading(false);
            } catch (error) {
                console.error('Error initializing chat:', error);
                setIsLoading(false);
            }
        };

        initChat();

        return () => {
            if (client) {
                client.disconnectUser();
            }
        };
    }, [videoId, session]);

    if (!session) {
        return (
            <div className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                    Faça login para comentar
                </p>
                <Button variant="outline">
                    Entrar
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!client || !channel) return null;

    return (
        <div className="border-t">
            <Chat client={client} theme="messaging light">
                <Channel channel={channel}>
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <MessageInput />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    );
}