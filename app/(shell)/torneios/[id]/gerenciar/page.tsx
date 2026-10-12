"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Users, Video } from "lucide-react"
import { tournamentService } from "@/services/tournamentService"
import { formatarPreco } from "@/lib/format"

interface Participant { id: string; name: string }
interface TournamentManagementData {
  name: string
  status: string
  modality: string
  date: string
  location: string
  participants: Participant[]
  participantCount: number
  maxParticipants: number
  entryFee: number
}

function normalizeTournament(value: unknown): TournamentManagementData {
  const outer = value && typeof value === "object" ? value as Record<string, unknown> : {}
  const raw = outer.data && typeof outer.data === "object" ? outer.data as Record<string, unknown> : outer
  const participantsValue = raw.participants ?? raw.inscritos
  const rawParticipants: unknown[] = Array.isArray(participantsValue) ? participantsValue : []
  const participants = rawParticipants.flatMap((participant, index): Participant[] => {
    if (!participant || typeof participant !== "object") return []
    const row = participant as Record<string, unknown>
    return [{ id: String(row.id ?? index), name: String(row.name ?? row.nome ?? "Participante") }]
  })
  const dateValue = raw.startDate ?? raw.dataInicio ?? raw.date ?? raw.data
  const date = dateValue ? new Date(String(dateValue)) : null
  return {
    name: String(raw.name ?? raw.nome ?? raw.title ?? "Torneio"),
    status: String(raw.status ?? "status indisponível"),
    modality: String(raw.modality ?? raw.modalidade ?? "Ciclismo"),
    date: date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("pt-BR") : "Data a confirmar",
    location: String(raw.location ?? raw.local ?? "Local a confirmar"),
    participants,
    participantCount: Number(raw.participantsCount ?? raw.participantes ?? participants.length),
    maxParticipants: Number(raw.maxParticipants ?? raw.maxParticipantes ?? 0),
    entryFee: Number(raw.entryFee ?? raw.valorInscricao ?? 0),
  }
}

export default function GerenciarTorneioPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const params = useParams<{ id: string }>()
  const id = params.id
  const numericId = Number(id)
  const validId = Number.isInteger(numericId) && numericId > 0
  const [tournament, setTournament] = useState<TournamentManagementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    if (!validId) return
    let active = true
    tournamentService.buscarPorId(numericId)
      .then((data) => { if (active) setTournament(normalizeTournament(data)) })
      .catch(() => { if (active) setError("Não foi possível carregar os dados deste torneio.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id, isLoaded, isSignedIn, numericId, validId])

  if (!isLoaded || (loading && validId)) return <main className="grid min-h-screen place-items-center text-sm text-muted-foreground">Carregando painel...</main>
  if (!isSignedIn) return <main className="grid min-h-screen place-items-center px-4 text-center"><div><p>Entre para abrir o painel do torneio.</p><Link className="mt-4 inline-block underline" href={`/sign-in?redirect_url=${encodeURIComponent(`/torneios/${id}/gerenciar`)}`}>Entrar</Link></div></main>
  if (error || !tournament) return <main className="grid min-h-screen place-items-center px-4 text-center"><div><p role="alert" className="text-sm text-destructive">{error ?? (!validId ? "Torneio inválido." : "Torneio não encontrado.")}</p><Link className="mt-4 inline-block underline" href="/torneios">Voltar aos torneios</Link></div></main>

  const fee = formatarPreco(tournament.entryFee)
  return <main className="mx-auto min-h-screen max-w-3xl space-y-6 px-4 py-8"><Link href={`/torneios/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4"/>Voltar ao torneio</Link><header><p className="text-xs font-semibold uppercase tracking-widest text-primary">Painel do torneio</p><h1 className="mt-2 font-heading text-3xl font-bold">{tournament.name}</h1><p className="mt-2 text-sm text-muted-foreground">{tournament.modality} · {tournament.status}</p></header><section className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-3"><p className="flex items-center gap-2 text-sm"><Calendar className="size-4 text-primary"/>{tournament.date}</p><p className="flex items-center gap-2 text-sm"><MapPin className="size-4 text-primary"/>{tournament.location}</p><p className="flex items-center gap-2 text-sm"><Users className="size-4 text-primary"/>{tournament.participantCount}{tournament.maxParticipants ? `/${tournament.maxParticipants}` : ""} participantes</p><p className="text-sm">Inscrição: {tournament.entryFee ? fee : "Grátis"}</p></section><section className="rounded-xl border border-border bg-card p-5"><h2 className="font-heading text-lg font-semibold">Participantes</h2>{tournament.participants.length ? <ul className="mt-4 divide-y divide-border">{tournament.participants.map((participant) => <li key={participant.id} className="py-3 text-sm">{participant.name}</li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">A API não retornou a lista de participantes.</p>}</section><section className="rounded-xl border border-amber-300/50 bg-amber-50 p-5 text-sm text-amber-950"><div className="flex items-center gap-2 font-semibold"><Video className="size-4"/>Transmissão ao vivo</div><p className="mt-2">O backend ainda não oferece controles de transmissão. A página de visualização está disponível, mas o player não está integrado.</p><Link href={`/torneios/${id}/live`} className="mt-3 inline-block underline">Abrir página da transmissão</Link></section><p className="text-xs text-muted-foreground">Edição de dados, cancelamento, definição de resultados e gestão de reembolsos ainda não estão conectados à API.</p></main>
}
