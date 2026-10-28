"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { LifeBuoy } from "lucide-react"
import { toast } from "sonner"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIAS_SUPORTE, suporteService, type Chamado } from "@/lib/suporte"
import { empresa } from "@/lib/empresa"
import { mensagemDaApi } from "@/services/tournamentService"

export default function ContatoSuportePage() {
    const { isLoaded, isSignedIn } = useAuth()
    const [chamados, setChamados] = useState<Chamado[] | null>(null)

    const carregar = useCallback(async () => {
        try {
            setChamados(await suporteService.meus())
        } catch {
            setChamados([])
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
        if (isSignedIn) void carregar()
    }, [isSignedIn, carregar])

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading
                    title="Falar com o suporte"
                    description="Conte o que aconteceu. A resposta chega nas suas notificações e fica guardada aqui."
                    back={{ href: "/ajuda", label: "Ajuda" }}
                />

                {isLoaded && !isSignedIn ? (
                    <EmptyState
                        className="mt-10"
                        icon={LifeBuoy}
                        title="Entre para abrir um chamado"
                        description={empresa.emailContato ? `Sem conta? Escreva para ${empresa.emailContato}.` : "Assim a resposta chega direto para você."}
                        action={
                            <Button asChild>
                                <Link href="/sign-in?redirect_url=%2Fajuda%2Fcontato">Entrar</Link>
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <NovoChamado onAberto={carregar} />
                        <MeusChamados chamados={chamados} />
                    </>
                )}
            </main>
        </AppShell>
    )
}

function NovoChamado({ onAberto }: { onAberto: () => Promise<void> }) {
    const [categoria, setCategoria] = useState("")
    const [assunto, setAssunto] = useState("")
    const [mensagem, setMensagem] = useState("")
    const [enviando, setEnviando] = useState(false)

    // Vindo de "Sugerir uma ideia" / "Reportar erro" (?assunto=IDEIA): o assunto já vem escolhido
    useEffect(() => {
        const pedido = new URLSearchParams(window.location.search).get("assunto")
        // eslint-disable-next-line react-hooks/set-state-in-effect -- só lê a URL ao abrir
        if (pedido && CATEGORIAS_SUPORTE.some((c) => c.id === pedido)) setCategoria(pedido)
    }, [])

    async function enviar(event: React.FormEvent) {
        event.preventDefault()
        setEnviando(true)
        try {
            await suporteService.abrir({ category: categoria, subject: assunto.trim(), message: mensagem.trim() })
            toast.success("Chamado aberto. Avisaremos quando houver resposta.")
            setCategoria("")
            setAssunto("")
            setMensagem("")
            await onAberto()
        } catch (cause) {
            toast.error(mensagemDaApi(cause, "Não foi possível abrir o chamado."))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-col gap-2">
                <Label htmlFor="categoria">Assunto</Label>
                <select
                    id="categoria"
                    required
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="h-11 rounded-lg border border-input bg-surface px-3 text-base text-foreground md:text-sm"
                >
                    <option value="" disabled>
                        Escolha
                    </option>
                    {CATEGORIAS_SUPORTE.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="assunto">Título</Label>
                <Input id="assunto" required minLength={5} maxLength={120} value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex.: Não recebi meu pedido" />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="mensagem">O que aconteceu?</Label>
                <Textarea
                    id="mensagem"
                    required
                    minLength={20}
                    maxLength={4000}
                    rows={6}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    aria-describedby="mensagem-ajuda"
                    placeholder="Inclua o número do pedido, o link do anúncio ou do evento, se tiver."
                />
                <p id="mensagem-ajuda" className="type-caption text-muted-foreground">
                    Não envie senha nem dados de cartão. Nunca vamos pedir isso.
                </p>
            </div>
            <Button type="submit" loading={enviando} className="self-start">
                Enviar chamado
            </Button>
        </form>
    )
}

function MeusChamados({ chamados }: { chamados: Chamado[] | null }) {
    return (
        <section aria-labelledby="meus-titulo" className="mt-10">
            <h2 id="meus-titulo" className="type-h3 border-b border-border pb-2 text-foreground">
                Meus chamados
            </h2>
            {chamados === null ? (
                <Skeleton className="mt-4 h-24 rounded-xl" />
            ) : chamados.length === 0 ? (
                <p className="type-body-small mt-4 text-muted-foreground">Você ainda não abriu chamados.</p>
            ) : (
                <ul className="mt-4 flex flex-col gap-3">
                    {chamados.map((c) => (
                        <li key={c.id} className="rounded-xl border border-border bg-surface p-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="type-label text-foreground">{c.subject}</p>
                                <StatusBadge tone={c.status === "ANSWERED" ? "success" : "info"}>
                                    {c.status === "ANSWERED" ? "Respondido" : "Aguardando resposta"}
                                </StatusBadge>
                            </div>
                            <p className="type-caption mt-1 text-muted-foreground">
                                {new Date(c.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                            </p>
                            <p className="type-body-small mt-2 whitespace-pre-line text-muted-foreground">{c.message}</p>
                            {c.answer && (
                                <div className="mt-3 border-l-2 border-primary pl-3">
                                    <p className="type-caption font-semibold text-foreground">Resposta do suporte</p>
                                    <p className="type-body-small mt-1 whitespace-pre-line text-foreground">{c.answer}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
