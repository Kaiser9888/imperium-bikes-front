"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { AlertCircle, Heart, Loader2, MessageCircle, SendHorizontal, Trash2 } from "lucide-react";

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
    /** Comentário respondido; null nos comentários do vídeo. */
    parentId?: string | null;
    likesCount?: number;
    replyCount?: number;
}

interface VideoCommentsProps {
    videoId: string;
    /** Total do vídeo (comentários + respostas) vindo do servidor. */
    initialCount: number;
    /** Avisa a página quando o total muda (novo ou apagado). */
    onCountChange?: (total: number) => void;
    /** Id (backend) do dono do vídeo: os comentários dele ganham o selo "Criador". */
    creatorId?: string;
    /** "sheet": gaveta do Memento, com a lista rolando e o campo fixo embaixo. */
    layout?: "page" | "sheet";
}

/** Resposta que está sendo escrita: sempre presa ao comentário principal da conversa. */
interface Respondendo {
    rootId: string;
    /** Começo do texto ("@Ana ") quando a resposta é para alguém dentro da conversa. */
    prefixo: string;
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

const primeiroNome = (nome?: string) => nome?.trim().split(/\s+/)[0] || "Usuário";

/** Trocar de vídeo (Memento) recomeça do zero: respostas abertas, curtidas e total. */
export function VideoComments(props: VideoCommentsProps) {
    return <ListaDeComentarios key={props.videoId} {...props} />;
}

function ListaDeComentarios({ videoId, initialCount, onCountChange, creatorId, layout = "page" }: VideoCommentsProps) {
    const { getToken, isSignedIn, userId } = useAuth();
    const { user } = useUser();

    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    // null até a pessoa comentar ou apagar algo: antes disso vale o total do servidor
    const [delta, setDelta] = useState<number | null>(null);

    // Respostas carregadas por comentário principal; undefined = ainda não abriu
    const [replies, setReplies] = useState<Record<string, Comment[] | undefined>>({});
    const [abertas, setAbertas] = useState<Record<string, boolean>>({});
    const [respondendo, setRespondendo] = useState<Respondendo | null>(null);

    const [curtidos, setCurtidos] = useState<Set<string>>(new Set());
    const [curtidas, setCurtidas] = useState<Record<string, number>>({});
    const [curtindo, setCurtindo] = useState<string | null>(null);

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

    // O que a pessoa já curtiu neste vídeo (para o coração vir preenchido)
    useEffect(() => {
        if (!isSignedIn) return;
        let cancelled = false;
        (async () => {
            const token = await getToken().catch(() => null);
            if (!token) return;
            const res = await fetch(`${API_URL}/api/videos/${videoId}/comments/my-likes`, {
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null);
            if (!res?.ok || cancelled) return;
            const ids: string[] = await res.json();
            if (!cancelled) setCurtidos(new Set(ids));
        })();
        return () => {
            cancelled = true;
        };
    }, [videoId, isSignedIn, getToken]);

    useEffect(() => {
        if (delta !== null) onCountChange?.(Math.max(initialCount + delta, 0));
    }, [delta, initialCount, onCountChange]);

    const mudarTotal = useCallback((diferenca: number) => setDelta((atual) => (atual ?? 0) + diferenca), []);

    const comToken = useCallback(async () => {
        const token = await getToken();
        if (!token) throw new Error("Sessão expirada. Entre novamente.");
        return token;
    }, [getToken]);

    /** Envia comentário (sem rootId) ou resposta. Devolve true quando deu certo. */
    const enviar = useCallback(
        async (texto: string, rootId?: string): Promise<boolean> => {
            setError(null);
            try {
                const token = await comToken();
                const res = await fetch(`${API_URL}/api/videos/${videoId}/comments`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ text: texto, parentId: rootId ?? null }),
                });
                if (!res.ok) throw new Error(`Falha ao enviar: ${res.status}`);
                const saved: Comment = await res.json();
                if (rootId) {
                    setReplies((prev) => ({ ...prev, [rootId]: [...(prev[rootId] ?? []), saved] }));
                    setAbertas((prev) => ({ ...prev, [rootId]: true }));
                    setComments((prev) => prev.map((c) => (c.id === rootId ? { ...c, replyCount: (c.replyCount ?? 0) + 1 } : c)));
                } else {
                    // Mais novo no topo, como a lista é lida de cima para baixo
                    setComments((prev) => [saved, ...prev]);
                }
                mudarTotal(1);
                return true;
            } catch (err) {
                console.error("Erro ao enviar comentário:", err);
                setError("Não foi possível enviar. Tente novamente.");
                return false;
            }
        },
        [comToken, videoId, mudarTotal]
    );

    const abrirRespostas = useCallback(
        async (rootId: string) => {
            const abrir = !abertas[rootId];
            setAbertas((prev) => ({ ...prev, [rootId]: abrir }));
            if (!abrir || replies[rootId]) return;
            try {
                const res = await fetch(`${API_URL}/api/videos/${videoId}/comments/${rootId}/replies`);
                if (!res.ok) throw new Error(`Falha ao buscar respostas: ${res.status}`);
                const lista: Comment[] = await res.json();
                setReplies((prev) => ({ ...prev, [rootId]: lista }));
            } catch (err) {
                console.error("Erro ao carregar respostas:", err);
                setAbertas((prev) => ({ ...prev, [rootId]: false }));
                setError("Não foi possível carregar as respostas.");
            }
        },
        [abertas, replies, videoId]
    );

    const curtir = useCallback(
        async (comment: Comment) => {
            if (!isSignedIn) {
                setError("Entre para curtir comentários.");
                return;
            }
            if (curtindo) return;
            const estava = curtidos.has(comment.id);
            const antes = curtidas[comment.id] ?? comment.likesCount ?? 0;
            const marcar = (liked: boolean, total: number) => {
                setCurtidos((prev) => {
                    const next = new Set(prev);
                    if (liked) next.add(comment.id);
                    else next.delete(comment.id);
                    return next;
                });
                setCurtidas((prev) => ({ ...prev, [comment.id]: total }));
            };

            // Otimista: muda já e corrige com a resposta do servidor
            marcar(!estava, Math.max(antes + (estava ? -1 : 1), 0));
            setCurtindo(comment.id);
            try {
                const token = await comToken();
                const res = await fetch(`${API_URL}/api/videos/${videoId}/comments/${comment.id}/like`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Falha ao curtir: ${res.status}`);
                const result: { liked: boolean; likesCount: number } = await res.json();
                marcar(result.liked, result.likesCount);
            } catch (err) {
                console.error("Erro ao curtir:", err);
                marcar(estava, antes);
                setError("Não foi possível curtir agora.");
            } finally {
                setCurtindo(null);
            }
        },
        [isSignedIn, curtindo, curtidos, curtidas, comToken, videoId]
    );

    const apagar = useCallback(
        async (comment: Comment) => {
            if (deletingId) return;
            const rootId = comment.parentId ?? null;
            const respostas = rootId ? 0 : Math.max(comment.replyCount ?? 0, replies[comment.id]?.length ?? 0);
            if (!window.confirm(respostas > 0 ? "Apagar este comentário e as respostas dele?" : "Apagar este comentário?")) return;

            setDeletingId(comment.id);
            setError(null);
            try {
                const token = await comToken();
                const res = await fetch(`${API_URL}/api/videos/${videoId}/comments/${comment.id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error(`Falha ao apagar: ${res.status}`);
                if (rootId) {
                    setReplies((prev) => ({ ...prev, [rootId]: prev[rootId]?.filter((r) => r.id !== comment.id) }));
                    setComments((prev) =>
                        prev.map((c) => (c.id === rootId ? { ...c, replyCount: Math.max((c.replyCount ?? 1) - 1, 0) } : c))
                    );
                } else {
                    setComments((prev) => prev.filter((c) => c.id !== comment.id));
                }
                mudarTotal(-(1 + respostas));
            } catch (err) {
                console.error("Erro ao apagar:", err);
                setError("Não foi possível apagar o comentário.");
            } finally {
                setDeletingId(null);
            }
        },
        [deletingId, replies, comToken, videoId, mudarTotal]
    );

    const sheet = layout === "sheet";
    const isOwner = (c: Comment) => !!userId && (c.clerkUserId === userId || c.userId === userId);

    const item = (comment: Comment, rootId: string, resposta: boolean) => (
        <CommentItem
            comment={comment}
            compact={resposta}
            isCreator={!!creatorId && comment.userId === creatorId}
            isOwner={isOwner(comment)}
            isDeleting={deletingId === comment.id}
            liked={curtidos.has(comment.id)}
            likesCount={curtidas[comment.id] ?? comment.likesCount ?? 0}
            onLike={() => void curtir(comment)}
            onReply={() => {
                if (!isSignedIn) {
                    setError("Entre para responder.");
                    return;
                }
                setRespondendo({ rootId, prefixo: resposta ? `@${primeiroNome(comment.userName)} ` : "" });
            }}
            onDelete={() => void apagar(comment)}
        />
    );

    return (
        <div className={sheet ? "flex h-full min-h-0 flex-col" : "flex flex-col gap-6"}>
            {/* Escrever (na gaveta fica fixo embaixo, como nos apps de vídeo curto) */}
            <div className={sheet ? "order-2 shrink-0 border-t border-border bg-card px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3" : ""}>
                {isSignedIn ? (
                    <Composer
                        id="new-comment-input"
                        avatar={<Avatar name={user?.fullName ?? undefined} url={user?.imageUrl} className="size-10" />}
                        placeholder="Comente sobre o vídeo..."
                        submitLabel="Comentar"
                        onSubmit={(texto) => enviar(texto)}
                    />
                ) : (
                    <Link
                        href="/sign-in"
                        className="type-body-small flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                        <MessageCircle className="size-5" aria-hidden="true" />
                        Entre para comentar e conversar com o criador.
                    </Link>
                )}
                {error && (
                    <p role="alert" className="type-caption mt-2 flex items-center gap-1 text-destructive">
                        <AlertCircle className="size-3.5" aria-hidden="true" />
                        {error}
                    </p>
                )}
            </div>

            {/* Lista */}
            <div className={sheet ? "order-1 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4" : ""}>
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
                    <ul className="flex flex-col gap-6">
                        {comments.map((comment) => {
                            const total = comment.replyCount ?? 0;
                            const aberta = !!abertas[comment.id];
                            const lista = replies[comment.id];
                            const escrevendoAqui = respondendo?.rootId === comment.id;
                            return (
                                <li key={comment.id}>
                                    {item(comment, comment.id, false)}

                                    {(total > 0 || escrevendoAqui) && (
                                        // Fio vermelho fino liga as respostas ao comentário
                                        <div className="ml-[1.1875rem] mt-3 border-l-2 border-primary/25 pl-5">
                                            {total > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => void abrirRespostas(comment.id)}
                                                    aria-expanded={aberta}
                                                    className="type-caption cursor-pointer font-semibold text-primary hover:underline"
                                                >
                                                    {aberta ? "Ocultar respostas" : total === 1 ? "Ver 1 resposta" : `Ver ${total} respostas`}
                                                </button>
                                            )}
                                            {aberta && !lista && <Loader2 className="mt-3 size-4 animate-spin text-muted-foreground" aria-label="Carregando respostas" />}
                                            {aberta && lista && lista.length > 0 && (
                                                <ul className="mt-4 flex flex-col gap-4">
                                                    {lista.map((r) => (
                                                        <li key={r.id}>{item(r, comment.id, true)}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {escrevendoAqui && (
                                                <div className={total > 0 ? "mt-4" : ""}>
                                                    <Composer
                                                        key={`${comment.id}-${respondendo.prefixo}`}
                                                        id={`reply-${comment.id}`}
                                                        compact
                                                        autoFocus
                                                        initialText={respondendo.prefixo}
                                                        placeholder={`Responder ${primeiroNome(comment.userName)}...`}
                                                        submitLabel="Responder"
                                                        onCancel={() => setRespondendo(null)}
                                                        onSubmit={async (texto) => {
                                                            const ok = await enviar(texto, comment.id);
                                                            if (ok) setRespondendo(null);
                                                            return ok;
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

interface ComposerProps {
    id: string;
    placeholder: string;
    submitLabel: string;
    onSubmit: (texto: string) => Promise<boolean>;
    onCancel?: () => void;
    avatar?: React.ReactNode;
    initialText?: string;
    compact?: boolean;
    autoFocus?: boolean;
}

function Composer({ id, placeholder, submitLabel, onSubmit, onCancel, avatar, initialText = "", compact = false, autoFocus = false }: ComposerProps) {
    const [texto, setTexto] = useState(initialText);
    const [focused, setFocused] = useState(autoFocus);
    const [sending, setSending] = useState(false);
    const aberto = focused || texto.length > 0 || compact;

    async function enviar() {
        const limpo = texto.trim();
        if (!limpo || sending) return;
        setSending(true);
        const ok = await onSubmit(limpo);
        setSending(false);
        if (ok) {
            setTexto("");
            setFocused(false);
        }
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                void enviar();
            }}
            className="flex items-start gap-3"
        >
            {avatar}
            <div className="min-w-0 flex-1">
                <label htmlFor={id} className="sr-only">
                    {placeholder}
                </label>
                <textarea
                    id={id}
                    value={texto}
                    autoFocus={autoFocus}
                    onChange={(e) => setTexto(e.target.value.slice(0, MAX_CHARS))}
                    onFocus={(e) => {
                        setFocused(true);
                        // Cursor depois do "@Nome " já escrito
                        if (initialText && e.currentTarget.value === initialText) {
                            e.currentTarget.setSelectionRange(initialText.length, initialText.length);
                        }
                    }}
                    onKeyDown={(e) => {
                        // Enter envia; Shift+Enter quebra linha
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            void enviar();
                        }
                    }}
                    rows={aberto ? (compact ? 2 : 3) : 1}
                    placeholder={placeholder}
                    disabled={sending}
                    className="type-body-small w-full resize-none border-0 border-b border-border bg-transparent px-0 py-2 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60"
                />
                {aberto && (
                    <div className="mt-2 flex items-center justify-end gap-2">
                        <span className="type-caption mr-auto tabular-nums text-muted-foreground">
                            {texto.length}/{MAX_CHARS}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setTexto("");
                                setFocused(false);
                                onCancel?.();
                            }}
                            className="type-label h-9 cursor-pointer rounded-full px-4 text-foreground hover:bg-surface-muted"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!texto.trim() || sending}
                            className="type-label inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {sending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <SendHorizontal className="size-4" aria-hidden="true" />}
                            {submitLabel}
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
}

interface CommentItemProps {
    comment: Comment;
    compact: boolean;
    isCreator: boolean;
    isOwner: boolean;
    isDeleting: boolean;
    liked: boolean;
    likesCount: number;
    onLike: () => void;
    onReply: () => void;
    onDelete: () => void;
}

const acao =
    "type-caption inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2 font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-40";

function CommentItem({ comment, compact, isCreator, isOwner, isDeleting, liked, likesCount, onLike, onReply, onDelete }: CommentItemProps) {
    return (
        <div className="group flex items-start gap-3">
            <Avatar name={comment.userName} url={comment.userAvatar} className={compact ? "size-7" : "size-10"} />
            <div className="min-w-0 flex-1">
                <p className="type-caption flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate font-semibold text-foreground">{comment.userName || "Usuário"}</span>
                    {isCreator && (
                        <span className="rounded-sm bg-primary px-1.5 py-px text-[0.625rem] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                            Criador
                        </span>
                    )}
                    <time dateTime={comment.createdAt} className="shrink-0 text-muted-foreground">
                        {timeAgo(comment.createdAt)}
                    </time>
                </p>
                <p className="type-body-small mt-1 whitespace-pre-wrap break-words text-foreground">{comment.text}</p>

                <div className="-ml-2 mt-1 flex items-center gap-1">
                    <button
                        type="button"
                        onClick={onLike}
                        aria-pressed={liked}
                        aria-label={liked ? `Descurtir, ${likesCount} curtidas` : `Curtir, ${likesCount} curtidas`}
                        className={cn(acao, liked && "text-primary hover:text-primary")}
                    >
                        <Heart className={cn("size-4 transition-transform", liked && "scale-110 fill-current")} aria-hidden="true" />
                        {likesCount > 0 && <span className="tabular-nums">{likesCount}</span>}
                    </button>
                    <button type="button" onClick={onReply} className={acao}>
                        Responder
                    </button>
                    {isOwner && (
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={isDeleting}
                            aria-label="Apagar comentário"
                            title="Apagar comentário"
                            className={cn(acao, "ml-auto hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100")}
                        >
                            {isDeleting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
