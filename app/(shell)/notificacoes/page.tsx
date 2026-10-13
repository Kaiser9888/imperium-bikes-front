"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Bell } from "lucide-react"

import { PageHeading } from "@/components/layout/page-heading"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Loader } from "@/components/ui/loader"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

type Notificacao = {
    id: string
    title: string
    message: string
    actionUrl?: string
    actionText?: string
    read: boolean
    createdAt: string
}

export default function NotificacoesPage() {
    const { isLoaded, isSignedIn } = useUser()
    const [itens, setItens] = useState<Notificacao[] | null>(null)
    const [falhou, setFalhou] = useState(false)

    const carregar = useCallback(async () => {
        setFalhou(false)
        try {
            const { data } = await api.get("/api/notifications", { params: { size: 50 } })
            setItens(data.content)
            // As não lidas continuam destacadas nesta visita; na próxima já aparecem como lidas.
            void api.post("/api/notifications/read-all").catch(() => {})
        } catch {
            setFalhou(true)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
        if (isSignedIn) void carregar()
    }, [isSignedIn, carregar])

    return (
        <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
            <PageHeading title="Notificações" back={{ href: "/", label: "Início" }} />
            <div className="mt-6 flex flex-col gap-3">
                {isLoaded && !isSignedIn && <EmptyState icon={Bell} title="Entre para ver suas notificações" />}
                {falhou && <ErrorState onRetry={carregar} />}
                {isSignedIn && !falhou && !itens && <Loader className="py-16" />}
                {itens?.length === 0 && <EmptyState icon={Bell} title="Nenhuma notificação" />}
                {itens?.map((item) => (
                    <article key={item.id} className={cn("rounded-xl border border-border bg-surface p-4", !item.read && "border-accent")}>
                        <p className="type-label text-foreground">{item.title}</p>
                        <p className="type-body-small mt-1 text-muted-foreground">{item.message}</p>
                        <p className="type-caption mt-2 text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                            {item.actionUrl?.startsWith("/") && (
                                <>
                                    {" · "}
                                    <Link href={item.actionUrl} className="text-primary hover:underline">
                                        {item.actionText || "Abrir"}
                                    </Link>
                                </>
                            )}
                        </p>
                    </article>
                ))}
            </div>
        </main>
    )
}
