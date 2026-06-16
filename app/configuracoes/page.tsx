// app/configuracoes/page.tsx
"use client"

import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface Torneio { id: string; nome: string; posicao: number; data: string }

export default function ConfiguracoesPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const [bio, setBio] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")
    const [pais, setPais] = useState("Brasil")
    const [username, setUsername] = useState("")
    const [mostrarSeguidores, setMostrarSeguidores] = useState(true)
    const [mostrarSeguindo, setMostrarSeguindo] = useState(true)
    const [planoPatrocinio, setPlanoPatrocinio] = useState("mensal")
    const [precoPatrocinio, setPrecoPatrocinio] = useState("")
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

    const removerTorneio = (id: string) => setTorneios(torneios.filter((t) => t.id !== id))

    const salvar = () => { setSalvo(true); setTimeout(() => setSalvo(false), 2000) }

    const labelPlano = () => {
        switch (planoPatrocinio) {
            case "mensal": return "/mês"
            case "trimestral": return "/trimestre"
            case "anual": return "/ano"
            case "vitalicio": return " (único)"
            default: return ""
        }
    }

    if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>
    if (!isSignedIn) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Entre para acessar</p></div>

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-3">
                        <Link href="/perfil" className="flex items-center gap-2 text-marble-foreground hover:text-foreground"><ArrowLeft className="size-5" /><span className="text-sm">Voltar</span></Link>
                        <h1 className="flex-1 text-center font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">Configurações</h1>
                        <div className="w-16" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
                {/* Perfil */}
                <section>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Perfil</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome completo</label>
                            <input type="text" defaultValue={user?.fullName || ""} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">@username</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={user?.username || "seuusername"} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" />
                            <p className="text-[10px] text-muted-foreground mt-1">Único e intransferível.</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Bio</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Conte sobre você..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30 resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[10px] text-muted-foreground uppercase tracking-wider">Cidade</label><input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" /></div>
                            <div><label className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado</label><input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" /></div>
                        </div>
                        <div><label className="text-[10px] text-muted-foreground uppercase tracking-wider">País</label><input type="text" value={pais} onChange={(e) => setPais(e.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" /></div>
                    </div>
                </section>

                {/* Privacidade */}
                <section>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Privacidade</h2>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors">
                            <span className="text-sm text-foreground">Mostrar seguidores publicamente</span>
                            <input type="checkbox" checked={mostrarSeguidores} onChange={(e) => setMostrarSeguidores(e.target.checked)} className="accent-primary size-4" />
                        </label>
                        <label className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors">
                            <span className="text-sm text-foreground">Mostrar seguindo publicamente</span>
                            <input type="checkbox" checked={mostrarSeguindo} onChange={(e) => setMostrarSeguindo(e.target.checked)} className="accent-primary size-4" />
                        </label>
                    </div>
                </section>

                {/* Patrocinadores */}
                <section>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Patrocinadores</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Plano de patrocínio</label>
                            <select
                                value={planoPatrocinio}
                                onChange={(e) => setPlanoPatrocinio(e.target.value)}
                                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30 cursor-pointer"
                            >
                                <option value="mensal">Mensal</option>
                                <option value="trimestral">Trimestral</option>
                                <option value="anual">Anual</option>
                                <option value="vitalicio">Vitalício</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor</label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-muted-foreground">R$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={precoPatrocinio}
                                    onChange={(e) => setPrecoPatrocinio(e.target.value)}
                                    placeholder="49,90"
                                    className="w-32 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary/30"
                                />
                                <span className="text-muted-foreground text-sm">{labelPlano()}</span>
                            </div>
                            {planoPatrocinio === "vitalicio" && (
                                <p className="text-[10px] text-muted-foreground mt-1">Cobrança única. O patrocinador aparece permanentemente.</p>
                            )}
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4 text-center">
                            <p className="text-sm text-muted-foreground">Gerenciamento de patrocinadores disponível em breve.</p>
                        </div>
                    </div>
                </section>

                {/* Torneios */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Torneios</h2>
                        <button onClick={() => setMostrarFormTorneio(!mostrarFormTorneio)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"><Plus className="size-3.5" />Adicionar</button>
                    </div>
                    {mostrarFormTorneio && (
                        <div className="rounded-xl border border-border bg-card p-4 mb-3 space-y-3">
                            <input type="text" value={novoTorneio.nome} onChange={(e) => setNovoTorneio({ ...novoTorneio, nome: e.target.value })} placeholder="Nome do torneio" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/30" />
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase">Posição</label>
                                    <select value={novoTorneio.posicao} onChange={(e) => setNovoTorneio({ ...novoTorneio, posicao: Number(e.target.value) })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mt-1 outline-none focus:border-primary/30">
                                        <option value={1}>1º Lugar</option><option value={2}>2º Lugar</option><option value={3}>3º Lugar</option><option value={0}>Participante</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase">Data</label>
                                    <input type="text" value={novoTorneio.data} onChange={(e) => setNovoTorneio({ ...novoTorneio, data: e.target.value })} placeholder="Mar 2026" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mt-1 outline-none focus:border-primary/30" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setMostrarFormTorneio(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors">Cancelar</button>
                                <button onClick={adicionarTorneio} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Salvar torneio</button>
                            </div>
                        </div>
                    )}
                    {torneios.length === 0 && !mostrarFormTorneio && <p className="text-sm text-muted-foreground text-center py-4">Nenhum torneio adicionado</p>}
                    <div className="space-y-2">
                        {torneios.map((t) => (
                            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-colors">
                                <div className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${t.posicao === 1 ? "bg-yellow-500/10 text-yellow-600" : t.posicao === 2 ? "bg-gray-300/20 text-gray-400" : t.posicao === 3 ? "bg-amber-600/10 text-amber-700" : "bg-secondary text-muted-foreground"}`}>{t.posicao > 0 ? `${t.posicao}º` : "—"}</div>
                                <div className="flex-1"><p className="text-sm font-medium">{t.nome}</p><p className="text-xs text-muted-foreground">{t.data}</p></div>
                                <button onClick={() => removerTorneio(t.id)} className="text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="size-4" /></button>
                            </div>
                        ))}
                    </div>
                </section>

                <button onClick={salvar} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors">
                    {salvo ? "✓ Salvo!" : <><Save className="size-4" />Salvar alterações</>}
                </button>
            </main>
        </div>
    )
}