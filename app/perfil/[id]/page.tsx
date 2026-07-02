/* eslint-disable @typescript-eslint/no-explicit-any */
// app/perfil/[id]/page.tsx
"use client"

import { ArrowLeft, Package, Trophy, Grid3X3, ShoppingBag, Medal, MapPin, Camera } from "lucide-react"
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

const API_URL = 'https://imperium-bikes.onrender.com'

export default function PerfilPublicoPage() {
    const { id } = useParams()
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
    const [loading, setLoading] = useState(true)
    const [aba, setAba] = useState<Aba>("fotos")

    useEffect(() => {
        fetch(`${API_URL}/api/users/${id}`)
            .then(r => r.json())
            .then(data => {
                setPerfil(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                    <div className="bg-marble/15 backdrop-blur-[2px]">
                        <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-3">
                            <Link href="/buscar" className="flex shrink-0 items-center"><ArrowLeft className="size-5" /></Link>
                        </div>
                    </div>
                </header>
                <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Carregando...</p></div>
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
                            <Link href="/buscar" className="flex shrink-0 items-center"><ArrowLeft className="size-5" /></Link>
                        </div>
                    </div>
                </header>
                <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Usuário não encontrado</p></div>
                <BottomNav onMenuClick={() => {}} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <Link href="/buscar" className="flex shrink-0 items-center"><ArrowLeft className="size-5" /></Link>
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
                        <h1 className="font-heading text-xl font-bold text-foreground">{perfil.fullName}</h1>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            {[perfil.city, perfil.state].filter(Boolean).join(", ") || "Brasil"}
                        </div>
                        {perfil.bio && <p className="text-sm text-foreground mt-2">{perfil.bio}</p>}
                        <span className="inline-block mt-2 rounded-full bg-primary/10 px-3 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-primary">{perfil.userLevel}</span>
                    </div>
                </div>

                <div className="mt-8 flex border-b border-border">
                    {[{ key: "fotos", label: "Fotos", icon: Grid3X3 },{ key: "produtos", label: "Produtos", icon: ShoppingBag },{ key: "torneios", label: "Torneios", icon: Trophy }].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setAba(key as Aba)} className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${aba === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                            <Icon className="size-4" />{label}
                        </button>
                    ))}
                </div>

                <div className="py-6">
                    {aba === "fotos" && <div className="text-center py-12"><Camera className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhuma foto postada</p></div>}
                    {aba === "produtos" && <div className="text-center py-12"><Package className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhum produto cadastrado</p></div>}
                    {aba === "torneios" && <div className="text-center py-12"><Trophy className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhum torneio disputado</p></div>}
                </div>
            </main>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}