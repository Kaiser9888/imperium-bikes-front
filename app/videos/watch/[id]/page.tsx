// app/videos/watch/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ChevronDown, Radio } from "lucide-react";
import { toast } from "sonner";
import { fetchRelated, fetchVideo, playbackIdFrom, likeVideo, dislikeVideo } from "@/lib/videos/api";
import type { VideoItem } from "@/lib/videos/types";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { VideoActions } from "@/components/videos/VideoActions";
import { VideoStats } from "@/components/videos/VideoStats";
import { VideoComments } from "@/components/videos/VideoComments";
import { VideoSidebar } from "@/components/videos/VideoSidebar";
import { VideoAvatar } from "@/components/videos/VideoAvatar";
import { VideoDescription } from "@/components/videos/VideoDescription";
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

export default function WatchPage() {
    const { id } = useParams<{ id: string }>();
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [loaded, setLoaded] = useState<Loaded | null>(null);
    const [related, setRelated] = useState<VideoItem[]>([]);
    const [reaction, setReaction] = useState<Reaction>(reactionOf(null));
    const [showMore, setShowMore] = useState(false);
    const [showComments, setShowComments] = useState(false);

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
              <div className="aspect-video w-full rounded-lg bg-card" />
              <div className="mt-4 h-6 w-2/3 rounded bg-card" />
          </div>
        );
    }

    if (!video) {
        return <p className="px-6 py-20 text-center text-muted-foreground">Vídeo não encontrado</p>;
    }

    const liveWaiting = video.isLive && !video.isLiveNow;

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

    return (
      <div className="mx-auto max-w-7xl px-0 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4 lg:space-y-5">
                  <div className="relative lg:rounded-lg overflow-hidden">
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
                      <h1 className="text-lg font-semibold leading-snug text-foreground lg:text-xl">
                          {video.title}
                      </h1>
                      <div className="mt-2">
                          <VideoStats viewCount={video.viewCount} createdAt={video.createdAt} />
                      </div>
                  </div>

                  {/* Ações mobile */}
                  <div className="px-4 sm:px-0 lg:hidden">{actions}</div>

                  {/* Canal + Ações desktop */}
                  <div className="flex items-center justify-between gap-4 border-y border-border py-3 px-4 sm:px-0">
                      <div className="flex items-center gap-3">
                          <VideoAvatar name={video.userName} url={video.userAvatarUrl} className="size-10" />
                          <div>
                              <p className="text-sm font-medium text-foreground">{video.userName}</p>
                              <p className="text-xs text-muted-foreground">Criador Imperium</p>
                          </div>
                      </div>
                      <div className="hidden lg:block">{actions}</div>
                  </div>

                  {liveWaiting && (
                    <p className="mx-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground sm:mx-0">
                        É sua live? Os dados para o OBS estão em{" "}
                        <Link href={`/videos/live?id=${video.id}`} className="font-medium text-primary hover:underline">
                            Fazer live
                        </Link>
                        .
                    </p>
                  )}

                  {/* Descrição */}
                  {video.description && (
                    <div className="mx-4 sm:mx-0 rounded-lg border border-border bg-card">
                        <button
                          type="button"
                          onClick={() => setShowMore((v) => !v)}
                          aria-expanded={showMore}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <span>Descrição</span>
                            <ChevronDown
                              className={`size-4 transition-transform ${showMore ? "rotate-180" : ""}`}
                            />
                        </button>
                        {showMore && (
                          <div className="border-t border-border px-4 py-3">
                              <VideoDescription description={video.description} hashtags={video.hashtags} />
                          </div>
                        )}
                    </div>
                  )}

                  {/* ===== COMENTÁRIOS ===== */}
                  <div className="px-4 sm:px-0">
                      <button
                        type="button"
                        onClick={() => setShowComments((v) => !v)}
                        aria-expanded={showComments}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
                          showComments
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                          <span>Comentários</span>
                          <span className="ml-auto text-sm text-muted-foreground">{video.commentsCount}</span>
                          <ChevronDown
                            className={`size-4 text-muted-foreground transition-transform ${showComments ? "rotate-180" : ""}`}
                          />
                      </button>
                  </div>

                  {showComments && (
                    <div className="mx-4 sm:mx-0 rounded-lg border border-border bg-card p-3">
                        <VideoComments videoId={video.id} />
                    </div>
                  )}
              </div>

              <div className="hidden lg:block">
                  <VideoSidebar videos={related} />
              </div>
          </div>

          <div className="mt-8 lg:hidden px-4 sm:px-0">
              <h2 className="text-lg font-semibold mb-4">Vídeos relacionados</h2>
              <VideoSidebar videos={related} />
          </div>
      </div>
    );
}
