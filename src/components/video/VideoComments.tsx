"use client";

import { useEffect, useState, useRef } from "react";
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageList,
    Window,
} from "stream-chat-react";
import { streamClient, connectUser, disconnectUser } from "@/lib/stream-chat";
import { useAuth } from "@clerk/nextjs";
import "stream-chat-react/dist/css/v2/index.css";
import type { Channel as StreamChannel } from "stream-chat";

export function VideoComments({ videoId }: { videoId: string }) {
    const { userId } = useAuth();
    const [channel, setChannel] = useState<StreamChannel | null>(null);
    const [ready, setReady] = useState(false);
    const initialized = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const init = async () => {
            if (!userId) return;
            await connectUser(userId, userId, "");
            const chatChannel = streamClient.channel("messaging", `video-${videoId}`, {});
            await chatChannel.watch();
            setChannel(chatChannel);
            setReady(true);
        };

        init();
        return () => { disconnectUser(); };
    }, [videoId, userId]);

    const sendMessage = async () => {
        if (!channel || !inputRef.current?.value.trim()) return;
        await channel.sendMessage({ text: inputRef.current.value });
        inputRef.current.value = "";
    };

    if (!ready || !channel) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
        );
    }

    return (
        <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">Comentários</h3>
            <Chat client={streamClient} theme="str-chat__theme-light">
                <Channel channel={channel}>
                    <Window>
                        <ChannelHeader />
                        <MessageList />
                        <div className="flex gap-2 p-3">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Escreva um comentário..."
                                className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm focus:border-primary focus:outline-none"
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            />
                            <button
                                onClick={sendMessage}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                            >
                                Enviar
                            </button>
                        </div>
                    </Window>
                </Channel>
            </Chat>
        </div>
    );
}