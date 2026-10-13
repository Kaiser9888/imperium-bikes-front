"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Calendar, CheckCircle, DollarSign, MapPin, Trophy, Users, type LucideIcon } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/error-state"
import { Loader } from "@/components/ui/loader"
import { ShareButton } from "@/components/ui/share-button"
import { formatarPreco } from "@/lib/format"
import { mensagemDaApi, tournamentService, type Tournament } from "@/services/tournamentService"

const STATUS_LABEL = { aberto: "Inscrições abertas", andamento: "Em andamento", encerrado: "Encerrado" }

function data(iso: string) {
    // Meio-dia evita o dia anterior por causa do fuso
    const d = new Date(`${iso}T12:00:00`)
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

export default function TorneioDetalhesPage() {
    const { isSignedIn, isLoaded } = useUser()
    const { id } = useParams<{ id: string }>()

    const [torneio, setTorneio] = useState<Tournament | null>(null)
    const [falhou, setFalhou] = useState(false)
    const [inscricao, setInscricao] = useState<"PAGA" | "PENDENTE" | null>(null)
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const carregar = useCallback(async () => {
        setFalhou(false)
        try {
            setTorneio(await tournamentService.buscarPorId(id))
        } catch {
            setFalhou(true)
        }
    }, [id])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial da página
        void carregar()
    }, [carregar])

    useEffect(() => {
        if (!isSignedIn) return
        tournamentService.minhaInscricao(id).then(setInscricao).catch(() => {})
    }, [id, isSignedIn])

    async function inscrever() {
        if (!torneio) return
        if (!isSignedIn) {
            window.location.assign(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        setEnviando(true)
        setErro(null)
        try {
            if (!inscricao) {
                await tournamentService.inscrever(id)
                setInscricao(torneio.valorInscricao > 0 ? "PENDENTE" : "PAGA")
            }
            if (torneio.valorInscricao > 0) {
                window.location.assign(await tournamentService.pagarInscricao(id, torneio.nome))
                return
            }
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível concluir sua inscrição. Tente novamente."))
        }
        setEnviando(false)
    }

    if (falhou) {
        return (
            <AppShell>
                <ErrorState title="Não foi possível carregar este evento" onRetry={carregar} />
            </AppShell>
        )
    }
    if (!torneio || !isLoaded) {
        return (
            <AppShell>
                <Loader className="py-24" />
            </AppShell>
        )
    }

    const vagas = torneio.maxParticipantes > 0 ? `${Math.max(0, torneio.maxParticipantes - torneio.participantes)} de ${torneio.maxParticipantes}` : "Ilimitadas"
    const preco = torneio.valorInscricao > 0 ? formatarPreco(torneio.valorInscricao) : "Grátis"
    const resumo: { icon: LucideIcon; label: string; valor: string }[] = [
        { icon: Calendar, label: "Data", valor: torneio.dataFim && torneio.dataFim !== torneio.dataInicio ? `${data(torneio.dataInicio)} a ${data(torneio.dataFim)}` : data(torneio.dataInicio) },
        { icon: MapPin, label: "Local", valor: torneio.local },
        { icon: Users, label: "Vagas", valor: vagas },
        { icon: DollarSign, label: "Inscrição", valor: preco },
    ]

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading title={torneio.nome} description={torneio.cancelado ? "Cancelado. Inscrições pagas são reembolsadas." : STATUS_LABEL[torneio.status]} back={{ href: "/torneios", label: "Eventos" }} />

                {/* eslint-disable-next-line @next/next/no-img-element -- capa enviada pelo organizador, domínio variável */}
                <img src={torneio.banner} alt="" className="mt-6 aspect-video w-full rounded-xl bg-surface-muted object-cover" />

                <dl className="mt-6 grid grid-cols-2 gap-3">
                    {resumo.map(({ icon: Icon, label, valor }) => (
                        <div key={label} className="rounded-xl border border-border bg-surface p-4">
                            <dt className="type-caption flex items-center gap-1.5 text-muted-foreground">
                                <Icon className="size-4" aria-hidden="true" />
                                {label}
                            </dt>
                            <dd className="type-label mt-1 text-foreground">{valor}</dd>
                        </div>
                    ))}
                </dl>

                {torneio.descricao && <p className="type-body mt-8 whitespace-pre-line text-foreground">{torneio.descricao}</p>}

                {torneio.premiacao && (
                    <section className="mt-8">
                        <h2 className="type-h3 flex items-center gap-2 text-foreground">
                            <Trophy className="size-5 text-accent" aria-hidden="true" />
                            Premiação
                        </h2>
                        <p className="type-body mt-2 whitespace-pre-line text-muted-foreground">{torneio.premiacao}</p>
                    </section>
                )}

                {torneio.regras && (
                    <section className="mt-8">
                        <h2 className="type-h3 text-foreground">Regras</h2>
                        <p className="type-body mt-2 whitespace-pre-line text-muted-foreground">{torneio.regras}</p>
                    </section>
                )}

                {torneio.organizadorId && (
                    <p className="type-body-small mt-8 text-muted-foreground">
                        Organizado por{" "}
                        <Link href={`/perfil/${torneio.organizadorId}`} className="font-semibold text-foreground hover:underline">
                            {torneio.organizadorNome}
                        </Link>
                    </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                    {inscricao === "PAGA" ? (
                        <p role="status" className="type-label flex items-center gap-2 text-success">
                            <CheckCircle className="size-5" aria-hidden="true" />
                            Você está inscrito
                        </p>
                    ) : (
                        torneio.status === "aberto" && (
                            <Button variant="accent" size="lg" loading={enviando} onClick={inscrever}>
                                {inscricao === "PENDENTE" ? `Pagar inscrição · ${preco}` : `Inscrever-se · ${preco}`}
                            </Button>
                        )
                    )}
                    <ShareButton title={torneio.nome} />
                </div>
                {erro && (
                    <p role="alert" className="type-body-small mt-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                        {erro}
                    </p>
                )}
            </main>
        </AppShell>
    )
}
