import Link from "next/link"
import { Calendar, MapPin, Trophy } from "lucide-react"

import { StatusBadge } from "@/components/ui/status-badge"
import { formatarPreco } from "@/lib/format"

export type EventStatus = "aberto" | "andamento" | "encerrado"

export type EventSummary = {
    id: string
    nome: string
    modalidade?: string
    /** ISO vindo da API. */
    dataInicio?: string
    local?: string
    status?: EventStatus
    banner?: string
    /** Valor da inscrição em reais; 0 = gratuito. Ausente quando a API não informa. */
    valorInscricao?: number
}

const texto = (valor: unknown) => (typeof valor === "string" && valor.trim() ? valor.trim() : undefined)

/** Normaliza a resposta de /api/tournaments sem preencher campos que a API não mandou. */
export function toEventSummaries(payload: unknown): EventSummary[] {
    const root = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {}
    const itens = Array.isArray(payload) ? payload : ([root.content, root.items, root.data].find(Array.isArray) ?? [])
    return (itens as unknown[]).flatMap((valor): EventSummary[] => {
        if (!valor || typeof valor !== "object") return []
        const item = valor as Record<string, unknown>
        const nome = texto(item.name) ?? texto(item.nome) ?? texto(item.title)
        if (item.id == null || !nome) return []

        const statusBruto = texto(item.status)?.toLowerCase()
        const status: EventStatus | undefined = !statusBruto
            ? undefined
            : /closed|ended|encerr|finaliz/.test(statusBruto)
              ? "encerrado"
              : /progress|live|andamento/.test(statusBruto)
                ? "andamento"
                : "aberto"

        const taxa = item.entryFee ?? item.valorInscricao ?? item.price
        const valorInscricao = taxa == null || Number.isNaN(Number(taxa)) ? undefined : Number(taxa)

        return [
            {
                id: String(item.id),
                nome,
                modalidade: texto(item.modality) ?? texto(item.modalidade),
                dataInicio: texto(item.startDate) ?? texto(item.dataInicio) ?? texto(item.date),
                local: texto(item.city) ?? texto(item.location) ?? texto(item.local),
                status,
                banner: texto(item.bannerUrl) ?? texto(item.banner),
                valorInscricao,
            },
        ]
    })
}

const statusInfo: Record<EventStatus, { label: string; tone: "success" | "info" | "neutral" }> = {
    aberto: { label: "Inscrições abertas", tone: "success" },
    andamento: { label: "Em andamento", tone: "info" },
    encerrado: { label: "Encerrado", tone: "neutral" },
}

function formatarData(iso?: string) {
    if (!iso) return undefined
    const data = new Date(iso)
    if (Number.isNaN(data.getTime())) return undefined
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

export function EventCard({ event }: { event: EventSummary }) {
    const data = formatarData(event.dataInicio)
    const status = event.status ? statusInfo[event.status] : undefined
    return (
        <Link href={`/torneios/${event.id}`} className="group flex flex-col gap-3 rounded-xl">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-muted">
                {event.banner ? (
                    <img
                        src={event.banner}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                ) : (
                    <span className="flex size-full items-center justify-center">
                        <Trophy className="size-8 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                )}
                {status && (
                    <StatusBadge tone={status.tone} className="absolute left-3 top-3 bg-surface">
                        {status.label}
                    </StatusBadge>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                {event.modalidade && <p className="type-caption font-semibold text-primary">{event.modalidade}</p>}
                <h3 className="type-h3 line-clamp-2 text-foreground group-hover:text-primary">{event.nome}</h3>
                <div className="type-body-small flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                    {data && (
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="size-4" aria-hidden="true" />
                            {data}
                        </span>
                    )}
                    {event.local && (
                        <span className="inline-flex min-w-0 items-center gap-1.5">
                            <MapPin className="size-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{event.local}</span>
                        </span>
                    )}
                </div>
                {event.valorInscricao !== undefined && (
                    <p className="type-label text-foreground">
                        {event.valorInscricao > 0 ? `Inscrição ${formatarPreco(event.valorInscricao)}` : "Inscrição gratuita"}
                    </p>
                )}
            </div>
        </Link>
    )
}
