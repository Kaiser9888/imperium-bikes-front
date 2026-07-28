"use client";

import { useEffect, useState, useRef } from "react";
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageList,
    Window,
} from "stream-chat-react";
// Sem esse CSS os ícones/reações do Stream renderizam sem constraint de
// tamanho (aparecem gigantes). Precisa estar importado em algum lugar que
// o Next carregue — aqui ou no layout raiz, mas só uma vez no projeto todo.
import "stream-chat-react/dist/css/v2/index.css";
import { streamClient, connectUser, disconnectUser } from "@/lib/stream-chat";
import { useAuth, useUser } from "@clerk/nextjs";
import type { Channel as StreamChannel } from "stream-chat";

export function VideoComments({ videoId }: { videoId: string }) {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const [channel, setChannel] = useState<StreamChannel | null>(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isLoaded) return;

        // Guarda contra a dupla montagem do React Strict Mode (dev) e contra
        // desmontagens reais no meio do fluxo assíncrono: se o efeito for
        // limpo antes do connectUser/watch terminarem, essas continuações
        // não devem mais tocar em estado nem no client do Stream.
        let cancelled = false;
        let didConnect = false;

        const init = async () => {
            if (!isSignedIn) {
                setReady(true);
                return;
            }

            try {
                const userName = clerkUser?.fullName || clerkUser?.username || "Usuário";
                const userImage = clerkUser?.imageUrl || "";

                // connectUser busca o token direto do backend, autenticado pelo
                // Clerk. O backend é quem resolve o userId — o front não decide
                // por qual usuário se conectar.
                const userId = await connectUser(userName, userImage, getToken);
                didConnect = true;

                if (cancelled) return;

                // Tipo "livestream" em vez de "messaging": no Stream, canais
                // "messaging" só permitem leitura/escrita para membros
                // explícitos. Para uma seção de comentários pública por vídeo,
                // "livestream" já vem com permissão para qualquer usuário
                // autenticado entrar e postar, sem precisar de lista de membros.
                const chatChannel = streamClient.channel("livestream", `video-${videoId}`, {
                    members: [userId],
                });
                await chatChannel.watch();

                if (cancelled) return;

                setChannel(chatChannel);
                setReady(true);
            } catch (err) {
                if (cancelled) return;
                console.error("[VideoComments] Erro ao conectar:", err);
                setError(err instanceof Error ? err.message : "Erro ao conectar ao chat");
                setReady(true);
            }
        };

        init();

        return () => {
            cancelled = true;
            if (didConnect) {
                disconnectUser();
            }
        };
    }, [videoId, isSignedIn, isLoaded, getToken, clerkUser]);

    const sendMessage = async () => {
        if (!channel || !inputRef.current?.value.trim()) return;
        await channel.sendMessage({ text: inputRef.current.value });
        inputRef.current.value = "";
    };

    if (!ready) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Faça login para comentar</p>
            </div>
        );
    }

    if (error || !channel) {
        return (
            <div className="py-8 text-center">
                <p className="text-sm text-destructive">
                    {error || "Não foi possível carregar os comentários"}
                </p>
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
                        {/* MessageList já renderiza reações (curtidas/emojis) por padrão
                            via o menu de reação em cada mensagem — não é necessário
                            código extra para habilitar curtir comentários. */}
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