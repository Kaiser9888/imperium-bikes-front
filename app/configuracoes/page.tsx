// app/configuracoes/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser, UserButton } from "@clerk/nextjs"
import { ArrowLeft, MapPin, Trophy, Plus, Trash2, Save, User, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface Torneio {
    id: string
    nome: string
    posicao: number
    data: string
}

export default function ConfiguracoesPage() {
    const { user, isSignedIn, isLoaded } = useUser()

    const [bio, setBio] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")
    const [pais, setPais] = useState("Brasil")
    const [torneios, setTorneios] = useState<Torneio[]>([])
    const [novoTorneio, setNovoTorneio] = useState({ nome: "", posicao: 1, data: "" })
    const [mostrarFormTorneio, setMostrarFormTorneio] = useState(false)
    const [salvo, setSalvo] = useState(false)

    const adicionarTorneio = () => {
        if (!novoTorneio.nome.trim() || !novoTorneio.data.trim()) return
        setTorneios([...torneios, { ...novoTorneio, id: Date.now().toString() }])
        setNovoTorneio({ nome: "", posicao: 1, data: "" })
        setMostrarFormTorneio(false)
    }

    const removerTorneio = (id: string) => {
        setTorneios(torneios.filter((t) => t.id !== id))
    }

    const salvarAlteracoes = () => {
        // Aqui depois conecta com a API
        setSalvo(true)
        setTimeout(() => setSalvo(false), 2000)
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-background">
                <Header onMenuClick={() => {}} cartCount={0} notificationCount={0} />
                <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <p className="text-muted-foreground">Entre para acessar as configurações</p>
                </div>
                <BottomNav onMenuClick={() => {}} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header
                className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm"
                style={{ backgroundImage: "url(/images/marble-light.png)" }}
            >
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                        <Link href="/perfil" className="flex items-center gap-2 text-marble-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="size-5" />
                            <span className="text-sm font-medium">Voltar</span>
                        </Link>
                        <h1 className="font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">
                            Configurações
                        </h1>
                        <div className="size-10" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
                {/* Foto e nome */}
                <section className="flex items-center gap-4">
                    <img
                        src={user.imageUrl || "/placeholder.svg"}
                        alt={user.fullName || "Perfil"}
                        className="size-16 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="font-heading text-lg font-bold text-foreground">
                            {user.fullName || "Usuário"}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>
                </section>

                {/* Bio */}
                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Bio</h3>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                        rows={3}
                        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30 resize-none"
                    />
                </section>

                {/* Localização */}
                <section>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Localização</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Cidade</label>
                            <input
                                type="text"
                                value={cidade}
                                onChange={(e) => setCidade(e.target.value)}
                                placeholder="Sua cidade"
                                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30 mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado</label>
                            <input
                                type="text"
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                placeholder="Seu estado"
                                className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30 mt-1"
                            />
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">País</label>
                        <input
                            type="text"
                            value={pais}
                            onChange={(e) => setPais(e.target.value)}
                            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/30 mt-1"
                        />
                    </div>
                </section>

                {/* Torneios */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Torneios</h3>
                        <button
                            onClick={() => setMostrarFormTorneio(!mostrarFormTorneio)}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            <Plus className="size-3.5" />
                            Adicionar
                        </button>
                    </div>

                    {mostrarFormTorneio && (
                        <div className="rounded-xl border border-border bg-card p-4 mb-3 space-y-3">
                            <input
                                type="text"
                                value={novoTorneio.nome}
                                onChange={(e) => setNovoTorneio({ ...novoTorneio, nome: e.target.value })}
                                placeholder="Nome do torneio"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/30"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Posição</label>
                                    <select
                                        value={novoTorneio.posicao}
                                        onChange={(e) => setNovoTorneio({ ...novoTorneio, posicao: Number(e.target.value) })}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/30 mt-1"
                                    >
                                        <option value={1}>1º Lugar</option>
                                        <option value={2}>2º Lugar</option>
                                        <option value={3}>3º Lugar</option>
                                        <option value={0}>Participante</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Data</label>
                                    <input
                                        type="text"
                                        value={novoTorneio.data}
                                        onChange={(e) => setNovoTorneio({ ...novoTorneio, data: e.target.value })}
                                        placeholder="Ex: Mar 2026"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/30 mt-1"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={adicionarTorneio}
                                className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Salvar torneio
                            </button>
                        </div>
                    )}

                    {torneios.length === 0 && !mostrarFormTorneio && (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            Nenhum torneio adicionado
                        </p>
                    )}

                    <div className="space-y-2">
                        {torneios.map((torneio) => (
                            <div
                                key={torneio.id}
                                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                            >
                                <div className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${
                                    torneio.posicao === 1
                                        ? "bg-yellow-500/10 text-yellow-600"
                                        : torneio.posicao === 2
                                            ? "bg-gray-300/20 text-gray-400"
                                            : torneio.posicao === 3
                                                ? "bg-amber-600/10 text-amber-700"
                                                : "bg-secondary text-muted-foreground"
                                }`}>
                                    {torneio.posicao > 0 ? `${torneio.posicao}º` : "—"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{torneio.nome}</p>
                                    <p className="text-xs text-muted-foreground">{torneio.data}</p>
                                </div>
                                <button
                                    onClick={() => removerTorneio(torneio.id)}
                                    className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Botão salvar */}
                <button
                    onClick={salvarAlteracoes}
                    className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                    {salvo ? (
                        <>✓ Salvo!</>
                    ) : (
                        <>
                            <Save className="size-4" />
                            Salvar alterações
                        </>
                    )}
                </button>
            </main>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}