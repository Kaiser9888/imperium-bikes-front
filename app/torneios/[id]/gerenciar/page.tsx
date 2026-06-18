// app/torneios/[id]/gerenciar/page.tsx
"use client"

import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Video, VideoOff, Users, Trophy, Settings, Edit, X, Check, Radio, Play, Square } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

interface Inscrito {
    id: string
    nome: string
    posicao: number | null
}

const torneio = {
    id: "1",
    nome: "Downhill Cup 2026",
    modalidade: "Downhill",
    data: "15 Ago 2026",
    local: "Parque Municipal, Campos do Jordão, SP",
    participantes: 32,
    maxParticipantes: 48,
    valorInscricao: 89.90,
    status: "aberto",
    live: {
        ativa: false,
        titulo: "",
        espectadores: 0,
    },
}

export default function GerenciarTorneioPage() {
    const { user, isSignedIn } = useUser()
    const params = useParams()
    const torneioId = params.id as string

    const [status, setStatus] = useState(torneio.status)
    const [liveAtiva, setLiveAtiva] = useState(torneio.live.ativa)
    const [editando, setEditando] = useState(false)
    const [nome, setNome] = useState(torneio.nome)
    const [local, setLocal] = useState(torneio.local)
    const [mostrarResultados, setMostrarResultados] = useState(false)
    const [inscritos, setInscritos] = useState<Inscrito[]>([
        { id: "1", nome: "Carlos Silva", posicao: null },
        { id: "2", nome: "Ana Oliveira", posicao: null },
        { id: "3", nome: "Pedro Santos", posicao: null },
        { id: "4", nome: "Marina Costa", posicao: null },
        { id: "5", nome: "Lucas Ferreira", posicao: null },
    ])
    const [temInscritosPagos] = useState(false)

    const iniciarLive = () => setLiveAtiva(true)
    const encerrarLive = () => setLiveAtiva(false)
    const salvarEdicao = () => setEditando(false)
    const abrirTorneio = () => setStatus("aberto")
    const iniciarTorneio = () => setStatus("andamento")
    const finalizarTorneio = () => setStatus("finalizado")
    const cancelarTorneio = () => {
        if (confirm("Tem certeza que deseja cancelar este torneio? Todos os participantes serão reembolsados.")) {
            setStatus("cancelado")
        }
    }

    const definirPosicao = (id: string, posicao: number) => {
        setInscritos((prev) => prev.map((p) => (p.id === id ? { ...p, posicao } : p)))
    }

    const statusLabel = (s: string) => {
        switch (s) {
            case "rascunho": return "Rascunho"
            case "aberto": return "Inscrições abertas"
            case "andamento": return "Em andamento"
            case "finalizado": return "Finalizado"
            case "cancelado": return "Cancelado"
            default: return s
        }
    }

    const statusColor = (s: string) => {
        switch (s) {
            case "rascunho": return "bg-gray-500/10 text-gray-600"
            case "aberto": return "bg-green-500/10 text-green-600"
            case "andamento": return "bg-blue-500/10 text-blue-600"
            case "finalizado": return "bg-purple-500/10 text-purple-600"
            case "cancelado": return "bg-red-500/10 text-red-600"
            default: return "bg-secondary"
        }
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Entre para gerenciar seu torneio</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                        <Link href="/torneios" className="flex items-center gap-2 text-marble-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                            <span className="text-sm">Voltar</span>
                        </Link>
                        <h1 className="font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">Painel</h1>
                        <div className="w-16" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">
                {/* Status */}
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${statusColor(status)}`}>
                    <span className="size-2 rounded-full bg-current" />
                    {statusLabel(status)}
                </div>

                {/* Info do torneio */}
                <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            {editando ? (
                                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="text-xl font-bold bg-transparent border-b border-border outline-none" />
                            ) : (
                                <h2 className="font-heading text-xl font-bold text-foreground">{nome}</h2>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">{torneio.modalidade} • {torneio.data}</p>
                            {editando ? (
                                <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} className="text-sm text-muted-foreground bg-transparent border-b border-border outline-none mt-1 w-full" />
                            ) : (
                                <p className="text-sm text-muted-foreground">{local}</p>
                            )}
                        </div>
                        {status !== "cancelado" && status !== "finalizado" && (
                            <button onClick={() => editando ? salvarEdicao() : setEditando(true)} className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors">
                                {editando ? <Check className="size-4 text-green-600" /> : <Edit className="size-4" />}
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="rounded-xl bg-secondary p-3 text-center">
                            <Users className="size-4 text-muted-foreground mx-auto mb-1" />
                            <p className="font-bold text-foreground">{inscritos.length}</p>
                            <p className="text-[0.6rem] text-muted-foreground uppercase">Inscritos</p>
                        </div>
                        <div className="rounded-xl bg-secondary p-3 text-center">
                            <Trophy className="size-4 text-muted-foreground mx-auto mb-1" />
                            <p className="font-bold text-foreground">R$ {torneio.valorInscricao.toFixed(2)}</p>
                            <p className="text-[0.6rem] text-muted-foreground uppercase">Inscrição</p>
                        </div>
                        <div className="rounded-xl bg-secondary p-3 text-center">
                            <Radio className="size-4 text-muted-foreground mx-auto mb-1" />
                            <p className="font-bold text-foreground">{liveAtiva ? "Ao vivo" : "Off"}</p>
                            <p className="text-[0.6rem] text-muted-foreground uppercase">Live</p>
                        </div>
                    </div>
                </div>

                {/* Ações */}
                <div className="grid grid-cols-2 gap-3">
                    {status === "rascunho" && (
                        <button onClick={abrirTorneio} className="col-span-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
                            Publicar torneio
                        </button>
                    )}
                    {status === "aberto" && (
                        <>
                            <button onClick={iniciarTorneio} className="rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                <Play className="size-4" /> Iniciar torneio
                            </button>
                            <button onClick={cancelarTorneio} className="rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                                Cancelar
                            </button>
                        </>
                    )}
                    {status === "andamento" && (
                        <>
                            {!liveAtiva ? (
                                <button onClick={iniciarLive} className="rounded-xl bg-red-600 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                    <Video className="size-4" /> Iniciar live
                                </button>
                            ) : (
                                <button onClick={encerrarLive} className="rounded-xl bg-gray-600 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                                    <VideoOff className="size-4" /> Encerrar live
                                </button>
                            )}
                            <button onClick={finalizarTorneio} className="rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                                <Square className="size-4" /> Finalizar
                            </button>
                        </>
                    )}
                    {status === "finalizado" && (
                        <div className="col-span-2 text-center py-4 text-sm text-muted-foreground">
                            Este torneio foi finalizado.
                        </div>
                    )}
                    {status === "cancelado" && (
                        <div className="col-span-2 text-center py-4 text-sm text-red-500">
                            Este torneio foi cancelado.
                        </div>
                    )}
                </div>

                {/* Live info */}
                {liveAtiva && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="flex size-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-sm font-semibold text-red-600 uppercase">AO VIVO</span>
                            <span className="text-xs text-red-500">{torneio.live.espectadores} espectadores</span>
                        </div>
                        <p className="text-sm text-red-700 mb-3">Sua live está ativa. Compartilhe o link com os espectadores.</p>
                        <div className="flex gap-2">
                            <Link href={`/torneios/${torneioId}/live`} className="flex-1 rounded-lg bg-red-600 py-2 text-center text-xs font-semibold text-white hover:bg-red-700 transition-colors">
                                Ver live
                            </Link>
                            <button className="rounded-lg border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">
                                Copiar link
                            </button>
                        </div>
                    </div>
                )}

                {/* Participantes */}
                <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">
                            Participantes ({inscritos.length})
                        </h3>
                        {(status === "finalizado" || status === "andamento") && (
                            <button onClick={() => setMostrarResultados(!mostrarResultados)} className="text-xs font-medium text-primary hover:underline">
                                {mostrarResultados ? "Ocultar resultados" : "Definir resultados"}
                            </button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {inscritos.map((p) => (
                            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                                <span className="text-sm font-medium">{p.nome}</span>
                                {mostrarResultados ? (
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map((pos) => (
                                            <button
                                                key={pos}
                                                onClick={() => definirPosicao(p.id, pos)}
                                                className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                                    p.posicao === pos
                                                        ? pos === 1 ? "bg-yellow-500 text-white" : pos === 2 ? "bg-gray-400 text-white" : "bg-amber-600 text-white"
                                                        : "bg-secondary text-muted-foreground hover:bg-border"
                                                }`}
                                            >
                                                {pos}º
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    p.posicao !== null && (
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                            p.posicao === 1 ? "bg-yellow-500/10 text-yellow-600" : p.posicao === 2 ? "bg-gray-300/20 text-gray-400" : "bg-amber-600/10 text-amber-700"
                                        }`}>
                                            {p.posicao}º lugar
                                        </span>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Valor travado */}
                {temInscritosPagos && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-2">
                            <Settings className="size-4 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">Valor da inscrição bloqueado</p>
                                <p className="text-xs text-amber-700 mt-1">O valor de R$ {torneio.valorInscricao.toFixed(2)} não pode ser alterado porque já existem participantes inscritos.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}