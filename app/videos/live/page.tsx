"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    Check,
    CheckCircle2,
    Copy,
    ExternalLink,
    Eye,
    EyeOff,
    Laptop,
    Loader2,
    Radio,
    Smartphone,
    Square,
    SquarePlay,
    Trophy,
    type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EventoPicker, type EventoEscolhido } from "@/components/videos/EventoPicker";
import { GlitchButton } from "@/components/videos/GlitchButton";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { YouTubePlayer } from "@/components/videos/YouTubePlayer";
import { createLive, createYouTubeLive, endLive, fetchLiveCredentials, fetchMyVideos, fetchVideo, playbackIdFrom } from "@/lib/videos/api";
import type { LiveCredentials, VideoItem } from "@/lib/videos/types";
import { ANUNCIOS_ABERTOS } from "@/lib/anuncios";
import { cn } from "@/lib/utils";
import { tournamentService } from "@/services/tournamentService";

/** Só o organizador transmite no evento; evento encerrado não recebe live. */
const meusEventosAtivos = () => tournamentService.meusEventos().then((lista) => lista.filter((t) => t.status !== "encerrado"));

const campo =
    "mt-1 w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

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
    const params = useSearchParams();
    const videoId = params.get("id");
    // Vindo do evento (?torneio=): a live já sai marcada com ele
    const torneioParam = params.get("torneio");

    const [credentials, setCredentials] = useState<LiveCredentials | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [fonte, setFonte] = useState<"imperium" | "youtube">("imperium");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [evento, setEvento] = useState<EventoEscolhido | null>(null);
    const [abertas, setAbertas] = useState<VideoItem[]>([]);
    const [creating, setCreating] = useState(false);
    const [ending, setEnding] = useState(false);
    const [ended, setEnded] = useState(false);
    const [live, setLive] = useState<VideoItem | null>(null);
    const isLiveNow = !ended && (live ? !!live.isLiveNow : !!credentials?.isLiveNow);
    const youtube = credentials?.platform === "YOUTUBE";

    useEffect(() => {
        if (!torneioParam) return;
        let ativo = true;
        tournamentService
            .buscarPorId(torneioParam)
            .then((t) => ativo && setEvento({ id: t.id, nome: t.nome }))
            .catch(() => {});
        return () => {
            ativo = false;
        };
    }, [torneioParam]);

    // Lives já criadas e ainda não encerradas: dá para voltar ao painel delas
    useEffect(() => {
        if (!isLoaded || !isSignedIn || videoId) return;
        let ativo = true;
        (async () => {
            const token = await getToken();
            if (!token) return;
            const pagina = await fetchMyVideos(token, 0).catch(() => null);
            if (ativo && pagina) setAbertas(pagina.content.filter((v) => v.isLive && v.status !== "REMOVED"));
        })();
        return () => {
            ativo = false;
        };
    }, [isLoaded, isSignedIn, videoId, getToken]);

    // Live já criada (?id=): busca a chave (só o dono recebe)
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !videoId) return;
        let cancelled = false;
        (async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const data = await fetchLiveCredentials(token, videoId);
                if (!cancelled) setCredentials(data);
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
        if (!activeId || ended) return;
        let ativo = true;
        const checar = async () => {
            const video = await fetchVideo(activeId, await getToken().catch(() => null));
            if (!ativo || !video) return;
            setLive(video);
            // Já virou replay: a transmissão acabou
            if (!video.isLive) setEnded(true);
        };
        void checar();
        const timer = setInterval(checar, 5000);
        return () => {
            ativo = false;
            clearInterval(timer);
        };
    }, [activeId, ended, getToken]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (title.trim().length < 3) {
            toast.error("O título precisa de pelo menos 3 letras.");
            return;
        }
        if (fonte === "youtube" && !youtubeUrl.trim()) {
            toast.error("Cole o link da live do YouTube.");
            return;
        }
        setCreating(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Sua sessão expirou. Entre de novo.");
            const created =
                fonte === "youtube"
                    ? await createYouTubeLive(token, youtubeUrl.trim(), title.trim(), description.trim(), evento?.id)
                    : await createLive(token, title.trim(), description.trim(), evento?.id);
            setCredentials(created);
            router.replace(`/videos/live?id=${created.videoId}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Não foi possível criar a live.");
        } finally {
            setCreating(false);
        }
    }

    async function handleEnd() {
        const aviso = youtube
            ? "Tirar a live do site? Ela vira um vídeo no seu canal. A transmissão no YouTube você encerra no app do YouTube."
            : "Encerrar a transmissão agora? A gravação vira um vídeo no seu canal.";
        if (!credentials || !window.confirm(aviso)) return;
        setEnding(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Sua sessão expirou.");
            await endLive(token, credentials.videoId);
            setEnded(true);
            toast(youtube ? "Live encerrada no site." : "Live encerrada. O replay aparece no seu canal em alguns minutos.");
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

    const torneioId = credentials?.tournamentId;

    return (
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:py-10">
            <h1 className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
                <span className={isLiveNow ? "live-dot" : "h-4 w-1 bg-primary"} aria-hidden="true" />
                {isLiveNow ? "Você está ao vivo" : credentials ? "Painel da live" : "Fazer live"}
            </h1>

            {loadError ? (
                <p role="alert" className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {loadError}
                </p>
            ) : !credentials ? (
                videoId ? (
                    <div className="mt-6 h-40 animate-pulse rounded-xl bg-secondary" />
                ) : (
                    <>
                        {abertas.length > 0 && (
                            <section aria-labelledby="lives-abertas" className="mt-6 rounded-xl border border-border bg-card p-4">
                                <h2 id="lives-abertas" className="text-sm font-medium">Suas lives abertas</h2>
                                <p className="mt-1 text-xs text-muted-foreground">Já criou e quer transmitir de novo? Use a mesma chave, sem criar outra.</p>
                                <ul className="mt-3 divide-y divide-border">
                                    {abertas.map((v) => (
                                        <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                                            <span className="flex min-w-0 items-center gap-2 text-sm">
                                                {v.isLiveNow && <span className="live-dot shrink-0" aria-label="No ar" />}
                                                <span className="truncate">{v.title}</span>
                                            </span>
                                            <Link href={`/videos/live?id=${v.id}`} className="shrink-0 text-sm font-semibold text-primary hover:underline">
                                                Abrir painel
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <form onSubmit={handleCreate} className="mt-6 space-y-5">
                            <div role="radiogroup" aria-label="Como você vai transmitir" className="grid gap-3 sm:grid-cols-2">
                                <OpcaoFonte
                                    ativa={fonte === "imperium"}
                                    onClick={() => setFonte("imperium")}
                                    Icone={Radio}
                                    titulo="Transmitir pelo Imperium"
                                    texto={ANUNCIOS_ABERTOS ? "Pelo OBS ou um app de live. Chat, views e monetização ficam aqui." : "Pelo OBS ou um app de live. Chat e views ficam aqui."}
                                />
                                <OpcaoFonte
                                    ativa={fonte === "youtube"}
                                    onClick={() => setFonte("youtube")}
                                    Icone={SquarePlay}
                                    titulo="Usar uma live do YouTube"
                                    texto="Transmita pelo app do YouTube e cole o link. Aparece aqui com o player dele."
                                />
                            </div>

                            {fonte === "youtube" ? (
                                <div>
                                    <label htmlFor="live-youtube" className="text-sm font-medium">Link da live no YouTube</label>
                                    <input
                                        id="live-youtube"
                                        type="url"
                                        inputMode="url"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        placeholder="https://youtube.com/live/..."
                                        className={campo}
                                    />
                                    <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-xs text-muted-foreground">
                                        <li>No app do YouTube: botão “+” → “Transmitir ao vivo” e comece a live.</li>
                                        <li>Toque em “Compartilhar” → “Copiar link” e cole aqui.</li>
                                        <li>A live entra no site na hora. Quando acabar, encerre aqui também.</li>
                                    </ol>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Dê um nome para a transmissão. Em seguida você recebe o servidor e a chave para colar no OBS
                                    ou num app de live do celular. Quando a live termina, a gravação vira um vídeo no seu canal.
                                </p>
                            )}
                            <div>
                                <label htmlFor="live-title" className="text-sm font-medium">Título</label>
                                <input
                                    id="live-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={255}
                                    placeholder="Ex.: Descida ao vivo no Pico do Jaraguá #downhill"
                                    className={campo}
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
                                    className={campo}
                                />
                            </div>
                            <EventoPicker
                                value={evento}
                                onChange={setEvento}
                                carregar={meusEventosAtivos}
                                listaFixa
                                disabled={creating}
                                ajuda="Só eventos que você organiza. Enquanto estiver no ar, a live aparece no topo da página do evento."
                            />
                            <Button type="submit" disabled={creating}>
                                {creating ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Radio aria-hidden="true" />}
                                {creating ? "Criando (pode levar até 1 minuto)..." : fonte === "youtube" ? "Publicar live no site" : "Criar live"}
                            </Button>
                        </form>
                    </>
                )
            ) : (
                <div className="mt-6 space-y-5">
                    <div>
                        <p className="text-lg font-bold">{credentials.title}</p>
                        {torneioId && (
                            <Link
                                href={`/torneios/${torneioId}`}
                                className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm hover:border-primary/50 hover:text-primary"
                            >
                                <Trophy className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                                <span className="truncate">{credentials.tournamentName || "Ver o evento"}</span>
                            </Link>
                        )}
                    </div>

                    <StatusLive estado={ended ? "encerrada" : isLiveNow ? "no-ar" : "aguardando"} live={live} youtube={youtube} />

                    {youtube && !ended && credentials.externalUrl && (
                        <p className="text-xs text-muted-foreground">
                            A transmissão acontece no YouTube: câmera, chat dele e fim da live são pelo app do YouTube.{" "}
                            <a href={credentials.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                                Abrir no YouTube
                                <ExternalLink className="size-3" aria-hidden="true" />
                            </a>
                        </p>
                    )}

                    {!ended && !youtube && (
                        <>
                            <ComoTransmitir />

                            <SecretField label="Servidor (RTMPS)" value={credentials.ingestUrl} />
                            <SecretField label="Chave de transmissão" value={credentials.streamKey} secret />

                            <p className="text-xs text-muted-foreground">
                                Não mostre a chave na tela durante a live: com ela qualquer pessoa transmite no seu canal.
                                Se o sinal cair, reconecte em até 1 minuto que a live continua a mesma.
                            </p>
                        </>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <GlitchButton
                            text={ended ? "Ver no meu canal" : torneioId ? "Ver no evento" : "Ver a live"}
                            href={ended ? "/videos/meus-videos" : torneioId ? `/torneios/${torneioId}` : `/videos/watch/${credentials.videoId}`}
                            icon={<Radio aria-hidden="true" />}
                        />
                        {!ended && (
                            <Button variant="outline" onClick={handleEnd} disabled={ending}>
                                <Square aria-hidden="true" />
                                {ending ? "Encerrando..." : youtube ? "Encerrar no site" : "Encerrar live"}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/** O que está acontecendo agora: esperando o sinal, no ar (com prévia) ou encerrada. */
function StatusLive({ estado, live, youtube }: { estado: "aguardando" | "no-ar" | "encerrada"; live: VideoItem | null; youtube: boolean }) {
    if (estado === "encerrada") {
        return (
            <div role="status" className="flex gap-3 rounded-xl border border-border bg-card p-4">
                <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
                <div className="text-sm">
                    <p className="font-medium">Transmissão encerrada</p>
                    <p className="mt-0.5 text-muted-foreground">
                        {youtube
                            ? "A live virou um vídeo no seu canal, tocando pelo YouTube."
                            : "A gravação está sendo preparada e aparece no seu canal em alguns minutos."}
                    </p>
                </div>
            </div>
        );
    }
    if (estado === "aguardando") {
        return (
            <div role="status" aria-live="polite" className="flex gap-3 rounded-xl border border-dashed border-border bg-card p-4">
                <Loader2 className="size-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
                <div className="text-sm">
                    <p className="font-medium">Esperando o sinal</p>
                    <p className="mt-0.5 text-muted-foreground">Comece a transmitir no OBS ou no app. Esta página muda sozinha quando o sinal chegar.</p>
                </div>
            </div>
        );
    }
    const playbackId = playbackIdFrom(live?.videoUrl);
    return (
        <div role="status" aria-live="polite" className="overflow-hidden rounded-xl border border-primary/50 bg-black">
            {youtube && live?.videoUrl ? (
                <YouTubePlayer embedUrl={live.videoUrl} title={live.title} autoplay />
            ) : playbackId && live && !youtube ? (
                <VideoPlayer videoId={live.id} playbackId={playbackId} title={live.title} live />
            ) : (
                <div className="aspect-video" />
            )}
            <p className="flex items-center gap-2 bg-card px-4 py-2.5 text-sm font-medium">
                <span className="live-dot" aria-hidden="true" />
                No ar. A prévia chega com alguns segundos de atraso.
            </p>
        </div>
    );
}

/** Cartão de escolha: transmitir por aqui ou usar uma live do YouTube. */
function OpcaoFonte({ ativa, onClick, Icone, titulo, texto }: { ativa: boolean; onClick: () => void; Icone: LucideIcon; titulo: string; texto: string }) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={ativa}
            onClick={onClick}
            className={cn(
                "flex cursor-pointer gap-3 rounded-xl border p-4 text-left transition-colors",
                ativa ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/40",
            )}
        >
            <Icone className={cn("mt-0.5 size-5 shrink-0", ativa ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
            <span>
                <span className="block text-sm font-semibold">{titulo}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{texto}</span>
            </span>
        </button>
    );
}

/** Passo a passo para computador e celular. */
function ComoTransmitir() {
    const [aba, setAba] = useState<"pc" | "celular">("pc");
    const abas = [
        { id: "pc" as const, nome: "Computador", Icone: Laptop },
        { id: "celular" as const, nome: "Celular", Icone: Smartphone },
    ];

    return (
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
            <div role="tablist" aria-label="Onde você vai transmitir" className="flex gap-1 rounded-lg bg-secondary p-1">
                {abas.map(({ id, nome, Icone }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={aba === id}
                        onClick={() => setAba(id)}
                        className={cn(
                            "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2 font-medium transition-colors",
                            aba === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <Icone className="size-4" aria-hidden="true" />
                        {nome}
                    </button>
                ))}
            </div>

            {aba === "pc" ? (
                <ol role="tabpanel" className="mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">
                    <li>No OBS ou Streamlabs: Configurações → Transmissão → Serviço “Personalizado”.</li>
                    <li>Cole o servidor e a chave abaixo.</li>
                    <li>Em Saída, use 720p ou 1080p a 30 fps, de 3.000 a 6.000 kbps, e intervalo de quadro-chave de 2 s.</li>
                    <li>Clique em “Iniciar transmissão”. Em alguns segundos esta página mostra “ao vivo”.</li>
                </ol>
            ) : (
                <ol role="tabpanel" className="mt-3 list-decimal space-y-1 pl-5 text-muted-foreground">
                    <li>Instale um app que transmite por RTMP, como o Larix Broadcaster ou o PRISM Live (grátis, Android e iPhone).</li>
                    <li>Crie uma conexão RTMP personalizada e cole o servidor e a chave abaixo (no Larix, junte os dois: servidor/chave).</li>
                    <li>Grave na horizontal, em 720p, de preferência no Wi-Fi ou com 4G bom.</li>
                    <li>Toque em transmitir. Em alguns segundos esta página mostra “ao vivo”.</li>
                </ol>
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
