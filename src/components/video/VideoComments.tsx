"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

interface Comment {
    id: string;
    text: string;
    userName: string;
    userAvatar: string;
    createdAt: string;
    userId: string; // UUID interno do banco, não o ID do Clerk
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function timeAgo(date: string) {
    if (!date) return "";
    try {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now.getTime() - past.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Hoje";
        if (diffDays === 1) return "Ontem";
        if (diffDays < 7) return `${diffDays}d`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
        return `${Math.floor(diffDays / 365)}a`;
    } catch {
        return "";
    }
}

export function VideoComments({ videoId }: { videoId: string }) {
    const { isSignedIn, getToken } = useAuth();

    // null = ainda carregando; array = carregado (mesmo vazio)
    const [comments, setComments] = useState<Comment[] | null>(null);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [currentDbUserId, setCurrentDbUserId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Busca o UUID interno do usuário logado (para saber quais comentários são "meus")
    useEffect(() => {
        if (!isSignedIn) return;

        let cancelled = false;

        async function fetchCurrentUser() {
            try {
                const token = await getToken();
                const res = await fetch(`${API_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setCurrentDbUserId(data.userId);
            } catch (error) {
                console.error("Erro ao buscar usuário atual:", error);
            }
        }

        fetchCurrentUser();

        return () => {
            cancelled = true;
        };
    }, [isSignedIn, getToken]);

    // Busca os comentários do vídeo
    useEffect(() => {
        let cancelled = false;

        async function fetchComments() {
            try {
                const res = await fetch(`${API_URL}/api/videos/${videoId}/comments?limit=50`);
                if (!res.ok) throw new Error("Falha ao carregar comentários");
                const data = await res.json();
                if (!cancelled) {
                    setComments(Array.isArray(data) ? data : []);
                    setErrorMessage(null);
                }
            } catch (error) {
                console.error("Erro ao buscar comentários:", error);
                if (!cancelled) {
                    setComments([]);
                    setErrorMessage("Não foi possível carregar os comentários.");
                }
            }
        }

        fetchComments();

        return () => {
            cancelled = true;
        };
    }, [videoId]);

    const sendComment = useCallback(async () => {
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        setSending(true);
        setErrorMessage(null);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/videos/${videoId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: trimmed }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setErrorMessage(data?.text ?? data?.error ?? "Não foi possível enviar o comentário.");
                return;
            }

            const newComment = await res.json();
            setComments((prev) => [newComment, ...(prev ?? [])]);
            setText("");
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
            setErrorMessage("Não foi possível enviar o comentário. Tente novamente.");
        } finally {
            setSending(false);
        }
    }, [text, sending, getToken, videoId]);

    const deleteComment = useCallback(
        async (commentId: string) => {
            if (!confirm("Apagar este comentário? Essa ação não pode ser desfeita.")) return;

            setDeletingId(commentId);
            setErrorMessage(null);
            try {
                const token = await getToken();
                const res = await fetch(
                    `${API_URL}/api/videos/${videoId}/comments/${commentId}`,
                    {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!res.ok) {
                    setErrorMessage("Não foi possível apagar o comentário.");
                    return;
                }

                setComments((prev) => (prev ?? []).filter((c) => c.id !== commentId));
            } catch (error) {
                console.error("Erro ao apagar comentário:", error);
                setErrorMessage("Não foi possível apagar o comentário. Tente novamente.");
            } finally {
                setDeletingId(null);
            }
        },
        [getToken, videoId]
    );

    const loading = comments === null;

    return (
        <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">
                Comentários ({comments?.length ?? 0})
            </h3>

            {errorMessage && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                    {errorMessage}
                </div>
            )}

            {isSignedIn && (
                <div className="mb-6 flex gap-3">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Adicione um comentário..."
                        maxLength={1000}
                        aria-label="Novo comentário"
                        className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && sendComment()}
                    />
                    <button
                        onClick={sendComment}
                        disabled={!text.trim() || sending}
                        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        {sending ? "Enviando..." : "Enviar"}
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                </div>
            ) : comments!.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
            ) : (
                <div className="space-y-4">
                    {comments!.map((comment) => (
                        <div key={comment.id} className="group flex gap-3">
                            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
                                {comment.userAvatar ? (
                                    <img src={comment.userAvatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
                                        {comment.userName?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{comment.userName}</span>
                                    <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="mt-0.5 text-sm whitespace-pre-wrap break-words">{comment.text}</p>
                            </div>
                            {isSignedIn && currentDbUserId === comment.userId && (
                                <button
                                    onClick={() => deleteComment(comment.id)}
                                    disabled={deletingId === comment.id}
                                    aria-label="Apagar comentário"
                                    className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-destructive transition-opacity disabled:opacity-50"
                                >
                                    {deletingId === comment.id ? "Apagando..." : "Apagar"}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}