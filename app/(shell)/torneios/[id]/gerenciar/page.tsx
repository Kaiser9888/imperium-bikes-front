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
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/error-state"
import { Loader } from "@/components/ui/loader"
import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { mensagemDaApi, tournamentService, type Tournament } from "@/services/tournamentService"

type Participant = { id: string; userName: string; paymentStatus: string }
type Estado = { status: "loading" } | { status: "error" } | { status: "ok"; torneio: Tournament; participantes: Participant[] }

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
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
      <PageHeading
        title={torneio.nome}
        description={`${participantes.length} inscritos · ${pagos} confirmados · inscrição ${torneio.valorInscricao > 0 ? formatarPreco(torneio.valorInscricao) : "grátis"}`}
        back={{ href: `/torneios/${id}`, label: "Evento" }}
      />
      {torneio.status === "andamento" && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="mr-2 mt-6">
              Encerrar evento
            </Button>
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
            <Button variant="outline" className="mt-6">
              Cancelar evento
            </Button>
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
      {torneio.cancelado && (
        <p role="status" className="type-body-small mt-6 text-muted-foreground">
          Evento cancelado. As inscrições pagas são reembolsadas automaticamente.
        </p>
      )}
      {erroEncerrar && (
        <p role="alert" className="type-body-small mt-3 text-destructive">
          {erroEncerrar}
        </p>
      )}
      <h2 className="type-h3 mt-8 text-foreground">Participantes</h2>
      {participantes.length === 0 ? (
        <p className="type-body-small mt-3 text-muted-foreground">Ninguém se inscreveu ainda.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
          {participantes.map((p) => (
            <li key={p.id} className="type-body-small flex items-center justify-between px-4 py-3">
              <span className="text-foreground">{p.userName}</span>
              <span className={p.paymentStatus === "PAID" ? "text-success" : "text-muted-foreground"}>
                {p.paymentStatus === "PAID" ? "Confirmado" : p.paymentStatus === "REFUNDED" ? "Reembolsado" : "Aguardando pagamento"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
