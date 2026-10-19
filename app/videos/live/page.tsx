"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Check, Copy, Eye, EyeOff, Radio, Square } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GlitchButton } from "@/components/videos/GlitchButton";
import { createLive, endLive, fetchLiveCredentials, fetchVideo } from "@/lib/videos/api";
import type { LiveCredentials } from "@/lib/videos/types";

export default function LivePage() {
    return (
        <Suspense fallback={null}>
            <LiveStudio />
        </Suspense>
    );
}

function LiveStudio() {
    const { getToken, isSignedIn, isLoaded } = useAuth();
    const router = useRouter();
    const videoId = useSearchParams().get("id");

    const [credentials, setCredentials] = useState<LiveCredentials | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [ending, setEnding] = useState(false);
    const [isLiveNow, setIsLiveNow] = useState(false);

    // Live já criada (?id=): busca a chave (só o dono recebe)
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !videoId) return;
        let cancelled = false;
        (async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const data = await fetchLiveCredentials(token, videoId);
                if (!cancelled) {
                    setCredentials(data);
                    setIsLiveNow(data.isLiveNow);
                }
            } catch (e) {
                if (!cancelled) setLoadError(e instanceof Error ? e.message : "Não foi possível abrir esta live.");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isLoaded, isSignedIn, videoId, getToken]);

    // Status: o Mux avisa o backend quando o OBS conecta/desconecta
    const activeId = credentials?.videoId;
    useEffect(() => {
        if (!activeId) return;
        const timer = setInterval(async () => {
            const video = await fetchVideo(activeId, await getToken().catch(() => null));
            if (video) setIsLiveNow(!!video.isLiveNow);
        }, 5000);
        return () => clearInterval(timer);
    }, [activeId, getToken]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (title.trim().length < 3) {
            toast.error("O título precisa de pelo menos 3 letras.");
            return;
        }
        setCreating(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Sua sessão expirou. Entre de novo.");
            const created = await createLive(token, title.trim(), description.trim());
            setCredentials(created);
            router.replace(`/videos/live?id=${created.videoId}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Não foi possível criar a live.");
        } finally {
            setCreating(false);
        }
    }

    async function handleEnd() {
        if (!credentials || !window.confirm("Encerrar a transmissão agora? A gravação vira um vídeo no seu canal.")) return;
        setEnding(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Sua sessão expirou.");
            await endLive(token, credentials.videoId);
            setIsLiveNow(false);
            toast("Live encerrada. O replay aparece no seu canal em alguns minutos.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Não foi possível encerrar.");
        } finally {
            setEnding(false);
        }
    }

    if (isLoaded && !isSignedIn) {
        return (
            <div className="mx-auto max-w-xl px-4 py-16 text-center">
                <Radio className="mx-auto size-10 text-primary" aria-hidden="true" />
                <h1 className="mt-4 text-xl font-bold">Entre para fazer uma live</h1>
                <Button asChild className="mt-6">
                    <Link href="/sign-in">Entrar</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-10">
            <h1 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
                <span className={isLiveNow ? "live-dot" : "h-4 w-1 bg-primary"} aria-hidden="true" />
                {isLiveNow ? "Você está ao vivo" : "Fazer live"}
            </h1>

            {loadError ? (
                <p role="alert" className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {loadError}
                </p>
            ) : !credentials ? (
                videoId ? (
                    <div className="mt-6 h-40 animate-pulse rounded-xl bg-secondary" />
                ) : (
                    <form onSubmit={handleCreate} className="mt-6 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Dê um nome para a transmissão. Em seguida você recebe o servidor e a chave para colar no OBS,
                            Streamlabs ou app de live do celular. Quando a live termina, a gravação vira um vídeo no seu canal.
                        </p>
                        <div>
                            <label htmlFor="live-title" className="text-sm font-medium">Título</label>
                            <input
                                id="live-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={255}
                                placeholder="Ex.: Descida ao vivo no Pico do Jaraguá #downhill"
                                className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label htmlFor="live-description" className="text-sm font-medium">Descrição (opcional)</label>
                            <textarea
                                id="live-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={5000}
                                rows={3}
                                className="mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <Button type="submit" disabled={creating}>
                            <Radio aria-hidden="true" />
                            {creating ? "Criando..." : "Criar live"}
                        </Button>
                    </form>
                )
            ) : (
                <div className="mt-6 space-y-5">
                    <div className="rounded-xl border border-border bg-card p-4 text-sm">
                        <p className="font-medium">Como entrar no ar</p>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                            <li>No OBS: Configurações → Transmissão → Serviço “Personalizado”.</li>
                            <li>Cole o servidor e a chave abaixo.</li>
                            <li>Clique em “Iniciar transmissão”. Em alguns segundos esta página mostra “ao vivo”.</li>
                        </ol>
                    </div>

                    <SecretField label="Servidor (RTMPS)" value={credentials.ingestUrl} />
                    <SecretField label="Chave de transmissão" value={credentials.streamKey} secret />

                    <p className="text-xs text-muted-foreground">
                        Não mostre a chave na tela durante a live: com ela qualquer pessoa transmite no seu canal.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <GlitchButton text="Ver a live" href={`/videos/watch/${credentials.videoId}`} icon={<Radio aria-hidden="true" />} />
                        <Button variant="outline" onClick={handleEnd} disabled={ending}>
                            <Square aria-hidden="true" />
                            {ending ? "Encerrando..." : "Encerrar live"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SecretField({ label, value, secret = false }: { label: string; value: string; secret?: boolean }) {
    const [visible, setVisible] = useState(!secret);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [copied]);

    async function copy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
        } catch {
            toast.error("Não foi possível copiar");
        }
    }

    return (
        <div>
            <p className="text-sm font-medium">{label}</p>
            <div className="mt-1 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-secondary px-3 py-2.5 font-mono text-xs">
                    {visible ? value : "•".repeat(Math.min(value.length, 32))}
                </code>
                {secret && (
                    <Button type="button" variant="outline" size="icon" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Esconder chave" : "Mostrar chave"}>
                        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    </Button>
                )}
                <Button type="button" variant="outline" size="icon" onClick={copy} aria-label={`Copiar ${label.toLowerCase()}`}>
                    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                </Button>
            </div>
        </div>
    );
}
