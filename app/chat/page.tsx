/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
// app/chat/page.tsx
"use client"
import { Button } from "@/components/ui/button"

import { BottomNav } from "@/components/layout/bottom-nav"
import { SignInButton, useUser } from "@clerk/nextjs"
import { Loader2, MessageCircle, Search } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { Channel } from "stream-chat"
import { useStreamClient } from "@/lib/stream"

const EVENTOS = [
    "message.new",
    "message.updated",
    "message.deleted",
    "notification.message_new",
    "notification.added_to_channel",
    "notification.mark_read",
    "channel.updated",
]

function formatarHora(d?: Date | string | null) {
    if (!d) return ""
    const data = new Date(d)
    const hoje = new Date()
    return data.toDateString() === hoje.toDateString()
      ? data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export default function ChatPage() {
    const { isSignedIn, isLoaded } = useUser()
    const { client, erro } = useStreamClient()
    const [canais, setCanais] = useState<Channel[]>([])
    const [busca, setBusca] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!client?.userID) return
        let vivo = true

        const carregar = async () => {
            try {
                const res = await client.queryChannels(
                  { type: "messaging", members: { $in: [client.userID!] } },
                  { last_message_at: -1 },
                  { watch: true, state: true, limit: 30 },
                )
                if (vivo) setCanais([...res])
            } catch (e) {
                console.error("[Chat] erro ao listar conversas:", e)
            }
            if (vivo) setLoading(false)
        }

        carregar()
        const sub = client.on((ev) => {
            if (EVENTOS.includes(ev.type)) carregar()
        })
        return () => {
            vivo = false
            sub.unsubscribe()
        }
    }, [client])

    const outroUsuario = (c: Channel) =>
      Object.values(c.state.members).find((m) => m.user_id !== client?.userID)?.user

    const filtradas = canais.filter((c) =>
      (outroUsuario(c)?.name ?? "").toLowerCase().includes(busca.toLowerCase()),
    )

    const Header = (
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
    )

    if (!isLoaded) {
        return <div className="min-h-screen bg-background grid place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
    }

    if (!isSignedIn) {
        return (
          <div className="min-h-screen bg-background">
              {Header}
              <div className="flex flex-col items-center px-4 py-20 text-center">
                  <p className="text-muted-foreground mb-6">Entre para ver suas mensagens</p>
                  <SignInButton mode="modal">
                      <Button size="lg">Entrar</Button>
                  </SignInButton>
              </div>
              <BottomNav onMenuClick={() => {}} />
          </div>
        )
    }

    return (
      <div className="min-h-screen bg-background">
          {Header}

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

              {erro ? (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>
              ) : loading ? (
                <div className="grid place-items-center py-12"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
              ) : filtradas.length === 0 ? (
                <div className="text-center py-12">
                    <MessageCircle className="size-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma conversa</p>
                    <p className="text-xs text-muted-foreground mt-1">Suas conversas com vendedores aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-1">
                    {filtradas.map((c) => {
                        const outro = outroUsuario(c)
                        const ultima = c.state.messages[c.state.messages.length - 1]
                        const naoLidas = c.countUnread()
                        const produto = (c.data as any)?.produtoTitulo as string | undefined
                        return (
                          <Link key={c.id} href={`/chat/${c.id}`} className="flex items-center gap-3 rounded-xl p-3 hover:bg-card transition-colors">
                              <div className="relative shrink-0">
                                  <img src={outro?.image || "/placeholder.svg"} alt={outro?.name ?? "Usuário"} className="size-12 rounded-full object-cover" />
                                  {naoLidas > 0 && (
                                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                                                {naoLidas}
                                            </span>
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                      <span className="truncate text-sm font-semibold text-foreground">{outro?.name ?? "Usuário"}</span>
                                      <span className="shrink-0 text-[0.6rem] text-muted-foreground">{formatarHora(ultima?.created_at)}</span>
                                  </div>
                                  {produto && <p className="truncate text-xs text-primary font-medium mt-0.5">{produto}</p>}
                                  <p className={`truncate text-xs ${naoLidas > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                                      {ultima?.text ?? "Nenhuma mensagem ainda"}
                                  </p>
                              </div>
                          </Link>
                        )
                    })}
                </div>
              )}
          </main>

          <div className="pb-24" />
          <BottomNav onMenuClick={() => {}} />
      </div>
    )
}
