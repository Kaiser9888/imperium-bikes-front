"use client"

import { useCallback, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { ArrowBigDown, ArrowBigUp, MessageSquare, Newspaper, PenLine, Trash2 } from "lucide-react"

import { PageHeading } from "@/components/layout/page-heading"
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
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import { forumService, type ForumCategory, type ForumPost, type Voto } from "@/services/forumService"
import { mensagemDaApi } from "@/services/tournamentService"

const TODAS = ""

const ENTRAR = "/sign-in?redirect_url=%2Fforum"
const dataCurta = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })

const botaoAcao = "type-label inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"

type VotosProps = {
    post: ForumPost
    meuId: string | null
    /** Voto que o usuário já tinha dado antes desta visita. */
    votoSalvo: Voto | null
    onErro: (mensagem: string | null) => void
}

/** Setas de voto com o saldo. Serve para publicação e para resposta. */
function Votos({ post, meuId, votoSalvo, onErro }: VotosProps) {
    const [saldo, setSaldo] = useState(post.karmaTotal ?? 0)
    // undefined: ainda não votou nesta visita, então vale o voto salvo no servidor
    const [votoAgora, setVotoAgora] = useState<Voto | null | undefined>(undefined)
    const meuVoto = votoAgora === undefined ? votoSalvo : votoAgora
    const proprio = meuId === post.userId

    async function votar(voto: Voto) {
        if (!meuId) return window.location.assign(ENTRAR)
        onErro(null)
        try {
            const resultado = await forumService.votar(post.id, voto)
            setSaldo(resultado.score)
            setVotoAgora(resultado.userVote)
        } catch (cause) {
            onErro(mensagemDaApi(cause, "Não foi possível registrar o voto."))
        }
    }

    return (
        <>
            <button type="button" onClick={() => votar("UP")} disabled={proprio} aria-pressed={meuVoto === "UP"} aria-label="Gostei" className={cn(botaoAcao, meuVoto === "UP" && "bg-accent/10 text-accent")}>
                <ArrowBigUp className={cn("size-5", meuVoto === "UP" && "fill-current")} aria-hidden="true" />
            </button>
            <span className="type-label min-w-6 text-center text-foreground" aria-label={`Saldo de votos: ${saldo}`}>{saldo}</span>
            <button type="button" onClick={() => votar("DOWN")} disabled={proprio} aria-pressed={meuVoto === "DOWN"} aria-label="Não gostei" className={cn(botaoAcao, meuVoto === "DOWN" && "bg-accent/10 text-accent")}>
                <ArrowBigDown className={cn("size-5", meuVoto === "DOWN" && "fill-current")} aria-hidden="true" />
            </button>
        </>
    )
}

type PublicacaoProps = {
    post: ForumPost
    /** Id do usuário logado no backend; null para visitante. */
    meuId: string | null
    /** Votos já dados pelo usuário, por id de publicação ou resposta. */
    votos: Record<string, Voto>
    /** Pede confirmação e, se confirmada, exclui a publicação ou resposta. */
    onExcluir: (alvo: ForumPost, depois: () => void) => void
    onRemovida: () => void
}

function Publicacao({ post, meuId, votos, onExcluir, onRemovida }: PublicacaoProps) {
    const [aberta, setAberta] = useState(false)
    const longa = post.content.length > 320
    const minha = meuId === post.userId

    const [respostas, setRespostas] = useState<ForumPost[] | null>(null)
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
        <article className="rounded-xl border border-border bg-surface p-5">
            <p className="type-caption font-semibold uppercase tracking-wide text-accent">{post.categoryName}</p>
            <h2 className="type-h3 mt-1 text-foreground">{post.title}</h2>
            <p className="type-caption mt-1 text-muted-foreground">
                {post.userName} · {dataCurta(post.createdAt)}
            </p>
            <p className={cn("type-body mt-3 whitespace-pre-line text-foreground", longa && !aberta && "line-clamp-4")}>{post.content}</p>
            {longa && (
                <button type="button" onClick={() => setAberta(!aberta)} className="type-label mt-2 text-primary hover:underline">
                    {aberta ? "Mostrar menos" : "Ler mais"}
                </button>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3">
                <Votos post={post} meuId={meuId} votoSalvo={votos[post.id] ?? null} onErro={setErro} />
                <button type="button" onClick={alternarRespostas} aria-expanded={mostrarRespostas} className={cn(botaoAcao, "ml-2")}>
                    <MessageSquare className="size-4" aria-hidden="true" />
                    {totalRespostas === 1 ? "1 resposta" : `${totalRespostas} respostas`}
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
                <div className="mt-4 flex flex-col gap-3">
                    {!respostas && !erro && <Loader className="py-4" />}
                    {respostas?.map((resposta) => (
                        <div key={resposta.id} className="rounded-lg bg-surface-muted px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                                <p className="type-caption text-muted-foreground">
                                    {resposta.userName} · {dataCurta(resposta.createdAt)}
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
                                        className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="size-4" aria-hidden="true" />
                                    </button>
                                )}
                            </div>
                            <p className="type-body-small mt-1 whitespace-pre-line text-foreground">{resposta.content}</p>
                            <div className="-ml-2.5 mt-1 flex items-center gap-1">
                                <Votos post={resposta} meuId={meuId} votoSalvo={votos[resposta.id] ?? null} onErro={setErro} />
                            </div>
                        </div>
                    ))}
                    {meuId ? (
                        <form onSubmit={responder} className="flex flex-col gap-2">
                            <Label htmlFor={`resposta-${post.id}`} className="sr-only">
                                Sua resposta
                            </Label>
                            <Textarea id={`resposta-${post.id}`} rows={2} maxLength={50000} placeholder="Escreva uma resposta" value={texto} onChange={(e) => setTexto(e.target.value)} />
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
        </article>
    )
}

export default function ForumPage() {
    const { isSignedIn } = useUser()
    const [categorias, setCategorias] = useState<ForumCategory[]>([])
    const [filtro, setFiltro] = useState(TODAS)
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

    useEffect(() => {
        if (!isSignedIn) return
        api.get("/api/users/me").then(({ data }) => setMeuId(data.id)).catch(() => {})
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
        forumService.categorias().then(setCategorias).catch(() => {})
    }, [])

    function abrirFormulario() {
        if (!isSignedIn) {
            window.location.assign(ENTRAR)
            return
        }
        setErro(null)
        setCategoriaId(filtro || categorias[0]?.id || "")
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

    return (
        <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <PageHeading title="Notícias e novidades" back={{ href: "/", label: "Início" }} />
                <Button variant="accent" onClick={abrirFormulario} disabled={categorias.length === 0}>
                    <PenLine aria-hidden="true" />
                    Publicar
                </Button>
            </div>

            <div role="group" aria-label="Categorias" className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {[{ id: TODAS, name: "Tudo" }, ...categorias].map((categoria) => (
                    <button
                        key={categoria.id}
                        type="button"
                        aria-pressed={filtro === categoria.id}
                        onClick={() => setFiltro(categoria.id)}
                        className={cn(
                            "type-label h-9 shrink-0 rounded-full border px-4 transition-colors",
                            filtro === categoria.id ? "border-accent bg-accent text-accent-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {categoria.name}
                    </button>
                ))}
            </div>

            <div className="mt-6 flex flex-col gap-4">
                {falhou && <ErrorState onRetry={carregar} />}
                {!falhou && !posts && <Loader className="py-16" />}
                {posts?.length === 0 && <EmptyState icon={Newspaper} title="Nada publicado ainda" description="Seja a primeira pessoa a publicar." />}
                {posts?.map((post) => (
                    <Publicacao
                        key={post.id}
                        post={post}
                        meuId={isSignedIn ? meuId : null}
                        votos={votos}
                        onExcluir={(alvo, depois) => setExcluindo({ alvo, depois })}
                        onRemovida={() => setPosts((atuais) => atuais?.filter((p) => p.id !== post.id) ?? null)}
                    />
                ))}
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
                        <DialogTitle>Nova publicação</DialogTitle>
                        <DialogDescription>Aparece para todos assim que você publicar.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={publicar} className="flex flex-col gap-4">
                        <fieldset className="grid grid-cols-2 gap-2">
                            <legend className="type-label mb-2 text-foreground">Categoria</legend>
                            {categorias.map((categoria) => (
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
                            <Label htmlFor="post-titulo">Título</Label>
                            <Input id="post-titulo" required minLength={5} maxLength={255} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="post-conteudo">Texto</Label>
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
                                Publicar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </main>
    )
}
