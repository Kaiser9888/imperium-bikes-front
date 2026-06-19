// app/carteira/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import api from "@/lib/api"

interface Transacao {
    id: string
    tipo: string
    status: string
    valor: number
    descricao: string
    criadoEm: string
}

interface CarteiraData {
    id: string
    saldoDisponivel: number
    saldoPendente: number
}

export default function CarteiraPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const [carteira, setCarteira] = useState<CarteiraData | null>(null)
    const [transacoes, setTransacoes] = useState<Transacao[]>([])
    const [loading, setLoading] = useState(true)
    const [mostrarSaque, setMostrarSaque] = useState(false)
    const [valorSaque, setValorSaque] = useState("")

    useEffect(() => {
        if (isSignedIn) carregarCarteira()
    }, [isSignedIn])

    const carregarCarteira = async () => {
        try {
            setLoading(true)
            const [resCarteira, resExtrato] = await Promise.all([
                api.get("/api/carteira"),
                api.get("/api/carteira/extrato", { params: { size: 20 } }),
            ])
            setCarteira(resCarteira.data)
            setTransacoes(resExtrato.data.content || resExtrato.data || [])
        } catch (error) {
            console.error("Erro ao carregar carteira:", error)
        } finally {
            setLoading(false)
        }
    }

    const solicitarSaque = async () => {
        const valor = Number(valorSaque)
        if (!valor || valor <= 0) return
        try {
            await api.post("/api/carteira/sacar", { valor })
            setMostrarSaque(false)
            setValorSaque("")
            carregarCarteira()
        } catch (error) {
            console.error("Erro ao sacar:", error)
        }
    }

    const tipoLabel = (tipo: string) => {
        switch (tipo) {
            case "INSCRICAO": return "Inscrição"
            case "PATROCINIO": return "Patrocínio"
            case "SUPER_CHAT": return "Super Chat"
            case "SAQUE": return "Saque"
            case "ESTORNO": return "Estorno"
            case "COMISSAO": return "Comissão"
            default: return tipo
        }
    }

    const tipoIcon = (tipo: string) => {
        if (tipo === "SAQUE") return <ArrowUpRight className="size-4 text-red-500" />
        if (tipo === "ESTORNO") return <ArrowDownRight className="size-4 text-orange-500" />
        return <ArrowDownRight className="size-4 text-green-500" />
    }

    const statusIcon = (status: string) => {
        switch (status) {
            case "CONCLUIDA": return <CheckCircle className="size-3 text-green-500" />
            case "PENDENTE": return <Clock className="size-3 text-yellow-500" />
            case "CANCELADA": return <XCircle className="size-3 text-red-500" />
            default: return null
        }
    }

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-background">
                <Header onMenuClick={() => {}} cartCount={0} notificationCount={0} />
                <div className="flex items-center justify-center py-20">
                    <p className="text-muted-foreground">Carregando carteira...</p>
                </div>
                <BottomNav onMenuClick={() => {}} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                        <Link href="/perfil" className="flex items-center gap-2 text-marble-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                            <span className="text-sm">Voltar</span>
                        </Link>
                        <h1 className="font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">Carteira</h1>
                        <div className="w-16" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
                {/* Card de saldo */}
                <div className="rounded-2xl bg-gradient-to-br from-primary to-imperial p-6 text-primary-foreground">
                    <div className="flex items-center gap-2 mb-4">
                        <Wallet className="size-5 opacity-80" />
                        <span className="text-xs uppercase tracking-widest opacity-80">Saldo disponível</span>
                    </div>
                    <p className="font-heading text-4xl font-bold">
                        R$ {carteira?.saldoDisponivel?.toFixed(2) || "0.00"}
                    </p>
                    {carteira && carteira.saldoPendente > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-sm opacity-80">
                            <Clock className="size-4" />
                            <span>R$ {carteira.saldoPendente.toFixed(2)} pendente de liberação</span>
                        </div>
                    )}
                    <button
                        onClick={() => setMostrarSaque(!mostrarSaque)}
                        disabled={!carteira || carteira.saldoDisponivel <= 0}
                        className="mt-4 w-full rounded-xl bg-white/20 py-2.5 text-sm font-semibold hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Sacar via PIX
                    </button>

                    {mostrarSaque && (
                        <div className="mt-3 bg-white/10 rounded-xl p-4 space-y-3">
                            <p className="text-xs opacity-80">Digite o valor que deseja sacar:</p>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">R$</span>
                                <input
                                    type="number"
                                    value={valorSaque}
                                    onChange={(e) => setValorSaque(e.target.value)}
                                    max={carteira?.saldoDisponivel}
                                    placeholder="0,00"
                                    className="w-full bg-white/20 rounded-lg px-3 py-2 text-sm outline-none placeholder:text-white/50"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setMostrarSaque(false)} className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-medium hover:bg-white/20">Cancelar</button>
                                <button onClick={solicitarSaque} className="flex-1 rounded-lg bg-white py-2 text-xs font-semibold text-primary hover:bg-white/90">Confirmar saque</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cards rápidos */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: TrendingUp, label: "Entradas", valor: transacoes.filter(t => t.valor > 0 && t.status === "CONCLUIDA").reduce((a, b) => a + b.valor, 0), cor: "text-green-600" },
                        { icon: TrendingDown, label: "Saídas", valor: Math.abs(transacoes.filter(t => t.valor < 0 && t.status === "CONCLUIDA").reduce((a, b) => a + b.valor, 0)), cor: "text-red-600" },
                        { icon: PiggyBank, label: "Comissão", valor: transacoes.filter(t => t.tipo === "COMISSAO").length, cor: "text-primary" },
                    ].map(({ icon: Icon, label, valor, cor }) => (
                        <div key={label} className="rounded-xl bg-card border border-border p-3 text-center">
                            <Icon className={`size-4 mx-auto mb-1 ${cor}`} />
                            <p className={`font-bold ${cor}`}>
                                {typeof valor === "number" && label !== "Comissão" ? `R$ ${valor.toFixed(2)}` : valor}
                            </p>
                            <p className="text-[0.6rem] text-muted-foreground uppercase tracking-wider">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Extrato */}
                <div>
                    <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground mb-4">Extrato</h2>

                    {transacoes.length === 0 ? (
                        <div className="text-center py-8">
                            <Wallet className="size-10 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nenhuma transação ainda</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {transacoes.map((t) => (
                                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                                    <div className="flex size-9 items-center justify-center rounded-full bg-secondary">
                                        {tipoIcon(t.tipo)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-foreground">{tipoLabel(t.tipo)}</p>
                                            {statusIcon(t.status)}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{t.descricao || "—"}</p>
                                        <p className="text-[0.6rem] text-muted-foreground">{new Date(t.criadoEm).toLocaleDateString("pt-BR")}</p>
                                    </div>
                                    <p className={`text-sm font-bold ${t.valor >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {t.valor >= 0 ? "+" : ""}R$ {Math.abs(t.valor).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}