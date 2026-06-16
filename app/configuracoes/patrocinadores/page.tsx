// app/configuracoes/patrocinadores/page.tsx
"use client"

import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Plus, Trash2, CreditCard, Clock, CheckCircle, XCircle, Upload } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface Patrocinador {
    id: string
    nome: string
    logo: string
    plano: string
    valor: number
    status: "ativo" | "pendente" | "expirado"
    dataInicio: string
    dataFim: string
}

const patrocinadoresFake: Patrocinador[] = [
    { id: "1", nome: "Nike SB", logo: "/images/patro-nike.png", plano: "Anual", valor: 499.90, status: "ativo", dataInicio: "Jan 2026", dataFim: "Jan 2027" },
    { id: "2", nome: "Red Bull", logo: "/images/patro-redbull.png", plano: "Mensal", valor: 49.90, status: "ativo", dataInicio: "Jun 2026", dataFim: "Jul 2026" },
    { id: "3", nome: "Shimano", logo: "/images/patro-shimano.png", plano: "Trimestral", valor: 129.90, status: "pendente", dataInicio: "—", dataFim: "—" },
    { id: "4", nome: "Fox Racing", logo: "/images/patro-fox.png", plano: "Anual", valor: 399.90, status: "expirado", dataInicio: "Jan 2025", dataFim: "Jan 2026" },
]

export default function PatrocinadoresPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>(patrocinadoresFake)
    const [mostrarForm, setMostrarForm] = useState(false)
    const [novoNome, setNovoNome] = useState("")
    const [novoLogo, setNovoLogo] = useState("")
    const [filtroStatus, setFiltroStatus] = useState<string>("todos")

    const adicionarPatrocinador = () => {
        if (!novoNome.trim()) return
        const novo: Patrocinador = {
            id: Date.now().toString(),
            nome: novoNome,
            logo: novoLogo || "/placeholder.svg",
            plano: "Mensal",
            valor: 49.90,
            status: "pendente",
            dataInicio: "—",
            dataFim: "—",
        }
        setPatrocinadores([...patrocinadores, novo])
        setNovoNome("")
        setNovoLogo("")
        setMostrarForm(false)
    }

    const removerPatrocinador = (id: string) => {
        setPatrocinadores(patrocinadores.filter((p) => p.id !== id))
    }

    const statusColor = (status: string) => {
        switch (status) {
            case "ativo": return "bg-green-500/10 text-green-600"
            case "pendente": return "bg-yellow-500/10 text-yellow-600"
            case "expirado": return "bg-red-500/10 text-red-600"
            default: return "bg-secondary text-muted-foreground"
        }
    }

    const statusIcon = (status: string) => {
        switch (status) {
            case "ativo": return <CheckCircle className="size-3.5" />
            case "pendente": return <Clock className="size-3.5" />
            case "expirado": return <XCircle className="size-3.5" />
            default: return null
        }
    }

    const patrocinadoresFiltrados = filtroStatus === "todos"
        ? patrocinadores
        : patrocinadores.filter((p) => p.status === filtroStatus)

    const totalMensal = patrocinadores
        .filter((p) => p.status === "ativo")
        .reduce((acc, p) => {
            if (p.plano === "Mensal") return acc + p.valor
            if (p.plano === "Trimestral") return acc + p.valor / 3
            if (p.plano === "Anual") return acc + p.valor / 12
            return acc
        }, 0)

    if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>
    if (!isSignedIn) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Entre para acessar</p></div>

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-3">
                        <Link href="/perfil" className="flex items-center gap-2 text-marble-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                            <span className="text-sm">Voltar</span>
                        </Link>
                        <h1 className="flex-1 text-center font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">Patrocinadores</h1>
                        <div className="w-16" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
                {/* Card de receita */}
                <div className="rounded-2xl bg-gradient-to-br from-primary to-imperial p-6 text-primary-foreground">
                    <p className="text-xs uppercase tracking-widest opacity-80">Receita mensal estimada</p>
                    <p className="font-heading text-3xl font-bold mt-2">
                        R$ {totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                        {patrocinadores.filter((p) => p.status === "ativo").length} patrocinadores ativos
                    </p>
                </div>

                {/* Filtros de status */}
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                    {[
                        { key: "todos", label: "Todos" },
                        { key: "ativo", label: "Ativos" },
                        { key: "pendente", label: "Pendentes" },
                        { key: "expirado", label: "Expirados" },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFiltroStatus(f.key)}
                            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                                filtroStatus === f.key
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Lista de patrocinadores */}
                <div className="space-y-3">
                    {patrocinadoresFiltrados.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">Nenhum patrocinador encontrado.</p>
                    )}

                    {patrocinadoresFiltrados.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-all group"
                        >
                            {/* Logo */}
                            <div className="size-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                                {p.logo ? (
                                    <img src={p.logo} alt={p.nome} className="size-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-muted-foreground">{p.nome[0]}</span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground">{p.nome}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${statusColor(p.status)}`}>
                                        {statusIcon(p.status)}
                                        {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                                    </span>
                                    <span className="text-[0.6rem] text-muted-foreground">
                                        {p.plano} • R$ {p.valor.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-[0.6rem] text-muted-foreground">
                                    <span>Início: {p.dataInicio}</span>
                                    <span>Fim: {p.dataFim}</span>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex items-center gap-1">
                                {p.status === "pendente" && (
                                    <button className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[0.65rem] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                                        <CreditCard className="size-3" />
                                        Pagar
                                    </button>
                                )}
                                <button
                                    onClick={() => removerPatrocinador(p.id)}
                                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Botão adicionar */}
                <button
                    onClick={() => setMostrarForm(!mostrarForm)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                >
                    <Plus className="size-4" />
                    Adicionar patrocinador
                </button>

                {/* Formulário */}
                {mostrarForm && (
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">Novo patrocinador</h3>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome da marca</label>
                            <input
                                type="text"
                                value={novoNome}
                                onChange={(e) => setNovoNome(e.target.value)}
                                placeholder="Ex: Nike SB"
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Logo (URL)</label>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    value={novoLogo}
                                    onChange={(e) => setNovoLogo(e.target.value)}
                                    placeholder="https://..."
                                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/30"
                                />
                                <button className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground">
                                    <Upload className="size-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setMostrarForm(false)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-secondary">Cancelar</button>
                            <button onClick={adicionarPatrocinador} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Adicionar</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}