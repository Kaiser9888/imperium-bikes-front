"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { AlertCircle, Loader2, MessageCircle, SendHorizontal, Trash2 } from "lucide-react";

import { API_BASE_URL } from "@/lib/api-config";
import { timeAgo } from "@/lib/videos/format";
import { cn } from "@/lib/utils";

const API_URL = API_BASE_URL;
const MAX_CHARS = 500;

interface Comment {
    id: string;
    userId: string;
    clerkUserId?: string;
    userName: string;
    userAvatar?: string;
    text: string;
    createdAt: string;
}

interface VideoCommentsProps {
    videoId: string;
    /** Avisa a página quando o total muda (novo ou apagado). */
    onCountChange?: (total: number) => void;
}

function Avatar({ name, url, className }: { name?: string; url?: string | null; className?: string }) {
    return url ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar do Clerk
        <img src={url} alt="" className={cn("shrink-0 rounded-full object-cover", className)} />
    ) : (
        <span className={cn("grid shrink-0 place-items-center rounded-full bg-surface-muted text-xs font-semibold text-foreground", className)}>
            {name?.charAt(0)?.toUpperCase() ?? "?"}
        </span>
    );
}

export function VideoComments({ videoId, onCountChange }: VideoCommentsProps) {
    const { getToken, isSignedIn, userId } = useAuth();
    const { user } = useUser();

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [focused, setFocused] = useState(false);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function loadComments() {
            setLoading(true);
            setLoadError(false);
            try {
                const res = await fetch(`${API_URL}/api/videos/${videoId}/comments`, { signal: controller.signal });
                if (!res.ok) throw new Error(`Falha ao buscar comentários: ${res.status}`);
                const data = await res.json();
                const list: Comment[] = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
                setComments(list);
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error("Erro ao carregar comentários:", err);
                    setLoadError(true);
                }
            } finally {
                setLoading(false);
            }
        }

        void loadComments();
        return () => controller.abort();
    }, [videoId]);

    useEffect(() => {
        if (!loading && !loadError) onCountChange?.(comments.length);
    }, [comments.length, loading, loadError, onCountChange]);

    const handleSend = useCallback(async () => {
        const text = newComment.trim();
        if (!text || sending) return;
        if (!isSignedIn) {
            setSendError("Entre para comentar.");
            return;
        }

        setSending(true);
        setSendError(null);
        try {
            const token = await getToken();
            if (!token) {
                setSendError("Sessão expirada. Entre novamente.");
                return;
            }
            const res = await fetch(`${API_URL}/api/videos/${videoId}/comments`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });
            if (!res.ok) throw new Error(`Falha ao enviar comentário: ${res.status}`);
            const saved: Comment = await res.json();
            // Mais novo no topo, como a lista é lida de cima para baixo
            setComments((prev) => [saved, ...prev]);
            setNewComment("");
            setFocused(false);
        } catch (err) {
            console.error("Erro ao enviar comentário:", err);
            setSendError("Não foi possível enviar o comentário. Tente novamente.");
        } finally {
            setSending(false);
        }
    }, [newComment, sending, isSignedIn, getToken, videoId]);

    const handleDelete = useCallback(
        async (commentId: string) => {
            if (deletingId) return;
            if (!window.confirm("Apagar este comentário?")) return;

            const previousComments = comments;
            setDeletingId(commentId);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            try {
                const token = await getToken();
                if (!token) throw new Error("Sessão expirada.");
                const res = await fetch(`${API_URL}/api/videos/${videoId}/comments/${commentId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Falha ao apagar: ${res.status}`);
            } catch (err) {
                console.error("Erro ao apagar:", err);
                setComments(previousComments);
                setSendError("Não foi possível apagar o comentário.");
            } finally {
                setDeletingId(null);
            }
        },
        [comments, deletingId, getToken, videoId]
    );

    const aberto = focused || newComment.length > 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Escrever */}
            {isSignedIn ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        void handleSend();
                    }}
                    className="flex items-start gap-3"
                >
                    <Avatar name={user?.fullName ?? undefined} url={user?.imageUrl} className="size-10" />
                    <div className="min-w-0 flex-1">
                        <label htmlFor="new-comment-input" className="sr-only">
                            Escreva um comentário
                        </label>
                        <textarea
                            id="new-comment-input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value.slice(0, MAX_CHARS))}
                            onFocus={() => setFocused(true)}
                            onKeyDown={(e) => {
                                // Enter envia; Shift+Enter quebra linha
                                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                                    e.preventDefault();
                                    void handleSend();
                                }
                            }}
                            rows={aberto ? 3 : 1}
                            placeholder="Adicione um comentário..."
                            disabled={sending}
                            className="type-body-small w-full resize-none border-0 border-b border-border bg-transparent px-0 py-2 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground disabled:opacity-60"
                        />
                        {aberto && (
                            <div className="mt-2 flex items-center justify-end gap-2">
                                <span className="type-caption mr-auto tabular-nums text-muted-foreground">
                                    {newComment.length}/{MAX_CHARS}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewComment("");
                                        setFocused(false);
                                    }}
                                    className="type-label h-9 cursor-pointer rounded-full px-4 text-foreground hover:bg-surface-muted"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newComment.trim() || sending}
                                    className="type-label inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {sending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <SendHorizontal className="size-4" aria-hidden="true" />}
                                    Comentar
                                </button>
                            </div>
                        )}
                        {sendError && (
                            <p role="alert" className="type-caption mt-2 flex items-center gap-1 text-destructive">
                                <AlertCircle className="size-3.5" aria-hidden="true" />
                                {sendError}
                            </p>
                        )}
                    </div>
                </form>
            ) : (
                <Link
                    href="/sign-in"
                    className="type-body-small flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                    <MessageCircle className="size-5" aria-hidden="true" />
                    Entre para comentar e conversar com o criador.
                </Link>
            )}

            {/* Lista */}
            {loading ? (
                <div className="flex flex-col gap-5" aria-busy="true">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex gap-3">
                            <div className="size-10 animate-pulse rounded-full bg-surface-muted" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-1/4 animate-pulse rounded bg-surface-muted" />
                                <div className="h-3 w-3/4 animate-pulse rounded bg-surface-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : loadError ? (
                <p className="type-body-small flex items-center gap-2 text-destructive">
                    <AlertCircle className="size-4" aria-hidden="true" />
                    Não foi possível carregar os comentários.
                </p>
            ) : comments.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                    <MessageCircle className="size-10 text-muted-foreground/30" aria-hidden="true" />
                    <p className="type-label mt-3 text-foreground">Nenhum comentário ainda</p>
                    <p className="type-caption mt-1 text-muted-foreground">Seja a primeira pessoa a comentar.</p>
                </div>
            ) : (
                <ul className="flex flex-col gap-5">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            isOwner={!!userId && (comment.clerkUserId === userId || comment.userId === userId)}
                            isDeleting={deletingId === comment.id}
                            onDelete={() => void handleDelete(comment.id)}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

interface CommentItemProps {
    comment: Comment;
    isOwner: boolean;
    isDeleting: boolean;
    onDelete: () => void;
}

function CommentItem({ comment, isOwner, isDeleting, onDelete }: CommentItemProps) {
    return (
        <li className="group flex items-start gap-3">
            <Avatar name={comment.userName} url={comment.userAvatar} className="size-10" />
            <div className="min-w-0 flex-1">
                <p className="type-caption flex items-baseline gap-2">
                    <span className="truncate font-semibold text-foreground">@{comment.userName}</span>
                    <time dateTime={comment.createdAt} className="shrink-0 text-muted-foreground">
                        {timeAgo(comment.createdAt)}
                    </time>
                </p>
                <p className="type-body-small mt-1 whitespace-pre-wrap break-words text-foreground">{comment.text}</p>
            </div>
            {isOwner && (
                <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    aria-label="Apagar comentário"
                    title="Apagar comentário"
                    className="shrink-0 cursor-pointer rounded-full p-2 text-muted-foreground opacity-100 transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                    {isDeleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
                </button>
            )}
        </li>
    );
}
