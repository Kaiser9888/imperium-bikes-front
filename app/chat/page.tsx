/* eslint-disable react-hooks/set-state-in-effect */
// app/chat/page.tsx
"use client"

import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser } from "@clerk/nextjs"
import { MessageCircle, Search } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import api from "@/lib/api"

interface Conversa {
    id: string
    nome: string
    avatar: string
    ultimaMensagem: string
    horario: string
    naoLidas: number
    produto?: string
}

export default function ChatPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const [conversas, setConversas] = useState<Conversa[]>([])
    const [busca, setBusca] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isSignedIn) return
        setLoading(true)
        api.get("/api/conversations")
            .then((res) => {
                if (res.data) {
                    const data = res.data.content || res.data || []
                    setConversas(data)
                }
            })
            .catch((error) => {
                console.error("Erro ao carregar conversas:", error)
            })
            .finally(() => setLoading(false))
    }, [isSignedIn])

    const conversasFiltradas = conversas.filter((c) =>
        c.nome?.toLowerCase().includes(busca.toLowerCase())
    )

    if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>

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

            <main className="mx-auto max-w-2xl px-4 py-6">
                <h1 className="font-blackletter text-3xl text-primary mb-4">Mensagens</h1>

                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar conversa..."
                        className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-sm outline-none focus:border-primary/30"
                    />
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">Carregando conversas...</p>
                    </div>
                ) : conversasFiltradas.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageCircle className="size-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Nenhuma conversa</p>
                        <p className="text-xs text-muted-foreground mt-1">Suas conversas com vendedores aparecerão aqui</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {conversasFiltradas.map((c) => (
                            <Link
                                key={c.id}
                                href={`/chat/${c.id}`}
                                className="flex items-center gap-3 rounded-xl p-3 hover:bg-card transition-colors"
                            >
                                <div className="relative shrink-0">
                                    <img src={c.avatar || "/placeholder.svg"} alt={c.nome} className="size-12 rounded-full object-cover" />
                                    {c.naoLidas > 0 && (
                                        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                                            {c.naoLidas}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">{c.nome}</span>
                                        <span className="text-[0.6rem] text-muted-foreground">{c.horario}</span>
                                    </div>
                                    {c.produto && (
                                        <p className="text-xs text-primary font-medium mt-0.5">{c.produto}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground truncate">{c.ultimaMensagem}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}