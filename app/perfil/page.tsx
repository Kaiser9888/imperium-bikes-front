// app/perfil/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Camera, Package, Trophy, Grid3X3, ShoppingBag, Medal, Settings, MapPin, Link2, X, Flame, Send, Trash2, UserPlus, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type Aba = "fotos" | "produtos" | "torneios"

const fotosFake = [
    "/images/galeria-1.png",
    "/images/galeria-2.png",
    "/images/galeria-3.png",
    "/images/galeria-4.png",
    "/images/galeria-5.png",
    "/images/galeria-6.png",
]

const torneiosFake = [
    { id: "1", nome: "Downhill Cup 2026", posicao: 1, data: "Mar 2026" },
    { id: "2", nome: "Mountain Challenge", posicao: 2, data: "Jan 2026" },
    { id: "3", nome: "Urban Race SP", posicao: 3, data: "Nov 2025" },
]

const patrocinadoresFake = [
    { nome: "Nike SB", logo: "/images/patro-nike.png" },
    { nome: "Red Bull", logo: "/images/patro-redbull.png" },
    { nome: "Shimano", logo: "/images/patro-shimano.png" },
    { nome: "Fox Racing", logo: "/images/patro-fox.png" },
    { nome: "Monster", logo: "/images/patro-monster.png" },
    { nome: "Oakley", logo: "/images/patro-oakley.png" },
]

export default function PerfilPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const [aba, setAba] = useState<Aba>("fotos")
    const [fotoSelecionada, setFotoSelecionada] = useState<number | null>(null)
    const [comentario, setComentario] = useState("")
    const [comentarios, setComentarios] = useState<{ texto: string; autor: string }[]>([])
    const [curtidas, setCurtidas] = useState<Record<number, boolean>>({})
    const [contagemCurtidas, setContagemCurtidas] = useState<Record<number, number>>(
        Object.fromEntries(fotosFake.map((_, i) => [i, Math.floor(Math.random() * 80) + 10]))
    )
    const [modoExclusao, setModoExclusao] = useState(false)
    const [fotos, setFotos] = useState(fotosFake)
    const [seguidores, setSeguidores] = useState(1247)
    const [seguindo, setSeguindo] = useState(389)

    const abrirFoto = (index: number) => setFotoSelecionada(index)
    const fecharFoto = () => { setFotoSelecionada(null); setComentario("") }

    const enviarComentario = () => {
        if (!comentario.trim()) return
        setComentarios([...comentarios, { texto: comentario, autor: user?.fullName || "Anônimo" }])
        setComentario("")
    }

    const toggleCurtida = (index: number) => {
        setCurtidas((prev) => ({ ...prev, [index]: !prev[index] }))
        setContagemCurtidas((prev) => ({ ...prev, [index]: prev[index] + (curtidas[index] ? -1 : 1) }))
    }

    const excluirFoto = (index: number) => {
        setFotos(fotos.filter((_, i) => i !== index))
        if (fotoSelecionada === index) fecharFoto()
    }

    if (!isLoaded) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-background">
                <Header onMenuClick={() => {}} cartCount={0} notificationCount={0} />
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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
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
                {/* Topo: Foto + Info */}
                <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                        <img src={user.imageUrl || "/placeholder.svg"} alt={user.fullName || "Perfil"} className="size-20 rounded-xl border-2 border-primary/20 object-cover md:size-24" />
                        <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Camera className="size-3.5" />
                        </button>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-heading text-xl font-bold text-foreground">{user.fullName || "Usuário Imperium"}</h1>
                        <p className="text-sm text-muted-foreground">@{user.username || "usuario"}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            Brasil
                        </div>
                        <Link href="/configuracoes" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                            Editar perfil
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-3 gap-2">
                    {[
                        { valor: fotos.length, label: "Fotos" },
                        { valor: 0, label: "Produtos" },
                        { valor: torneiosFake.length, label: "Torneios" },
                    ].map((stat) => (
                        <button key={stat.label} onClick={() => { if (stat.label === "Fotos") setAba("fotos"); if (stat.label === "Produtos") setAba("produtos"); if (stat.label === "Torneios") setAba("torneios") }}
                                className="rounded-xl bg-card border border-border p-4 text-center hover:border-primary/30 transition-colors">
                            <p className="font-heading text-2xl font-bold text-foreground">{stat.valor}</p>
                            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                        </button>
                    ))}
                </div>

                {/* Seguidores | Seguindo */}
                <div className="mt-6 flex items-center divide-x divide-border">
                    <button className="flex-1 text-left pr-4 hover:opacity-80 transition-opacity">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">Seguidores</p>
                        <div className="flex items-center justify-between mt-1">
                            <p className="font-heading text-xl font-bold text-foreground">{seguidores.toLocaleString()}</p>
                            <ChevronRight className="size-4 text-muted-foreground" />
                        </div>
                    </button>
                    <button className="flex-1 text-left pl-4 hover:opacity-80 transition-opacity">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider">Seguindo</p>
                        <div className="flex items-center justify-between mt-1">
                            <p className="font-heading text-xl font-bold text-foreground">{seguindo.toLocaleString()}</p>
                            <ChevronRight className="size-4 text-muted-foreground" />
                        </div>
                    </button>
                </div>

                {/* Patrocinadores */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Patrocinadores</p>
                        <Link href="/configuracoes" className="text-xs font-medium text-primary hover:underline">Gerenciar</Link>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {patrocinadoresFake.map((p, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 hover:border-primary/30 transition-all cursor-pointer">
                                <img src={p.logo} alt={p.nome} className="size-10 rounded-lg object-cover" />
                                <span className="text-[0.6rem] font-medium text-foreground text-center leading-tight">{p.nome}</span>
                            </div>
                        ))}
                        <Link href="/configuracoes" className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-transparent p-3 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary">
                            <Plus className="size-5" />
                            <span className="text-[0.6rem] font-medium text-center leading-tight">Anunciar</span>
                        </Link>
                    </div>
                </div>

                {/* Abas */}
                <div className="mt-8 flex border-b border-border">
                    {[
                        { key: "fotos", label: "Fotos", icon: Grid3X3 },
                        { key: "produtos", label: "Produtos", icon: ShoppingBag },
                        { key: "torneios", label: "Torneios", icon: Trophy },
                    ].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setAba(key as Aba)}
                                className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${aba === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                            <Icon className="size-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Conteúdo */}
                <div className="py-6">
                    {aba === "fotos" && (
                        <>
                            {fotos.length === 0 ? (
                                <div className="text-center py-12">
                                    <Camera className="size-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">Nenhuma foto postada</p>
                                </div>
                            ) : (
                                <>
                                    {modoExclusao && (
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs text-red-500">Toque para excluir</p>
                                            <button onClick={() => setModoExclusao(false)} className="text-xs font-medium text-primary hover:underline">Concluído</button>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {fotos.map((foto, i) => (
                                            <button key={i} onClick={() => modoExclusao ? excluirFoto(i) : abrirFoto(i)}
                                                    onContextMenu={(e) => { e.preventDefault(); setModoExclusao(true) }}
                                                    className="aspect-square bg-secondary rounded-lg overflow-hidden hover:opacity-80 transition-opacity group relative">
                                                <img src={foto} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                                                {modoExclusao ? (
                                                    <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center"><Trash2 className="size-6 text-white" /></div>
                                                ) : (
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-start p-2 opacity-0 group-hover:opacity-100">
                                                        <div className="flex items-center gap-1 text-white text-xs"><Flame className="size-3 fill-white" />{contagemCurtidas[i]}</div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {!modoExclusao && (
                                        <button onClick={() => setModoExclusao(true)} className="mt-3 text-xs text-muted-foreground hover:text-foreground w-full text-center">Gerenciar fotos</button>
                                    )}
                                    <button className="fixed bottom-24 right-4 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                                        <Camera className="size-5" />
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {aba === "produtos" && (
                        <div className="text-center py-12">
                            <Package className="size-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">Nenhum produto cadastrado</p>
                            <Link href="/vender" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Vender agora</Link>
                        </div>
                    )}

                    {aba === "torneios" && (
                        <div className="space-y-3">
                            {torneiosFake.map((t) => (
                                <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                                    <div className={`flex size-10 items-center justify-center rounded-full text-sm font-bold ${t.posicao === 1 ? "bg-yellow-500/10 text-yellow-600" : t.posicao === 2 ? "bg-gray-300/20 text-gray-400" : "bg-amber-600/10 text-amber-700"}`}>{t.posicao}º</div>
                                    <div className="flex-1"><p className="text-sm font-semibold text-foreground">{t.nome}</p><p className="text-xs text-muted-foreground">{t.data}</p></div>
                                    <Medal className={`size-5 ${t.posicao === 1 ? "text-yellow-500" : t.posicao === 2 ? "text-gray-400" : "text-amber-700"}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />

            {/* Modal de foto */}
            {fotoSelecionada !== null && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <img src={user?.imageUrl || "/placeholder.svg"} alt="Avatar" className="size-8 rounded-full object-cover" />
                            <span className="text-sm font-medium text-white">{user?.fullName || "Usuário"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => excluirFoto(fotoSelecionada)} className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/50"><Trash2 className="size-4" /></button>
                            <button onClick={fecharFoto} className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="size-4" /></button>
                        </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-2">
                        <img src={fotos[fotoSelecionada]} alt="Foto" className="max-h-full max-w-full rounded-lg object-contain" />
                    </div>
                    <div className="px-4 py-3 flex items-center gap-4">
                        <button onClick={() => toggleCurtida(fotoSelecionada)} className="transition-transform active:scale-125">
                            <Flame className={`size-6 transition-colors ${curtidas[fotoSelecionada] ? "fill-orange-500 text-orange-500" : "text-white"}`} />
                        </button>
                        <span className="text-sm font-medium text-white">{contagemCurtidas[fotoSelecionada]} {contagemCurtidas[fotoSelecionada] === 1 ? "curtida" : "curtidas"}</span>
                    </div>
                    <div className="bg-background rounded-t-2xl max-h-64 overflow-y-auto">
                        <div className="p-4 space-y-3">
                            {comentarios.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>}
                            {comentarios.map((c, i) => (
                                <div key={i}><span className="text-sm font-semibold text-foreground">{c.autor}</span> <span className="text-sm text-muted-foreground">{c.texto}</span></div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 border-t border-border/50 px-4 py-2.5">
                            <input type="text" value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Adicionar comentário..." className="flex-1 bg-transparent text-[13px] text-foreground/80 outline-none placeholder:text-muted-foreground/50"
                                   onKeyDown={(e) => { if (e.key === "Enter" && comentario.trim()) enviarComentario() }} />
                            {comentario.trim() && <button onClick={enviarComentario} className="text-primary/70 hover:text-primary"><Send className="size-3.5" /></button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}