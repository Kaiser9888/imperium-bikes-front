"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Send, MessageCircle } from "lucide-react";

const API_URL = "https://imperium-bikes.onrender.com";

interface Comment {
    id: string;
    userName: string;
    userAvatarUrl?: string;
    text: string;
    createdAt: string;
}

export function VideoComments({ videoId }: { videoId: string }) {
    const { getToken, isSignedIn } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_URL}/api/videos/${videoId}/comments`);
                const data = await res.json();
                if (!cancelled) {
                    setComments(data.content || []);
                    setLoading(false);
                }
            } catch {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [videoId]);

    async function handleSend() {
        if (!newComment.trim() || sending || !isSignedIn) return;
        setSending(true);
        try {
            const token = await getToken();
            const res = await fetch(`${API_URL}/api/videos/${videoId}/comments`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: newComment.trim() })
            });
            if (res.ok) {
                const saved = await res.json();
                setComments(prev => [...prev, saved]);
                setNewComment("");
            }
        } finally {
            setSending(false);
        }
    }

    return (
      <div className="space-y-4">
          {/* ===== ÁREA DE DIGITAR (DISCRETA) ===== */}
          <div className="flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Adicionar comentário..."
                className="flex-1 rounded-full border border-border/50 bg-muted/20 px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:border-primary/30 focus:bg-background"
              />
              <button
                onClick={handleSend}
                disabled={!newComment.trim() || sending}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:opacity-40 disabled:hover:bg-primary/10"
                aria-label="Enviar comentário"
              >
                  <Send className="size-3.5" />
              </button>
          </div>

          {/* ===== LISTA DE COMENTÁRIOS ===== */}
          {loading ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : comments.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 py-2">
                <MessageCircle className="size-3.5" />
                Nenhum comentário ainda
            </div>
          ) : (
            <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2.5">
                      {comment.userAvatarUrl ? (
                        <img
                          src={comment.userAvatarUrl}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                            {comment.userName?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-medium text-foreground truncate">
                                        @{comment.userName}
                                    </span>
                              <span className="text-[10px] text-muted-foreground/50">
                                        {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
                                    </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {comment.text}
                          </p>
                      </div>
                  </div>
                ))}
            </div>
          )}
      </div>
    );
}