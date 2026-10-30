"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  Bookmark,
  ChevronRight,
  CircleDollarSign,
  Clapperboard,
  Clock,
  Compass,
  Eye,
  Film,
  Heart,
  ImageOff,
  ImagePlus,
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
import { ErrorState } from "@/components/videos/FeedStates";
import { CopyLinkButton } from "@/components/videos/CopyLinkButton";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoGridSkeleton } from "@/components/videos/VideoGridSkeleton";
import { sponsorImageUrl } from "@/components/perfil/SponsorBanners";
import { monetizacaoService, type MonetizacaoStatus } from "@/lib/ads";
import { ANUNCIOS_ABERTOS } from "@/lib/anuncios";
import api from "@/lib/api";
import { formatarPreco } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteVideo, fetchLikedVideos, fetchMyVideos, fetchSavedVideos, setVideoCapa } from "@/lib/videos/api";
import { formatViews, timeAgo } from "@/lib/videos/format";
import type { VideoItem, VideoPage } from "@/lib/videos/types";

type Aba = "canal" | "salvos" | "curtidos";
type Filtro = "todos" | "videos" | "mementos" | "lives";

const ABAS: { value: Aba; label: string; icon: typeof Film }[] = [
  { value: "canal", label: "Meu canal", icon: Clapperboard },
  { value: "salvos", label: "Salvos", icon: Bookmark },
  { value: "curtidos", label: "Curtidos", icon: Heart },
];

const FILTROS: { value: Filtro; label: string; aceita: (v: VideoItem) => boolean }[] = [
  { value: "todos", label: "Todos", aceita: () => true },
  { value: "videos", label: "Vídeos", aceita: (v) => !v.isShort && !v.isLive },
  { value: "mementos", label: "Mementos", aceita: (v) => Boolean(v.isShort) },
  { value: "lives", label: "Lives", aceita: (v) => Boolean(v.isLive) },
];

const MAX_IMAGEM = 5 * 1024 * 1024;

/** Sobe a imagem pelo nosso upload (R2) e devolve o caminho /api/files/... */
async function enviarImagem(file: File): Promise<string> {
  if (file.size > MAX_IMAGEM) throw new Error("A imagem deve ter no máximo 5 MB.");
  const form = new FormData();
  form.append("file", file);
  // Content-Type indefinido: o navegador define o multipart com o boundary correto
  const { data } = await api.post("/api/files/upload/image", form, { headers: { "Content-Type": undefined } });
  const url = data?.data?.publicUrl;
  if (typeof url !== "string") throw new Error("Falha no envio da imagem.");
  return url;
}

function mensagem(cause: unknown, padrao: string): string {
  const data = (cause as { response?: { data?: { message?: unknown } } })?.response?.data;
  if (typeof data?.message === "string") return data.message;
  return cause instanceof Error && cause.message ? cause.message : padrao;
}

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
  return (
    <Suspense fallback={null}>
      <Central />
    </Suspense>
  );
}

function abaDaUrl(valor: string | null): Aba {
  return valor === "salvos" || valor === "curtidos" ? valor : "canal";
}

function Central() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  // ?aba=salvos / ?aba=curtidos abre direto na aba (links de outras telas)
  const params = useSearchParams();
  const [aba, setAba] = useState<Aba>(() => abaDaUrl(params.get("aba")));
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
  const [banner, setBanner] = useState<string | null | undefined>(undefined);
  const [enviandoBanner, setEnviandoBanner] = useState(false);
  const [capaDe, setCapaDe] = useState<string | null>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const capaInput = useRef<HTMLInputElement>(null);
  const capaAlvo = useRef<string | null>(null);

  function trocarAba(nova: Aba) {
    setAba(nova);
    const url = new URL(window.location.href);
    if (nova === "canal") url.searchParams.delete("aba");
    else url.searchParams.set("aba", nova);
    window.history.replaceState(null, "", url);
  }

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
    // Opcionais: sem eles a Central continua funcionando
    if (ANUNCIOS_ABERTOS) monetizacaoService.status().then(setMonetizacao).catch(() => setMonetizacao(null));
    api
      .get("/api/users/me")
      .then(({ data }) => setBanner(data?.bannerCanalUrl ?? null))
      .catch(() => setBanner(null));
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

  async function salvarBanner(url: string | null) {
    await api.put("/api/users/me/banner-canal", { bannerCanalUrl: url ?? "" });
    setBanner(url);
  }

  async function trocarBanner(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setEnviandoBanner(true);
    try {
      await salvarBanner(await enviarImagem(file));
      toast.success("Banner atualizado");
    } catch (cause) {
      toast.error(mensagem(cause, "Não foi possível trocar o banner."));
    } finally {
      setEnviandoBanner(false);
    }
  }

  async function removerBanner() {
    setEnviandoBanner(true);
    try {
      await salvarBanner(null);
    } catch (cause) {
      toast.error(mensagem(cause, "Não foi possível remover o banner."));
    } finally {
      setEnviandoBanner(false);
    }
  }

  function escolherCapa(videoId: string) {
    capaAlvo.current = videoId;
    capaInput.current?.click();
  }

  async function aplicarCapa(videoId: string, file: File | null) {
    setCapaDe(videoId);
    try {
      const token = await getToken();
      if (!token) throw new Error("Sua sessão expirou.");
      const url = file ? await enviarImagem(file) : null;
      const atualizado = await setVideoCapa(token, videoId, url);
      setVideos((prev) => prev?.map((v) => (v.id === videoId ? { ...v, thumbnailUrl: atualizado.thumbnailUrl, hasCapa: atualizado.hasCapa } : v)) ?? prev);
      toast.success(file ? "Capa atualizada" : "Capa removida");
    } catch (cause) {
      toast.error(mensagem(cause, "Não foi possível trocar a capa."));
    } finally {
      setCapaDe(null);
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
        <p className="type-body-small mt-2 text-muted-foreground">Entre para publicar, ver seus salvos e curtidos.</p>
        <Button asChild className="mt-6">
          <Link href="/sign-in?redirect_url=%2Fvideos%2Fmeus-videos">Entrar</Link>
        </Button>
      </div>
    );
  }

  const nome = user?.fullName || user?.username || "Seu canal";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-6 lg:pt-8">
        {/* ===== Banner do canal ===== */}
        <section aria-labelledby="central-title">
          <div className="relative h-40 overflow-hidden rounded-3xl bg-black sm:h-56 lg:h-64">
            {banner === undefined ? (
              <Skeleton className="size-full rounded-none" />
            ) : banner ? (
              // eslint-disable-next-line @next/next/no-img-element -- banner enviado pelo criador
              <img src={sponsorImageUrl(banner)} alt="" className="size-full object-cover" />
            ) : (
              <BannerPadrao />
            )}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute right-3 top-3 flex gap-2">
              {banner && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={enviandoBanner}
                  onClick={removerBanner}
                  aria-label="Remover banner"
                  className="border-white/30 bg-black/40 text-white backdrop-blur hover:bg-black/60 hover:text-white"
                >
                  <ImageOff aria-hidden="true" />
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                loading={enviandoBanner}
                onClick={() => bannerInput.current?.click()}
                className="border-white/30 bg-black/40 text-white backdrop-blur hover:bg-black/60 hover:text-white"
              >
                {!enviandoBanner && <ImagePlus aria-hidden="true" />}
                {banner ? "Trocar banner" : "Colocar banner"}
              </Button>
            </div>
            <input ref={bannerInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={trocarBanner} className="sr-only" tabIndex={-1} aria-hidden="true" />
          </div>

          <div className="relative -mt-12 flex flex-col gap-5 px-2 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div className="flex items-end gap-4">
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- avatar do Clerk
                <img src={user.imageUrl} alt="" className="size-24 shrink-0 rounded-full bg-surface-muted object-cover ring-4 ring-background sm:size-28" />
              ) : (
                <Skeleton className="size-24 shrink-0 rounded-full ring-4 ring-background sm:size-28" />
              )}
              <div className="min-w-0 pb-1">
                <p className="type-caption font-semibold uppercase tracking-[0.2em] text-primary">Central de Vídeos</p>
                <h1 id="central-title" className="type-h2 truncate text-foreground">{nome}</h1>
                <p className="type-caption text-muted-foreground">
                  {videos ? `${published.length} publicados · ${formatViews(totalViews)} views` : "Carregando canal..."}
                </p>
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
        </section>

        {/* ===== Abas principais ===== */}
        <div role="tablist" aria-label="Seções da Central" className="mt-8 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-surface-muted/60 p-1">
          {ABAS.map(({ value, label, icon: Icon }) => {
            const ativa = aba === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => trocarAba(value)}
                className={cn(
                  "type-label flex cursor-pointer items-center justify-center gap-2 rounded-xl px-2 py-2.5 transition-all",
                  ativa ? "bg-surface text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-4", ativa && "text-primary", ativa && value === "curtidos" && "fill-primary")} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        {aba === "canal" && (
          <>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Numero icone={Film} rotulo="Publicados" valor={videos ? String(published.length) : null} />
              <Numero icone={Eye} rotulo="Visualizações" valor={videos ? formatViews(totalViews) : null} />
              <Numero icone={Heart} rotulo="Curtidas" valor={videos ? formatViews(totalLikes) : null} />
              <Numero icone={MessageSquare} rotulo="Comentários" valor={videos ? formatViews(totalComments) : null} />
            </dl>

            {monetizacao && <CartaoMonetizacao dados={monetizacao} />}

            <section aria-label="Seus vídeos" className="mt-8">
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0">
                {FILTROS.map((f) => {
                  const ativo = filtro === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFiltro(f.value)}
                      aria-pressed={ativo}
                      className={cn(
                        "type-caption inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 font-semibold transition-colors",
                        ativo ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                      )}
                    >
                      {f.label}
                      {videos && <span className="tabular-nums opacity-70">{list.filter(f.aceita).length}</span>}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                {error ? (
                  <ErrorState onRetry={() => { setError(false); setVideos(null); setAttempt((n) => n + 1); }} />
                ) : videos === null ? (
                  <div className="flex flex-col gap-3" aria-busy="true">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))}
                  </div>
                ) : visiveis.length === 0 ? (
                  <Vazio
                    icone={Film}
                    titulo={filtro === "todos" ? "Nenhum vídeo ainda" : `Nenhum item em ${FILTROS.find((f) => f.value === filtro)!.label}`}
                    texto="Publique seu primeiro conteúdo e comece a crescer o canal."
                    href={filtro === "mementos" ? "/videos/memento/upload" : filtro === "lives" ? "/videos/live" : "/videos/upload"}
                    acao={filtro === "mementos" ? "Publicar Memento" : filtro === "lives" ? "Fazer live" : "Publicar vídeo"}
                  />
                ) : (
                  <>
                    <ul className="flex flex-col gap-3">
                      {visiveis.map((video) => (
                        <ItemDoCanal
                          key={video.id}
                          video={video}
                          trocandoCapa={capaDe === video.id}
                          onCapa={() => escolherCapa(video.id)}
                          onRemoverCapa={() => aplicarCapa(video.id, null)}
                          onExcluir={() => setExcluindo(video)}
                        />
                      ))}
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
              <input
                ref={capaInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file && capaAlvo.current) void aplicarCapa(capaAlvo.current, file);
                }}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />
            </section>
          </>
        )}

        {aba === "salvos" && (
          <Colecao
            key="salvos"
            buscar={fetchSavedVideos}
            vazio={{ icone: Bookmark, titulo: "Nada salvo ainda", texto: "Toque no marcador de um vídeo para guardar e assistir depois." }}
          />
        )}
        {aba === "curtidos" && (
          <Colecao
            key="curtidos"
            buscar={fetchLikedVideos}
            vazio={{ icone: Heart, titulo: "Nenhum vídeo curtido", texto: "Os vídeos em que você deu gostei aparecem aqui." }}
          />
        )}
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

/** Sem banner enviado: arte própria da Central (diferente da capa do perfil). */
function BannerPadrao() {
  return (
    <div aria-hidden="true" className="relative size-full overflow-hidden bg-[#0b0b0d]">
      <div className="absolute inset-0 bg-[radial-gradient(90%_120%_at_0%_100%,var(--primary)_0%,transparent_55%),radial-gradient(60%_90%_at_100%_0%,color-mix(in_oklch,var(--primary)_45%,transparent)_0%,transparent_60%)] opacity-80" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(115deg,transparent_0_22px,rgb(255_255_255/0.05)_22px_23px)]" />
      <Clapperboard className="absolute -right-6 -top-6 size-48 rotate-12 text-white/[0.06] sm:size-64" />
    </div>
  );
}

function ItemDoCanal({
  video,
  trocandoCapa,
  onCapa,
  onRemoverCapa,
  onExcluir,
}: {
  video: VideoItem;
  trocandoCapa: boolean;
  onCapa: () => void;
  onRemoverCapa: () => void;
  onExcluir: () => void;
}) {
  const href = video.isLive ? `/videos/live?id=${video.id}` : `/videos/watch/${video.id}`;
  const acao = "grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-50";
  return (
    <li className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:p-4">
      <Link href={href} className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-secondary sm:w-48">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- capa do criador ou miniatura do Mux
          <img src={video.thumbnailUrl} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Film className="size-6" aria-hidden="true" />
          </div>
        )}
        {trocandoCapa && (
          <div className="absolute inset-0 grid place-items-center bg-black/60">
            <Loader2 className="size-6 animate-spin text-white" aria-label="Enviando capa" />
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
        {video.description && <p className="type-body-small mt-1 line-clamp-1 text-muted-foreground">{video.description}</p>}
        <ul className="type-caption mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          <li className="inline-flex items-center gap-1.5"><Eye className="size-3.5" aria-hidden="true" />{formatViews(video.viewCount)} views</li>
          <li className="inline-flex items-center gap-1.5"><Heart className="size-3.5" aria-hidden="true" />{video.likesCount ?? 0}</li>
          <li className="inline-flex items-center gap-1.5"><MessageSquare className="size-3.5" aria-hidden="true" />{video.commentsCount}</li>
          <li className="inline-flex items-center gap-1.5"><Clock className="size-3.5" aria-hidden="true" />{timeAgo(video.createdAt)}</li>
        </ul>
      </div>

      <div className="flex shrink-0 items-center gap-1 border-t border-border pt-2 sm:border-0 sm:pt-0">
        <button type="button" onClick={onCapa} disabled={trocandoCapa} className={acao} aria-label={`${video.hasCapa ? "Trocar" : "Colocar"} capa de ${video.title || "vídeo"}`} title={video.hasCapa ? "Trocar capa" : "Colocar capa"}>
          <ImagePlus className="size-4" aria-hidden="true" />
        </button>
        {video.hasCapa && (
          <button type="button" onClick={onRemoverCapa} disabled={trocandoCapa} className={acao} aria-label="Voltar à miniatura automática" title="Remover capa">
            <ImageOff className="size-4" aria-hidden="true" />
          </button>
        )}
        {video.status === "PUBLISHED" && <CopyLinkButton path={`/videos/watch/${video.id}`} />}
        <button
          type="button"
          onClick={onExcluir}
          className="ml-auto grid size-9 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:ml-0"
          aria-label={`Excluir ${video.title || "vídeo"}`}
          title="Excluir"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

/** Salvos ou curtidos: grade paginada de vídeos de qualquer criador. */
function Colecao({
  buscar,
  vazio,
}: {
  buscar: (token: string, page: number) => Promise<VideoPage>;
  vazio: { icone: typeof Film; titulo: string; texto: string };
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [itens, setItens] = useState<VideoItem[] | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(
    async (target: number) => {
      const token = await getToken();
      if (!token) throw new Error("Sessão expirada");
      return buscar(token, target);
    },
    [getToken, buscar]
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let cancelled = false;
    load(0)
      .then((data) => {
        if (cancelled) return;
        setItens(data.content);
        setPage(0);
        setHasMore(!data.last);
        setError(false);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, load, attempt]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const data = await load(page + 1);
      setItens((prev) => [...(prev ?? []), ...data.content]);
      setPage((p) => p + 1);
      setHasMore(!data.last);
    } catch {
      toast.error("Não foi possível carregar mais vídeos.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className="mt-8" aria-live="polite">
      {error ? (
        <ErrorState onRetry={() => { setError(false); setItens(null); setAttempt((n) => n + 1); }} />
      ) : itens === null ? (
        <VideoGridSkeleton />
      ) : itens.length === 0 ? (
        <Vazio icone={vazio.icone} titulo={vazio.titulo} texto={vazio.texto} href="/videos" acao="Explorar vídeos" acaoIcone={Compass} />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {itens.map((video, i) => (
              <li key={video.id}>
                <VideoCard video={video} priority={i < 3} />
              </li>
            ))}
          </ul>
          {hasMore && (
            <div className="mt-10 flex justify-center">
              <Button onClick={loadMore} disabled={loadingMore} variant="outline">
                {loadingMore ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                {loadingMore ? "Carregando..." : "Ver mais"}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Vazio({
  icone: Icone,
  titulo,
  texto,
  href,
  acao,
  acaoIcone: AcaoIcone = Plus,
}: {
  icone: typeof Film;
  titulo: string;
  texto: string;
  href: string;
  acao: string;
  acaoIcone?: typeof Film;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border px-6 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
        <Icone className="size-7" aria-hidden="true" />
      </span>
      <p className="type-label mt-4 text-foreground">{titulo}</p>
      <p className="type-body-small mt-1 max-w-sm text-muted-foreground">{texto}</p>
      <Button asChild className="mt-6">
        <Link href={href}>
          <AcaoIcone aria-hidden="true" />
          {acao}
        </Link>
      </Button>
    </div>
  );
}

function Numero({ icone: Icone, rotulo, valor }: { icone: typeof Film; rotulo: string; valor: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icone className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dd className="type-h3 tabular-nums text-foreground">{valor ?? <Skeleton className="h-6 w-10" />}</dd>
        <dt className="type-caption truncate text-muted-foreground">{rotulo}</dt>
      </div>
    </div>
  );
}

/** Atalho para a monetização: situação do canal ou o saldo para sacar. */
function CartaoMonetizacao({ dados }: { dados: MonetizacaoStatus }) {
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
    detalhe = "Ganhe 55% dos anúncios exibidos nos seus vídeos quando o canal for liberado.";
  }

  return (
    <Link
      href="/videos/monetizacao"
      className="group mt-3 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/40 sm:p-5"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-success/12 text-success">
        <CircleDollarSign className="size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="type-label block text-foreground">{titulo}</span>
        <span className="type-caption block truncate text-muted-foreground">{detalhe}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}
