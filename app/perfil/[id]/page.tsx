"use client"

import { ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

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

export default function PerfilPublicoPage() {
    const { id } = useParams()
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`https://imperium-bikes-production.up.railway.app/api/users/${id}`)
            .then(r => r.json())
            .then(data => {
                setPerfil(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [id])

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Carregando...</p></div>
    if (!perfil) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Usuário não encontrado</p></div>

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm">
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
                        <Link href="/buscar" className="flex shrink-0 items-center">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <span className="font-heading text-lg font-bold">{perfil.fullName}</span>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-2xl px-4 py-8">
                <div className="flex items-start gap-5">
                    <img src={perfil.avatarUrl || "/placeholder.svg"} alt={perfil.fullName} className="size-20 rounded-xl object-cover" />
                    <div>
                        <h1 className="font-heading text-xl font-bold">{perfil.fullName}</h1>
                        {perfil.bio && <p className="text-sm text-muted-foreground mt-2">{perfil.bio}</p>}
                        {(perfil.city || perfil.state) && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin className="size-3" />
                                {[perfil.city, perfil.state].filter(Boolean).join(", ")}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}