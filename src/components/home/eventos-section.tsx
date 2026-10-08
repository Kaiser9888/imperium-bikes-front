"use client"

import Link from "next/link"
import { Trophy } from "lucide-react"
import { useEffect, useState } from "react"

import { EventCard, toEventSummaries, type EventSummary } from "@/components/events/EventCard"
import { HomeSection } from "@/components/home/home-section"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { tournamentService } from "@/services/tournamentService"

const LIMITE = 3

type Estado = { status: "loading" } | { status: "error" } | { status: "ok"; eventos: EventSummary[] }

export function EventosSection() {
    const [estado, setEstado] = useState<Estado>({ status: "loading" })

    const [tentativa, setTentativa] = useState(0)

    useEffect(() => {
        let ativo = true
        tournamentService
            .listar({ page: 0 })
            .then((dados) => {
                if (ativo) setEstado({ status: "ok", eventos: toEventSummaries(dados).slice(0, LIMITE) })
            })
            .catch(() => {
                if (ativo) setEstado({ status: "error" })
            })
        return () => {
            ativo = false
        }
    }, [tentativa])

    const tentarNovamente = () => {
        setEstado({ status: "loading" })
        setTentativa((n) => n + 1)
    }

    return (
        <HomeSection id="eventos" title="Eventos" description="Competições e encontros para participar." href="/torneios">
            {estado.status === "loading" && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
                    {Array.from({ length: LIMITE }, (_, i) => (
                        <div key={i} className={i === 2 ? "hidden flex-col gap-3 lg:flex" : "flex flex-col gap-3"}>
                            <Skeleton className="aspect-video rounded-xl" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            )}

            {estado.status === "error" && (
                <ErrorState
                    title="Não foi possível carregar os eventos"
                    onRetry={tentarNovamente}
                    className="rounded-xl bg-surface-secondary"
                />
            )}

            {estado.status === "ok" && estado.eventos.length === 0 && (
                <EmptyState
                    icon={Trophy}
                    title="Nenhum evento publicado ainda"
                    description="Quando alguém criar um evento, ele aparece aqui."
                    className="rounded-xl bg-surface-secondary"
                    action={
                        <Button asChild variant="outline">
                            <Link href="/torneios/criar">Criar evento</Link>
                        </Button>
                    }
                />
            )}

            {estado.status === "ok" && estado.eventos.length > 0 && (
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {estado.eventos.map((evento) => (
                        <li key={evento.id}>
                            <EventCard event={evento} />
                        </li>
                    ))}
                </ul>
            )}
        </HomeSection>
    )
}
