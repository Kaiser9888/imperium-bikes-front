"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useUser } from "@clerk/nextjs"
import {
    Bike,
    CalendarDays,
    CircleCheck,
    CircleHelp,
    Flame,
    Clock,
    MessageSquare,
    MessagesSquare,
    Newspaper,
    PenLine,
    Sparkles,
    Trash2,
    Users,
    Wrench,
    type LucideIcon,
} from "lucide-react"

import { BackButton } from "@/components/ui/back-button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import { RadioCard } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { forumService, type ForumCategory, type ForumPost, type Voto } from "@/services/forumService"
import { mensagemDaApi } from "@/services/tournamentService"

const TODAS = ""
const ENTRAR = "/sign-in?redirect_url=%2Fforum"

const ICONES: Record<string, LucideIcon> = {
    noticias: Newspaper,
    novidades: Sparkles,
    eventos: CalendarDays,
    geral: MessagesSquare,
    duvidas: CircleHelp,
    mecanica: Wrench,
    equipamentos: Bike,
}
/** Ícone da categoria pelo slug (componente fixo: o React não deixa escolher o componente durante a renderização). */
function IconeCategoria({ slug, className }: { slug?: string; className?: string }) {
    const Icone = (slug && ICONES[slug]) || MessagesSquare
    return <Icone className={className} aria-hidden="true" />
}

/** Categorias de oficina: quem pergunta marca a resposta que resolveu. */
const OFICINA = new Set(["duvidas", "mecanica", "equipamentos"])

type Ordem = "recentes" | "alta" | "sem-resposta"
const ORDENS: { value: Ordem; label: string; icon: LucideIcon }[] = [
    { value: "recentes", label: "Recentes", icon: Clock },
    { value: "alta", label: "Mais pedaladas", icon: Flame },
    { value: "sem-resposta", label: "Esperando ajuda", icon: CircleHelp },
]

function tempoAtras(iso: string): string {
    const minutos = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
    if (minutos < 1) return "agora"
    if (minutos < 60) return `há ${minutos} min`
    const horas = Math.floor(minutos / 60)
    if (horas < 24) return `há ${horas} h`
    const dias = Math.floor(horas / 24)
    if (dias < 30) return `há ${dias} ${dias === 1 ? "dia" : "dias"}`
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

function Iniciais({ nome, className }: { nome: string; className?: string }) {
    const iniciais = nome.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase()
    return (
        <span aria-hidden="true" className={cn("type-caption grid shrink-0 place-items-center rounded-full bg-surface-muted font-semibold text-foreground", className)}>
            {iniciais || "?"}
        </span>
    )
}

const botaoAcao =
    "type-label inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"

type PedalProps = {
    post: ForumPost
    meuId: string | null
    /** Voto que o usuário já tinha dado antes desta visita. */
    votoSalvo: Voto | null
    onErro: (mensagem: string | null) => void
    /** Coluna ao lado da publicação (em vez de linha). */
    vertical?: boolean
}

/**
 * "Pedal": o reconhecimento da comunidade. Só positivo, sem voto negativo (quem discorda
 * responde). Serve para publicação e para resposta; tocar de novo retira.
 */
function Pedal({ post, meuId, votoSalvo, onErro, vertical = false }: PedalProps) {
    const [total, setTotal] = useState(post.karmaTotal ?? 0)
    // undefined: ainda não tocou nesta visita, então vale o que está salvo no servidor
    const [agora, setAgora] = useState<boolean | undefined>(undefined)
    const pedalou = agora === undefined ? votoSalvo === "UP" : agora
    const proprio = meuId === post.userId

    async function pedalar() {
        if (!meuId) return window.location.assign(ENTRAR)
        onErro(null)
        try {
            const resultado = await forumService.pedalar(post.id)
            setTotal(resultado.score)
            setAgora(resultado.userVote === "UP")
        } catch (cause) {
            onErro(mensagemDaApi(cause, "Não foi possível dar o pedal."))
        }
    }

    return (
        <button
            type="button"
            onClick={pedalar}
            disabled={proprio}
            aria-pressed={pedalou}
            aria-label={`${pedalou ? "Tirar o pedal" : "Dar um pedal"}: ${total} ${total === 1 ? "pedal" : "pedais"}`}
            title={proprio ? "Você não pode dar pedal no que escreveu" : "Ajudou ou curtiu? Dê um pedal"}
            className={cn(
                "group inline-flex cursor-pointer items-center justify-center rounded-full border transition-colors disabled:cursor-default disabled:opacity-60",
                vertical ? "w-12 flex-col gap-0.5 py-2" : "h-9 gap-1.5 px-3",
                pedalou ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
        >
            <Bike className={cn("size-5 transition-transform", !proprio && "group-hover:-rotate-6", pedalou && "stroke-[2.5]")} aria-hidden="true" />
            <span className="type-label tabular-nums">{total}</span>
        </button>
    )
}

type PublicacaoProps = {
    post: ForumPost
    categoria?: ForumCategory
    /** Id do usuário logado no backend; null para visitante. */
    meuId: string | null
    /** Votos já dados pelo usuário, por id de publicação ou resposta. */
    votos: Record<string, Voto>
    /** Pede confirmação e, se confirmada, exclui a publicação ou resposta. */
    onExcluir: (alvo: ForumPost, depois: () => void) => void
    onRemovida: () => void
}

function Publicacao({ post, categoria, meuId, votos, onExcluir, onRemovida }: PublicacaoProps) {
    const [aberta, setAberta] = useState(false)
    const longa = post.content.length > 320
    const minha = meuId === post.userId

    const ehDuvida = categoria?.slug === "duvidas"
    // Na oficina (dúvidas, mecânica, equipamento) quem perguntou marca a resposta que resolveu
    const oficina = OFICINA.has(categoria?.slug ?? "")
    const [resolvida, setResolvida] = useState(Boolean(post.isSolution))

    const [respostas, setRespostas] = useState<ForumPost[] | null>(null)
    // A que resolveu vem primeiro; o resto na ordem da conversa
    const ordenadas = useMemo(
        () => (respostas ? [...respostas].sort((a, b) => Number(Boolean(b.isSolution)) - Number(Boolean(a.isSolution))) : null),
        [respostas],
    )

    async function marcarResolveu(resposta: ForumPost) {
        setErro(null)
        try {
            await forumService.marcarResolveu(resposta.id)
            const agora = !resposta.isSolution
            setRespostas((atuais) => atuais?.map((r) => ({ ...r, isSolution: r.id === resposta.id ? agora : false })) ?? null)
            setResolvida(agora)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível marcar a resposta."))
        }
    }
    const [totalRespostas, setTotalRespostas] = useState(post.replyCount ?? 0)
    const [mostrarRespostas, setMostrarRespostas] = useState(false)
    const [texto, setTexto] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    async function alternarRespostas() {
        setMostrarRespostas(!mostrarRespostas)
        if (respostas) return
        try {
            setRespostas(await forumService.respostas(post.id))
        } catch {
            setErro("Não foi possível carregar as respostas.")
        }
    }

    /** Resposta a uma resposta: fica na mesma conversa, começando com @Nome. */
    function responderA(resposta: ForumPost) {
        const mencao = `@${resposta.userName.trim().split(/\s+/)[0] || "Usuário"} `
        setTexto((atual) => (atual.startsWith(mencao) ? atual : mencao + atual))
        const campo = document.getElementById(`resposta-${post.id}`) as HTMLTextAreaElement | null
        campo?.focus()
        requestAnimationFrame(() => campo?.setSelectionRange(campo.value.length, campo.value.length))
    }

    async function responder(event: React.FormEvent) {
        event.preventDefault()
        setEnviando(true)
        setErro(null)
        try {
            const nova = await forumService.responder(post, texto.trim())
            setRespostas([...(respostas ?? []), nova])
            setTotalRespostas(totalRespostas + 1)
            setTexto("")
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível responder. Tente novamente."))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <article className="flex gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/30 sm:gap-4 sm:p-5">
            <div className="-ml-1 hidden sm:block">
                <Pedal post={post} meuId={meuId} votoSalvo={votos[post.id] ?? null} onErro={setErro} vertical />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="type-caption inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                        <IconeCategoria slug={categoria?.slug} className="size-3.5" />
                        {post.categoryName}
                    </span>
                    {oficina &&
                        (resolvida ? (
                            <StatusBadge tone="success">
                                <CircleCheck className="size-3.5" aria-hidden="true" />
                                Resolvida
                            </StatusBadge>
                        ) : totalRespostas === 0 ? (
                            <StatusBadge tone="warning">Esperando ajuda</StatusBadge>
                        ) : (
                            <StatusBadge tone="info">Em aberto</StatusBadge>
                        ))}
                </div>

                <h2 className="type-h3 mt-2 break-words text-foreground">{post.title}</h2>

                <div className="type-caption mt-2 flex items-center gap-2 text-muted-foreground">
                    <Iniciais nome={post.userName} className="size-6" />
                    <span className="font-medium text-foreground">{post.userName}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.createdAt}>{tempoAtras(post.createdAt)}</time>
                </div>

                <p className={cn("type-body mt-3 whitespace-pre-line break-words text-foreground/90", longa && !aberta && "line-clamp-4")}>{post.content}</p>
                {longa && (
                    <button type="button" onClick={() => setAberta(!aberta)} className="type-label mt-2 cursor-pointer text-primary hover:underline">
                        {aberta ? "Mostrar menos" : "Ler mais"}
                    </button>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3">
                    <div className="sm:hidden">
                        <Pedal post={post} meuId={meuId} votoSalvo={votos[post.id] ?? null} onErro={setErro} />
                    </div>
                    <button type="button" onClick={alternarRespostas} aria-expanded={mostrarRespostas} className={cn(botaoAcao, "-ml-2.5 max-sm:ml-1")}>
                        <MessageSquare className="size-4" aria-hidden="true" />
                        {totalRespostas === 0 ? (ehDuvida ? "Responder" : "Comentar") : totalRespostas === 1 ? "1 resposta" : `${totalRespostas} respostas`}
                    </button>
                    {minha && (
                        <button type="button" onClick={() => onExcluir(post, onRemovida)} className={cn(botaoAcao, "ml-auto hover:text-destructive")}>
                            <Trash2 className="size-4" aria-hidden="true" />
                            Excluir
                        </button>
                    )}
                </div>

                {erro && (
                    <p role="alert" className="type-body-small mt-3 text-destructive">
                        {erro}
                    </p>
                )}

                {mostrarRespostas && (
                    <div className="mt-4 flex flex-col gap-3 border-l-2 border-border pl-4">
                        {!respostas && !erro && <Loader className="py-4" />}
                        {ordenadas?.map((resposta) => (
                            <div
                                key={resposta.id}
                                className={cn(
                                    "rounded-xl px-4 py-3",
                                    resposta.isSolution ? "border border-success/40 bg-success/5" : "bg-surface-muted/60",
                                )}
                            >
                                {resposta.isSolution && (
                                    <p className="type-caption mb-1.5 inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-success">
                                        <CircleCheck className="size-3.5" aria-hidden="true" />
                                        Resolveu
                                    </p>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <p className="type-caption flex items-center gap-2 text-muted-foreground">
                                        <Iniciais nome={resposta.userName} className="size-5 text-[0.625rem]" />
                                        <span className="font-medium text-foreground">{resposta.userName}</span>
                                        <span aria-hidden="true">·</span>
                                        {tempoAtras(resposta.createdAt)}
                                    </p>
                                    {meuId === resposta.userId && (
                                        <button
                                            type="button"
                                            aria-label="Excluir resposta"
                                            onClick={() =>
                                                onExcluir(resposta, () => {
                                                    setRespostas((atuais) => atuais?.filter((r) => r.id !== resposta.id) ?? null)
                                                    setTotalRespostas((total) => Math.max(total - 1, 0))
                                                })
                                            }
                                            className="cursor-pointer rounded-full p-1.5 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="size-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                                <p className="type-body-small mt-1.5 whitespace-pre-line break-words text-foreground">{resposta.content}</p>
                                <div className="-ml-1.5 mt-1 flex items-center gap-1">
                                    <Pedal post={resposta} meuId={meuId} votoSalvo={votos[resposta.id] ?? null} onErro={setErro} />
                                    {meuId && (
                                        <button type="button" onClick={() => responderA(resposta)} className={botaoAcao}>
                                            Responder
                                        </button>
                                    )}
                                    {minha && oficina && resposta.userId !== meuId && (
                                        <button
                                            type="button"
                                            onClick={() => marcarResolveu(resposta)}
                                            aria-pressed={Boolean(resposta.isSolution)}
                                            className={cn(botaoAcao, resposta.isSolution ? "text-success" : "hover:text-success")}
                                        >
                                            <CircleCheck className="size-4" aria-hidden="true" />
                                            {resposta.isSolution ? "Desmarcar" : "Resolveu"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {meuId ? (
                            <form onSubmit={responder} className="flex flex-col gap-2">
                                <Label htmlFor={`resposta-${post.id}`} className="sr-only">
                                    Sua resposta
                                </Label>
                                <Textarea
                                    id={`resposta-${post.id}`}
                                    rows={2}
                                    maxLength={50000}
                                    placeholder={ehDuvida ? "Ajude com uma resposta" : "Escreva uma resposta"}
                                    value={texto}
                                    onChange={(e) => setTexto(e.target.value)}
                                />
                                <Button type="submit" size="sm" className="self-end" loading={enviando} disabled={!texto.trim()}>
                                    Responder
                                </Button>
                            </form>
                        ) : (
                            <a href={ENTRAR} className="type-label text-primary hover:underline">
                                Entre para responder
                            </a>
                        )}
                    </div>
                )}
            </div>
        </article>
    )
}

export default function ForumPage() {
    const { isSignedIn } = useUser()
    const [categorias, setCategorias] = useState<ForumCategory[] | null>(null)
    const [filtro, setFiltro] = useState(TODAS)
    const [ordem, setOrdem] = useState<Ordem>("recentes")
    const [posts, setPosts] = useState<ForumPost[] | null>(null)
    const [falhou, setFalhou] = useState(false)

    const [escrevendo, setEscrevendo] = useState(false)
    const [categoriaId, setCategoriaId] = useState("")
    const [titulo, setTitulo] = useState("")
    const [conteudo, setConteudo] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const [meuId, setMeuId] = useState<string | null>(null)
    const [votos, setVotos] = useState<Record<string, Voto>>({})
    const [excluindo, setExcluindo] = useState<{ alvo: ForumPost; depois: () => void } | null>(null)

    const porId = useMemo(() => new Map((categorias ?? []).map((c) => [c.id, c])), [categorias])
    const duvidas = categorias?.find((c) => c.slug === "duvidas")

    useEffect(() => {
        if (!isSignedIn) return
        api.get("/api/users/me").then(({ data }) => setMeuId(String(data.userId ?? data.id))).catch(() => {})
        forumService.meusVotos().then(setVotos).catch(() => {})
    }, [isSignedIn])

    async function confirmarExclusao() {
        if (!excluindo) return
        const { alvo, depois } = excluindo
        setExcluindo(null)
        try {
            await forumService.excluir(alvo.id)
            depois()
        } catch {
            setFalhou(true)
        }
    }

    const carregar = useCallback(async () => {
        setFalhou(false)
        setPosts(null)
        try {
            setPosts(await forumService.listar(filtro || undefined))
        } catch {
            setFalhou(true)
        }
    }, [filtro])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- recarrega ao trocar de categoria
        void carregar()
    }, [carregar])

    useEffect(() => {
        let ativo = true
        // O backend no Render pode estar acordando: sem categorias ninguém consegue publicar
        void (async () => {
            for (let tentativa = 0; tentativa < 4 && ativo; tentativa++) {
                try {
                    const lista = await forumService.categorias()
                    if (ativo) setCategorias(lista)
                    return
                } catch {
                    await new Promise((resolve) => setTimeout(resolve, 4000 * (tentativa + 1)))
                }
            }
            if (ativo) setCategorias([])
        })()
        return () => {
            ativo = false
        }
    }, [])

    const visiveis = useMemo(() => {
        const lista = [...(posts ?? [])]
        if (ordem === "alta") return lista.sort((a, b) => (b.karmaTotal ?? 0) + (b.replyCount ?? 0) - ((a.karmaTotal ?? 0) + (a.replyCount ?? 0)))
        if (ordem === "sem-resposta") return lista.filter((p) => (p.replyCount ?? 0) === 0)
        return lista
    }, [posts, ordem])

    function abrirFormulario(categoriaInicial?: string) {
        if (!isSignedIn) {
            window.location.assign(ENTRAR)
            return
        }
        setErro(null)
        setCategoriaId(categoriaInicial || filtro || categorias?.[0]?.id || "")
        setEscrevendo(true)
    }

    async function publicar(event: React.FormEvent) {
        event.preventDefault()
        setEnviando(true)
        setErro(null)
        try {
            await forumService.publicar({ categoryId: categoriaId, title: titulo.trim(), content: conteudo.trim() })
            setTitulo("")
            setConteudo("")
            setEscrevendo(false)
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível publicar. Tente novamente."))
        } finally {
            setEnviando(false)
        }
    }

    const perguntando = categoriaId !== "" && categoriaId === duvidas?.id

    return (
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6">
            <BackButton href="/" label="Início" className="-ml-2.5" />

            {/* ===== Topo ===== */}
            <section aria-labelledby="comunidade-title" className="relative mt-3 overflow-hidden rounded-2xl border border-border bg-[#0d0d0d] text-white">
                {/* Foto de trilha ao fundo: a comunidade é de quem pedala */}
                {/* eslint-disable-next-line @next/next/no-img-element -- imagem local decorativa */}
                <img src="/images/mountain-poster.png" alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover opacity-45" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
                <div className="relative px-5 py-8 sm:px-8 sm:py-11">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-xl">
                            <p className="type-caption flex items-center gap-1.5 font-semibold uppercase tracking-[0.16em] text-primary">
                                <Users className="size-4" aria-hidden="true" />
                                Comunidade Imperium
                            </p>
                            <h1 id="comunidade-title" className="type-h1 mt-2 text-white">
                                Oficina, trilha e resenha
                            </h1>
                            <p className="type-body mt-2 text-white/75">
                                Leve a dúvida de mecânica para a oficina, conte do pedal de hoje e fique por dentro do mundo da bike. Ninguém pedala
                                sozinho.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {duvidas && (
                                <Button onClick={() => abrirFormulario(duvidas.id)}>
                                    <Wrench aria-hidden="true" />
                                    Levar para a oficina
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => abrirFormulario()}
                                disabled={!categorias?.length}
                                className="border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                            >
                                <PenLine aria-hidden="true" />
                                Contar do pedal
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="min-w-0">
                    {/* Categorias */}
                    <div role="group" aria-label="Categorias" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
                        {categorias === null
                            ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />)
                            : [{ id: TODAS, name: "Tudo", slug: "" } as ForumCategory, ...categorias].map((categoria) => {
                                  const slug = categoria.id === TODAS ? undefined : categoria.slug
                                  const ativa = filtro === categoria.id
                                  return (
                                      <button
                                          key={categoria.id}
                                          type="button"
                                          aria-pressed={ativa}
                                          onClick={() => setFiltro(categoria.id)}
                                          className={cn(
                                              "type-label inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 transition-colors",
                                              ativa
                                                  ? "border-foreground bg-foreground text-background"
                                                  : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground",
                                          )}
                                      >
                                          <IconeCategoria slug={slug} className="size-4" />
                                          {categoria.name}
                                      </button>
                                  )
                              })}
                    </div>

                    {/* Ordenação */}
                    <div role="group" aria-label="Ordenar" className="mt-4 flex gap-5 border-b border-border">
                        {ORDENS.map(({ value, label, icon: Icone }) => (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={ordem === value}
                                onClick={() => setOrdem(value)}
                                className={cn(
                                    "type-label -mb-px inline-flex cursor-pointer items-center gap-1.5 border-b-2 pb-3 pt-1 transition-colors",
                                    ordem === value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                            >
                                <Icone className="size-4" aria-hidden="true" />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="mt-5 flex flex-col gap-4">
                        {falhou && <ErrorState onRetry={carregar} />}
                        {!falhou && !posts && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
                        {posts && visiveis.length === 0 && (
                            <EmptyState
                                icon={ordem === "sem-resposta" ? CircleHelp : MessagesSquare}
                                title={ordem === "sem-resposta" ? "Ninguém parado no acostamento" : "Pista livre por aqui"}
                                description={ordem === "sem-resposta" ? "Todas as perguntas já tiveram ajuda." : "Puxe o pelotão: leve uma dúvida para a oficina ou conte do seu pedal."}
                                className="rounded-2xl border border-dashed border-border"
                            />
                        )}
                        {visiveis.map((post) => (
                            <Publicacao
                                key={post.id}
                                post={post}
                                categoria={porId.get(post.categoryId)}
                                meuId={isSignedIn ? meuId : null}
                                votos={votos}
                                onExcluir={(alvo, depois) => setExcluindo({ alvo, depois })}
                                onRemovida={() => setPosts((atuais) => atuais?.filter((p) => p.id !== post.id) ?? null)}
                            />
                        ))}
                    </div>
                </div>

                {/* ===== Lateral ===== */}
                <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
                    <section aria-labelledby="regras-title" className="rounded-2xl border border-border bg-surface p-5">
                        <h2 id="regras-title" className="type-label text-foreground">
                            Regras do pedal
                        </h2>
                        <ul className="type-body-small mt-3 flex flex-col gap-2.5 text-muted-foreground">
                            <li>No título, diga o problema e o modelo da bike ou da peça.</li>
                            <li className="flex gap-2">
                                <Bike className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                                <span>Ajudou ou curtiu? Dê um pedal. Aqui não tem voto negativo: discordou, responda explicando.</span>
                            </li>
                            <li className="flex gap-2">
                                <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                                <span>Deu certo? Marque a resposta que resolveu: ela fica no topo para o próximo ciclista.</span>
                            </li>
                            <li>Respeito sempre. Golpes, ofensas e pedido de pagamento por fora saem.</li>
                        </ul>
                    </section>

                    {categorias && categorias.length > 0 && (
                        <section aria-labelledby="cats-title" className="hidden rounded-2xl border border-border bg-surface p-5 lg:block">
                            <h2 id="cats-title" className="type-label text-foreground">
                                Categorias
                            </h2>
                            <ul className="mt-3 flex flex-col gap-1">
                                {categorias.map((c) => {

                                    return (
                                        <li key={c.id}>
                                            <button
                                                type="button"
                                                onClick={() => setFiltro(c.id)}
                                                className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-muted"
                                            >
                                                <IconeCategoria slug={c.slug} className="mt-0.5 size-4 shrink-0 text-primary" />
                                                <span className="min-w-0">
                                                    <span className="type-label block text-foreground">{c.name}</span>
                                                    {c.description && <span className="type-caption block text-muted-foreground">{c.description}</span>}
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </section>
                    )}
                </aside>
            </div>

            <AlertDialog open={excluindo !== null} onOpenChange={(open) => !open && setExcluindo(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir {excluindo?.alvo.title ? "publicação" : "resposta"}?</AlertDialogTitle>
                        <AlertDialogDescription>Ela some para todos e não dá para desfazer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmarExclusao}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={escrevendo} onOpenChange={(open) => !enviando && setEscrevendo(open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{perguntando ? "Levar para a oficina" : "Contar do pedal"}</DialogTitle>
                        <DialogDescription>
                            {perguntando ? "Explique o problema com detalhes: quanto mais claro, melhores as respostas." : "Aparece para todos assim que você publicar."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={publicar} className="flex flex-col gap-4">
                        <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <legend className="type-label mb-2 text-foreground">Categoria</legend>
                            {(categorias ?? []).map((categoria) => (
                                <RadioCard
                                    key={categoria.id}
                                    name="categoria"
                                    value={categoria.id}
                                    checked={categoriaId === categoria.id}
                                    onChange={() => setCategoriaId(categoria.id)}
                                >
                                    {categoria.name}
                                </RadioCard>
                            ))}
                        </fieldset>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="post-titulo">{perguntando ? "Sua pergunta" : "Título"}</Label>
                            <Input
                                id="post-titulo"
                                required
                                minLength={5}
                                maxLength={255}
                                placeholder={perguntando ? "Ex.: Freio hidráulico Shimano MT200 perdendo força" : ""}
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="post-conteudo">{perguntando ? "Detalhes" : "Texto"}</Label>
                            <Textarea id="post-conteudo" required rows={6} maxLength={50000} value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
                        </div>
                        {erro && (
                            <p role="alert" className="type-body-small rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                                {erro}
                            </p>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEscrevendo(false)} disabled={enviando}>
                                Cancelar
                            </Button>
                            <Button type="submit" loading={enviando} disabled={!categoriaId || titulo.trim().length < 5 || !conteudo.trim()}>
                                {perguntando ? "Perguntar" : "Publicar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </main>
    )
}
