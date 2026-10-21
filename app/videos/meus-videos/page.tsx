"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  ChevronRight,
  CircleDollarSign,
  Clapperboard,
  Clock,
  Eye,
  Film,
  Heart,
  Loader2,
  MessageSquare,
  Plus,
  Radio,
  Smartphone,
  Trash2,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorState } from "@/components/videos/FeedStates";
import { CopyLinkButton } from "@/components/videos/CopyLinkButton";
import { monetizacaoService, type MonetizacaoStatus } from "@/lib/ads";
import { formatarPreco } from "@/lib/format";
import { deleteVideo, fetchMyVideos } from "@/lib/videos/api";
import { formatViews, timeAgo } from "@/lib/videos/format";
import type { VideoItem } from "@/lib/videos/types";

type Filtro = "todos" | "videos" | "mementos" | "lives";

const FILTROS: { value: Filtro; label: string; aceita: (v: VideoItem) => boolean }[] = [
  { value: "todos", label: "Todos", aceita: () => true },
  { value: "videos", label: "Vídeos", aceita: (v) => !v.isShort && !v.isLive },
  { value: "mementos", label: "Mementos", aceita: (v) => Boolean(v.isShort) },
  { value: "lives", label: "Lives", aceita: (v) => Boolean(v.isLive) },
];

/** Estado do vídeo que o criador precisa enxergar: processando, falhou, live... */
function SeloDoVideo({ video }: { video: VideoItem }) {
  if (video.isLiveNow) return <StatusBadge tone="live">Ao vivo</StatusBadge>;
  if (video.isLive) return <StatusBadge tone="neutral">Live aguardando</StatusBadge>;
  if (video.status === "PROCESSING" || video.status === "UPLOADING") return <StatusBadge tone="info">Processando</StatusBadge>;
  if (video.status === "FAILED") return <StatusBadge tone="destructive">Falhou</StatusBadge>;
  if (video.status === "PUBLISHED") return <StatusBadge tone="success">Publicado</StatusBadge>;
  return null;
}

export default function MeusVideosPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [excluindo, setExcluindo] = useState<VideoItem | null>(null);
  const [apagando, setApagando] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [monetizacao, setMonetizacao] = useState<MonetizacaoStatus | null>(null);

  const load = useCallback(
    async (target: number) => {
      const token = await getToken();
      if (!token) throw new Error("Sessão expirada");
      return fetchMyVideos(token, target);
    },
    [getToken]
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    load(0)
      .then((data) => {
        if (cancelled) return;
        setVideos(data.content);
        setPage(0);
        setHasMore(!data.last);
        setError(false);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, load, attempt]);

  useEffect(() => {
    if (!isSignedIn) return;
    // Opcional: sem a monetização a Central continua funcionando
    monetizacaoService.status().then(setMonetizacao).catch(() => setMonetizacao(null));
  }, [isSignedIn]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const data = await load(page + 1);
      setVideos((prev) => [...(prev ?? []), ...data.content]);
      setPage((p) => p + 1);
      setHasMore(!data.last);
    } catch {
      toast.error("Não foi possível carregar mais vídeos.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    setApagando(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sua sessão expirou.");
      await deleteVideo(token, excluindo.id);
      setVideos((prev) => prev?.filter((v) => v.id !== excluindo.id) ?? prev);
      toast("Vídeo excluído");
      setExcluindo(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao excluir vídeo");
    } finally {
      setApagando(false);
    }
  }

  const list = useMemo(() => videos ?? [], [videos]);
  const published = list.filter((v) => v.status === "PUBLISHED");
  const totalViews = published.reduce((sum, v) => sum + (v.viewCount ?? 0), 0);
  const totalLikes = published.reduce((sum, v) => sum + (v.likesCount ?? 0), 0);
  const totalComments = published.reduce((sum, v) => sum + (v.commentsCount ?? 0), 0);
  const visiveis = list.filter(FILTROS.find((f) => f.value === filtro)!.aceita);

  if (isLoaded && !isSignedIn) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Clapperboard className="mx-auto size-12 text-muted-foreground/40" aria-hidden="true" />
        <h1 className="type-h2 mt-4 text-foreground">Central de Vídeos</h1>
        <p className="type-body-small mt-2 text-muted-foreground">Entre para publicar e gerenciar seus vídeos.</p>
        <Button asChild className="mt-6">
          <Link href="/sign-in?redirect_url=%2Fvideos%2Fmeus-videos">Entrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6 lg:pt-10">
        {/* ===== Cabeçalho do canal ===== */}
        <section aria-labelledby="central-title" className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div
            aria-hidden="true"
            className="h-24 bg-[radial-gradient(120%_140%_at_0%_0%,var(--primary)_0%,transparent_55%),linear-gradient(135deg,var(--surface-muted),var(--surface-secondary))] opacity-90 sm:h-28"
          />
          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                {user?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar do Clerk
                  <img src={user.imageUrl} alt="" className="relative size-20 shrink-0 rounded-full bg-surface-muted object-cover ring-4 ring-surface" />
                ) : (
                  <Skeleton className="relative size-20 shrink-0 rounded-full ring-4 ring-surface" />
                )}
                <div className="relative min-w-0 pb-1">
                  <p className="type-caption font-semibold uppercase tracking-[0.16em] text-primary">Central de Vídeos</p>
                  <h1 id="central-title" className="type-h2 truncate text-foreground">
                    {user?.fullName || user?.username || "Seu canal"}
                  </h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:pb-1">
                <Button asChild>
                  <Link href="/videos/upload">
                    <Plus aria-hidden="true" />
                    Novo vídeo
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/videos/memento/upload">
                    <Smartphone aria-hidden="true" />
                    Memento
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/videos/live">
                    <Radio aria-hidden="true" />
                    Live
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* gap-px sobre fundo de borda desenha as divisórias */}
          <dl className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
            <Numero rotulo="Publicados" valor={videos ? String(published.length) : null} />
            <Numero rotulo="Visualizações" valor={videos ? formatViews(totalViews) : null} />
            <Numero rotulo="Curtidas" valor={videos ? formatViews(totalLikes) : null} />
            <Numero rotulo="Comentários" valor={videos ? formatViews(totalComments) : null} />
          </dl>
        </section>

        {monetizacao && <CartaoMonetizacao dados={monetizacao} />}

        {/* ===== Conteúdo ===== */}
        <section aria-labelledby="conteudo-title" className="mt-10">
          <h2 id="conteudo-title" className="sr-only">
            Seus vídeos
          </h2>
          <Tabs value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
            <TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
              {FILTROS.map((f) => (
                <TabsTrigger
                  key={f.value}
                  value={f.value}
                  className="type-label -mb-px gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 pt-1 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {f.label}
                  {videos && (
                    <span className="type-caption rounded-full bg-surface-muted px-2 py-0.5 tabular-nums text-muted-foreground">
                      {list.filter(f.aceita).length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="mt-6">
            {error ? (
              <ErrorState onRetry={() => { setError(false); setVideos(null); setAttempt((n) => n + 1); }} />
            ) : videos === null ? (
              <div className="flex flex-col gap-3" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            ) : visiveis.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                <Film className="size-12 text-muted-foreground/40" aria-hidden="true" />
                <p className="type-label mt-4 text-foreground">
                  {filtro === "todos" ? "Nenhum vídeo ainda" : `Nenhum item em ${FILTROS.find((f) => f.value === filtro)!.label}`}
                </p>
                <p className="type-body-small mt-1 text-muted-foreground">Publique seu primeiro conteúdo e comece a crescer o canal.</p>
                <Button asChild className="mt-6">
                  <Link href={filtro === "mementos" ? "/videos/memento/upload" : filtro === "lives" ? "/videos/live" : "/videos/upload"}>
                    <Plus aria-hidden="true" />
                    {filtro === "mementos" ? "Publicar Memento" : filtro === "lives" ? "Fazer live" : "Publicar vídeo"}
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
                  {visiveis.map((video) => {
                    const href = video.isLive ? `/videos/live?id=${video.id}` : `/videos/watch/${video.id}`;
                    return (
                      <li key={video.id} className="group flex flex-col gap-4 p-4 transition-colors hover:bg-surface-muted/50 sm:flex-row sm:items-center">
                        <Link
                          href={href}
                          className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-secondary sm:w-44"
                        >
                          {video.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- miniatura do Mux
                            <img src={video.thumbnailUrl} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                              <Film className="size-6" aria-hidden="true" />
                            </div>
                          )}
                          {video.formattedDuration && (
                            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums text-white">
                              {video.formattedDuration}
                            </span>
                          )}
                          {video.isShort && (
                            <span className="absolute left-1.5 top-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.2em] text-white">
                              Memento
                            </span>
                          )}
                        </Link>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={href} className="type-label line-clamp-1 text-foreground transition-colors hover:text-primary">
                              {video.title || "Sem título"}
                            </Link>
                            <SeloDoVideo video={video} />
                          </div>
                          {video.description && (
                            <p className="type-body-small mt-1 line-clamp-1 text-muted-foreground">{video.description}</p>
                          )}
                          <ul className="type-caption mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                            <li className="inline-flex items-center gap-1.5"><Eye className="size-3.5" aria-hidden="true" />{formatViews(video.viewCount)} views</li>
                            <li className="inline-flex items-center gap-1.5"><Heart className="size-3.5" aria-hidden="true" />{video.likesCount ?? 0}</li>
                            <li className="inline-flex items-center gap-1.5"><MessageSquare className="size-3.5" aria-hidden="true" />{video.commentsCount}</li>
                            <li className="inline-flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden="true" />{timeAgo(video.createdAt)}</li>
                          </ul>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          {video.status === "PUBLISHED" && <CopyLinkButton path={`/videos/watch/${video.id}`} />}
                          <button
                            type="button"
                            onClick={() => setExcluindo(video)}
                            className="grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label={`Excluir ${video.title || "vídeo"}`}
                            title="Excluir"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button onClick={loadMore} disabled={loadingMore} variant="outline">
                      {loadingMore ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                      {loadingMore ? "Carregando..." : "Ver mais"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <AlertDialog open={excluindo !== null} onOpenChange={(aberto) => !aberto && !apagando && setExcluindo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este vídeo?</AlertDialogTitle>
            <AlertDialogDescription>
              “{excluindo?.title || "Sem título"}” sai do seu canal com as views, curtidas e comentários. Não dá para desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={apagando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmarExclusao();
              }}
              disabled={apagando}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {apagando ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Numero({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-surface px-3 py-4 text-center">
      <dt className="type-caption order-2 uppercase tracking-wider text-muted-foreground">{rotulo}</dt>
      <dd className="type-h2 order-1 tabular-nums text-foreground">{valor ?? <Skeleton className="h-7 w-10" />}</dd>
    </div>
  );
}

/** Atalho para a monetização: progresso até os requisitos ou o saldo para sacar. */
function CartaoMonetizacao({ dados }: { dados: MonetizacaoStatus }) {
  const req = dados.nextTierRequirements;
  let titulo: string;
  let detalhe: string;
  if (dados.isEnabled) {
    titulo = `${formatarPreco(Number(dados.earnings.available ?? 0))} disponíveis`;
    detalhe = `Este mês: ${formatarPreco(Number(dados.earnings.thisMonth ?? 0))} · 55% dos anúncios nos seus vídeos`;
  } else if (dados.isEligible) {
    titulo = "Você já pode monetizar";
    detalhe = "Conecte sua conta de recebimentos e comece a ganhar com os anúncios.";
  } else {
    titulo = "Monetização";
    detalhe = req
      ? `${dados.stats.followers.toLocaleString("pt-BR")} de ${req.followers.toLocaleString("pt-BR")} inscritos · ${formatViews(dados.stats.totalViews)} de ${formatViews(req.totalViews)} views`
      : "Ganhe 55% dos anúncios exibidos nos seus vídeos.";
  }
  const progresso = !dados.isEligible ? Math.min(100, Math.round(dados.nextTierProgress)) : null;

  return (
    <Link
      href="/videos/monetizacao"
      className="group mt-4 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 sm:p-5"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-success/12 text-success">
        <CircleDollarSign className="size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="type-label block text-foreground">{titulo}</span>
        <span className="type-caption block truncate text-muted-foreground">{detalhe}</span>
        {progresso !== null && (
          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${progresso}%` }} />
          </span>
        )}
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
