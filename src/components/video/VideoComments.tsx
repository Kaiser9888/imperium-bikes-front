"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface Comment {
    id: string;
    text: string;
    userName: string;
    userAvatar: string;
    createdAt: string;
    userId: string;
}

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
    const { isSignedIn, getToken, userId: currentUserId } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchComments = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments?limit=50`
                );
                const data = await res.json();
                if (!cancelled && Array.isArray(data)) {
                    setComments(data);
                    setLoading(false);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Erro ao buscar comentários:", error);
                    setLoading(false);
                }
            }
        };

        fetchComments();

        return () => {
            cancelled = true;
        };
    }, [videoId]);

    const sendComment = async () => {
        if (!text.trim() || sending) return;

        setSending(true);
        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ text: text.trim() }),
                }
            );
            if (res.ok) {
                const newComment = await res.json();
                setComments((prev) => [newComment, ...prev]);
                setText("");
            }
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
        } finally {
            setSending(false);
        }
    };

    const deleteComment = async (commentId: string) => {
        if (!confirm("Apagar este comentário?")) return;
        try {
            const token = await getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/videos/${videoId}/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.ok) {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
            }
        } catch (error) {
            console.error("Erro ao apagar comentário:", error);
        }
    };

    return (
        <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">
                Comentários ({comments.length})
            </h3>

            {isSignedIn && (
                <div className="mb-6 flex gap-3">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Adicione um comentário..."
                        maxLength={1000}
                        className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && sendComment()}
                    />
                    <button
                        onClick={sendComment}
                        disabled={!text.trim() || sending}
                        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        {sending ? "..." : "Enviar"}
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                </div>
            ) : comments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum comentário ainda.
                </p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
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
                                <p className="mt-0.5 text-sm whitespace-pre-wrap">{comment.text}</p>
                            </div>
                            {currentUserId === comment.userId && (
                                <button
                                    onClick={() => deleteComment(comment.id)}
                                    className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-destructive transition-opacity"
                                >
                                    Apagar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}