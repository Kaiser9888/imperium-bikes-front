/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
// app/chat/[id]/page.tsx
"use client"

import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import type { Channel } from "stream-chat"
import { useStreamClient } from "@/lib/stream"

export default function ConversaPage() {
    const { isLoaded, isSignedIn } = useUser()
    const { client, erro } = useStreamClient()
    const params = useParams<{ id: string }>()
    const chatId = params?.id

    const [canal, setCanal] = useState<Channel | null>(null)
    const [mensagens, setMensagens] = useState<any[]>([])
    const [texto, setTexto] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [loading, setLoading] = useState(true)
    const [erroCanal, setErroCanal] = useState<string | null>(null)
    const fimRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!client || !chatId) return
        let vivo = true
        const ch = client.channel("messaging", chatId)

        ch.watch()
          .then(() => {
              if (!vivo) return
              setCanal(ch)
              setMensagens([...ch.state.messages])
              ch.markRead()
              setLoading(false)
          })
          .catch((e) => {
              console.error("[Chat] erro ao abrir conversa:", e)
              if (!vivo) return
              setErroCanal("Conversa não encontrada.")
              setLoading(false)
          })

        const sub = ch.on((ev) => {
            if (ev.type?.startsWith("message.")) {
                setMensagens([...ch.state.messages])
                if (ev.type === "message.new") ch.markRead()
            }
        })

        return () => {
            vivo = false
            sub.unsubscribe()
        }
    }, [client, chatId])

    useEffect(() => {
        fimRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [mensagens])

    const outro = canal
      ? Object.values(canal.state.members).find((m) => m.user_id !== client?.userID)?.user
      : null
    const produto = (canal?.data as any)?.produtoTitulo as string | undefined

    const enviar = async () => {
        const t = texto.trim()
        if (!t || !canal || enviando) return
        setEnviando(true)
        try {
            await canal.sendMessage({ text: t })
            setTexto("")
            setMensagens([...canal.state.messages])
        } catch (e) {
            console.error("[Chat] erro ao enviar:", e)
        }
        setEnviando(false)
    }

    if (!isLoaded || (isSignedIn && loading && !erro)) {
        return (
          <div className="min-h-screen bg-background grid place-items-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )
    }

    if (!isSignedIn || erro || erroCanal) {
        return (
          <div className="min-h-screen bg-background grid place-items-center px-6 text-center">
              <div>
                  <p className="text-sm text-muted-foreground">
                      {!isSignedIn ? "Entre para ver esta conversa." : (erro ?? erroCanal)}
                  </p>
                  <Link href="/chat" className="mt-4 inline-block text-sm font-semibold text-primary">Voltar às mensagens</Link>
              </div>
          </div>
        )
    }

    return (
      <div className="flex min-h-screen flex-col bg-background">
          <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
              <div className="bg-marble/15 backdrop-blur-[2px]">
                  <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
                      <Link href="/chat" className="flex items-center text-marble-foreground hover:text-foreground">
                          <ArrowLeft className="size-5" />
                      </Link>
                      <img src={outro?.image || "/placeholder.svg"} alt={outro?.name ?? "Usuário"} className="size-9 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{outro?.name ?? "Conversa"}</p>
                          {produto && <p className="truncate text-xs text-muted-foreground">{produto}</p>}
                      </div>
                  </div>
              </div>
          </header>

          <main className="mx-auto w-full max-w-2xl flex-1 space-y-1 px-4 py-4 pb-24">
              {mensagens.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma mensagem ainda. Envie a primeira!</p>
              )}
              {mensagens.map((m) => {
                  const minha = m.user?.id === client?.userID
                  return (
                    <div key={m.id} className={`flex ${minha ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${minha ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card text-foreground"}`}>
                            <p className="whitespace-pre-wrap break-words text-sm">{m.text}</p>
                            <p className={`mt-1 text-[0.6rem] ${minha ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                {m.created_at ? new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}
                            </p>
                        </div>
                    </div>
                  )
              })}
              <div ref={fimRef} />
          </main>

          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background px-4 py-3">
              <div className="mx-auto flex max-w-2xl items-center gap-2">
                  <input
                    type="text"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && enviar()}
                    placeholder="Mensagem..."
                    className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:border-primary/30"
                  />
                  <button
                    onClick={enviar}
                    disabled={!texto.trim() || enviando}
                    aria-label="Enviar mensagem"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                      {enviando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </button>
              </div>
          </div>
      </div>
    )
}