"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { ArrowRight, CheckCircle, ClipboardList, Loader2, MapPin, Radio, Upload } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { BackButton } from "@/components/ui/back-button"
import { DenunciarButton } from "@/components/ui/denunciar-button"
import { ErrorState } from "@/components/ui/error-state"
import { Loader } from "@/components/ui/loader"
import { ShareButton } from "@/components/ui/share-button"
import { Avatar, Classificacao, Podio } from "@/components/torneios/Placar"
import { VideoCard } from "@/components/videos/VideoCard"
import { VideoPlayer } from "@/components/videos/VideoPlayer"
import { YouTubePlayer } from "@/components/videos/YouTubePlayer"
import api from "@/lib/api"
import { formatarPreco, partesDaData } from "@/lib/format"
import { fetchTournamentLive, fetchTournamentVideos, playbackIdFrom } from "@/lib/videos/api"
import type { VideoItem } from "@/lib/videos/types"
import { mensagemDaApi, tournamentService, type InscritoPublico, type MinhaInscricao, type Tournament } from "@/services/tournamentService"

/** De quanto em quanto tempo a página pergunta se o organizador entrou ou saiu do ar. */
const CHECAR_LIVE_MS = 30_000
/** Placar ao vivo: com o evento acontecendo, a classificação se atualiza sozinha. */
const ATUALIZAR_PLACAR_MS = 15_000

/** Transmissão do organizador, no topo da página enquanto estiver no ar. */
function AoVivo({ live }: { live: VideoItem }) {
    return (
        <section aria-label="Transmissão ao vivo" className="mt-4 overflow-hidden rounded-lg border border-foreground bg-black shadow-[4px_4px_0_var(--foreground)]">
            <div className="relative">
                {live.platform === "YOUTUBE" && live.videoUrl ? (
                    <YouTubePlayer embedUrl={live.videoUrl} title={live.title} autoplay />
                ) : (
                    <VideoPlayer
                        videoId={live.id}
                        playbackId={playbackIdFrom(live.videoUrl)}
                        title={live.title}
                        poster={live.thumbnailUrl || undefined}
                        live
                    />
                )}
                <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded bg-primary px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-widest text-primary-foreground">
                    <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
                    Ao vivo
                </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-foreground bg-surface px-4 py-3">
                <p className="type-label min-w-0 truncate text-foreground">{live.title}</p>
                <Link href={`/videos/watch/${live.id}`} className="type-caption shrink-0 font-semibold text-primary underline-offset-2 hover:underline">
                    Comentar na live
                </Link>
            </div>
        </section>
    )
}

/** Vídeos que a galera marcou com o evento. Sem vídeos, só aparece o convite para quem está logado. */
function VideosDoEvento({ torneioId, logado }: { torneioId: string; logado: boolean }) {
    const [videos, setVideos] = useState<VideoItem[]>([])

    useEffect(() => {
        let ativo = true
        fetchTournamentVideos(torneioId)
            .then((pagina) => ativo && setVideos(pagina.content))
            .catch(() => {})
        return () => {
            ativo = false
        }
    }, [torneioId])

    if (videos.length === 0 && !logado) return null

    return (
        <section aria-labelledby="videos-evento" className="mt-10 border-t border-border pt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="videos-evento" className="type-h2">Vídeos do evento</h2>
                {logado && (
                    <Link href={`/videos/upload?torneio=${torneioId}`} className="line-btn line-btn--sm">
                        <Upload aria-hidden="true" />
                        Enviar vídeo
                    </Link>
                )}
            </div>
            {videos.length === 0 ? (
                <p className="type-body-small mt-3 text-muted-foreground">
                    Ninguém marcou um vídeo com este evento ainda. Gravou alguma coisa? Mande o primeiro.
                </p>
            ) : (
                <div className="mt-5 grid gap-x-4 gap-y-6 sm:grid-cols-2">
                    {videos.map((v) => (
                        <VideoCard key={v.id} video={v} />
                    ))}
                </div>
            )}
        </section>
    )
}

const STATUS_LABEL ={ aberto: "Inscrições abertas", andamento: "Acontecendo agora", encerrado: "Encerrado" }

function dataPorExtenso(iso: string) {
    // Meio-dia evita o dia anterior por causa do fuso
    const d = new Date(`${iso}T12:00:00`)
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "long" })
}

export default function TorneioDetalhesPage() {
    const { isSignedIn, isLoaded } = useUser()
    const { id } = useParams<{ id: string }>()

    const [torneio, setTorneio] = useState<Tournament | null>(null)
    const [falhou, setFalhou] = useState(false)
    const [inscricao, setInscricao] = useState<MinhaInscricao | null>(null)
    const [inscritos, setInscritos] = useState<InscritoPublico[]>([])
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [live, setLive] = useState<VideoItem | null>(null)
    const [meuId, setMeuId] = useState<string | null>(null)

    // A live entra e sai do ar sozinha: confere de tempos em tempos
    useEffect(() => {
        let ativo = true
        const checar = () => fetchTournamentLive(id).then((atual) => ativo && setLive((antes) => (antes?.id === atual?.id ? antes : atual)))
        void checar()
        const timer = setInterval(checar, CHECAR_LIVE_MS)
        return () => {
            ativo = false
            clearInterval(timer)
        }
    }, [id])

    useEffect(() => {
        if (!isSignedIn) return
        api.get("/api/users/me").then(({ data }) => setMeuId(String(data.userId ?? data.id))).catch(() => {})
    }, [isSignedIn])

    const carregar = useCallback(async () => {
        setFalhou(false)
        try {
            setTorneio(await tournamentService.buscarPorId(id))
        } catch {
            setFalhou(true)
        }
        // Lista é complemento: se falhar, a página continua
        tournamentService.inscritos(id).then(setInscritos).catch(() => setInscritos([]))
    }, [id])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial da página
        void carregar()
    }, [carregar])

    useEffect(() => {
        if (!isSignedIn) return
        tournamentService.minhaInscricao(id).then(setInscricao).catch(() => {})
    }, [id, isSignedIn])

    // Durante a prova o organizador lança as marcas: a classificação acompanha (só com a aba à vista)
    const andamento = torneio?.status === "andamento" && !torneio.cancelado
    useEffect(() => {
        if (!andamento) return
        const timer = setInterval(() => {
            if (document.visibilityState !== "visible") return
            tournamentService.inscritos(id).then(setInscritos).catch(() => {})
        }, ATUALIZAR_PLACAR_MS)
        return () => clearInterval(timer)
    }, [id, andamento])

    async function sair() {
        if (!torneio) return
        const pago = inscricao?.situacao === "PAGA" && torneio.valorInscricao > 0
        const aviso = pago
            ? `Cancelar sua inscrição? O valor de ${formatarPreco(torneio.valorInscricao)} volta na forma de pagamento original.`
            : "Cancelar sua inscrição?"
        if (!window.confirm(aviso)) return
        setEnviando(true)
        setErro(null)
        try {
            await tournamentService.sair(id)
            setInscricao(null)
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível cancelar a inscrição."))
        }
        setEnviando(false)
    }

    async function inscrever() {
        if (!torneio) return
        if (!isSignedIn) {
            window.location.assign(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        setEnviando(true)
        setErro(null)
        try {
            if (!inscricao) {
                await tournamentService.inscrever(id)
                setInscricao({ situacao: torneio.valorInscricao > 0 ? "PENDENTE" : "PAGA", numero: null })
            }
            if (torneio.valorInscricao > 0) {
                window.location.assign(await tournamentService.pagarInscricao(id, torneio.nome))
                return
            }
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível concluir sua inscrição. Tente novamente."))
        }
        setEnviando(false)
    }

    if (falhou) {
        return (
            <AppShell>
                <ErrorState title="Não foi possível carregar este evento" onRetry={carregar} />
            </AppShell>
        )
    }
    if (!torneio || !isLoaded) {
        return (
            <AppShell>
                <Loader className="py-24" />
            </AppShell>
        )
    }

    const inicio = partesDaData(torneio.dataInicio)
    const variosDias = torneio.dataFim && torneio.dataFim !== torneio.dataInicio
    const quando = variosDias ? `${dataPorExtenso(torneio.dataInicio)} a ${dataPorExtenso(torneio.dataFim)}` : dataPorExtenso(torneio.dataInicio)
    const preco = torneio.valorInscricao > 0 ? formatarPreco(torneio.valorInscricao) : "Grátis"
    const limite = torneio.maxParticipantes > 0
    const restantes = Math.max(0, torneio.maxParticipantes - torneio.participantes)
    const ocupacao = limite ? Math.min(1, torneio.participantes / torneio.maxParticipantes) : 0
    const status = torneio.cancelado ? "Cancelado" : STATUS_LABEL[torneio.status]
    const organizador = !!meuId && meuId === torneio.organizadorId
    const comResultado = inscritos.some((i) => i.posicao !== null)

    // Seções numeradas só com o que o organizador preencheu
    const secoes = [
        { titulo: "Sobre", texto: torneio.descricao },
        { titulo: "Premiação", texto: torneio.premiacao },
        { titulo: "Regras", texto: torneio.regras },
    ].filter((s) => s.texto.trim())

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6">
                <BackButton href="/torneios" label="Eventos" className="-ml-2.5" />

                {live && <AoVivo live={live} />}

                <header className="mt-6 flex gap-5 sm:gap-7">
                    {inicio && (
                        <div className="h-fit shrink-0 border border-foreground px-3 py-2.5 text-center shadow-[4px_4px_0_var(--foreground)]">
                            <p className="text-3xl font-bold leading-none tabular-nums sm:text-5xl">{inicio.dia}</p>
                            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.16em]">{inicio.mes}</p>
                            <p className="text-xs tabular-nums text-muted-foreground">{inicio.ano}</p>
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className={`type-caption flex items-center gap-2 font-semibold uppercase tracking-[0.16em] ${torneio.status === "encerrado" ? "text-muted-foreground" : "text-accent"}`}>
                            <span className={`size-1.5 rounded-full ${torneio.status === "encerrado" ? "bg-muted-foreground" : "bg-accent"} ${torneio.status === "andamento" ? "animate-pulse" : ""}`} />
                            {status}
                        </p>
                        <h1 className="type-display mt-2 text-balance">{torneio.nome}</h1>
                        <p className="type-body mt-2 text-muted-foreground">{torneio.local}</p>
                        {torneio.local && (
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(torneio.local)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="type-label mt-2 inline-flex min-h-9 items-center gap-1.5 text-primary underline underline-offset-2"
                            >
                                <MapPin className="size-4" aria-hidden="true" />
                                Como chegar
                            </a>
                        )}
                    </div>
                </header>

                {/* eslint-disable-next-line @next/next/no-img-element -- capa enviada pelo organizador, domínio variável */}
                <img
                    src={torneio.banner}
                    alt={torneio.banner.endsWith("placeholder.svg") ? "" : `Capa do evento ${torneio.nome}`}
                    className={`mt-8 aspect-[16/9] w-full rounded-lg border border-foreground bg-surface-muted object-cover sm:aspect-[21/9] ${torneio.status === "encerrado" ? "grayscale" : ""}`}
                />

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
                    <aside className="order-first h-fit rounded-lg border border-foreground bg-surface p-5 shadow-[4px_4px_0_var(--foreground)] lg:order-none lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
                        <p className="type-caption text-muted-foreground">Inscrição</p>
                        <p className="mt-0.5 text-3xl font-bold tabular-nums">{preco}</p>

                        <dl className="type-body-small mt-5 divide-y divide-border border-y border-border">
                            <div className="flex justify-between gap-4 py-2.5">
                                <dt className="text-muted-foreground">Quando</dt>
                                <dd className="text-right font-medium first-letter:uppercase">{quando}</dd>
                            </div>
                            <div className="py-2.5">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted-foreground">Vagas</dt>
                                    <dd className="font-medium tabular-nums">
                                        {limite ? `${restantes} de ${torneio.maxParticipantes}` : "Sem limite"}
                                    </dd>
                                </div>
                                {limite && (
                                    <div className="mt-2 h-1 bg-surface-muted" aria-hidden="true">
                                        <div className="h-full bg-foreground" style={{ width: `${ocupacao * 100}%` }} />
                                    </div>
                                )}
                            </div>
                        </dl>

                        {/* Escassez real: só quando as vagas estão mesmo acabando */}
                        {limite && torneio.status === "aberto" && !torneio.cancelado && restantes > 0 && restantes <= Math.max(3, Math.ceil(torneio.maxParticipantes * 0.2)) && (
                            <p className="type-label mt-4 text-primary">
                                {restantes === 1 ? "Última vaga" : `Últimas ${restantes} vagas`}
                            </p>
                        )}

                        {/* Prova social: quem já confirmou presença (dados reais da lista pública) */}
                        {inscritos.length > 0 && (
                            <div className="mt-4 flex items-center gap-3">
                                <div className="flex -space-x-2" aria-hidden="true">
                                    {inscritos.slice(0, 5).map((i) => (
                                        <Avatar key={i.userId} inscrito={i} className="size-8 ring-2 ring-surface" />
                                    ))}
                                </div>
                                <p className="type-caption text-muted-foreground">
                                    {inscritos.length === 1 ? "1 pessoa confirmada" : `${inscritos.length} pessoas confirmadas`}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col items-start gap-5">
                            {inscricao?.situacao === "PAGA" ? (
                                <div className="flex flex-col items-start gap-2">
                                    <p role="status" className="type-label flex items-center gap-2 text-success">
                                        <CheckCircle className="size-5" aria-hidden="true" />
                                        Você está inscrito
                                    </p>
                                    {inscricao.numero !== null && (
                                        <p className="type-body-small text-muted-foreground">
                                            Seu número de peito: <strong className="text-lg font-bold tabular-nums text-foreground">{inscricao.numero}</strong>
                                        </p>
                                    )}
                                    {torneio.status === "aberto" && !torneio.cancelado && (
                                        <button type="button" onClick={sair} disabled={enviando} className="type-caption font-semibold text-muted-foreground underline underline-offset-2 hover:text-destructive">
                                            Cancelar inscrição
                                        </button>
                                    )}
                                </div>
                            ) : torneio.status === "aberto" && !torneio.cancelado ? (
                                <button type="button" onClick={inscrever} disabled={enviando} aria-busy={enviando} className="line-btn line-btn--lg line-btn--accent">
                                    {inscricao?.situacao === "PENDENTE" ? "Pagar inscrição" : "Quero participar"}
                                    {enviando ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                                </button>
                            ) : (
                                <p className="type-body-small text-muted-foreground">Inscrições fechadas.</p>
                            )}
                            <ShareButton title={torneio.nome} variant="line" />
                            {organizador && (
                                <Link href={`/torneios/${torneio.id}/gerenciar`} className="line-btn line-btn--sm">
                                    <ClipboardList aria-hidden="true" />
                                    {torneio.modo !== "posicao" && torneio.status === "andamento" ? "Abrir o placar" : "Gerenciar evento"}
                                </Link>
                            )}
                            {organizador && !torneio.cancelado && torneio.status !== "encerrado" && (
                                <Link
                                    href={live ? `/videos/live?id=${live.id}&torneio=${torneio.id}` : `/videos/live?torneio=${torneio.id}`}
                                    className="line-btn line-btn--sm"
                                >
                                    <Radio aria-hidden="true" />
                                    {live ? "Painel da transmissão" : "Transmitir ao vivo"}
                                </Link>
                            )}
                        </div>
                        {torneio.valorInscricao > 0 && inscricao?.situacao === "PENDENTE" && (
                            <p className="type-caption mt-4 text-muted-foreground">
                                Sua vaga fica reservada por 30 minutos enquanto você paga. Depois disso, ela volta a ficar livre.
                            </p>
                        )}
                        {torneio.valorInscricao > 0 && (
                            <p className="type-caption mt-4 text-muted-foreground">
                                Pode cancelar até o início e receber o valor de volta. Evento cancelado é reembolsado automaticamente.{" "}
                                <Link href="/reembolso#eventos" className="underline underline-offset-2">Política de reembolso</Link>
                            </p>
                        )}
                        {erro && (
                            <p role="alert" className="type-body-small mt-4 border-l-2 border-destructive pl-3 text-destructive">
                                {erro}
                            </p>
                        )}
                    </aside>

                    <article className="min-w-0 lg:col-start-1 lg:row-start-1">
                        {/* Com resultado, o placar abre a página: é o que todo mundo veio ver */}
                        {comResultado && (
                            <div className="mb-12 space-y-8 border-b border-border pb-10">
                                <Podio inscritos={inscritos} modo={torneio.modo} aoVivo={andamento} imagemHref={`/torneios/${torneio.id}/podio`} />
                                <Classificacao inscritos={inscritos} modo={torneio.modo} titulo={andamento ? "Classificação ao vivo" : "Classificação"} />
                                {andamento && (
                                    <p className="type-caption text-muted-foreground">Atualiza sozinha a cada 15 segundos.</p>
                                )}
                            </div>
                        )}
                        {secoes.length === 0 && (
                            <p className="type-body text-muted-foreground">O organizador ainda não escreveu os detalhes deste evento.</p>
                        )}
                        {secoes.map((s, i) => (
                            <section key={s.titulo} className={i > 0 ? "mt-10 border-t border-border pt-8" : ""}>
                                <h2 className="flex items-baseline gap-3">
                                    <span className="text-sm font-bold tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
                                    <span className="type-h2">{s.titulo}</span>
                                </h2>
                                <p className="type-body mt-3 whitespace-pre-line text-foreground/85">{s.texto}</p>
                            </section>
                        ))}

                        {torneio.organizadorId && (
                            <p className="type-body-small mt-12 border-t border-border pt-5 text-muted-foreground">
                                Organizado por{" "}
                                <Link href={`/perfil/${torneio.organizadorId}`} className="line-btn line-btn--sm ml-1 align-baseline">
                                    {torneio.organizadorNome || "ver perfil"}
                                </Link>
                            </p>
                        )}
                        {!comResultado && inscritos.length > 0 && (
                            <div className="mt-12 border-t border-border pt-8">
                                <Classificacao inscritos={inscritos} modo={torneio.modo} titulo="Inscritos" />
                            </div>
                        )}
                        <VideosDoEvento torneioId={torneio.id} logado={!!isSignedIn} />
                        <DenunciarButton tipo="TOURNAMENT" id={torneio.id} className="mt-6" />
                    </article>
                </div>
            </main>
        </AppShell>
    )
}
