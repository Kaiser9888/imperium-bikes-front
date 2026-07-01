/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
// app/perfil/page.tsx
"use client"

import { useUser, SignInButton } from "@clerk/nextjs"
import { Camera, Package, Trophy, Grid3X3, ShoppingBag, Medal, Settings, MapPin, X, Flame, Send, Trash2, Plus, Pencil } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import api from "@/lib/api"
import { BottomNav } from "@/components/layout/bottom-nav"

const API_URL = 'https://imperium-bikes.onrender.com'

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

interface FotoItem {
    id: string
    url: string
    curtidas: number
    curtiu: boolean
}

export default function PerfilPage() {
    const { user, isSignedIn, isLoaded } = useUser()

    const [fotos, setFotos] = useState<FotoItem[]>([])
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [torneios, setTorneios] = useState<Torneio[]>([])
    const [banners, setBanners] = useState<string[]>([])
    const [bio, setBio] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")
    const [pais, setPais] = useState("Brasil")
    const [seguidores, setSeguidores] = useState(0)
    const [seguindo, setSeguindo] = useState(0)
    const [loading, setLoading] = useState(true)
    const [aba, setAba] = useState<Aba>("fotos")
    const [fotoSelecionada, setFotoSelecionada] = useState<number | null>(null)
    const [comentario, setComentario] = useState("")
    const [comentarios, setComentarios] = useState<{ id: string; texto: string; autor: string }[]>([])
    const [modoExclusao, setModoExclusao] = useState(false)
    const [modalEditOpen, setModalEditOpen] = useState(false)
    const [editBio, setEditBio] = useState("")
    const [editCidade, setEditCidade] = useState("")
    const [editEstado, setEditEstado] = useState("")
    const [editPais, setEditPais] = useState("Brasil")
    const [modalSeguidores, setModalSeguidores] = useState<"seguidores" | "seguindo" | null>(null)
    const [listaModal, setListaModal] = useState<any[]>([])
    const [loadingModal, setLoadingModal] = useState(false)

    const carregarPerfil = () => {
        if (!user) return
        setLoading(true)
        const userId = user.id
        api.post("/api/users/sync").catch(() => {})
        Promise.all([
            api.get(`/api/users/${userId}`).catch(() => null),
            api.get(`/api/users/${userId}/followers/count`).catch(() => null),
            api.get(`/api/users/${userId}/following/count`).catch(() => null),
        ]).then(([resPerfil, resSeguidores, resSeguindo]) => {
            if (resPerfil?.data) {
                setBio(resPerfil.data.bio || "")
                setCidade(resPerfil.data.city || resPerfil.data.cidade || "")
                setEstado(resPerfil.data.state || resPerfil.data.estado || "")
                setPais(resPerfil.data.country || resPerfil.data.pais || "Brasil")
            }
            if (resSeguidores?.data) setSeguidores(resSeguidores.data.count || 0)
            if (resSeguindo?.data) setSeguindo(resSeguindo.data.count || 0)
        }).catch((error) => {
            console.error("Erro ao carregar perfil:", error)
        }).finally(() => setLoading(false))
    }

    useEffect(() => {
        if (isSignedIn) carregarPerfil()
    }, [isSignedIn, user])

    const abrirModal = async (tipo: "seguidores" | "seguindo") => {
        if (!user) return
        setModalSeguidores(tipo)
        setLoadingModal(true)
        try {
            const endpoint = tipo === "seguidores" ? "followers" : "following"
            const res = await api.get(`/api/users/${user.id}/${endpoint}`)
            setListaModal(res.data.content || [])
        } catch (error) {
            console.error("Erro ao carregar lista:", error)
        }
        setLoadingModal(false)
    }

    const abrirFoto = async (index: number) => {
        setFotoSelecionada(index)
        setComentarios([])
        try {
            const fotoId = fotos[index].id
            const res = await api.get(`/api/fotos/${fotoId}/comentarios`)
            if (res?.data) setComentarios(Array.isArray(res.data) ? res.data : [])
        } catch {}
    }

    const fecharFoto = () => { setFotoSelecionada(null); setComentario("") }

    const enviarComentario = async () => {
        if (!comentario.trim() || fotoSelecionada === null) return
        const fotoId = fotos[fotoSelecionada].id
        try {
            const res = await api.post(`/api/fotos/${fotoId}/comentarios`, { texto: comentario })
            if (res?.data) {
                setComentarios((prev) => [...prev, res.data])
                setComentario("")
            }
        } catch (error) {
            console.error("Erro ao comentar:", error)
        }
    }

    const toggleCurtida = async (index: number) => {
        const foto = fotos[index]
        try {
            await api.post(`/api/fotos/${foto.id}/curtir`)
            setFotos((prev) =>
                prev.map((f, i) =>
                    i === index ? { ...f, curtiu: !f.curtiu, curtidas: f.curtidas + (f.curtiu ? -1 : 1) } : f
                )
            )
        } catch (error) {
            console.error("Erro ao curtir:", error)
        }
    }

    const excluirFoto = async (index: number) => {
        const foto = fotos[index]
        try {
            await api.delete(`/api/fotos/${foto.id}`)
            setFotos((prev) => prev.filter((_, i) => i !== index))
            if (fotoSelecionada === index) fecharFoto()
        } catch (error) {
            console.error("Erro ao excluir foto:", error)
        }
    }

    const abrirModalEdit = () => {
        setEditBio(bio)
        setEditCidade(cidade)
        setEditEstado(estado)
        setEditPais(pais)
        setModalEditOpen(true)
    }

    const salvarEditRapido = async () => {
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
        } catch (error) {
            console.error("Erro ao salvar perfil:", error)
        }
        setModalEditOpen(false)
    }

    function formatPreco(valor: number) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
    }

    if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>

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
                            <div className="size-10" />
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
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                    <div className="bg-marble/15 backdrop-blur-[2px]">
                        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                            <Link href="/" className="flex shrink-0 flex-col leading-none">
                                <span className="font-blackletter text-2xl leading-none text-primary">Imperium</span>
                                <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-marble-foreground/70">Bikes</span>
                            </Link>
                            <div className="size-10" />
                        </div>
                    </div>
                </header>
                <div className="flex items-center justify-center py-20">
                    <p className="text-muted-foreground">Carregando perfil...</p>
                </div>
                <BottomNav onMenuClick={() => {}} />
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
                            {[cidade, estado, pais !== "Brasil" ? pais : null].filter(Boolean).join(", ") || "Brasil"}
                        </div>
                        {bio && <p className="text-sm text-foreground mt-2">{bio}</p>}
                        <button onClick={abrirModalEdit} className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors">
                            <Pencil className="size-3" />Editar perfil
                        </button>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-6">
                    <button onClick={() => abrirModal("seguidores")} className="text-center hover:opacity-80 transition-opacity">
                        <p className="font-heading text-xl font-bold text-foreground">{seguidores.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Seguidores</p>
                    </button>
                    <button onClick={() => abrirModal("seguindo")} className="text-center hover:opacity-80 transition-opacity">
                        <p className="font-heading text-xl font-bold text-foreground">{seguindo.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Seguindo</p>
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2">
                    {[{ valor: fotos.length, label: "Fotos" },{ valor: produtos.length, label: "Produtos" },{ valor: torneios.length, label: "Torneios" }].map((stat) => (
                        <button key={stat.label} onClick={() => { if (stat.label === "Fotos") setAba("fotos"); if (stat.label === "Produtos") setAba("produtos"); if (stat.label === "Torneios") setAba("torneios") }}
                                className="rounded-xl bg-card border border-border p-4 text-center hover:border-primary/30 transition-colors">
                            <p className="font-heading text-2xl font-bold text-foreground">{stat.valor}</p>
                            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                        </button>
                    ))}
                </div>

                {banners.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Patrocinadores</p>
                            <Link href="/configuracoes/patrocinadores" className="text-xs font-medium text-primary hover:underline">Gerenciar</Link>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {banners.map((banner, i) => (
                                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                                    <img src={banner} alt={`Banner ${i + 1}`} className="w-full h-20 object-cover" />
                                </div>
                            ))}
                            <Link href="/configuracoes/patrocinadores" className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-transparent p-3 hover:border-primary/50 transition-all text-muted-foreground hover:text-primary">
                                <Plus className="size-5" /><span className="text-[0.6rem] font-medium">Anunciar</span>
                            </Link>
                        </div>
                    </div>
                )}

                <div className="mt-8 flex border-b border-border">
                    {[{ key: "fotos", label: "Fotos", icon: Grid3X3 },{ key: "produtos", label: "Produtos", icon: ShoppingBag },{ key: "torneios", label: "Torneios", icon: Trophy }].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setAba(key as Aba)} className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${aba === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                            <Icon className="size-4" />{label}
                        </button>
                    ))}
                </div>

                <div className="py-6">
                    {aba === "fotos" && (
                        fotos.length === 0 ? (
                            <div className="text-center py-12"><Camera className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhuma foto postada</p></div>
                        ) : (
                            <>
                                {modoExclusao && <div className="flex items-center justify-between mb-2"><p className="text-xs text-red-500">Toque para excluir</p><button onClick={() => setModoExclusao(false)} className="text-xs font-medium text-primary hover:underline">Concluído</button></div>}
                                <div className="grid grid-cols-3 gap-1.5">
                                    {fotos.map((foto, i) => (
                                        <button key={foto.id} onClick={() => modoExclusao ? excluirFoto(i) : abrirFoto(i)} onContextMenu={(e) => { e.preventDefault(); setModoExclusao(true) }} className="aspect-square bg-secondary rounded-lg overflow-hidden hover:opacity-80 transition-opacity group relative">
                                            <img src={foto.url} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                                            {modoExclusao ? <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center"><Trash2 className="size-6 text-white" /></div>
                                                : <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-start p-2 opacity-0 group-hover:opacity-100"><Flame className={`size-3 ${foto.curtiu ? "fill-orange-500" : "fill-white"}`} /><span className="text-white text-xs ml-1">{foto.curtidas}</span></div>}
                                        </button>
                                    ))}
                                </div>
                                {!modoExclusao && <button onClick={() => setModoExclusao(true)} className="mt-3 text-xs text-muted-foreground hover:text-foreground w-full text-center">Gerenciar fotos</button>}
                                <button className="fixed bottom-24 right-4 z-30 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"><Camera className="size-5" /></button>
                            </>
                        )
                    )}

                    {aba === "produtos" && (
                        produtos.length === 0 ? (
                            <div className="text-center py-12"><Package className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhum produto cadastrado</p><Link href="/vender" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Vender agora</Link></div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {produtos.map((p) => (
                                    <Link key={p.id} href={`/produto/${p.id}`} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-square bg-secondary"><img src={p.img || p.imageUrl || "/placeholder.svg"} alt={p.nome || p.title || ""} className="size-full object-cover" /></div>
                                        <div className="p-3"><span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">{p.modalidade || p.category || "Geral"}</span><h3 className="text-sm font-semibold mt-1">{p.nome || p.title}</h3><p className="font-heading text-base font-bold mt-1">{formatPreco(p.preco || p.price || 0)}</p></div>
                                    </Link>
                                ))}
                            </div>
                        )
                    )}

                    {aba === "torneios" && (
                        torneios.length === 0 ? (
                            <div className="text-center py-12"><Trophy className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhum torneio disputado</p><Link href="/configuracoes" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Adicionar torneio</Link></div>
                        ) : (
                            <div className="space-y-3">
                                {torneios.map((t) => (
                                    <div key={t.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                                        <div className={`flex size-10 items-center justify-center rounded-full text-sm font-bold ${t.posicao===1?"bg-yellow-500/10 text-yellow-600":t.posicao===2?"bg-gray-300/20 text-gray-400":"bg-amber-600/10 text-amber-700"}`}>{t.posicao > 0 ? `${t.posicao}º` : "—"}</div>
                                        <div className="flex-1"><p className="text-sm font-semibold">{t.nome}</p><p className="text-xs text-muted-foreground">{t.data}</p></div>
                                        <Medal className={`size-5 ${t.posicao===1?"text-yellow-500":t.posicao===2?"text-gray-400":"text-amber-700"}`} />
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </main>

            <div className="pb-24" /><BottomNav onMenuClick={() => {}} />

            {/* Modal de Editar Perfil */}
            {modalEditOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setModalEditOpen(false)} />
                    <div className="relative bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6"><h3 className="font-heading text-base font-bold">Editar perfil</h3><button onClick={() => setModalEditOpen(false)} className="size-8 flex items-center justify-center rounded-md hover:bg-secondary"><X className="size-4" /></button></div>
                        <div className="space-y-4">
                            <div><label className="text-[10px] text-muted-foreground uppercase">Bio</label><textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={2} className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30 resize-none" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] text-muted-foreground uppercase">Cidade</label><input value={editCidade} onChange={(e) => setEditCidade(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" /></div>
                                <div><label className="text-[10px] text-muted-foreground uppercase">Estado</label><input value={editEstado} onChange={(e) => setEditEstado(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" /></div>
                            </div>
                            <div><label className="text-[10px] text-muted-foreground uppercase">País</label><input value={editPais} onChange={(e) => setEditPais(e.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" /></div>
                        </div>
                        <div className="flex gap-2 mt-6"><button onClick={() => setModalEditOpen(false)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-secondary">Cancelar</button><button onClick={salvarEditRapido} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Salvar</button></div>
                    </div>
                </div>
            )}

            {/* Modal de Seguidores/Seguindo */}
            {modalSeguidores && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setModalSeguidores(null)} />
                    <div className="relative bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[70vh] overflow-y-auto p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-heading text-base font-bold">
                                {modalSeguidores === "seguidores" ? "Seguidores" : "Seguindo"}
                            </h3>
                            <button onClick={() => setModalSeguidores(null)} className="size-8 flex items-center justify-center rounded-md hover:bg-secondary">
                                <X className="size-4" />
                            </button>
                        </div>
                        {loadingModal ? (
                            <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
                        ) : listaModal.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                {modalSeguidores === "seguidores" ? "Nenhum seguidor ainda" : "Não segue ninguém ainda"}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {listaModal.map((u: any) => (
                                    <Link key={u.userId} href={`/perfil/${u.userId}`} onClick={() => setModalSeguidores(null)}
                                          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:shadow-sm transition-shadow">
                                        <img src={u.avatarUrl || "/placeholder.svg"} alt={u.fullName} className="size-10 rounded-full object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-foreground">{u.fullName}</p>
                                            {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Foto */}
            {fotoSelecionada !== null && (
                <div className="fixed inset-0 z-50 flex flex-col bg-black">
                    <div className="flex items-center justify-between px-4 py-3"><div className="flex items-center gap-3"><img src={user?.imageUrl||"/placeholder.svg"} alt="Avatar" className="size-8 rounded-full object-cover" /><span className="text-sm font-medium text-white">{user?.fullName||"Usuário"}</span></div><div className="flex items-center gap-1"><button onClick={() => excluirFoto(fotoSelecionada)} className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-red-500/50"><Trash2 className="size-4"/></button><button onClick={fecharFoto} className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"><X className="size-4"/></button></div></div>
                    <div className="flex-1 flex items-center justify-center px-2"><img src={fotos[fotoSelecionada].url} alt="Foto" className="max-h-full max-w-full rounded-lg object-contain"/></div>
                    <div className="px-4 py-3 flex items-center gap-4"><button onClick={() => toggleCurtida(fotoSelecionada)} className="transition-transform active:scale-125"><Flame className={`size-6 ${fotos[fotoSelecionada].curtiu?"fill-orange-500 text-orange-500":"text-white"}`}/></button><span className="text-sm font-medium text-white">{fotos[fotoSelecionada].curtidas} {fotos[fotoSelecionada].curtidas===1?"curtida":"curtidas"}</span></div>
                    <div className="bg-background rounded-t-2xl max-h-64 overflow-y-auto"><div className="p-4 space-y-3">{comentarios.length===0&&<p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda.</p>}{comentarios.map((c)=><div key={c.id}><span className="text-sm font-semibold text-foreground">{c.autor}</span> <span className="text-sm text-muted-foreground">{c.texto}</span></div>)}</div><div className="flex items-center gap-2 border-t border-border/50 px-4 py-2.5"><input type="text" value={comentario} onChange={(e)=>setComentario(e.target.value)} placeholder="Adicionar comentário..." className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/50" onKeyDown={(e)=>{if(e.key==="Enter"&&comentario.trim())enviarComentario()}}/>{comentario.trim()&&<button onClick={enviarComentario} className="text-primary/70 hover:text-primary"><Send className="size-3.5"/></button>}</div></div>
                </div>
            )}
        </div>
    )
}