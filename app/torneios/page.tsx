// app/torneios/page.tsx
"use client"

import { BottomNav } from "@/components/layout/bottom-nav"
import { Search, Plus, Trophy, MapPin, Calendar, Users, Flame, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { tournamentService } from "@/services/tournamentService"

interface TournamentCard {
    id: string
    nome: string
    modalidade: string
    data: string
    local: string
    participantes: number
    maxParticipantes: number
    valor: string
    status: string
    banner: string
    organizador: string
    premiacao: string
}

function tournamentCards(payload: unknown): TournamentCard[] {
    const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {}
    const rawItems = Array.isArray(payload) ? payload : [root.content, root.items, root.data].find(Array.isArray) ?? []
    return rawItems.flatMap((value): TournamentCard[] => {
        if (!value || typeof value !== "object") return []
        const item = value as Record<string, unknown>
        const id = item.id
        const name = item.name ?? item.nome ?? item.title
        if (id == null || typeof name !== "string") return []
        const rawStatus = String(item.status ?? "open").toLowerCase()
        const status = /closed|ended|encerr|finaliz/.test(rawStatus) ? "encerrado" : /progress|live|andamento/.test(rawStatus) ? "andamento" : "aberto"
        const dateValue = item.startDate ?? item.dataInicio ?? item.date ?? item.data
        const parsedDate = dateValue ? new Date(String(dateValue)) : null
        const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "Data a confirmar"
        const price = Number(item.entryFee ?? item.valorInscricao ?? item.price ?? 0)
        return [{
            id: String(id), nome: name, modalidade: String(item.modality ?? item.modalidade ?? "Ciclismo"), data: date,
            local: String(item.location ?? item.local ?? item.city ?? "Local a confirmar"),
            participantes: Number(item.participantsCount ?? item.participantes ?? item.participants ?? 0),
            maxParticipantes: Math.max(1, Number(item.maxParticipants ?? item.maxParticipantes ?? 1)),
            valor: price > 0 ? price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Grátis",
            status, banner: String(item.bannerUrl ?? item.banner ?? "/placeholder.svg"),
            organizador: String(item.organizerUsername ?? item.organizer ?? item.organizador ?? "Organizador"),
            premiacao: String(item.prize ?? item.premiacao ?? "Premiação a confirmar"),
        }]
    })
}

type FiltroStatus = "todos" | "aberto" | "andamento" | "encerrado"

export default function TorneiosPage() {
    const [filtro, setFiltro] = useState<FiltroStatus>("todos")
    const [busca, setBusca] = useState("")
    const [modalidadeFiltro, setModalidadeFiltro] = useState<string>("todas")
    const [torneios, setTorneios] = useState<TournamentCard[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        tournamentService.listar({ page: 0 }).then((result) => {
            if (active) setTorneios(tournamentCards(result))
        }).catch(() => {
            if (active) setErro("Não foi possível carregar os torneios. Tente novamente mais tarde.")
        }).finally(() => { if (active) setCarregando(false) })
        return () => { active = false }
    }, [])

    const modalidades = ["todas", "Downhill", "Mountain Bike", "Speed", "BMX", "Urbana"]

    const torneiosFiltrados = torneios.filter((t) => {
        const matchStatus = filtro === "todos" ||
            (filtro === "aberto" && t.status === "aberto") ||
            (filtro === "andamento" && t.status === "andamento") ||
            (filtro === "encerrado" && t.status === "encerrado")
        const matchBusca = t.nome.toLowerCase().includes(busca.toLowerCase())
        const matchModalidade = modalidadeFiltro === "todas" || t.modalidade === modalidadeFiltro
        return matchStatus && matchBusca && matchModalidade
    })

    return (
        <div className="min-h-screen bg-background">
            {/* Header próprio do torneio (sem busca) */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                        <Link href="/" className="flex shrink-0 flex-col leading-none">
                            <span className="font-blackletter text-2xl leading-none text-primary">Imperium</span>
                            <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-marble-foreground/70">Bikes</span>
                        </Link>
                        <Link href="/torneios/criar" className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Plus className="size-3.5" />
                            Criar torneio
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6">
                {/* Título */}
                <div className="mb-6">
                    <h1 className="font-blackletter text-3xl text-primary">Torneios</h1>
                    <p className="text-sm text-muted-foreground mt-1">Compita, vença e conquiste sua glória</p>
                </div>

                {/* Busca */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar torneio..." className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-sm outline-none focus:border-primary/30" />
                </div>

                {/* Filtros */}
                <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none]">
                    {[
                        { key: "todos", label: "Todos" },
                        { key: "aberto", label: "Inscrições abertas" },
                        { key: "andamento", label: "Em andamento" },
                        { key: "encerrado", label: "Encerrados" },
                    ].map((f) => (
                        <button key={f.key} onClick={() => setFiltro(f.key as FiltroStatus)}
                                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${filtro === f.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                            {f.label}
                        </button>
                    ))}
                    <div className="w-px bg-border shrink-0" />
                    {modalidades.map((m) => (
                        <button key={m} onClick={() => setModalidadeFiltro(m)}
                                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${modalidadeFiltro === m ? "bg-imperial text-imperial-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
                            {m === "todas" ? "Todas" : m}
                        </button>
                    ))}
                </div>

                {/* Lista */}
                {erro && <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{erro}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {carregando && <p className="col-span-full py-12 text-center text-sm text-muted-foreground">Carregando torneios...</p>}
                    {!carregando && !erro && torneiosFiltrados.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <Trophy className="size-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">Nenhum torneio encontrado</p>
                        </div>
                    )}
                    {torneiosFiltrados.map((torneio) => (
                        <Link key={torneio.id} href={`/torneios/${torneio.id}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all">
                            <div className="relative h-40 bg-secondary overflow-hidden">
                                <img src={torneio.banner || "/placeholder.svg"} alt={torneio.nome} className="size-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-3 left-3">
                                    {torneio.status === "aberto" && <span className="inline-flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-[0.6rem] font-bold text-white uppercase"><span className="size-1.5 rounded-full bg-white animate-pulse" />Inscrições abertas</span>}
                                    {torneio.status === "quase_cheio" && <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/90 px-2.5 py-1 text-[0.6rem] font-bold text-white uppercase"><Flame className="size-3" />Quase cheio</span>}
                                    {torneio.status === "encerrado" && <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/90 px-2.5 py-1 text-[0.6rem] font-bold text-white uppercase">Encerrado</span>}
                                </div>
                                <div className="absolute top-3 right-3"><span className="rounded-full bg-white/20 backdrop-blur px-2.5 py-1 text-[0.6rem] font-semibold text-white uppercase">{torneio.modalidade}</span></div>
                                <div className="absolute bottom-0 left-0 right-0 p-3"><h3 className="font-heading text-base font-bold text-white leading-tight">{torneio.nome}</h3></div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5"><Calendar className="size-3.5" />{torneio.data}</div>
                                    <div className="flex items-center gap-1.5"><MapPin className="size-3.5" /><span className="truncate">{torneio.local.split(",")[0]}</span></div>
                                    <div className="flex items-center gap-1.5"><Users className="size-3.5" />{torneio.participantes}/{torneio.maxParticipantes}</div>
                                    <div className="flex items-center gap-1.5 font-semibold text-foreground"><Trophy className="size-3.5 text-primary" />{torneio.premiacao}</div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-[0.6rem] text-muted-foreground mb-1"><span>Vagas</span><span>{Math.round((torneio.participantes / torneio.maxParticipantes) * 100)}%</span></div>
                                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden"><div className={`h-full rounded-full transition-all ${torneio.participantes / torneio.maxParticipantes > 0.8 ? "bg-red-500" : torneio.participantes / torneio.maxParticipantes > 0.5 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${(torneio.participantes / torneio.maxParticipantes) * 100}%` }} /></div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <span className="text-xs text-muted-foreground">por <span className="font-medium text-foreground">{torneio.organizador}</span></span>
                                    <div className="flex items-center gap-2"><span className="text-sm font-bold text-primary">{torneio.valor}</span><ChevronRight className="size-4 text-muted-foreground" /></div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}
