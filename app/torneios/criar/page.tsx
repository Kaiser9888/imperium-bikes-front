// app/torneios/criar/page.tsx
"use client"
import { Button } from "@/components/ui/button"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Trophy, Image, X, Shield } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { useState } from "react"
import { mensagemDaApi, tournamentService } from "@/services/tournamentService"

export default function CriarTorneioPage() {
    const { isSignedIn } = useUser()

    const [form, setForm] = useState({
        nome: "",
        descricao: "",
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
        capa: "",
    })

    const [passo, setPasso] = useState(1)
    const [criadoId, setCriadoId] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)
    const [erroEnvio, setErroEnvio] = useState<string | null>(null)

    const update = (campo: string, valor: string) => {
        setForm((prev) => ({ ...prev, [campo]: valor }))
    }

    const handleSubmit = async () => {
        if (!isSignedIn) {
            window.location.assign(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        setEnviando(true)
        setErroEnvio(null)
        try {
            const criado = await tournamentService.criar({
                name: form.nome.trim(), description: form.descricao.trim(),
                location: form.local.trim(), city: form.cidade.trim(), state: form.estado.trim().toUpperCase(),
                startDate: form.dataInicio, endDate: form.dataFim || form.dataInicio, registrationDeadline: form.prazoInscricao,
                maxParticipants: Number(form.maxParticipantes), minParticipants: Number(form.minParticipantes),
                registrationFee: Number(form.valorInscricao) || 0, prizes: form.premiacao.trim(), rules: form.regras.trim(), coverImageUrl: form.capa.trim(),
            })
            setCriadoId(criado.id)
        } catch (cause) {
            setErroEnvio(mensagemDaApi(cause, "Não foi possível criar o evento. Confira os dados e tente novamente."))
        } finally {
            setEnviando(false)
        }
    }

    const podeAvancar = () => {
        if (passo === 1) return form.nome.trim().length >= 5 && form.dataInicio
        if (passo === 2) return form.local && form.maxParticipantes
        return true
    }

    if (criadoId) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <div className="size-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
                        <Shield className="size-8 text-success" />
                    </div>
                    <h1 className="type-h1 mb-2 text-foreground">Evento publicado</h1>
                    <p className="mb-6 text-muted-foreground">As inscrições já estão abertas.</p>
                    <Button asChild size="lg">
                        <Link href={`/torneios/${criadoId}`}>Ver evento</Link>
                    </Button>
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
                <div>
                    <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
                        <Link href="/torneios" className="flex items-center gap-2 text-marble-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                            <span className="text-sm">Voltar</span>
                        </Link>
                        <h1 className="font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">Criar Torneio</h1>
                        <Logo compact />
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

                {/* PASSO 1 */}
                {passo === 1 && (
                    <div className="space-y-5">
                        <h2 className="font-heading text-lg font-bold text-foreground">Informações do torneio</h2>

                        <div>
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nome do torneio *</label>
                            <input type="text" value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Ex: Downhill Cup 2026" className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30" />
                        </div>

                        {/* CAPA DO TORNEIO */}
                        <div>
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Capa do torneio</label>
                            <div className="mt-1">
                                {form.capa ? (
                                    <div className="relative rounded-xl overflow-hidden border border-border">
                                        <img src={form.capa} alt="Capa" className="w-full h-40 object-cover" />
                                        <button
                                            onClick={() => update("capa", "")}
                                            className="absolute top-2 right-2 size-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 hover:border-primary/30 transition-colors">
                                        <Image className="size-10 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">Adicionar capa</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG ou WEBP • Recomendado 1200×630px</p>
                                        <input
                                            type="text"
                                            value={form.capa}
                                            onChange={(e) => update("capa", e.target.value)}
                                            placeholder="Cole a URL da imagem"
                                            className="mt-3 w-full max-w-xs rounded-xl border border-border bg-background px-4 py-2 text-xs text-center outline-none focus:border-primary/30"
                                        />
                                    </div>
                                )}
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

                {/* PASSO 2 */}
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

                    </div>
                )}

                {/* PASSO 3 */}
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
                                <p className="text-[10px] text-muted-foreground mt-1">Deixe em branco ou R$ 0 para gratuito. Em evento pago, você recebe 90% de cada inscrição na sua Carteira depois de encerrar o evento; conecte sua conta de recebimento lá.</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Premiação total</label>
                                <div className="relative mt-1">
                                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input type="text" value={form.premiacao} onChange={(e) => update("premiacao", e.target.value)} placeholder="Ex: R$ 2.000" className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary/30" />
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Navegação */}
                <div className="flex gap-3 mt-8">
                    {passo > 1 && (
                        <Button onClick={() => setPasso(passo - 1)} variant="outline" size="lg" className="flex-1">
                            Voltar
                        </Button>
                    )}
                    {passo < 3 ? (
                        <Button onClick={() => setPasso(passo + 1)} disabled={!podeAvancar()} size="lg" className="flex-1">
                            Continuar
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} loading={enviando} variant="accent" size="lg" className="flex-1">
                            Publicar evento
                        </Button>
                    )}
                </div>
                {erroEnvio && <p role="alert" className="mt-4 text-sm text-destructive">{erroEnvio}</p>}
            </main>

            <div className="pb-24" />
            <BottomNav />
        </div>
    )
}
