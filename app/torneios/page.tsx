// app/torneios/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Search, Plus, Trophy, MapPin, Calendar, Users, Flame, Clock, Filter, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const torneiosFake = [
    {
        id: "1",
        nome: "Downhill Cup 2026",
        modalidade: "Downhill",
        data: "15 Ago 2026",
        local: "Campos do Jordão, SP",
        participantes: 32,
        maxParticipantes: 48,
        valor: "R$ 89,90",
        status: "aberto",
        banner: "/images/torneio-1.png",
        organizador: "@pedalpesado",
        premiacao: "R$ 5.000",
        diasRestantes: 12,
    },
    {
        id: "2",
        nome: "Mountain Challenge",
        modalidade: "Mountain Bike",
        data: "03 Set 2026",
        local: "Monte Verde, MG",
        participantes: 18,
        maxParticipantes: 30,
        valor: "Grátis",
        status: "aberto",
        banner: "/images/torneio-2.png",
        organizador: "@trilheirapro",
        premiacao: "R$ 3.000",
        diasRestantes: 31,
    },
    {
        id: "3",
        nome: "Speed Elite Race",
        modalidade: "Speed",
        data: "22 Out 2026",
        local: "Rio de Janeiro, RJ",
        participantes: 45,
        maxParticipantes: 50,
        valor: "R$ 120,00",
        status: "quase_cheio",
        banner: "/images/torneio-3.png",
        organizador: "@velocista",
        premiacao: "R$ 8.000",
        diasRestantes: 80,
    },
    {
        id: "4",
        nome: "Urban Street Session",
        modalidade: "Urbana",
        data: "10 Jul 2026",
        local: "São Paulo, SP",
        participantes: 24,
        maxParticipantes: 40,
        valor: "R$ 49,90",
        status: "encerrado",
        banner: "/images/torneio-4.png",
        organizador: "@urbanrider",
        premiacao: "R$ 2.500",
        diasRestantes: 0,
    },
]

type FiltroStatus = "todos" | "aberto" | "andamento" | "encerrado"

export default function TorneiosPage() {
    const [filtro, setFiltro] = useState<FiltroStatus>("todos")
    const [busca, setBusca] = useState("")
    const [modalidadeFiltro, setModalidadeFiltro] = useState<string>("todas")

    const modalidades = ["todas", "Downhill", "Mountain Bike", "Speed", "BMX", "Urbana"]

    const torneiosFiltrados = torneiosFake.filter((t) => {
        const matchStatus = filtro === "todos" ||
            (filtro === "aberto" && t.status !== "encerrado") ||
            (filtro === "andamento" && t.status === "andamento") ||
            (filtro === "encerrado" && t.status === "encerrado")
        const matchBusca = t.nome.toLowerCase().includes(busca.toLowerCase())
        const matchModalidade = modalidadeFiltro === "todas" || t.modalidade === modalidadeFiltro
        return matchStatus && matchBusca && matchModalidade
    })

    return (
        <div className="min-h-screen bg-background">
            <Header onMenuClick={() => {}} cartCount={0} notificationCount={0} />

            {/* Hero torneios */}
            <section className="bg-gradient-to-b from-primary/10 to-background">
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="font-blackletter text-3xl text-primary">Torneios</h1>
                            <p className="text-sm text-muted-foreground mt-1">Compita, vença e conquiste sua glória</p>
                        </div>
                        <Link
                            href="/torneios/criar"
                            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            <Plus className="size-4" />
                            Criar torneio
                        </Link>
                    </div>

                    {/* Busca */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar torneio..."
                            className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-sm outline-none focus:border-primary/30"
                        />
                    </div>
                </div>
            </section>

            {/* Filtros */}
            <section className="mx-auto max-w-7xl px-4 py-4">
                <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
                    {[
                        { key: "todos", label: "Todos" },
                        { key: "aberto", label: "Inscrições abertas" },
                        { key: "andamento", label: "Em andamento" },
                        { key: "encerrado", label: "Encerrados" },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFiltro(f.key as FiltroStatus)}
                            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                                filtro === f.key
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}

                    <div className="w-px bg-border shrink-0" />

                    {modalidades.map((m) => (
                        <button
                            key={m}
                            onClick={() => setModalidadeFiltro(m)}
                            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                                modalidadeFiltro === m
                                    ? "bg-imperial text-imperial-foreground"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {m === "todas" ? "Todas modalidades" : m}
                        </button>
                    ))}
                </div>
            </section>

            {/* Lista de torneios */}
            <section className="mx-auto max-w-7xl px-4 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {torneiosFiltrados.length === 0 && (
                        <div className="col-span-full text-center py-12">
                            <Trophy className="size-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">Nenhum torneio encontrado</p>
                        </div>
                    )}

                    {torneiosFiltrados.map((torneio) => (
                        <Link
                            key={torneio.id}
                            href={`/torneios/${torneio.id}`}
                            className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
                        >
                            {/* Banner */}
                            <div className="relative h-40 bg-secondary overflow-hidden">
                                <img
                                    src={torneio.banner || "/placeholder.svg"}
                                    alt={torneio.nome}
                                    className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                {/* Status badge */}
                                <div className="absolute top-3 left-3">
                                    {torneio.status === "aberto" && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/90 px-2.5 py-1 text-[0.6rem] font-bold text-white uppercase">
                                            <span className="size-1.5 rounded-full bg-white animate-pulse" />
                                            Inscrições abertas
                                        </span>
                                    )}
                                    {torneio.status === "quase_cheio" && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/90 px-2.5 py-1 text-[0.6rem] font-bold text-white uppercase">
                                            <Flame className="size-3" />
                                            Quase cheio
                                        </span>
                                    )}
                                    {torneio.status === "encerrado" && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/90 px-2.5 py-1 text-[0.6rem] font-bold text-white uppercase">
                                            Encerrado
                                        </span>
                                    )}
                                </div>

                                {/* Modalidade */}
                                <div className="absolute top-3 right-3">
                                    <span className="rounded-full bg-white/20 backdrop-blur px-2.5 py-1 text-[0.6rem] font-semibold text-white uppercase">
                                        {torneio.modalidade}
                                    </span>
                                </div>

                                {/* Info overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <h3 className="font-heading text-base font-bold text-white leading-tight">
                                        {torneio.nome}
                                    </h3>
                                </div>
                            </div>

                            {/* Detalhes */}
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="size-3.5" />
                                        {torneio.data}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="size-3.5" />
                                        <span className="truncate">{torneio.local.split(",")[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="size-3.5" />
                                        {torneio.participantes}/{torneio.maxParticipantes}
                                    </div>
                                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                        <Trophy className="size-3.5 text-primary" />
                                        {torneio.premiacao}
                                    </div>
                                </div>

                                {/* Barra de progresso */}
                                <div>
                                    <div className="flex items-center justify-between text-[0.6rem] text-muted-foreground mb-1">
                                        <span>Vagas preenchidas</span>
                                        <span>{Math.round((torneio.participantes / torneio.maxParticipantes) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                torneio.participantes / torneio.maxParticipantes > 0.8
                                                    ? "bg-red-500"
                                                    : torneio.participantes / torneio.maxParticipantes > 0.5
                                                        ? "bg-yellow-500"
                                                        : "bg-green-500"
                                            }`}
                                            style={{ width: `${(torneio.participantes / torneio.maxParticipantes) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-muted-foreground">por</span>
                                        <span className="text-xs font-medium text-foreground">{torneio.organizador}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-primary">{torneio.valor}</span>
                                        <ChevronRight className="size-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}