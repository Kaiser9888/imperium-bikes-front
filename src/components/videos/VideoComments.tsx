import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import type { CommentItem } from "@/lib/videos/types";
import { timeAgo } from "@/lib/videos/format";
import { VideoAvatar } from "./VideoAvatar";

interface VideoCommentsProps {
    videoId: string;
    initialComments?: CommentItem[];
}

export function VideoComments({ videoId, initialComments = [] }: VideoCommentsProps) {
    const [comments, setComments] = useState<CommentItem[]>(initialComments);
    const [text, setText] = useState("");

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const value = text.trim();
        if (!value) return;
        setComments((prev) => [
            { id: `${videoId}-${Date.now()}`, userName: "Você", text: value, createdAt: new Date().toISOString() },
            ...prev,
        ]);
        setText("");
    };

    return (
        <section aria-label="Comentários" className="rounded-lg border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MessageSquare className="size-4 text-primary" aria-hidden="true" />
                Comentários
                <span className="text-muted-foreground">({comments.length})</span>
            </h2>

            <form onSubmit={submit} className="mt-4 flex items-center gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escreva um comentário"
                    className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                    type="submit"
                    disabled={!text.trim()}
                    aria-label="Enviar comentário"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
                >
                    <Send className="size-4" />
                </button>
            </form>

            <ul className="mt-5 space-y-4">
                {comments.length === 0 && (
                    <li className="text-sm text-muted-foreground">Nenhum comentário ainda. Comece a conversa.</li>
                )}
                {comments.map((c) => (
                    <li key={c.id} className="flex gap-3 border-t border-border pt-4 first:border-0 first:pt-0">
                        <VideoAvatar name={c.userName} url={c.userAvatarUrl} className="size-8" />
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{c.userName}</span> · {timeAgo(c.createdAt)}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-foreground">{c.text}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}