/* eslint-disable react-hooks/set-state-in-effect */
// app/chat/[id]/page.tsx
"use client"

import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Send, Image, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import api from "@/lib/api"

interface Mensagem {
    id: string
    texto: string
    remetente: "eu" | "outro"
    horario: string
}

export default function ConversaPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const params = useParams()
    const chatId = params.id as string
    const [mensagens, setMensagens] = useState<Mensagem[]>([])
    const [novaMensagem, setNovaMensagem] = useState("")
    const [loading, setLoading] = useState(true)
    const fimRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isSignedIn) return
        setLoading(true)
        api.get(`/api/messages/${chatId}`)
            .then((res) => {
                if (res.data) {
                    const data = res.data.content || res.data || []
                    setMensagens(data)
                }
            })
            .catch((error) => console.error("Erro ao carregar mensagens:", error))
            .finally(() => setLoading(false))
    }, [isSignedIn, chatId])

    useEffect(() => {
        fimRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [mensagens])

    const enviar = async () => {
        if (!novaMensagem.trim()) return
        try {
            const res = await api.post(`/api/messages/${chatId}`, { texto: novaMensagem })
            if (res.data) {
                setMensagens((prev) => [...prev, res.data])
                setNovaMensagem("")
            }
        } catch (error) {
            console.error("Erro ao enviar:", error)
        }
    }

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Carregando conversa...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
                        <Link href="/chat" className="flex items-center gap-2 text-marble-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <img src="/placeholder.svg" alt="Usuário" className="size-9 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">Conversa</p>
                        </div>
                        <button className="flex size-9 items-center justify-center rounded-md text-marble-foreground hover:bg-marble-foreground/10">
                            <MoreHorizontal className="size-4" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-4 space-y-1">
                {mensagens.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-10">
                        Nenhuma mensagem ainda. Envie a primeira!
                    </p>
                )}
                {mensagens.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.remetente === "eu" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            msg.remetente === "eu"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-card border border-border text-foreground rounded-bl-md"
                        }`}>
                            <p className="text-sm">{msg.texto}</p>
                            <p className={`text-[0.6rem] mt-1 ${
                                msg.remetente === "eu" ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>{msg.horario}</p>
                        </div>
                    </div>
                ))}
                <div ref={fimRef} />
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-30">
                <div className="mx-auto max-w-2xl flex items-center gap-2">
                    <button className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors">
                        <Image className="size-5" />
                    </button>
                    <input
                        type="text"
                        value={novaMensagem}
                        onChange={(e) => setNovaMensagem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && enviar()}
                        placeholder="Mensagem..."
                        className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:border-primary/30"
                    />
                    <button
                        onClick={enviar}
                        disabled={!novaMensagem.trim()}
                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Send className="size-4" />
                    </button>
                </div>
            </div>

            <div className="pb-20" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}