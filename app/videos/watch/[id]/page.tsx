// app/videos/watch/[id]/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Radio, Trophy } from "lucide-react";
import { toast } from "sonner";
import { fetchRelated, fetchVideo, playbackIdFrom, likeVideo, dislikeVideo } from "@/lib/videos/api";
import { formatViews, timeAgo } from "@/lib/videos/format";
import { PESO, registrarInteresse } from "@/lib/videos/gosto";
import type { VideoItem } from "@/lib/videos/types";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { YouTubePlayer } from "@/components/videos/YouTubePlayer";
import { VideoActions } from "@/components/videos/VideoActions";
import { DenunciarButton } from "@/components/ui/denunciar-button";
import { VideoComments } from "@/components/videos/VideoComments";
import { VideoSidebar } from "@/components/videos/VideoSidebar";
import { VideoAvatar } from "@/components/videos/VideoAvatar";
import { VideoDescription } from "@/components/videos/VideoDescription";
import { SubscribeButton } from "@/components/videos/SubscribeButton";
import { Loader } from "@/components/ui/loader";

interface Reaction {
    liked: boolean;
    disliked: boolean;
    likesCount: number;
    dislikesCount: number;
}

/** Dados guardados junto com o id: trocar de vídeo já vira "carregando" sem setState no efeito. */
interface Loaded {
    id: string;
    video: VideoItem | null;
}

function reactionOf(video: VideoItem | null): Reaction {
    return {
        liked: video?.liked ?? false,
        disliked: video?.disliked ?? false,
        likesCount: video?.likesCount ?? 0,
        dislikesCount: video?.dislikesCount ?? 0,
    };
}

const dataCompleta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

function Dado({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
    return (
        <div className="min-w-0 px-3 first:pl-0">
            <dt className="truncate text-[0.625rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">{rotulo}</dt>
            <dd className="mt-1 truncate text-base font-bold tabular-nums text-foreground sm:text-lg">{valor}</dd>
        </div>
    );
}

export default function WatchPage() {
    const { id } = useParams<{ id: string }>();
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [loaded, setLoaded] = useState<Loaded | null>(null);
    const [related, setRelated] = useState<VideoItem[]>([]);
    const [reaction, setReaction] = useState<Reaction>(reactionOf(null));
    const [showMore, setShowMore] = useState(false);
    const [totalComentarios, setTotalComentarios] = useState<number | null>(null);

    // Com token: liked/disliked de quem está vendo e acesso aos próprios vídeos privados
    useEffect(() => {
        if (!isLoaded) return;
        let cancelled = false;
        (async () => {
            const token = await getToken().catch(() => null);
            const data = await fetchVideo(id, token);
            if (cancelled) return;
            setLoaded({ id, video: data });
            setReaction(reactionOf(data));
            // Aprende o gosto: assistir pesa nas hashtags deste vídeo
            if (data) registrarInteresse(data.hashtags ?? [], PESO.assistiu);
        })();
        fetchRelated(id).then((r) => !cancelled && setRelated(r));
        return () => {
            cancelled = true;
        };
    }, [id, isLoaded, getToken]);

    const video = loaded?.id === id ? loaded.video : null;
    const loading = loaded?.id !== id;

    // Vídeo processando ou live aguardando o encoder: consulta de novo a cada 5s
    const waiting = video?.status === "PROCESSING" || (video?.isLive && !video.isLiveNow && video.status === "READY");
    useEffect(() => {
        if (!waiting) return;
        const timer = setInterval(async () => {
            const token = await getToken().catch(() => null);
            const data = await fetchVideo(id, token);
            if (data) setLoaded({ id, video: data });
        }, 5000);
        return () => clearInterval(timer);
    }, [id, waiting, getToken]);

    const aoContarComentarios = useCallback((total: number) => setTotalComentarios(total), []);

    async function toggle(kind: "like" | "dislike") {
        if (!video) return;
        if (!isSignedIn) {
            toast("Entre para reagir aos vídeos");
            return;
        }
        const previous = reaction;
        const isLike = kind === "like";
        const wasOn = isLike ? previous.liked : previous.disliked;
        const otherOn = isLike ? previous.disliked : previous.liked;
        if (isLike && !wasOn) registrarInteresse(video.hashtags ?? [], PESO.curtiu);

        // Otimista: atualiza já e corrige com a resposta do servidor
        setReaction({
            liked: isLike ? !wasOn : false,
            disliked: isLike ? false : !wasOn,
            likesCount: previous.likesCount + (isLike ? (wasOn ? -1 : 1) : otherOn ? -1 : 0),
            dislikesCount: previous.dislikesCount + (isLike ? (otherOn ? -1 : 0) : wasOn ? -1 : 1),
        });

        const token = await getToken();
        const result = token ? await (isLike ? likeVideo : dislikeVideo)(video.id, token) : null;
        if (!result) {
            setReaction(previous);
            toast.error("Não foi possível registrar sua reação.");
            return;
        }
        setReaction({
            liked: result.liked,
            disliked: result.disliked,
            likesCount: result.likesCount,
            dislikesCount: result.dislikesCount,
        });
    }

    if (loading) {
        return (
          <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8">
              <div className="aspect-video w-full rounded-xl bg-card" />
              <div className="mt-4 h-6 w-2/3 rounded bg-card" />
              <div className="mt-4 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-card" />
                  <div className="h-4 w-40 rounded bg-card" />
              </div>
          </div>
        );
    }

    if (!video) {
        return <p className="px-6 py-20 text-center text-muted-foreground">Vídeo não encontrado</p>;
    }

    const liveWaiting = video.isLive && !video.isLiveNow;
    const temDescricao = Boolean(video.description?.trim()) || (video.hashtags?.length ?? 0) > 0;

    const actions = (
      <VideoActions
        videoId={video.id}
        liked={reaction.liked}
        disliked={reaction.disliked}
        likesCount={reaction.likesCount}
        dislikesCount={reaction.dislikesCount}
        onToggleLike={() => void toggle("like")}
        onToggleDislike={() => void toggle("dislike")}
      />
    );
    const denunciar = <DenunciarButton tipo="VIDEO" id={video.id} />;

    return (
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
              <div className="min-w-0">
                  <div className="relative overflow-hidden sm:rounded-xl">
                      {video.status === "PROCESSING" || video.status === "FAILED" || liveWaiting ? (
                          <div role="status" className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-surface-muted px-6 text-center">
                              {video.status === "PROCESSING" && <Loader label="Processando vídeo" />}
                              {liveWaiting && <Radio className="size-8 text-primary" aria-hidden="true" />}
                              <p className="type-body-small text-muted-foreground">
                                  {video.status === "PROCESSING"
                                      ? "Processando o vídeo. Ele aparece aqui assim que ficar pronto."
                                      : liveWaiting
                                        ? "A transmissão ainda não começou. Esta página atualiza sozinha quando entrar no ar."
                                        : "Não foi possível processar este vídeo. Envie o arquivo novamente."}
                              </p>
                          </div>
                      ) : video.platform === "YOUTUBE" && video.videoUrl ? (
                          <YouTubePlayer embedUrl={video.videoUrl} title={video.title} autoplay={video.isLiveNow} />
                      ) : (
                          <VideoPlayer
                            videoId={video.id}
                            playbackId={playbackIdFrom(video.videoUrl)}
                            title={video.title}
                            poster={video.thumbnailUrl || undefined}
                            live={video.isLiveNow}
                          />
                      )}
                      {video.isLiveNow && (
                        <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded bg-primary px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-widest text-primary-foreground">
                            <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
                            Ao vivo
                        </span>
                      )}
                  </div>

                  <div className="px-4 sm:px-0">
                      {/* Hashtags no alto, em vermelho, e o título */}
                      {(video.hashtags?.length ?? 0) > 0 && (
                        <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                            {video.hashtags!.slice(0, 3).map((tag) => (
                              <Link
                                key={tag}
                                href={`/videos/hashtag/${encodeURIComponent(tag.toLowerCase())}`}
                                className="text-xs font-semibold text-primary hover:underline"
                              >
                                  #{tag}
                              </Link>
                            ))}
                        </p>
                      )}
                      <h1 className={`type-h2 break-words text-foreground ${(video.hashtags?.length ?? 0) > 0 ? "mt-1" : "mt-4"}`}>{video.title}</h1>
                      {video.tournamentId && (
                        <Link
                          href={`/torneios/${video.tournamentId}`}
                          className="type-label mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-border px-3 py-1 text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                        >
                            <Trophy className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
                            <span className="truncate">{video.tournamentName || "Ver o evento"}</span>
                        </Link>
                      )}

                      {/* Canal + ações */}
                      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                              <Link href={video.userId ? `/perfil/${video.userId}` : "#"} className="shrink-0" aria-label={`Canal de ${video.userName}`}>
                                  <VideoAvatar name={video.userName} url={video.userAvatarUrl} className="size-11" />
                              </Link>
                              <div className="min-w-0">
                                  <Link
                                    href={video.userId ? `/perfil/${video.userId}` : "#"}
                                    className="type-label block truncate text-foreground hover:text-primary"
                                  >
                                      {video.userName}
                                  </Link>
                                  <p className="type-caption text-muted-foreground">Criador Imperium</p>
                              </div>
                              <SubscribeButton userId={video.userId} showCount className="ml-auto lg:ml-4" />
                          </div>
                          {actions}
                      </div>
                      <div className="mt-1 flex justify-end">{denunciar}</div>

                      {liveWaiting && (
                        <p className="type-body-small mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-muted-foreground">
                            É sua live? Os dados para o OBS estão em{" "}
                            <Link href={`/videos/live?id=${video.id}`} className="font-medium text-primary hover:underline">
                                Fazer live
                            </Link>
                            .
                        </p>
                      )}

                      {/* Ficha do vídeo: os números em linha, como placar de prova */}
                      <section aria-label="Sobre o vídeo" className="mt-5">
                          <dl className="grid grid-cols-3 divide-x divide-border border-y border-border py-3">
                              <Dado rotulo="Visualizações" valor={formatViews(video.viewCount)} />
                              <Dado
                                rotulo="Publicado"
                                valor={<time dateTime={video.createdAt} title={dataCompleta(video.createdAt)}>{timeAgo(video.createdAt)}</time>}
                              />
                              <Dado rotulo="Duração" valor={video.isLiveNow ? "Ao vivo" : video.formattedDuration || "—"} />
                          </dl>

                          {temDescricao && (
                            <div className="mt-4">
                                <div className={showMore ? "" : "line-clamp-3"}>
                                    <VideoDescription description={video.description || " "} hashtags={video.hashtags} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowMore((v) => !v)}
                                  aria-expanded={showMore}
                                  className="type-caption mt-2 cursor-pointer font-semibold text-primary hover:underline"
                                >
                                    {showMore ? "Mostrar menos" : "Ler mais"}
                                </button>
                            </div>
                          )}
                      </section>

                      {/* Comentários */}
                      <section aria-labelledby="comentarios-title" className="mt-10">
                          <h2 id="comentarios-title" className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-foreground">
                              <span aria-hidden="true" className="h-4 w-1 bg-primary" />
                              Comentários
                              <span className="font-semibold tracking-normal text-muted-foreground tabular-nums">
                                  {totalComentarios ?? video.commentsCount}
                              </span>
                          </h2>
                          <VideoComments
                            videoId={video.id}
                            initialCount={video.commentsCount}
                            creatorId={video.userId}
                            onCountChange={aoContarComentarios}
                          />
                      </section>
                  </div>
              </div>

              <div className="px-4 pb-10 sm:px-0">
                  <VideoSidebar videos={related} />
              </div>
          </div>
      </div>
    );
}
