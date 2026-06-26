/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
// app/perfil/[id]/page.tsx
"use client"

import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Package, Trophy, Grid3X3, ShoppingBag, Medal, MapPin, UserPlus, UserCheck, Camera } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { BottomNav } from "@/components/layout/bottom-nav"

type Aba = "fotos" | "produtos" | "torneios"

interface PerfilUsuario {
    userId: string
    fullName: string
    avatarUrl: string | null
    bio: string | null
    city: string | null
    state: string | null
    userLevel: string
    reputationScore: number
    totalReviews: number
    totalSales: number
}

const API_URL = 'https://imperium-bikes-production.up.railway.app'

declare global {
    interface Window {
        Clerk?: {
            session?: {
                getToken: () => Promise<string>
            }
        }
    }
}

export default function PerfilPublicoPage() {
    const { id } = useParams()
    const { user: currentUser } = useUser()
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
    const [loading, setLoading] = useState(true)
    const [aba, setAba] = useState<Aba>("fotos")
    const [jaSegue, setJaSegue] = useState(false)
    const [seguidores, setSeguidores] = useState(0)
    const [seguindo, setSeguindo] = useState(0)

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const perfilRes = await fetch(`${API_URL}/api/users/${id}`)
                const perfilData = await perfilRes.json()

                const followersRes = await fetch(`${API_URL}/api/users/${id}/followers/count`)
                const followersData = await followersRes.json()

                const followingRes = await fetch(`${API_URL}/api/users/${id}/following/count`)
                const followingData = await followingRes.json()

                let isFollowingData = { isFollowing: false }
                if (currentUser) {
                    const token = await window.Clerk?.session?.getToken()
                    const isFollowingRes = await fetch(`${API_URL}/api/users/${id}/is-following`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                    isFollowingData = await isFollowingRes.json()
                }

                setPerfil(perfilData)
                setSeguidores(followersData.count || 0)
                setSeguindo(followingData.count || 0)
                setJaSegue(isFollowingData.isFollowing || false)
            } catch (error) {
                console.error("Erro ao carregar perfil:", error)
            }
            setLoading(false)
        }
        carregarDados()
    }, [id, currentUser])

    const toggleSeguir = async () => {
        if (!currentUser) return
        try {
            const tok = await window.Clerk?.session?.getToken()
            if (jaSegue) {
                await fetch(`${API_URL}/api/users/${id}/follow`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${tok}` }
                })
                setSeguidores(prev => prev - 1)
            } else {
                await fetch(`${API_URL}/api/users/${id}/follow`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${tok}` }
                })
                setSeguidores(prev => prev + 1)
            }
            setJaSegue(!jaSegue)
        } catch (error) {
            console.error("Erro ao seguir:", error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                    <div className="bg-marble/15 backdrop-blur-[2px]">
                        <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-3">
                            <Link href="/buscar" className="flex shrink-0 items-center">
                                <ArrowLeft className="size-5" />
                            </Link>
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

    if (!perfil) {
        return (
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                    <div className="bg-marble/15 backdrop-blur-[2px]">
                        <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-3">
                            <Link href="/buscar" className="flex shrink-0 items-center">
                                <ArrowLeft className="size-5" />
                            </Link>
                        </div>
                    </div>
                </header>
                <div className="flex items-center justify-center py-20">
                    <p className="text-muted-foreground">Usuário não encontrado</p>
                </div>
                <BottomNav onMenuClick={() => {}} />
            </div>
        )
    }

    const ehPerfilProprio = currentUser?.id === id

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <Link href="/buscar" className="flex shrink-0 items-center">
                                <ArrowLeft className="size-5" />
                            </Link>
                            <span className="font-heading text-lg font-bold text-foreground truncate">{perfil.fullName}</span>
                        </div>
                        <div className="size-10" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-8">
                <div className="flex items-start gap-5">
                    <div className="relative shrink-0">
                        <img src={perfil.avatarUrl || "/placeholder.svg"} alt={perfil.fullName} className="size-20 rounded-xl border-2 border-primary/20 object-cover md:size-24" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="font-heading text-xl font-bold text-foreground">{perfil.fullName}</h1>
                            {!ehPerfilProprio && currentUser && (
                                <button onClick={toggleSeguir} className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${jaSegue ? "bg-secondary text-muted-foreground hover:bg-red-50 hover:text-red-500" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                                    {jaSegue ? <UserCheck className="size-3.5" /> : <UserPlus className="size-3.5" />}
                                    {jaSegue ? "Seguindo" : "Seguir"}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            {[perfil.city, perfil.state].filter(Boolean).join(", ") || "Brasil"}
                        </div>
                        {perfil.bio && <p className="text-sm text-foreground mt-2">{perfil.bio}</p>}
                        <span className="inline-block mt-2 rounded-full bg-primary/10 px-3 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-primary">
                            {perfil.userLevel}
                        </span>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-6">
                    <button className="text-center">
                        <p className="font-heading text-xl font-bold text-foreground">{seguidores}</p>
                        <p className="text-xs text-muted-foreground">Seguidores</p>
                    </button>
                    <button className="text-center">
                        <p className="font-heading text-xl font-bold text-foreground">{seguindo}</p>
                        <p className="text-xs text-muted-foreground">Seguindo</p>
                    </button>
                    <button className="text-center">
                        <p className="font-heading text-xl font-bold text-foreground">{perfil.totalSales}</p>
                        <p className="text-xs text-muted-foreground">Vendas</p>
                    </button>
                    <button className="text-center">
                        <p className="font-heading text-xl font-bold text-foreground">{perfil.reputationScore.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Nota</p>
                    </button>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2">
                    {[{ valor: 0, label: "Fotos" },{ valor: 0, label: "Produtos" },{ valor: 0, label: "Torneios" }].map((stat) => (
                        <button key={stat.label} onClick={() => { if (stat.label === "Fotos") setAba("fotos"); if (stat.label === "Produtos") setAba("produtos"); if (stat.label === "Torneios") setAba("torneios") }}
                                className="rounded-xl bg-card border border-border p-4 text-center hover:border-primary/30 transition-colors">
                            <p className="font-heading text-2xl font-bold text-foreground">{stat.valor}</p>
                            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex border-b border-border">
                    {[{ key: "fotos", label: "Fotos", icon: Grid3X3 },{ key: "produtos", label: "Produtos", icon: ShoppingBag },{ key: "torneios", label: "Torneios", icon: Trophy }].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setAba(key as Aba)} className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${aba === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                            <Icon className="size-4" />{label}
                        </button>
                    ))}
                </div>

                <div className="py-6">
                    {aba === "fotos" && (
                        <div className="text-center py-12"><Camera className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhuma foto postada</p></div>
                    )}
                    {aba === "produtos" && (
                        <div className="text-center py-12"><Package className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhum produto cadastrado</p></div>
                    )}
                    {aba === "torneios" && (
                        <div className="text-center py-12"><Trophy className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhum torneio disputado</p></div>
                    )}
                </div>
            </main>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}