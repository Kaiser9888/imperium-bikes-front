// app/torneios/[id]/page.tsx
"use client"
import { Button } from "@/components/ui/button"

import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, MapPin, Calendar, Users, Trophy, DollarSign, Shield, Flame, Clock, Share2, ChevronRight, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { tournamentService } from "@/services/tournamentService"

interface TournamentDetail {
    nome: string; modalidade: string; descricao: string; regras: string; data: string; horario: string
    local: string; endereco: string; participantes: number; maxParticipantes: number; valorInscricao: number
    premiacao: string; status: string; banner: string; inscrito: boolean
    organizador: { nome: string; username: string; avatar: string; torneiosCriados: number; nota: number }
    podio: { nome: string; posicao: number }[]
}

function toTournamentDetail(payload: unknown): TournamentDetail {
    const outer = payload && typeof payload === "object" ? payload as Record<string, unknown> : {}
    const item = (outer.data && typeof outer.data === "object" ? outer.data : payload) as Record<string, unknown>
    const organizer = (item.organizer ?? item.organizador ?? {}) as Record<string, unknown>
    const statusValue = String(item.status ?? "open").toLowerCase()
    const status = /closed|ended|encerr|finaliz/.test(statusValue) ? "finalizado" : /progress|live|andamento/.test(statusValue) ? "andamento" : "aberto"
    const dateValue = item.startDate ?? item.dataInicio ?? item.date ?? item.data
    const date = dateValue ? new Date(String(dateValue)) : null
    const podium = Array.isArray(item.podium ?? item.podio) ? (item.podium ?? item.podio) as unknown[] : []
    return {
        nome: String(item.name ?? item.nome ?? item.title ?? "Torneio"),
        modalidade: String(item.modality ?? item.modalidade ?? "Ciclismo"),
        descricao: String(item.description ?? item.descricao ?? ""), regras: String(item.rules ?? item.regras ?? ""),
        data: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("pt-BR") : "Data a confirmar",
        horario: String(item.schedule ?? item.horario ?? "Horário a confirmar"),
        local: String(item.locationName ?? item.local ?? item.location ?? "Local a confirmar"),
        endereco: String(item.address ?? item.endereco ?? item.location ?? ""),
        participantes: Number(item.participantsCount ?? item.participantes ?? item.participants ?? 0),
        maxParticipantes: Math.max(1, Number(item.maxParticipants ?? item.maxParticipantes ?? 1)),
        valorInscricao: Number(item.entryFee ?? item.valorInscricao ?? item.price ?? 0),
        premiacao: String(item.prize ?? item.premiacao ?? "Premiação a confirmar"), status,
        banner: String(item.bannerUrl ?? item.banner ?? "/placeholder.svg"),
        inscrito: Boolean(item.isParticipant ?? item.inscrito),
        organizador: {
            nome: String(organizer.name ?? organizer.nome ?? "Organizador"),
            username: String(organizer.username ?? organizer.id ?? ""),
            avatar: String(organizer.avatarUrl ?? organizer.avatar ?? "/placeholder.svg"),
            torneiosCriados: Number(organizer.tournamentsCount ?? organizer.torneiosCriados ?? 0),
            nota: Number(organizer.rating ?? organizer.nota ?? 0),
        },
        podio: podium.flatMap((entry, index) => {
            if (!entry || typeof entry !== "object") return []
            const row = entry as Record<string, unknown>
            return [{ nome: String(row.name ?? row.nome ?? "Participante"), posicao: Number(row.position ?? row.posicao ?? index + 1) }]
        }),
    }
}

export default function TorneioDetalhesPage() {
    const { isSignedIn } = useUser()
    const params = useParams()
    const torneioId = params.id as string
    const numericTournamentId = Number(torneioId)
    const validTournamentId = Number.isInteger(numericTournamentId) && numericTournamentId > 0

    const [torneio, setTorneio] = useState<TournamentDetail | null>(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)
    const [inscrito, setInscrito] = useState(false)
    const [inscrevendo, setInscrevendo] = useState(false)
    const [erroInscricao, setErroInscricao] = useState<string | null>(null)
    const [mostrarRegras, setMostrarRegras] = useState(false)

    useEffect(() => {
        if (!validTournamentId) return
        let active = true
        tournamentService.buscarPorId(numericTournamentId).then((data) => {
            if (active) {
                const result = toTournamentDetail(data)
                setTorneio(result)
                setInscrito(result.inscrito)
            }
        }).catch(() => { if (active) setErro("Não foi possível carregar este torneio.") }).finally(() => { if (active) setCarregando(false) })
        return () => { active = false }
    }, [numericTournamentId, torneioId, validTournamentId])

    async function handleInscrever() {
        if (!isSignedIn) {
            window.location.assign(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        setInscrevendo(true)
        setErroInscricao(null)
        try {
            await tournamentService.inscrever(Number(torneioId))
            setInscrito(true)
        } catch {
            setErroInscricao("Não foi possível concluir sua inscrição. Tente novamente.")
        } finally {
            setInscrevendo(false)
        }
    }

    if (carregando && validTournamentId) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando torneio...</main>
    if (erro || !torneio) return <main className="grid min-h-screen place-items-center px-4 text-center"><div><p role="alert" className="text-sm text-destructive">{erro ?? (!validTournamentId ? "Torneio inválido." : "Torneio não encontrado.")}</p><Link href="/torneios" className="mt-4 inline-block underline">Voltar aos torneios</Link></div></main>

    const vagasRestantes = torneio.maxParticipantes - torneio.participantes
    const quaseCheio = vagasRestantes <= 5

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                        <Link href="/torneios" className="flex items-center gap-2 text-marble-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                            <span className="text-sm">Torneios</span>
                        </Link>
                        <h1 className="font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">Detalhes</h1>
                        <Button variant="ghost" size="icon">
                            <Share2 className="size-5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Banner */}
            <section className="relative h-64 md:h-80 overflow-hidden">
                <img src={torneio.banner} alt={torneio.nome} className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                    {torneio.status === "aberto" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white">
                            <span className="size-2 rounded-full bg-white animate-pulse" />
                            Inscrições abertas
                        </span>
                    )}
                    {torneio.status === "andamento" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-bold text-white">
                            <span className="size-2 rounded-full bg-white animate-pulse" />
                            Em andamento
                        </span>
                    )}
                    {torneio.status === "finalizado" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500 px-3 py-1.5 text-xs font-bold text-white">
                            Finalizado
                        </span>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="rounded-full bg-white/20 backdrop-blur px-3 py-1 text-[0.65rem] font-semibold text-white uppercase">
                        {torneio.modalidade}
                    </span>
                    <h1 className="mt-2 font-heading text-2xl md:text-3xl font-bold text-white">{torneio.nome}</h1>
                </div>
            </section>

            <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
                {/* Info rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { icon: Calendar, label: "Data", valor: torneio.data },
                        { icon: Clock, label: "Horário", valor: torneio.horario },
                        { icon: Users, label: "Vagas", valor: `${vagasRestantes} restantes` },
                        { icon: DollarSign, label: "Inscrição", valor: torneio.valorInscricao > 0 ? `R$ ${torneio.valorInscricao.toFixed(2)}` : "Grátis" },
                    ].map(({ icon: Icon, label, valor }) => (
                        <div key={label} className="rounded-xl bg-card border border-border p-3 text-center">
                            <Icon className="size-4 text-primary mx-auto mb-1" />
                            <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">{label}</p>
                            <p className="text-xs font-semibold text-foreground mt-0.5">{valor}</p>
                        </div>
                    ))}
                </div>

                {torneio.status === "aberto" && quaseCheio && (
                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
                        <Flame className="size-4 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800">Restam apenas <strong>{vagasRestantes} vagas</strong>! Inscreva-se antes que acabe.</p>
                    </div>
                )}

                {/* Descrição */}
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground mb-3">Sobre o torneio</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{torneio.descricao}</p>
                    <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                        <MapPin className="size-4" />
                        <span>{torneio.endereco}</span>
                    </div>
                </div>

                {/* Regras */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <button onClick={() => setMostrarRegras(!mostrarRegras)} className="w-full flex items-center justify-between p-5">
                        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">Regras</h2>
                        <ChevronRight className={`size-4 text-muted-foreground transition-transform ${mostrarRegras ? "rotate-90" : ""}`} />
                    </button>
                    {mostrarRegras && (
                        <div className="px-5 pb-5">
                            <pre className="text-sm text-muted-foreground whitespace-pre-line font-sans leading-relaxed">{torneio.regras}</pre>
                        </div>
                    )}
                </div>

                {/* Premiação */}
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground mb-3">Premiação</h2>
                    <div className="flex items-center gap-3">
                        <Trophy className="size-8 text-yellow-500" />
                        <span className="text-sm font-medium text-foreground">{torneio.premiacao}</span>
                    </div>
                </div>

                {/* Pódio */}
                {torneio.status === "finalizado" && (
                    <div className="rounded-2xl border border-border bg-card p-5">
                        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground mb-4">Pódio</h2>
                        <div className="space-y-3">
                            {torneio.podio.map((p) => (
                                <div key={p.posicao} className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                                    <div className={`flex size-9 items-center justify-center rounded-full text-sm font-bold ${
                                        p.posicao === 1 ? "bg-yellow-500 text-white" : p.posicao === 2 ? "bg-gray-400 text-white" : "bg-amber-600 text-white"
                                    }`}>
                                        {p.posicao}º
                                    </div>
                                    <span className="text-sm font-semibold">{p.nome}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Organizador */}
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground mb-3">Organizador</h2>
                    <Link href={`/perfil/${torneio.organizador.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src={torneio.organizador.avatar} alt={torneio.organizador.nome} className="size-10 rounded-full object-cover" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{torneio.organizador.nome}</p>
                            <p className="text-xs text-muted-foreground">{torneio.organizador.username}</p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="rounded-lg bg-secondary p-2 text-center">
                            <p className="font-bold text-foreground">{torneio.organizador.torneiosCriados}</p>
                            <p className="text-[0.6rem] text-muted-foreground uppercase">Torneios</p>
                        </div>
                        <div className="rounded-lg bg-secondary p-2 text-center flex items-center justify-center gap-1">
                            <Star className="size-3 fill-yellow-500 text-yellow-500" />
                            <p className="font-bold text-foreground">{torneio.organizador.nota}</p>
                            <p className="text-[0.6rem] text-muted-foreground uppercase">Nota</p>
                        </div>
                    </div>
                </div>

                {/* Comissão */}
                {torneio.valorInscricao > 0 && (
                    <div className="rounded-xl bg-secondary/50 p-3 flex items-start gap-2">
                        <Shield className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-[0.65rem] text-muted-foreground">
                            Pagamento seguro via Stripe. O valor fica retido e só é liberado ao organizador 24h após o torneio.
                        </p>
                    </div>
                )}

                {/* Botão de inscrição */}
                {torneio.status === "aberto" && (
                    <div className="fixed bottom-20 left-0 right-0 px-4 z-30 md:static md:px-0">
                        {inscrito ? (
                            <div className="flex items-center justify-between rounded-2xl bg-green-50 border border-green-200 p-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="size-5 text-green-600" />
                                    <span className="text-sm font-semibold text-green-700">Inscrito!</span>
                                </div>
                                <span className="text-xs text-muted-foreground">Sua inscrição foi enviada.</span>
                            </div>
                        ) : (
                            <Button disabled={inscrevendo} onClick={handleInscrever} size="lg" className="w-full">
                                {inscrevendo ? "Enviando inscrição..." : `Inscrever-se • ${torneio.valorInscricao > 0 ? `R$ ${torneio.valorInscricao.toFixed(2)}` : "Grátis"}`}
                            </Button>
                        )}
                        {erroInscricao && <p role="alert" className="mt-2 text-center text-sm text-destructive">{erroInscricao}</p>}
                    </div>
                )}
            </main>

            <div className="pb-32 md:pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}
