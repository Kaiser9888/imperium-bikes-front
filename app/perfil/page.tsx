// app/perfil/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Camera, Package, Trophy, Grid3X3, ShoppingBag, Medal, Settings, MapPin, Link2, X, Flame, Send, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import api from "@/lib/api"

type Aba = "fotos" | "produtos" | "torneios"

interface Produto {
    id: number
    nome?: string
    title?: string
    preco?: number
    price?: number
    img?: string
    imageUrl?: string
    modalidade?: string
    category?: string
}

interface Torneio {
    id: string
    nome: string
    posicao: number
    data: string
}

export default function PerfilPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const [aba, setAba] = useState<Aba>("fotos")
    const [fotoSelecionada, setFotoSelecionada] = useState<number | null>(null)
    const [comentario, setComentario] = useState("")
    const [comentarios, setComentarios] = useState<{ texto: string; autor: string }[]>([])
    const [curtidas, setCurtidas] = useState<Record<number, boolean>>({})
    const [contagemCurtidas, setContagemCurtidas] = useState<Record<number, number>>({})
    const [modoExclusao, setModoExclusao] = useState(false)

    // Dados reais
    const [fotos, setFotos] = useState<string[]>([])
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [torneios, setTorneios] = useState<Torneio[]>([])
    const [loading, setLoading] = useState(true)
    const [bio, setBio] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")
    const [pais, setPais] = useState("")

    const carregarPerfil = useCallback(async () => {
        if (!user) return
        try {
            setLoading(true)
            const [resPerfil, resProdutos, resTorneios] = await Promise.all([
                api.get(`/api/users/${user.id}`).catch(() => null),
                api.get("/api/products", { params: { userId: user.id } }).catch(() => null),
                api.get(`/api/users/${user.id}/torneios`).catch(() => null),
            ])

            if (resPerfil?.data) {
                setBio(resPerfil.data.bio || "")
                setCidade(resPerfil.data.cidade || "")
                setEstado(resPerfil.data.estado || "")
                setPais(resPerfil.data.pais || "Brasil")
                if (resPerfil.data.fotos) {
                    setFotos(resPerfil.data.fotos)
                    setContagemCurtidas(
                        Object.fromEntries(resPerfil.data.fotos.map((_: string, i: number) => [i, resPerfil.data.curtidas?.[i] || 0]))
                    )
                }
            }

            if (resProdutos?.data) {
                const data = resProdutos.data.content || resProdutos.data || []
                setProdutos(data)
            }

            if (resTorneios?.data) {
                setTorneios(resTorneios.data)
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (isSignedIn) carregarPerfil()
    }, [isSignedIn, carregarPerfil])

    const abrirFoto = (index: number) => setFotoSelecionada(index)
    const fecharFoto = () => {
        setFotoSelecionada(null)
        setComentario("")
    }

    const enviarComentario = async () => {
        if (!comentario.trim() || fotoSelecionada === null) return
        const novoComentario = { texto: comentario, autor: user?.fullName || "Anônimo" }
        setComentarios([...comentarios, novoComentario])
        setComentario("")
        // Futuro: await api.post(`/api/fotos/${fotoSelecionada}/comentarios`, novoComentario)
    }

    const toggleCurtida = async (index: number) => {
        setCurtidas((prev) => ({ ...prev, [index]: !prev[index] }))
        setContagemCurtidas((prev) => ({
            ...prev,
            [index]: prev[index] + (curtidas[index] ? -1 : 1),
        }))
        // Futuro: await api.post(`/api/fotos/${index}/curtir`)
    }

    const excluirFoto = async (index: number) => {
        setFotos(fotos.filter((_, i) => i !== index))
        if (fotoSelecionada === index) fecharFoto()
        // Futuro: await api.delete(`/api/fotos/${index}`)
    }

    function formatPreco(valor: number) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
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
                    <h1 className="font-blackletter text-3xl text-primary mb-4">Imperium</h1>
                    <p className="text-muted-foreground mb-6">Entre para acessar seu perfil</p>
                    <SignInButton mode="modal">
                        <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                            Entrar
                        </button>
                    </SignInButton>
                </div>
                <BottomNav onMenuClick={() => {}} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header sem busca */}
            <header
                className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm"
                style={{ backgroundImage: "url(/images/marble-light.png)" }}
            >
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

            {/* Cabeçalho do perfil */}
            <section className="mx-auto max-w-2xl px-4 py-8">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <img
                            src={user.imageUrl || "/placeholder.svg"}
                            alt={user.fullName || "Perfil"}
                            className="size-20 rounded-full border-2 border-primary/20 object-cover md:size-24"
                        />
                        <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Camera className="size-3.5" />
                        </button>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h1 className="font-heading text-xl font-bold text-foreground truncate">
                            {user.fullName || user.username || "Usuário Imperium"}
                        </h1>
                        {bio && <p className="text-sm text-muted-foreground mt-1">{bio}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {(cidade || estado) && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    {[cidade, estado].filter(Boolean).join(", ")}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Link2 className="size-3" />
                                @{user.username || "usuario"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-2">
                    {[
                        { valor: fotos.length, label: "Fotos" },
                        { valor: produtos.length, label: "Produtos" },
                        { valor: torneios.length, label: "Torneios" },
                    ].map((stat) => (
                        <button
                            key={stat.label}
                            onClick={() => {
                                if (stat.label === "Fotos") setAba("fotos")
                                if (stat.label === "Produtos") setAba("produtos")
                                if (stat.label === "Torneios") setAba("torneios")
                            }}
                            className="rounded-xl bg-card border border-border p-3 text-center hover:border-primary/30 transition-colors"
                        >
                            <p className="font-heading text-lg font-bold text-foreground">{stat.valor}</p>
                            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* Abas */}
            <section className="mx-auto max-w-2xl px-4">
                <div className="flex border-b border-border">
                    {[
                        { key: "fotos", label: "Fotos", icon: Grid3X3 },
                        { key: "produtos", label: "Produtos", icon: ShoppingBag },
                        { key: "torneios", label: "Torneios", icon: Trophy },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setAba(key as Aba)}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${
                                aba === key
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Icon className="size-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Conteúdo da aba */}
            <section className="mx-auto max-w-2xl px-4 py-6">
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-sm">Carregando...</p>
                    </div>
                ) : (
                    <>
                        {/* Fotos */}
                        {aba === "fotos" && (
                            <>
                                {fotos.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Camera className="size-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground text-sm">Nenhuma foto postada</p>
                                        <button className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                            Postar foto
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {modoExclusao && (
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs text-red-500">Toque na foto para excluir</p>
                                                <button onClick={() => setModoExclusao(false)} className="text-xs font-medium text-primary hover:underline">
                                                    Concluído
                                                </button>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {fotos.map((foto, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => modoExclusao ? excluirFoto(i) : abrirFoto(i)}
                                                    onContextMenu={(e) => { e.preventDefault(); setModoExclusao(true) }}
                                                    className="aspect-square bg-secondary rounded-lg overflow-hidden hover:opacity-80 transition-opacity group relative"
                                                >
                                                    <img src={foto} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                                                    {modoExclusao ? (
                                                        <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                                                            <Trash2 className="size-6 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-start p-2 opacity-0 group-hover:opacity-100">
                                                            <div className="flex items-center gap-1 text-white text-xs">
                                                                <Flame className="size-3 fill-white" />
                                                                {contagemCurtidas[i] || 0}
                                                            </div>
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        {!modoExclusao && (
                                            <button
                                                onClick={() => setModoExclusao(true)}
                                                className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
                                            >
                                                Gerenciar fotos
                                            </button>
                                        )}
                                        <button className="fixed bottom-24 right-4 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                                            <Camera className="size-5" />
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        {/* Produtos */}
                        {aba === "produtos" && (
                            produtos.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="size-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">Nenhum produto cadastrado</p>
                                    <Link href="/vender" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                        Vender agora
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {produtos.map((produto) => (
                                        <Link
                                            key={produto.id}
                                            href={`/produto/${produto.id}`}
                                            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                                        >
                                            <div className="aspect-square bg-secondary">
                                                <img
                                                    src={produto.img || produto.imageUrl || "/placeholder.svg"}
                                                    alt={produto.nome || produto.title || "Produto"}
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                            <div className="p-3">
                                                <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-widest text-muted-foreground">
                                                    {produto.modalidade || produto.category || "Geral"}
                                                </span>
                                                <h3 className="text-sm font-semibold text-card-foreground mt-1">
                                                    {produto.nome || produto.title || "Sem nome"}
                                                </h3>
                                                <p className="font-heading text-base font-bold text-foreground mt-1">
                                                    {formatPreco(produto.preco || produto.price || 0)}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Torneios */}
                        {aba === "torneios" && (
                            torneios.length === 0 ? (
                                <div className="text-center py-12">
                                    <Trophy className="size-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground text-sm">Nenhum torneio disputado</p>
                                    <Link href="/configuracoes" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                        Adicionar torneio
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {torneios.map((torneio) => (
                                        <div key={torneio.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                                            <div className={`flex size-10 items-center justify-center rounded-full text-sm font-bold ${
                                                torneio.posicao === 1 ? "bg-yellow-500/10 text-yellow-600"
                                                    : torneio.posicao === 2 ? "bg-gray-300/20 text-gray-400"
                                                        : torneio.posicao === 3 ? "bg-amber-600/10 text-amber-700"
                                                            : "bg-secondary text-muted-foreground"
                                            }`}>
                                                {torneio.posicao > 0 ? `${torneio.posicao}º` : "—"}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-foreground">{torneio.nome}</p>
                                                <p className="text-xs text-muted-foreground">{torneio.data}</p>
                                            </div>
                                            <Medal className={`size-5 ${
                                                torneio.posicao === 1 ? "text-yellow-500"
                                                    : torneio.posicao === 2 ? "text-gray-400"
                                                        : torneio.posicao === 3 ? "text-amber-700"
                                                            : "text-muted-foreground"
                                            }`} />
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </section>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />

            {/* Modal de visualização de foto */}
            {fotoSelecionada !== null && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <img src={user?.imageUrl || "/placeholder.svg"} alt="Avatar" className="size-8 rounded-full object-cover" />
                            <span className="text-sm font-medium text-white">{user?.fullName || user?.username || "Usuário"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => excluirFoto(fotoSelecionada)}
                                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/50 transition-colors"
                            >
                                <Trash2 className="size-4" />
                            </button>
                            <button
                                onClick={fecharFoto}
                                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center px-2">
                        <img src={fotos[fotoSelecionada]} alt="Foto" className="max-h-full max-w-full rounded-lg object-contain" />
                    </div>

                    <div className="px-4 py-3">
                        <div className="flex items-center gap-4">
                            <button onClick={() => toggleCurtida(fotoSelecionada)} className="transition-transform active:scale-125">
                                <Flame className={`size-6 transition-colors ${curtidas[fotoSelecionada] ? "fill-orange-500 text-orange-500" : "text-white"}`} />
                            </button>
                            <span className="text-sm font-medium text-white">
                                {contagemCurtidas[fotoSelecionada] || 0} {contagemCurtidas[fotoSelecionada] === 1 ? "curtida" : "curtidas"}
                            </span>
                        </div>
                    </div>

                    <div className="bg-background rounded-t-2xl max-h-64 overflow-y-auto">
                        <div className="p-4 space-y-3">
                            {comentarios.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>
                            )}
                            {comentarios.map((c, i) => (
                                <div key={i}>
                                    <span className="text-sm font-semibold text-foreground">{c.autor}</span>
                                    {" "}
                                    <span className="text-sm text-muted-foreground">{c.texto}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 border-t border-border/50 px-4 py-2.5">
                            <input
                                type="text"
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                placeholder="Adicionar comentário..."
                                className="flex-1 bg-transparent text-[13px] text-foreground/80 outline-none placeholder:text-muted-foreground/50"
                                onKeyDown={(e) => { if (e.key === "Enter" && comentario.trim()) enviarComentario() }}
                            />
                            {comentario.trim() && (
                                <button onClick={enviarComentario} className="text-primary/70 hover:text-primary transition-colors">
                                    <Send className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}