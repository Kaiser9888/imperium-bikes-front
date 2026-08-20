"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Send, MessageCircle, AlertCircle } from "lucide-react";

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
    const { getToken, isSignedIn } = useAuth();

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    // ============================================================
    // BUSCAR COMENTÁRIOS
    // ============================================================
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

                // A API retorna um array diretamente, não { content: [...] }.
                // Mantemos o fallback defensivo caso o formato mude no futuro.
                const list: Comment[] = Array.isArray(data)
                  ? data
                  : Array.isArray(data?.content)
                    ? data.content
                    : [];

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

    // ============================================================
    // ENVIAR COMENTÁRIO
    // ============================================================
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            void handleSend();
        }
    };

    return (
      <div className="space-y-4">
          {/* ===== INPUT ===== */}
          <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isSignedIn ? "Adicionar comentário..." : "Faça login para comentar"}
                    disabled={!isSignedIn || sending}
                    maxLength={500}
                    className="flex-1 rounded-full border border-border/50 bg-muted/20 px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary/30 focus:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={!newComment.trim() || sending || !isSignedIn}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-40 disabled:hover:bg-primary/10"
                    aria-label="Enviar comentário"
                  >
                      <Send className="size-3.5" />
                  </button>
              </div>

              {sendError && (
                <p className="flex items-center gap-1 text-[11px] text-red-500">
                    <AlertCircle className="size-3" />
                    {sendError}
                </p>
              )}
          </div>

          {/* ===== LISTA ===== */}
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
                Nenhum comentário ainda
            </div>
          ) : (
            <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
            </div>
          )}
      </div>
    );
}

function CommentItem({ comment }: { comment: Comment }) {
    return (
      <div className="flex items-start gap-2.5">
          {comment.userAvatar ? (
            <img
              src={comment.userAvatar}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
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
      </div>
    );
}