"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { ArrowRight, Award, CheckCircle, ChevronRight, ClipboardList, HeartHandshake, Loader2, MapPin, Radio, ScrollText, Ticket, Trophy, Upload } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { CapaEvento } from "@/components/torneios/CapaEvento"
import { DenunciarButton } from "@/components/ui/denunciar-button"
import { ErrorState } from "@/components/ui/error-state"
import { Loader } from "@/components/ui/loader"
import { ShareButton } from "@/components/ui/share-button"
import { Galeria } from "@/components/torneios/Galeria"
import { Percurso } from "@/components/torneios/Percurso"
import { Avatar, Classificacao, Podio, PodioVazio } from "@/components/torneios/Placar"
import { VideoCard } from "@/components/videos/VideoCard"
import { VideoPlayer } from "@/components/videos/VideoPlayer"
import { YouTubePlayer } from "@/components/videos/YouTubePlayer"
import api from "@/lib/api"
import { formatarPreco, partesDaData, textoDaPremiacao } from "@/lib/format"
import { MODOS } from "@/lib/placar"
import { fetchTournamentLive, fetchTournamentVideos, playbackIdFrom } from "@/lib/videos/api"
import type { VideoItem } from "@/lib/videos/types"
import { mensagemDaApi, tournamentService, type Cupom, type FotoEvento, type InscritoPublico, type MinhaInscricao, type Rota, type Tournament } from "@/services/tournamentService"

/** De quanto em quanto tempo a página pergunta se o organizador entrou ou saiu do ar. */
const CHECAR_LIVE_MS = 30_000
/** Placar ao vivo: com o evento acontecendo, a classificação se atualiza sozinha. */
const ATUALIZAR_PLACAR_MS = 15_000

const ABAS = ["ranking", "videos", "fotos", "percurso", "sobre"] as const
type Aba = (typeof ABAS)[number]
/** Endereços antigos (#resultados, #inscritos) caem no ranking. */
const ABA_ANTIGA: Record<string, Aba> = { resultados: "ranking", inscritos: "ranking" }

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

    return (
        <section aria-labelledby="videos-evento">
            {/* A aba já diz "Vídeos": o título fica só para leitor de tela */}
            <div className="flex flex-wrap items-center justify-end gap-3">
                <h2 id="videos-evento" className="sr-only">Vídeos do evento</h2>
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

/** "sáb., 14": para o primeiro dia de um evento que termina no mesmo mês. */
function diaDaSemana(iso: string) {
    const d = new Date(`${iso}T12:00:00`)
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" })
}

export default function TorneioDetalhesPage() {
    const { isSignedIn, isLoaded } = useUser()
    const { id } = useParams<{ id: string }>()

    const [torneio, setTorneio] = useState<Tournament | null>(null)
    // "inexistente": o servidor respondeu que o evento não existe; "rede": não deu para perguntar
    const [falhou, setFalhou] = useState<false | "rede" | "inexistente">(false)
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
        } catch (cause) {
            const status = (cause as { response?: { status?: number } })?.response?.status
            setFalhou(status === 400 || status === 404 ? "inexistente" : "rede")
        }
        // Lista é complemento: se falhar, a página continua
        tournamentService.inscritos(id).then(setInscritos).catch(() => setInscritos([]))
    }, [id])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial da página
        void carregar()
    }, [carregar])

    // Ajudante do placar (convidado pelo organizador) ganha um atalho para lançar os resultados
    const [ajudante, setAjudante] = useState(false)
    useEffect(() => {
        if (!isSignedIn) return
        tournamentService.souAjudante(id).then(setAjudante).catch(() => {})
    }, [id, isSignedIn])

    // Cupom de desconto: conferido antes de se inscrever, para mostrar o preço novo
    const [cupomAberto, setCupomAberto] = useState(false)
    const [cupomCodigo, setCupomCodigo] = useState("")
    const [cupom, setCupom] = useState<Cupom | null>(null)
    const [cupomErro, setCupomErro] = useState<string | null>(null)
    const [conferindo, setConferindo] = useState(false)
    async function conferirCupom(e: React.FormEvent) {
        e.preventDefault()
        if (!cupomCodigo.trim()) return
        if (!isSignedIn) {
            window.location.assign(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        setConferindo(true)
        setCupomErro(null)
        try {
            setCupom(await tournamentService.conferirCupom(id, cupomCodigo.trim()))
        } catch (cause) {
            setCupom(null)
            setCupomErro(mensagemDaApi(cause, "Não foi possível conferir o cupom."))
        } finally {
            setConferindo(false)
        }
    }

    useEffect(() => {
        if (!isSignedIn) return
        tournamentService.minhaInscricao(id).then(setInscricao).catch(() => {})
    }, [id, isSignedIn])

    const [fotos, setFotos] = useState<FotoEvento[]>([])
    const carregarFotos = useCallback(async () => {
        setFotos(await tournamentService.fotos(id).catch(() => []))
    }, [id])
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial da galeria
        void carregarFotos()
    }, [carregarFotos])

    // Percurso: os pontos só vêm quando o evento tem (o resumo já vem no evento)
    const [rota, setRota] = useState<Rota | null>(null)
    const temRota = !!torneio?.rota
    useEffect(() => {
        if (!temRota) return
        tournamentService.rota(id).then(setRota).catch(() => setRota(null))
    }, [id, temRota])

    // Categoria: a que a pessoa escolhe para se inscrever e a que está sendo vista no resultado
    const [categoriaInscricao, setCategoriaInscricao] = useState("")
    const [categoriaVista, setCategoriaVista] = useState<string | null>(null)

    // Aba aberta fica no endereço (#fotos), para dar para compartilhar direto
    const [abaEscolhida, setAbaEscolhida] = useState<Aba | null>(null)
    useEffect(() => {
        const hash = window.location.hash.slice(1)
        const aba = ABA_ANTIGA[hash] ?? hash
        // eslint-disable-next-line react-hooks/set-state-in-effect -- só no navegador existe o hash
        if ((ABAS as readonly string[]).includes(aba)) setAbaEscolhida(aba as Aba)
    }, [])
    function escolherAba(aba: Aba) {
        setAbaEscolhida(aba)
        window.history.replaceState(null, "", `#${aba}`)
    }

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
        // Com cupom a pessoa pagou menos (ou nada): devolve o que foi pago de fato
        const valorPago = inscricao?.valorPago ?? 0
        const pago = inscricao?.situacao === "PAGA" && valorPago > 0
        const aviso = pago
            ? `Cancelar sua inscrição? O valor de ${formatarPreco(valorPago)} volta na forma de pagamento original.`
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
        if (!inscricao && torneio.categorias.length > 0 && !categoriaInscricao) {
            setErro("Escolha sua categoria antes de se inscrever.")
            return
        }
        setEnviando(true)
        setErro(null)
        try {
            let confirmada = false
            if (!inscricao) {
                const categoria = torneio.categorias.length > 0 ? categoriaInscricao : "Geral"
                confirmada = await tournamentService.inscrever(id, categoria, cupom?.codigo)
                setInscricao({ id: "", situacao: confirmada ? "PAGA" : "PENDENTE", numero: null, categoria, valorPago: null, cupom: cupom?.codigo ?? null })
            } else if (cupom && cupom.codigo !== inscricao.cupom) {
                // Voltou para pagar e trouxe um cupom: vale para a inscrição já reservada
                confirmada = await tournamentService.aplicarCupom(id, cupom.codigo)
                if (confirmada) setInscricao({ ...inscricao, situacao: "PAGA", cupom: cupom.codigo })
            }
            if (confirmada) {
                // Grátis ou cupom de 100%: atualiza a lista e não passa pelo pagamento
                void carregar()
                tournamentService.minhaInscricao(id).then(setInscricao).catch(() => {})
            } else if (torneio.valorInscricao > 0) {
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
                {falhou === "inexistente" ? (
                    <ErrorState title="Evento não encontrado" description="Ele pode ter sido removido ou o link está errado." />
                ) : (
                    <ErrorState title="Não foi possível carregar este evento" onRetry={carregar} />
                )}
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
    // Mesmo mês: "Sáb., 14 a dom., 15 de novembro" (cabe numa linha no celular)
    const mesmoMes = variosDias && torneio.dataInicio.slice(0, 7) === torneio.dataFim.slice(0, 7)
    const quando = !variosDias
        ? dataPorExtenso(torneio.dataInicio)
        : mesmoMes
          ? `${diaDaSemana(torneio.dataInicio)} a ${dataPorExtenso(torneio.dataFim)}`
          : `${dataPorExtenso(torneio.dataInicio)} a ${dataPorExtenso(torneio.dataFim)}`
    const preco = torneio.valorInscricao > 0 ? formatarPreco(torneio.valorInscricao) : "Grátis"
    const limite = torneio.maxParticipantes > 0
    const restantes = Math.max(0, torneio.maxParticipantes - torneio.participantes)
    const ocupacao = limite ? Math.min(1, torneio.participantes / torneio.maxParticipantes) : 0
    const status = torneio.cancelado ? "Cancelado" : STATUS_LABEL[torneio.status]
    const organizador = !!meuId && meuId === torneio.organizadorId
    const comResultado = inscritos.some((i) => i.posicao !== null)

    // Quem participa vem primeiro (lista antes da prova, ranking com o top 3 depois); detalhes ficam por último
    const abas: { id: Aba; rotulo: string; contagem?: number }[] = [
        { id: "ranking", rotulo: comResultado ? "Ranking" : "Participantes", contagem: inscritos.length },
        { id: "videos", rotulo: "Vídeos" },
        { id: "fotos", rotulo: "Fotos", contagem: fotos.length },
        ...(torneio.rota ? [{ id: "percurso" as const, rotulo: "Percurso" }] : []),
        { id: "sobre", rotulo: "Sobre" },
    ]
    const abaAtual: Aba = abas.some((a) => a.id === abaEscolhida) ? abaEscolhida! : abas[0].id

    // Com categorias, resultado e pódio são de uma categoria por vez (a primeira que já tem resultado)
    const porCategoria = torneio.categorias.length > 0
    const categoriaAtual = porCategoria
        ? categoriaVista && torneio.categorias.includes(categoriaVista)
            ? categoriaVista
            : torneio.categorias.find((c) => inscritos.some((i) => i.categoria === c && i.posicao !== null)) ?? torneio.categorias[0]
        : null
    const daCategoria = categoriaAtual ? inscritos.filter((i) => i.categoria === categoriaAtual) : inscritos
    const filtroCategorias = porCategoria && (
        <div role="group" aria-label="Categoria" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {torneio.categorias.map((c) => (
                <button
                    key={c}
                    type="button"
                    aria-pressed={categoriaAtual === c}
                    onClick={() => setCategoriaVista(c)}
                    className={`type-label shrink-0 rounded-full border px-3.5 py-1.5 transition-colors ${
                        categoriaAtual === c ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                    }`}
                >
                    {c} <span className="tabular-nums opacity-70">{inscritos.filter((i) => i.categoria === c).length}</span>
                </button>
            ))}
        </div>
    )

    // Premiação fica no cartão principal, à vista; texto longo aparece inteiro no Sobre
    const premio = textoDaPremiacao(torneio.premiacao)
    const premioCurto = premio.length <= 16
    const formato = MODOS.find((m) => m.id === torneio.modo)

    // Ficha do Sobre: só as linhas que o evento tem
    const ficha: { rotulo: string; valor: React.ReactNode }[] = [
        { rotulo: "Data", valor: <span className="block first-letter:uppercase">{quando}</span> },
        ...(torneio.local
            ? [{
                  rotulo: "Local",
                  valor: (
                      <>
                          {torneio.local}
                          <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(torneio.local)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 flex items-center gap-1 font-semibold text-primary underline underline-offset-2"
                          >
                              <MapPin className="size-3.5" aria-hidden="true" />
                              Como chegar
                          </a>
                      </>
                  ),
              }]
            : []),
        // Só a regra ("Menor tempo vence"); os exemplos de modalidade são para quem cria o evento
        ...(formato ? [{ rotulo: "Disputa", valor: <>{formato.titulo}<span className="block text-muted-foreground">{formato.texto.split(".")[0]}.</span></> }] : []),
        ...(torneio.categorias.length > 0 ? [{ rotulo: "Categorias", valor: torneio.categorias.join(", ") }] : []),
        { rotulo: "Inscrição", valor: preco },
        ...(premio && !premioCurto ? [{ rotulo: "Premiação", valor: <span className="whitespace-pre-line">{premio}</span> }] : []),
        { rotulo: "Vagas", valor: limite ? `${torneio.maxParticipantes} no total` : "Sem limite" },
        ...(torneio.solidaria ? [{ rotulo: "Solidária", valor: `Levar ${torneio.solidaria} no dia` }] : []),
    ]

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-4 sm:px-6">
                <BackButton href="/torneios" label="Eventos" className="-ml-2.5" />

                {live && <AoVivo live={live} />}

                {/* Topo enxuto: espaço no celular é valioso. Detalhes (como chegar, regras) ficam no Sobre */}
                <header className="mt-3 flex items-start gap-4 sm:gap-7">
                    {inicio && (
                        <div className="shrink-0 border border-foreground px-2.5 py-2 text-center shadow-[3px_3px_0_var(--foreground)]">
                            <p className="text-2xl font-bold leading-none tabular-nums sm:text-5xl">{inicio.dia}</p>
                            <p className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.16em]">{inicio.mes}</p>
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className={`type-caption flex items-center gap-2 font-semibold uppercase tracking-[0.16em] ${torneio.status === "encerrado" ? "text-muted-foreground" : "text-accent"}`}>
                            <span className={`size-1.5 rounded-full ${torneio.status === "encerrado" ? "bg-muted-foreground" : "bg-accent"} ${torneio.status === "andamento" ? "animate-pulse" : ""}`} />
                            {status}
                        </p>
                        <h1 className="type-h1 mt-1 text-balance">{torneio.nome}</h1>
                        {torneio.local && (
                            <p className="type-body-small mt-1 flex items-center gap-1 text-muted-foreground">
                                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                                <span className="truncate">{torneio.local}</span>
                            </p>
                        )}
                    </div>
                </header>

                <CapaEvento
                    src={torneio.banner}
                    nome={torneio.nome}
                    apagada={torneio.status === "encerrado"}
                    className="mt-4 aspect-[2/1] w-full rounded-lg border border-foreground bg-surface-muted sm:aspect-[21/9]"
                />

                <div className="mt-5 grid gap-6 lg:mt-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
                    <aside className="order-first h-fit rounded-lg border border-foreground bg-surface p-4 shadow-[4px_4px_0_var(--foreground)] sm:p-5 lg:order-none lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
                        {/* Inscrição e premiação lado a lado: as duas coisas que a pessoa quer saber primeiro */}
                        <div className={premio ? "grid grid-cols-2 gap-4" : ""}>
                            <div>
                                <p className="type-caption text-muted-foreground">Inscrição</p>
                                <p className="mt-0.5 text-2xl font-bold tabular-nums">{preco}</p>
                            </div>
                            {premio && (
                                <div className="min-w-0 border-l border-border pl-4">
                                    <p className="type-caption flex items-center gap-1.5 text-muted-foreground">
                                        <Trophy className="size-3.5 text-[#E8B931]" aria-hidden="true" />
                                        Premiação
                                    </p>
                                    {premioCurto ? (
                                        <p className="mt-0.5 break-words text-2xl font-bold tabular-nums text-[#E8B931]">{premio}</p>
                                    ) : (
                                        <p className="type-body-small mt-1 line-clamp-2 font-semibold text-foreground">{premio}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <dl className="type-body-small mt-4 divide-y divide-border border-y border-border">
                            <div className="flex justify-between gap-4 py-2.5">
                                <dt className="text-muted-foreground">Quando</dt>
                                <dd className="text-right font-medium first-letter:uppercase">{quando}</dd>
                            </div>
                            {/* Depois do evento, vagas não interessam a ninguém */}
                            {torneio.status !== "encerrado" && !torneio.cancelado && (
                                <div className="py-2.5">
                                    <div className="flex justify-between gap-4">
                                        <dt className="text-muted-foreground">Vagas</dt>
                                        <dd className="font-medium tabular-nums">
                                            {!limite ? "Sem limite" : restantes === 0 ? "Esgotado" : `${restantes} livres de ${torneio.maxParticipantes}`}
                                        </dd>
                                    </div>
                                    {limite && (
                                        <div className="mt-2 h-1 bg-surface-muted" aria-hidden="true">
                                            <div className="h-full bg-foreground" style={{ width: `${ocupacao * 100}%` }} />
                                        </div>
                                    )}
                                </div>
                            )}
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
                                        <Avatar key={i.id} inscrito={i} className="size-8 ring-2 ring-surface" />
                                    ))}
                                </div>
                                <p className="type-caption text-muted-foreground">
                                    {inscritos.length === 1 ? "1 pessoa confirmada" : `${inscritos.length} pessoas confirmadas`}
                                </p>
                            </div>
                        )}

                        {torneio.solidaria && (
                            <div className="mt-4 flex gap-2.5 rounded-lg border border-success/40 bg-success/5 px-3 py-2.5">
                                <HeartHandshake className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                                <p className="type-body-small text-foreground">
                                    <strong>Inscrição solidária:</strong> leve {torneio.solidaria} no dia. A doação é conferida na chegada.
                                    {torneio.doacoesEntregues > 0 && (
                                        <span className="block text-muted-foreground">
                                            {torneio.doacoesEntregues === 1 ? "1 doação entregue" : `${torneio.doacoesEntregues} doações entregues`} até agora.
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="mt-5 flex flex-col items-start gap-4">
                            {inscricao?.situacao === "PAGA" ? (
                                <div className="flex flex-col items-start gap-2">
                                    <p role="status" className="type-label flex items-center gap-2 text-success">
                                        <CheckCircle className="size-5" aria-hidden="true" />
                                        Você está inscrito
                                    </p>
                                    {inscricao.categoria && inscricao.categoria !== "Geral" && (
                                        <p className="type-body-small text-muted-foreground">
                                            Categoria: <strong className="text-foreground">{inscricao.categoria}</strong>
                                        </p>
                                    )}
                                    {inscricao.numero !== null && (
                                        <p className="type-body-small text-muted-foreground">
                                            Seu número de peito: <strong className="text-lg font-bold tabular-nums text-foreground">{inscricao.numero}</strong>
                                        </p>
                                    )}
                                    {/* Depois do evento: imagem pronta para postar, com nome, colocação e marca */}
                                    {torneio.status === "encerrado" && !torneio.cancelado && inscricao.id && (
                                        <a href={`/torneios/${torneio.id}/certificado?p=${inscricao.id}`} target="_blank" rel="noopener" className="line-btn line-btn--sm">
                                            <Award aria-hidden="true" />
                                            Baixar meu certificado
                                        </a>
                                    )}
                                    {torneio.status === "aberto" && !torneio.cancelado && (
                                        <button type="button" onClick={sair} disabled={enviando} className="type-caption font-semibold text-muted-foreground underline underline-offset-2 hover:text-destructive">
                                            Cancelar inscrição
                                        </button>
                                    )}
                                </div>
                            ) : torneio.status === "aberto" && !torneio.cancelado ? (
                                <>
                                {torneio.categorias.length > 0 && !inscricao && (
                                    <label className="flex w-full flex-col gap-1.5">
                                        <span className="type-label text-foreground">Sua categoria</span>
                                        <select
                                            value={categoriaInscricao}
                                            onChange={(e) => setCategoriaInscricao(e.target.value)}
                                            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-base md:text-sm"
                                        >
                                            <option value="">Escolha…</option>
                                            {torneio.categorias.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                                {torneio.valorInscricao > 0 &&
                                    (cupomAberto || cupom ? (
                                        <form onSubmit={conferirCupom} className="flex w-full flex-col gap-1.5">
                                            <label htmlFor="cupom" className="type-label text-foreground">
                                                Cupom de desconto
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    id="cupom"
                                                    value={cupomCodigo}
                                                    onChange={(e) => {
                                                        setCupomCodigo(e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 30))
                                                        setCupom(null)
                                                        setCupomErro(null)
                                                    }}
                                                    autoCapitalize="characters"
                                                    autoComplete="off"
                                                    placeholder="Ex.: AMIGO10"
                                                    className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-base uppercase md:text-sm"
                                                />
                                                <button type="submit" disabled={conferindo || !cupomCodigo.trim() || !!cupom} className="line-btn line-btn--sm min-h-11">
                                                    {conferindo ? "…" : cupom ? "Aplicado" : "Aplicar"}
                                                </button>
                                            </div>
                                            {cupom && (
                                                <p role="status" className="type-body-small text-success">
                                                    {cupom.percentual}% de desconto:{" "}
                                                    {cupom.valorComDesconto > 0 ? (
                                                        <>
                                                            você paga <strong>{formatarPreco(cupom.valorComDesconto)}</strong>{" "}
                                                            <s className="text-muted-foreground">{formatarPreco(torneio.valorInscricao)}</s>
                                                        </>
                                                    ) : (
                                                        <strong>inscrição grátis</strong>
                                                    )}
                                                </p>
                                            )}
                                            {cupomErro && (
                                                <p role="alert" className="type-caption text-destructive">
                                                    {cupomErro}
                                                </p>
                                            )}
                                        </form>
                                    ) : (
                                        <button type="button" onClick={() => setCupomAberto(true)} className="type-caption inline-flex items-center gap-1.5 font-semibold text-muted-foreground underline underline-offset-2">
                                            <Ticket className="size-3.5" aria-hidden="true" />
                                            Tenho um cupom
                                        </button>
                                    ))}
                                <Button type="button" variant="accent" size="lg" onClick={inscrever} disabled={enviando} aria-busy={enviando} className="w-full">
                                    {cupom && cupom.valorComDesconto <= 0
                                        ? "Confirmar inscrição grátis"
                                        : inscricao?.situacao === "PENDENTE"
                                          ? "Pagar inscrição"
                                          : "Quero participar"}
                                    {enviando ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                                </Button>
                                </>
                            ) : (
                                <p className="type-body-small text-muted-foreground">
                                    {torneio.cancelado ? "Evento cancelado." : torneio.status === "encerrado" ? "Evento encerrado." : "Inscrições fechadas."}
                                </p>
                            )}
                            <ShareButton title={torneio.nome} variant="line" />
                        </div>

                        {torneio.valorInscricao > 0 && inscricao?.situacao === "PENDENTE" && (
                            <p className="type-caption mt-4 text-muted-foreground">
                                Sua vaga fica reservada por 30 minutos enquanto você paga. Depois disso, ela volta a ficar livre.
                            </p>
                        )}
                        {torneio.valorInscricao > 0 && torneio.status === "aberto" && !torneio.cancelado && (
                            <p className="type-caption mt-3 text-muted-foreground">
                                Pode cancelar até o início e receber o valor de volta.{" "}
                                <button type="button" onClick={() => escolherAba("sobre")} className="underline underline-offset-2">
                                    Detalhes
                                </button>
                            </p>
                        )}
                        {erro && (
                            <p role="alert" className="type-body-small mt-4 border-l-2 border-destructive pl-3 text-destructive">
                                {erro}
                            </p>
                        )}
                        {ajudante && !organizador && !torneio.cancelado && torneio.status !== "encerrado" && (
                            <div className="mt-6 border-t border-border pt-5">
                                <p className="type-caption font-semibold uppercase tracking-[0.14em] text-muted-foreground">Você ajuda no placar</p>
                                <Button asChild variant="default" className="mt-3 w-full">
                                    <Link href={`/torneios/${torneio.id}/juiz`}>
                                        <ClipboardList aria-hidden="true" />
                                        Abrir o placar
                                    </Link>
                                </Button>
                            </div>
                        )}
                        {/* Ferramentas do organizador separadas do que o público vê */}
                        {organizador && (
                            <div className="mt-6 border-t border-border pt-5">
                                <p className="type-caption font-semibold uppercase tracking-[0.14em] text-muted-foreground">Você organiza este evento</p>
                                <div className="mt-3 flex flex-col items-start gap-4">
                                    <Button asChild variant="default" className="w-full">
                                        <Link href={`/torneios/${torneio.id}/gerenciar`}>
                                            <ClipboardList aria-hidden="true" />
                                            {torneio.modo !== "posicao" && torneio.status === "andamento" ? "Abrir o placar" : "Gerenciar evento"}
                                        </Link>
                                    </Button>
                                    {!torneio.cancelado && torneio.status !== "encerrado" && (
                                        <Link
                                            href={live ? `/videos/live?id=${live.id}&torneio=${torneio.id}` : `/videos/live?torneio=${torneio.id}`}
                                            className="line-btn line-btn--sm"
                                        >
                                            <Radio aria-hidden="true" />
                                            {live ? "Painel da transmissão" : "Transmitir ao vivo"}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </aside>

                    <article className="min-w-0 lg:col-start-1 lg:row-start-1">
                        {/* Abas dividem a largura por igual; com muitas, rolam de lado */}
                        <div role="tablist" aria-label="Seções do evento" className="-mx-4 flex overflow-x-auto border-b border-border px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
                            {abas.map((a) => (
                                <button
                                    key={a.id}
                                    type="button"
                                    role="tab"
                                    id={`aba-${a.id}`}
                                    aria-selected={abaAtual === a.id}
                                    aria-controls={`painel-${a.id}`}
                                    onClick={() => escolherAba(a.id)}
                                    className={`type-label -mb-px flex min-h-12 flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-3 transition-colors ${
                                        abaAtual === a.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {a.id === "ranking" && andamento && comResultado && <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />}
                                    {a.rotulo}
                                    {a.contagem !== undefined && a.contagem > 0 && (
                                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-surface-muted px-1.5 text-xs tabular-nums text-muted-foreground">{a.contagem}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div role="tabpanel" id={`painel-${abaAtual}`} aria-labelledby={`aba-${abaAtual}`} className="pt-6">
                            {abaAtual === "ranking" &&
                                (inscritos.length === 0 ? (
                                    <div className="space-y-6">
                                        <PodioVazio />
                                        <p className="type-body-small text-muted-foreground">Ninguém confirmou a inscrição ainda. Seja o primeiro.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {filtroCategorias}
                                        {comResultado ? (
                                            <Podio
                                                inscritos={daCategoria}
                                                modo={torneio.modo}
                                                aoVivo={andamento}
                                                imagemHref={`/torneios/${torneio.id}/podio${categoriaAtual ? `?categoria=${encodeURIComponent(categoriaAtual)}` : ""}`}
                                            />
                                        ) : (
                                            <PodioVazio />
                                        )}
                                        <Classificacao
                                            inscritos={daCategoria}
                                            modo={torneio.modo}
                                            titulo={`${comResultado ? (andamento ? "Classificação ao vivo" : "Classificação") : "Participantes"}${categoriaAtual ? ` · ${categoriaAtual}` : ""}`}
                                        />
                                        {andamento && comResultado && <p className="type-caption text-muted-foreground">Atualiza sozinha a cada 15 segundos.</p>}
                                    </div>
                                ))}

                            {abaAtual === "sobre" && (
                                <div className="space-y-6">
                                    {torneio.descricao.trim() && (
                                        <p className="type-body whitespace-pre-line text-foreground/90">{torneio.descricao.trim()}</p>
                                    )}

                                    {/* Ficha do evento: tudo num lugar só, uma linha por informação */}
                                    <dl className="type-body-small divide-y divide-border rounded-lg border border-border bg-surface px-4">
                                        {ficha.map(({ rotulo, valor }) => (
                                            <div key={rotulo} className="grid grid-cols-[6.5rem_1fr] gap-3 py-3">
                                                <dt className="text-muted-foreground">{rotulo}</dt>
                                                <dd className="min-w-0 text-foreground">{valor}</dd>
                                            </div>
                                        ))}
                                    </dl>

                                    {torneio.regras.trim() && (
                                        <section className="rounded-lg border border-border bg-surface p-4">
                                            <h2 className="type-caption flex items-center gap-2 font-semibold uppercase tracking-wider text-muted-foreground">
                                                <ScrollText className="size-4" aria-hidden="true" />
                                                Regras
                                            </h2>
                                            <p className="type-body mt-2 whitespace-pre-line text-foreground">{torneio.regras.trim()}</p>
                                        </section>
                                    )}

                                    {torneio.valorInscricao > 0 && (
                                        <p className="type-body-small text-muted-foreground">
                                            <strong className="text-foreground">Reembolso:</strong> pode cancelar até o início e receber o valor de volta. Evento cancelado
                                            pelo organizador é reembolsado automaticamente.{" "}
                                            <Link href="/reembolso#eventos" className="underline underline-offset-2">Política de reembolso</Link>
                                        </p>
                                    )}

                                    {torneio.organizadorId && (
                                        <div className="border-t border-border pt-6">
                                            <Link
                                                href={`/perfil/${torneio.organizadorId}`}
                                                className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-foreground/40"
                                            >
                                                {torneio.organizadorFoto ? (
                                                    // eslint-disable-next-line @next/next/no-img-element -- foto do perfil, domínio do Clerk
                                                    <img src={torneio.organizadorFoto} alt="" className="size-11 shrink-0 rounded-full bg-surface-muted object-cover" />
                                                ) : (
                                                    <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-muted font-semibold text-muted-foreground">
                                                        {(torneio.organizadorNome || "?").slice(0, 1).toUpperCase()}
                                                    </span>
                                                )}
                                                <span className="min-w-0 flex-1">
                                                    <span className="type-caption block text-muted-foreground">Organizado por</span>
                                                    <span className="type-label block truncate text-foreground">{torneio.organizadorNome || "Ver perfil"}</span>
                                                </span>
                                                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            </Link>
                                            <DenunciarButton tipo="TOURNAMENT" id={torneio.id} className="mt-3" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {abaAtual === "percurso" &&
                                (rota ? <Percurso rota={rota} nome={torneio.nome} /> : <p className="type-body-small text-muted-foreground">Carregando o percurso…</p>)}

                            {abaAtual === "fotos" && (
                                <Galeria torneioId={torneio.id} fotos={fotos} organizador={organizador} aoMudar={carregarFotos} />
                            )}

                            {abaAtual === "videos" && <VideosDoEvento torneioId={torneio.id} logado={!!isSignedIn} />}
                        </div>
                    </article>
                </div>
            </main>
        </AppShell>
    )
}
