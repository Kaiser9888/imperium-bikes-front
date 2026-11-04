/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
// app/chat/page.tsx
"use client"
import { Button } from "@/components/ui/button"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { EmptyState } from "@/components/ui/empty-state"
import { Loader } from "@/components/ui/loader"
import { useUser } from "@clerk/nextjs"
import { MessageCircle, Search } from "lucide-react"
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

    if (!isLoaded) return <AppShell><Loader className="py-24" /></AppShell>

    if (!isSignedIn) {
        return (
          <AppShell>
              <main className="mx-auto max-w-2xl px-4 py-10">
                  <EmptyState
                    icon={MessageCircle}
                    title="Entre para ver suas mensagens"
                    description="Aqui ficam suas conversas com compradores e vendedores."
                    action={<Button asChild size="lg"><Link href="/sign-in?redirect_url=%2Fchat">Entrar</Link></Button>}
                  />
              </main>
          </AppShell>
        )
    }

    return (
      <AppShell>
          <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6">
              <PageHeading title="Mensagens" back={{ href: "/", label: "Início" }} />

              {/* Busca só quando há conversas para filtrar */}
              {canais.length > 0 && (
                <div className="relative my-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
                    <input
                      type="search"
                      aria-label="Buscar conversa"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar conversa"
                      className="w-full rounded-xl border border-border bg-card pl-11 pr-4 py-3 text-base outline-none focus:border-primary/30 md:text-sm"
                    />
                </div>
              )}

              {erro ? (
                <p role="alert" className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>
              ) : loading ? (
                <Loader className="py-12" />
              ) : filtradas.length === 0 ? (
                canais.length > 0
                  ? <EmptyState icon={Search} title="Nenhuma conversa com esse nome" />
                  : <EmptyState icon={MessageCircle} title="Nenhuma conversa ainda" description="Quando você falar com um vendedor ou comprador, a conversa aparece aqui." />
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
      </AppShell>
    )
}
