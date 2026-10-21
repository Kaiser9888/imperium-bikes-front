"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { PageHeading } from "@/components/layout/page-heading"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ErrorState } from "@/components/ui/error-state"
import { Loader } from "@/components/ui/loader"
import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { mensagemDaApi, tournamentService, type Tournament } from "@/services/tournamentService"

type Participant = { id: string; userName: string; paymentStatus: string; rankPosition: number | null }
type Estado = { status: "loading" } | { status: "error" } | { status: "ok"; torneio: Tournament; participantes: Participant[] }

const PAGAMENTO: Record<string, { texto: string; cor: string }> = {
  PAID: { texto: "Confirmado", cor: "bg-success" },
  REFUNDED: { texto: "Reembolsado", cor: "bg-muted-foreground" },
}
const AGUARDANDO = { texto: "Aguardando pagamento", cor: "bg-warning" }

/** Campo de colocação de um participante (o organizador digita 1, 2, 3...). */
function Colocacao({ participante }: { participante: Participant }) {
  const [valor, setValor] = useState(participante.rankPosition ? String(participante.rankPosition) : "")
  const [salvo, setSalvo] = useState(participante.rankPosition)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const numero = Number(valor)
  const mudou = Number.isInteger(numero) && numero > 0 && numero !== salvo

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    if (!mudou) return
    setSalvando(true)
    setErro(null)
    try {
      await tournamentService.lancarColocacao(participante.id, numero)
      setSalvo(numero)
    } catch (cause) {
      setErro(mensagemDaApi(cause, "Não foi possível salvar."))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={salvar} className="flex shrink-0 items-center gap-1.5">
      <label htmlFor={`pos-${participante.id}`} className="sr-only">
        Colocação de {participante.userName}
      </label>
      <input
        id={`pos-${participante.id}`}
        type="number"
        inputMode="numeric"
        min={1}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Pos."
        className="h-9 w-16 rounded-lg bg-surface px-2 text-center text-base tabular-nums md:text-sm"
      />
      <button type="submit" disabled={!mudou || salvando} className="line-btn line-btn--sm">
        {salvando ? "…" : salvo && !mudou ? "Salvo" : "Salvar"}
      </button>
      {erro && (
        <span role="alert" className="type-caption text-destructive">
          {erro}
        </span>
      )}
    </form>
  )
}

export default function GerenciarTorneioPage() {
  const { id } = useParams<{ id: string }>()
  const [estado, setEstado] = useState<Estado>({ status: "loading" })
  const [erroEncerrar, setErroEncerrar] = useState<string | null>(null)

  async function mudarStatus(chamada: () => Promise<Tournament>) {
    if (estado.status !== "ok") return
    setErroEncerrar(null)
    try {
      setEstado({ ...estado, torneio: await chamada() })
    } catch (cause) {
      setErroEncerrar(mensagemDaApi(cause, "Não foi possível concluir. Tente novamente."))
    }
  }
  const encerrar = () => mudarStatus(() => tournamentService.encerrar(id))
  const cancelar = () => mudarStatus(() => tournamentService.cancelar(id, "Cancelado pelo organizador"))

  useEffect(() => {
    let active = true
    Promise.all([tournamentService.buscarPorId(id), api.get(`/api/tournaments/${id}/participants`, { params: { size: 200 } })])
      .then(([torneio, { data }]) => active && setEstado({ status: "ok", torneio, participantes: data.content }))
      .catch(() => active && setEstado({ status: "error" }))
    return () => {
      active = false
    }
  }, [id])

  if (estado.status === "loading") return <Loader className="py-24" />
  if (estado.status === "error") return <ErrorState title="Não foi possível carregar este evento" />

  const { torneio, participantes } = estado
  const pagos = participantes.filter((p) => p.paymentStatus === "PAID").length
  const numeros = [
    { label: "Inscritos", valor: String(participantes.length) },
    { label: "Confirmados", valor: String(pagos) },
    {
      label: "Vagas livres",
      valor: torneio.maxParticipantes > 0 ? String(Math.max(0, torneio.maxParticipantes - participantes.length)) : "∞",
    },
  ]

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
      <PageHeading
        title={torneio.nome}
        description={`Inscrição ${torneio.valorInscricao > 0 ? formatarPreco(torneio.valorInscricao) : "grátis"} · ${torneio.cancelado ? "cancelado" : torneio.status === "encerrado" ? "encerrado" : torneio.status === "andamento" ? "acontecendo" : "inscrições abertas"}`}
        back={{ href: `/torneios/${id}`, label: "Evento" }}
      />

      <dl className="mt-8 grid grid-cols-3 border-y border-foreground">
        {numeros.map((n, i) => (
          <div key={n.label} className={`py-4 ${i > 0 ? "border-l border-border pl-4" : ""}`}>
            <dt className="type-caption uppercase tracking-[0.12em] text-muted-foreground">{n.label}</dt>
            <dd className="mt-1 text-3xl font-bold tabular-nums">{n.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        {torneio.status === "andamento" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="line-btn line-btn--sm">
                Encerrar evento
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Encerrar {torneio.nome}?</AlertDialogTitle>
                <AlertDialogDescription>
                  O evento passa a constar como encerrado e não pode ser reaberto.
                  {torneio.valorInscricao > 0 && " As inscrições pagas são repassadas para a sua Carteira."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={encerrar}>Encerrar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!torneio.cancelado && torneio.status !== "encerrado" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button type="button" className="line-btn line-btn--sm line-btn--danger">
                Cancelar evento
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar {torneio.nome}?</AlertDialogTitle>
                <AlertDialogDescription>
                  O evento sai do ar e não pode ser reaberto.
                  {pagos > 0 && ` As ${pagos} inscrições pagas são reembolsadas automaticamente e você não recebe o valor.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={cancelar}>Cancelar evento</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {torneio.cancelado && (
        <p role="status" className="type-body-small mt-6 text-muted-foreground">
          Evento cancelado. As inscrições pagas são reembolsadas automaticamente.
        </p>
      )}
      {erroEncerrar && (
        <p role="alert" className="type-body-small mt-4 border-l-2 border-destructive pl-3 text-destructive">
          {erroEncerrar}
        </p>
      )}

      <h2 className="type-h2 mt-12">Participantes</h2>
      {torneio.status !== "aberto" && !torneio.cancelado && pagos > 0 && (
        <p className="type-body-small mt-1 text-muted-foreground">
          Lance a colocação de cada um: os três primeiros aparecem no pódio da página do evento.
        </p>
      )}
      {participantes.length === 0 ? (
        <p className="type-body-small mt-3 text-muted-foreground">Ninguém se inscreveu ainda. Compartilhe o link do evento para começar.</p>
      ) : (
        <ol className="mt-4 border-t border-foreground">
          {participantes.map((p, i) => {
            const pg = PAGAMENTO[p.paymentStatus] ?? AGUARDANDO
            return (
              <li key={p.id} className="type-body-small flex items-center gap-4 border-b border-border py-3">
                <span className="w-7 shrink-0 tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">{p.userName}</span>
                <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                  <span className={`size-1.5 rounded-full ${pg.cor}`} aria-hidden="true" />
                  {pg.texto}
                </span>
                {torneio.status !== "aberto" && !torneio.cancelado && p.paymentStatus === "PAID" && (
                  <Colocacao participante={p} />
                )}
              </li>
            )
          })}
        </ol>
      )}
    </main>
  )
}
