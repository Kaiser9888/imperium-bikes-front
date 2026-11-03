"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Bell, ChevronRight, CircleDollarSign, Heart, Megaphone, MessageCircle, RotateCcw, ShieldCheck, Tag, Trophy, UserPlus, type LucideIcon } from "lucide-react"

import { PageHeading } from "@/components/layout/page-heading"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Loader } from "@/components/ui/loader"
import api from "@/lib/api"
import { atualizarContadores } from "@/hooks/useContadores"
import { cn } from "@/lib/utils"

// Ícone por NotificationType do backend; tipo desconhecido usa o sino
const ICONES: Record<string, LucideIcon> = {
    TOURNAMENT_CREATED: Trophy,
    TOURNAMENT_STARTING: Trophy,
    TOURNAMENT_RESULT: Trophy,
    TOURNAMENT_CANCELLED: Trophy,
    NEW_MESSAGE: MessageCircle,
    NEW_REPLY: MessageCircle,
    MENTION: MessageCircle,
    PRODUCT_SOLD: CircleDollarSign,
    PAYMENT_RECEIVED: CircleDollarSign,
    PAYMENT_REFUNDED: RotateCcw,
    PRODUCT_FAVORITE: Heart,
    KARMA_RECEIVED: Heart,
    PRICE_DROP: Tag,
    NEW_FOLLOWER: UserPlus,
    SYSTEM_ANNOUNCEMENT: Megaphone,
    VERIFICATION_REQUIRED: ShieldCheck,
}

// Hoje: só a hora; ontem: "Ontem"; antes: dia/mês
function quando(iso: string): string {
    const data = new Date(iso)
    const hoje = new Date()
    const dias = Math.round((new Date(hoje.toDateString()).getTime() - new Date(data.toDateString()).getTime()) / 86_400_000)
    if (dias <= 0) return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    if (dias === 1) return "Ontem"
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", ...(data.getFullYear() !== hoje.getFullYear() && { year: "2-digit" }) })
}

type Notificacao = {
    id: string
    type?: string
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
            void api.post("/api/notifications/read-all").then(atualizarContadores).catch(() => {})
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
            </div>
            {!!itens?.length && (
                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                    {itens.map((item) => {
                        const Icone = ICONES[item.type ?? ""] ?? Bell
                        const conteudo = (
                            <>
                                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", item.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                                    <Icone className="size-5" aria-hidden />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline gap-3">
                                        <p className={cn("type-label min-w-0 flex-1 truncate text-foreground", item.read && "font-medium")}>{item.title}</p>
                                        <time dateTime={item.createdAt} className="type-caption shrink-0 text-muted-foreground">
                                            {quando(item.createdAt)}
                                        </time>
                                    </div>
                                    <p className="type-body-small mt-0.5 line-clamp-2 text-muted-foreground">{item.message}</p>
                                    {item.actionUrl?.startsWith("/") && (
                                        <span className="type-caption mt-1.5 inline-flex items-center gap-1 font-semibold text-primary">
                                            {item.actionText || "Abrir"}
                                            <ChevronRight className="size-3.5" aria-hidden />
                                        </span>
                                    )}
                                </div>
                                {!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-label="Não lida" />}
                            </>
                        )
                        const classe = cn("flex items-start gap-3 px-4 py-3.5", !item.read && "bg-primary/[0.04]")
                        return (
                            <li key={item.id}>
                                {item.actionUrl?.startsWith("/") ? (
                                    <Link href={item.actionUrl} className={cn(classe, "transition-colors hover:bg-muted/60")}>
                                        {conteudo}
                                    </Link>
                                ) : (
                                    <div className={classe}>{conteudo}</div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </main>
    )
}
