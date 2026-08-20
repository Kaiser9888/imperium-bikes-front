"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Send, MessageCircle, AlertCircle, Trash2 } from "lucide-react";

const API_URL = "https://imperium-bikes.onrender.com";

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    createdAt: string;
}

interface VideoCommentsProps {
    videoId: string;
}

export function VideoComments({ videoId }: VideoCommentsProps) {
    const { getToken, isSignedIn, userId } = useAuth();

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
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
                const res = await fetch(`${API_URL}/api/videos/${videoId}/comments`, {
                    signal: controller.signal,
                });

                if (!res.ok) {
                    throw new Error(`Falha ao buscar comentários: ${res.status}`);
                }

                const data = await res.json();
                const list: Comment[] = Array.isArray(data)
                  ? data
                  : Array.isArray(data?.content)
                    ? data.content
                    : [];

                // 🔍 DEBUG
                console.log("🔍 Comentários carregados:", list);
                console.log("🔍 Seu userId:", userId);

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

    const handleSend = useCallback(async () => {
        const text = newComment.trim();
        if (!text || sending) return;

        if (!isSignedIn) {
            setSendError("Faça login para comentar.");
            return;
        }

        setSending(true);
        setSendError(null);

        try {
            const token = await getToken();
            if (!token) {
                setSendError("Sessão expirada. Faça login novamente.");
                return;
            }

            const res = await fetch(`${API_URL}/api/videos/${videoId}/comments`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) {
                throw new Error(`Falha ao enviar comentário: ${res.status}`);
            }

            const saved: Comment = await res.json();
            setComments((prev) => [...prev, saved]);
            setNewComment("");
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

          const confirmed = window.confirm("Apagar este comentário?");
          if (!confirmed) return;

          const previousComments = comments;
          setDeletingId(commentId);
          setComments((prev) => prev.filter((c) => c.id !== commentId));

          try {
              const token = await getToken();
              if (!token) {
                  throw new Error("Sessão expirada.");
              }

              const res = await fetch(
                `${API_URL}/api/videos/${videoId}/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
              );

              if (!res.ok) {
                  throw new Error(`Falha ao apagar comentário: ${res.status}`);
              }
          } catch (err) {
              console.error("Erro ao apagar comentário:", err);
              setComments(previousComments);
              setSendError("Não foi possível apagar o comentário. Tente novamente.");
          } finally {
              setDeletingId(null);
          }
      },
      [comments, deletingId, getToken, videoId]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            void handleSend();
        }
    };

    return (
      <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <MessageCircle className="size-4 text-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                  Comentários{!loading && !loadError ? ` (${comments.length})` : ""}
              </h3>
          </div>

          <div className="space-y-1.5 rounded-xl border border-border/50 bg-muted/10 p-2.5">
              <label htmlFor="new-comment-input" className="px-1 text-[11px] font-medium text-muted-foreground">
                  {isSignedIn ? "Deixe seu comentário" : "Faça login para comentar"}
              </label>
              <div className="flex items-center gap-2">
                  <input
                    id="new-comment-input"
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Adicionar comentário..."
                    disabled={!isSignedIn || sending}
                    maxLength={500}
                    className="flex-1 rounded-full border border-border/50 bg-background px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={!newComment.trim() || sending || !isSignedIn}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary"
                    aria-label="Enviar comentário"
                  >
                      <Send className="size-3.5" />
                  </button>
              </div>

              {sendError && (
                <p className="flex items-center gap-1 px-1 text-[11px] text-red-500">
                    <AlertCircle className="size-3" />
                    {sendError}
                </p>
              )}
          </div>

          {loading ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : loadError ? (
            <div className="flex items-center gap-2 text-xs text-red-500/80 py-2">
                <AlertCircle className="size-3.5" />
                Não foi possível carregar os comentários.
            </div>
          ) : comments.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 py-2">
                <MessageCircle className="size-3.5" />
                Nenhum comentário ainda. Seja o primeiro a comentar!
            </div>
          ) : (
            <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isOwner={!!userId && comment.userId === userId}
                    isDeleting={deletingId === comment.id}
                    onDelete={() => void handleDelete(comment.id)}
                  />
                ))}
            </div>
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
      <div className="flex items-start gap-2.5">
          {comment.userAvatar ? (
            <img src={comment.userAvatar} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                {comment.userName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                    <span className="truncate text-xs font-medium text-foreground">
                        @{comment.userName}
                    </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground/50">
                        {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
                    </span>
              </div>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-muted-foreground">
                  {comment.text}
              </p>
          </div>

          {/* Troque isOwner por true TEMPORARIAMENTE */}
          {true && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              aria-label="Apagar comentário"
              className="shrink-0 rounded-full p-1.5 text-red-500 hover:bg-red-500/10"
            >
                <Trash2 className="size-3.5" />
            </button>
          )}
      </div>
    );
}