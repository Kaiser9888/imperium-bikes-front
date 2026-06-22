// app/chat/[id]/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Send, Phone, MoreHorizontal, Image } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"

interface Mensagem {
    id: string
    texto: string
    remetente: "eu" | "outro"
    horario: string
}

const mensagensFake: Mensagem[] = [
    { id: "1", texto: "Olá! Vi seu anúncio da MTB Mountain Pro", remetente: "eu", horario: "10:30" },
    { id: "2", texto: "Oi! Sim, ainda está disponível!", remetente: "outro", horario: "10:32" },
    { id: "3", texto: "Qual o estado dela? Tem nota fiscal?", remetente: "eu", horario: "10:33" },
    { id: "4", texto: "Está perfeita, uso há 6 meses. Tenho nota fiscal e manual sim. Posso enviar mais fotos se quiser.", remetente: "outro", horario: "10:35" },
    { id: "5", texto: "Aceita proposta? Posso fazer pix à vista.", remetente: "eu", horario: "10:40" },
    { id: "6", texto: "Qual seria sua oferta?", remetente: "outro", horario: "10:42" },
    { id: "7", texto: "R$ 3.000 à vista, busco hoje ainda.", remetente: "eu", horario: "10:45" },
]

export default function ConversaPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const params = useParams()
    const chatId = params.id as string
    const [mensagens, setMensagens] = useState<Mensagem[]>(mensagensFake)
    const [novaMensagem, setNovaMensagem] = useState("")
    const fimRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fimRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [mensagens])

    const enviar = () => {
        if (!novaMensagem.trim()) return
        const msg: Mensagem = {
            id: Date.now().toString(),
            texto: novaMensagem,
            remetente: "eu",
            horario: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }
        setMensagens([...mensagens, msg])
        setNovaMensagem("")
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
                        <Link href="/chat" className="flex items-center gap-2 text-marble-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <img src="/placeholder.svg" alt="Carlos Silva" className="size-9 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">Carlos Silva</p>
                            <p className="text-[0.6rem] text-muted-foreground">Online</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="flex size-9 items-center justify-center rounded-md text-marble-foreground hover:bg-marble-foreground/10">
                                <Phone className="size-4" />
                            </button>
                            <button className="flex size-9 items-center justify-center rounded-md text-marble-foreground hover:bg-marble-foreground/10">
                                <MoreHorizontal className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mensagens */}
            <main className="mx-auto max-w-2xl px-4 py-4 space-y-1">
                {/* Produto referência */}
                <div className="flex justify-center mb-4">
                    <Link href="/produto/1" className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 text-xs hover:border-primary/30 transition-colors">
                        <img src="/placeholder.svg" alt="Produto" className="size-6 rounded object-cover" />
                        <span className="text-foreground font-medium">MTB Mountain Pro</span>
                        <span className="text-primary font-bold">R$ 3.500</span>
                    </Link>
                </div>

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

            {/* Input */}
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