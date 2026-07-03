/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
// app/perfil/page.tsx
"use client"

import { useUser, SignInButton, UserProfile } from "@clerk/nextjs"
import { Camera, Package, Trophy, Grid3X3, ShoppingBag, Medal, Settings, MapPin, X, Pencil, Plus, Loader2, Check } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { BottomNav } from "@/components/layout/bottom-nav"

type Aba = "fotos" | "produtos" | "torneios"

export default function PerfilPage() {
    const { user, isSignedIn, isLoaded } = useUser()

    const [bio, setBio] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")
    const [pais, setPais] = useState("Brasil")
    const [loading, setLoading] = useState(true)
    const [aba, setAba] = useState<Aba>("fotos")
    const [modalEditOpen, setModalEditOpen] = useState(false)
    const [editBio, setEditBio] = useState("")
    const [editCidade, setEditCidade] = useState("")
    const [editEstado, setEditEstado] = useState("")
    const [editPais, setEditPais] = useState("Brasil")
    const [showClerkProfile, setShowClerkProfile] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savedMsg, setSavedMsg] = useState(false)

    const carregarPerfil = async () => {
        if (!user) return
        setLoading(true)
        try {
            const syncRes = await api.post("/api/users/sync")
            const meuId = syncRes.data.id
            const perfilRes = await api.get(`/api/users/${meuId}`)
            const d = perfilRes.data
            setBio(d.bio || "")
            setCidade(d.city || "")
            setEstado(d.state || "")
            setPais(d.country || "Brasil")
        } catch (e) {
            console.error("Erro ao carregar perfil:", e)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (isSignedIn) carregarPerfil()
    }, [isSignedIn, user])

    const abrirModalEdit = () => {
        setEditBio(bio)
        setEditCidade(cidade)
        setEditEstado(estado)
        setEditPais(pais)
        setSavedMsg(false)
        setModalEditOpen(true)
    }

    const salvarEditRapido = async () => {
        setSaving(true)
        try {
            await api.put(`/api/users/me`, {
                fullName: user?.fullName,
                bio: editBio,
                city: editCidade,
                state: editEstado,
                country: editPais,
            })
            setBio(editBio)
            setCidade(editCidade)
            setEstado(editEstado)
            setPais(editPais)
            setSavedMsg(true)
            setTimeout(() => setModalEditOpen(false), 800)
        } catch (e) {
            console.error("Erro ao salvar:", e)
        }
        setSaving(false)
    }

    if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                    <div className="bg-marble/15 backdrop-blur-[2px]">
                        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                            <Link href="/" className="flex shrink-0 flex-col leading-none">
                                <span className="font-blackletter text-2xl leading-none text-primary">Imperium</span>
                                <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-marble-foreground/70">Bikes</span>
                            </Link>
                        </div>
                    </div>
                </header>
                <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <h1 className="font-blackletter text-3xl text-primary mb-4">Imperium</h1>
                    <p className="text-muted-foreground mb-6">Entre para acessar seu perfil</p>
                    <SignInButton mode="modal">
                        <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">Entrar</button>
                    </SignInButton>
                </div>
                <BottomNav onMenuClick={() => {}} />
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                        <Link href="/" className="flex shrink-0 flex-col leading-none">
                            <span className="font-blackletter text-2xl leading-none text-primary">Imperium</span>
                            <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-marble-foreground/70">Bikes</span>
                        </Link>
                        <Link href="/configuracoes" className="flex size-10 items-center justify-center rounded-md text-marble-foreground hover:bg-marble-foreground/10 transition-colors">
                            <Settings className="size-5" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-8">
                <div className="flex items-start gap-5">
                    <button onClick={() => setShowClerkProfile(true)} className="relative shrink-0 group">
                        <img src={user.imageUrl || "/placeholder.svg"} alt={user.fullName || "Perfil"} className="size-20 rounded-xl border-2 border-primary/20 object-cover md:size-24 group-hover:border-primary/50 transition-all" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="size-5 text-white" />
                        </div>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-heading text-xl font-bold text-foreground">{user.fullName || "Usuário Imperium"}</h1>
                        <p className="text-sm text-muted-foreground">@{user.username || "usuario"}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            {[cidade, estado, pais !== "Brasil" ? pais : null].filter(Boolean).join(", ") || "Brasil"}
                        </div>
                        {bio && <p className="text-sm text-foreground mt-2 bg-secondary/50 rounded-lg p-3 italic">&ldquo;{bio}&rdquo;</p>}
                        <button onClick={abrirModalEdit} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                            <Pencil className="size-3" />Editar perfil
                        </button>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="mt-8 grid grid-cols-3 gap-2">
                    {[{ valor: 0, label: "Fotos" },{ valor: 0, label: "Produtos" },{ valor: 0, label: "Torneios" }].map((stat) => (
                        <button key={stat.label} onClick={() => { if (stat.label === "Fotos") setAba("fotos"); if (stat.label === "Produtos") setAba("produtos"); if (stat.label === "Torneios") setAba("torneios") }}
                                className="rounded-xl bg-card border border-border p-4 text-center hover:border-primary/30 transition-colors">
                            <p className="font-heading text-2xl font-bold text-foreground">{stat.valor}</p>
                            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                        </button>
                    ))}
                </div>

                {/* Abas */}
                <div className="mt-8 flex border-b border-border">
                    {[{ key: "fotos", label: "Fotos", icon: Grid3X3 },{ key: "produtos", label: "Produtos", icon: ShoppingBag },{ key: "torneios", label: "Torneios", icon: Trophy }].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setAba(key as Aba)} className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${aba === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                            <Icon className="size-4" />{label}
                        </button>
                    ))}
                </div>

                {/* Conteúdo das abas */}
                <div className="py-6">
                    {aba === "fotos" && (
                        <div className="text-center py-16">
                            <Camera className="size-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-sm font-medium text-muted-foreground">Fotos em breve</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Compartilhe momentos com a comunidade</p>
                            <button disabled className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/50 px-5 py-2.5 text-sm font-medium text-primary-foreground/50 cursor-not-allowed">
                                <Camera className="size-4" />Postar foto
                            </button>
                        </div>
                    )}

                    {aba === "produtos" && (
                        <div className="text-center py-16">
                            <Package className="size-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-sm font-medium text-muted-foreground">Produtos em breve</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Anuncie suas bikes e peças para venda</p>
                            <button disabled className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/50 px-5 py-2.5 text-sm font-medium text-primary-foreground/50 cursor-not-allowed">
                                <Plus className="size-4" />Anunciar
                            </button>
                        </div>
                    )}

                    {aba === "torneios" && (
                        <div className="text-center py-16">
                            <Trophy className="size-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-sm font-medium text-muted-foreground">Torneios em breve</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Participe de competições e ganhe prêmios</p>
                            <button disabled className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/50 px-5 py-2.5 text-sm font-medium text-primary-foreground/50 cursor-not-allowed">
                                <Trophy className="size-4" />Inscrever-se
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <div className="pb-24" /><BottomNav onMenuClick={() => {}} />

            {/* Modal Editar Perfil */}
            {modalEditOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setModalEditOpen(false)} />
                    <div className="relative bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-heading text-base font-bold">Editar perfil</h3>
                            <button onClick={() => setModalEditOpen(false)} className="size-8 flex items-center justify-center rounded-md hover:bg-secondary"><X className="size-4" /></button>
                        </div>
                        {savedMsg ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                                <div className="size-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Check className="size-6 text-green-500" />
                                </div>
                                <p className="font-medium text-foreground">Perfil atualizado!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase">Bio</label>
                                    <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={2} placeholder="Conte um pouco sobre você..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30 resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-muted-foreground uppercase">Cidade</label>
                                        <input value={editCidade} onChange={(e) => setEditCidade(e.target.value)} placeholder="São Paulo" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-muted-foreground uppercase">Estado</label>
                                        <input value={editEstado} onChange={(e) => setEditEstado(e.target.value)} placeholder="SP" className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-muted-foreground uppercase">País</label>
                                    <input value={editPais} onChange={(e) => setEditPais(e.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" />
                                </div>
                            </div>
                        )}
                        {!savedMsg && (
                            <div className="flex gap-2 mt-6">
                                <button onClick={() => setModalEditOpen(false)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-secondary">Cancelar</button>
                                <button onClick={salvarEditRapido} disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving && <Loader2 className="size-3 animate-spin" />}
                                    Salvar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Clerk - Foto, Nome, Email, Senha */}
            {showClerkProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowClerkProfile(false)} />
                    <div className="relative bg-background rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <button onClick={() => setShowClerkProfile(false)} className="absolute top-3 right-3 z-10 size-8 flex items-center justify-center rounded-full bg-background/80 hover:bg-secondary">
                            <X className="size-4" />
                        </button>
                        <UserProfile />
                    </div>
                </div>
            )}
        </div>
    )
}