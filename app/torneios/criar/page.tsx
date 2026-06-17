// app/torneios/criar/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Trophy, FileText, Image, X, Info, Shield } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const MODALIDADES = ["Downhill", "Mountain Bike", "Speed", "BMX", "Urbana"]

export default function CriarTorneioPage() {
    const { user, isSignedIn } = useUser()

    const [form, setForm] = useState({
        nome: "",
        descricao: "",
        modalidade: "",
        local: "",
        cidade: "",
        estado: "",
        dataInicio: "",
        dataFim: "",
        prazoInscricao: "",
        maxParticipantes: "",
        minParticipantes: "2",
        valorInscricao: "",
        premiacao: "",
        regras: "",
    })

    const [passo, setPasso] = useState(1)
    const [enviado, setEnviado] = useState(false)

    const update = (campo: string, valor: string) => {
        setForm((prev) => ({ ...prev, [campo]: valor }))
    }

    const calcularComissao = () => {
        const valor = Number(form.valorInscricao) || 0
        const max = Number(form.maxParticipantes) || 0
        const total = valor * max
        const comissao = total * 0.15
        const organizador = total * 0.85
        return { total, comissao, organizador }
    }

    const { total, comissao, organizador } = calcularComissao()

    const handleSubmit = () => {
        // Futuro: POST /api/tournaments
        setEnviado(true)
    }

    const podeAvancar = () => {
        if (passo === 1) return form.nome && form.modalidade && form.dataInicio
        if (passo === 2) return form.local && form.maxParticipantes
        return true
    }

    if (enviado) {
        return (
            <div className="min-h-screen bg-background">
                <Header onMenuClick={() => {}} cartCount={0} notificationCount={0} />
                <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <Shield className="size-8 text-green-600" />
                    </div>
                    <h1 className="font-blackletter text-3xl text-primary mb-2">Torneio Enviado!</h1>
                    <p className="text-muted-foreground mb-2">Seu torneio está em análise pela nossa equipe.</p>
                    <p className="text-sm text-muted-foreground mb-6">Resposta em até 24 horas.</p>
                    <Link href="/torneios" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                        Ver torneios
                    </Link>
                </div>
                <BottomNav onMenuClick={() => {}} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header onMenuClick={() => {}} cartCount={0} notificationCount={0} />

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
                        <Link href="/torneios" className="flex items-center gap-2 text-marble-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                            <span className="text-sm">Voltar</span>
                        </Link>
                        <h1 className="font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">Criar Torneio</h1>
                        <div className="w-16" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-6">
                {/* Passos */}
                <div className="flex items-center gap-2 mb-8">
                    {[1, 2, 3].map((p) => (
                        <div key={p} className="flex items-center gap-2 flex-1">
                            <div className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                                passo >= p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                            }`}>
                                {passo > p ? "✓" : p}
                            </div>
                            <span className={`text-xs font-medium hidden sm:block ${passo >= p ? "text-foreground" : "text-muted-foreground"}`}>
                                {p === 1 ? "Básico" : p === 2 ? "Local e Vagas" : "Finalizar"}
                            </span>
                            {p < 3 && <div className={`flex-1 h-px ${passo > p ? "bg-primary" : "bg-border"}`} />}
                        </div>
                    ))}
                </div>

                {/* PASSO 1 - Informações básicas */}
                {passo === 1 && (
                    <div className="space-y-5">
                        <h2 className="font-heading text-lg font-bold text-foreground">Informações do torneio</h2>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nome do torneio *</label>
                            <input type="text" value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Ex: Downhill Cup 2026" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30" />
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Modalidade *</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {MODALIDADES.map((m) => (
                                    <button key={m} onClick={() => update("modalidade", m)} className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                                        form.modalidade === m ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                                    }`}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Data de início *</label>
                                <div className="relative mt-1">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input type="date" value={form.dataInicio} onChange={(e) => update("dataInicio", e.target.value)} className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/30" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Data de término</label>
                                <div className="relative mt-1">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input type="date" value={form.dataFim} onChange={(e) => update("dataFim", e.target.value)} className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/30" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Descrição</label>
                            <textarea value={form.descricao} onChange={(e) => update("descricao", e.target.value)} rows={3} placeholder="Descreva seu torneio..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30 resize-none" />
                        </div>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Regras</label>
                            <textarea value={form.regras} onChange={(e) => update("regras", e.target.value)} rows={2} placeholder="Regras do torneio..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30 resize-none" />
                        </div>
                    </div>
                )}

                {/* PASSO 2 - Local e Vagas */}
                {passo === 2 && (
                    <div className="space-y-5">
                        <h2 className="font-heading text-lg font-bold text-foreground">Local e Participantes</h2>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Local do evento *</label>
                            <div className="relative mt-1">
                                <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                <input type="text" value={form.local} onChange={(e) => update("local", e.target.value)} placeholder="Ex: Parque Municipal, Campos do Jordão" className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/30" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cidade</label>
                                <input type="text" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} placeholder="Ex: São Paulo" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Estado (UF)</label>
                                <input type="text" value={form.estado} onChange={(e) => update("estado", e.target.value)} maxLength={2} placeholder="Ex: SP" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30 uppercase" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Máximo de participantes *</label>
                                <div className="relative mt-1">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input type="number" value={form.maxParticipantes} onChange={(e) => update("maxParticipantes", e.target.value)} min={2} placeholder="Ex: 50" className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/30" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Prazo de inscrição</label>
                                <div className="relative mt-1">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input type="date" value={form.prazoInscricao} onChange={(e) => update("prazoInscricao", e.target.value)} className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/30" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Info className="size-4 text-primary" />
                                <span className="text-sm font-semibold text-foreground">Limites para novos organizadores</span>
                            </div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Máximo de 1 torneio ativo por vez</li>
                                <li>• Seu torneio passará por aprovação (até 24h)</li>
                                <li>• Mantenha as regras claras para evitar denúncias</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* PASSO 3 - Financeiro e Finalizar */}
                {passo === 3 && (
                    <div className="space-y-5">
                        <h2 className="font-heading text-lg font-bold text-foreground">Inscrição e Premiação</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Valor da inscrição</label>
                                <div className="relative mt-1">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input type="number" value={form.valorInscricao} onChange={(e) => update("valorInscricao", e.target.value)} min={0} max={500} step="0.01" placeholder="R$ 50,00" className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/30" />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1">Deixe em branco ou R$ 0 para gratuito</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Premiação total</label>
                                <div className="relative mt-1">
                                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input type="text" value={form.premiacao} onChange={(e) => update("premiacao", e.target.value)} placeholder="Ex: R$ 2.000" className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/30" />
                                </div>
                            </div>
                        </div>

                        {/* Resumo financeiro */}
                        {Number(form.valorInscricao) > 0 && Number(form.maxParticipantes) > 0 && (
                            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resumo financeiro</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Inscrição</span>
                                        <span>R$ {Number(form.valorInscricao).toFixed(2)} por pessoa</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Vagas</span>
                                        <span>{form.maxParticipantes} participantes</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>Total arrecadado</span>
                                        <span className="text-green-600">R$ {total.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-border pt-2 flex justify-between">
                                        <span className="text-muted-foreground">Comissão Imperium (15%)</span>
                                        <span className="text-primary">- R$ {comissao.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base">
                                        <span>Você recebe</span>
                                        <span className="text-green-600">R$ {organizador.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl border border-border bg-amber-50 p-4">
                            <div className="flex items-start gap-2">
                                <Shield className="size-4 text-amber-600 mt-0.5 shrink-0" />
                                <div className="text-xs text-amber-800">
                                    <p className="font-semibold mb-1">Compromisso do organizador</p>
                                    <p>Ao criar este torneio, você se compromete a realizá-lo na data e local informados. O cancelamento sem justificativa pode resultar em penalidades na plataforma. O valor das inscrições fica retido e só é liberado 24h após a conclusão do torneio.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navegação */}
                <div className="flex gap-3 mt-8">
                    {passo > 1 && (
                        <button onClick={() => setPasso(passo - 1)} className="flex-1 rounded-xl border border-border py-3 text-sm font-medium hover:bg-secondary transition-colors">
                            Voltar
                        </button>
                    )}
                    {passo < 3 ? (
                        <button onClick={() => setPasso(passo + 1)} disabled={!podeAvancar()} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Continuar
                        </button>
                    ) : (
                        <button onClick={handleSubmit} className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                            Enviar para revisão
                        </button>
                    )}
                </div>
            </main>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}