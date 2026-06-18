// app/torneios/[id]/page.tsx
"use client"

import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, MapPin, Calendar, Users, Trophy, DollarSign, Shield, Flame, Clock, Share2, ChevronRight, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

const torneio = {
    id: "1",
    nome: "Downhill Cup 2026",
    modalidade: "Downhill",
    descricao: "O maior torneio de downhill do Brasil. Pista técnica com mais de 2km de descida em meio à mata nativa da Serra da Mantiqueira. Prepare seu equipamento e venha competir com os melhores riders do país.",
    regras: "- Bicicletas com suspensão mínima de 180mm\n- Capacete full face obrigatório\n- Joelheiras e cotoveleiras recomendadas\n- Categoria única: Open\n- Cronometragem eletrônica",
    data: "15 Ago 2026",
    horario: "08:00 - 18:00",
    local: "Parque Municipal",
    endereco: "Av. Principal, 1000 - Campos do Jordão, SP",
    participantes: 32,
    maxParticipantes: 48,
    valorInscricao: 89.90,
    premiacao: "R$ 5.000 (1º), R$ 2.000 (2º), R$ 1.000 (3º)",
    status: "aberto",
    banner: "/images/torneio-1.png",
    organizador: {
        nome: "Pedro Alves",
        username: "@pedalpesado",
        avatar: "/placeholder.svg",
        torneiosCriados: 8,
        nota: 4.9,
    },
    diasRestantes: 12,
    podio: [
        { nome: "Carlos Silva", posicao: 1 },
        { nome: "Ana Oliveira", posicao: 2 },
        { nome: "Pedro Santos", posicao: 3 },
    ],
}

export default function TorneioDetalhesPage() {
    const { user, isSignedIn } = useUser()
    const params = useParams()
    const torneioId = params.id as string

    const [inscrito, setInscrito] = useState(false)
    const [mostrarRegras, setMostrarRegras] = useState(false)

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
                        <button className="size-10 flex items-center justify-center rounded-md text-marble-foreground hover:bg-marble-foreground/10">
                            <Share2 className="size-5" />
                        </button>
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
                                <button onClick={() => setInscrito(false)} className="text-xs text-red-500 hover:underline">Cancelar inscrição</button>
                            </div>
                        ) : (
                            <button onClick={() => setInscrito(true)} className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                Inscrever-se • {torneio.valorInscricao > 0 ? `R$ ${torneio.valorInscricao.toFixed(2)}` : "Grátis"}
                            </button>
                        )}
                    </div>
                )}
            </main>

            <div className="pb-32 md:pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}