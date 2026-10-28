"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { BadgeCheck, Search, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { bikesRoubadasService, STATUS_ALERTA, type AlertaRoubo, type NovoAlerta } from "@/lib/bikes-roubadas"
import { mensagemDaApi } from "@/services/tournamentService"

export default function BikeRoubadaPage() {
    const { isSignedIn, isLoaded } = useAuth()
    const [meus, setMeus] = useState<AlertaRoubo[] | null>(null)

    const carregar = useCallback(async () => {
        try {
            setMeus(await bikesRoubadasService.meus())
        } catch {
            setMeus([])
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
        if (isSignedIn) void carregar()
    }, [isSignedIn, carregar])

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading
                    title="Bike roubada"
                    description="Consulte um número de série antes de comprar, ou registre o alerta da sua bike. Número com alerta confirmado não pode ser anunciado no Imperium."
                    back={{ href: "/ajuda", label: "Ajuda" }}
                />

                <Consulta />

                {isLoaded && !isSignedIn ? (
                    <p className="type-body-small mt-10 text-muted-foreground">
                        <Link href="/sign-in?redirect_url=%2Fseguranca%2Fbike-roubada" className="font-semibold text-primary underline underline-offset-2">
                            Entre
                        </Link>{" "}
                        para registrar o alerta da sua bike.
                    </p>
                ) : (
                    <>
                        <Registrar onRegistrado={carregar} />
                        <MeusAlertas alertas={meus} onMudou={carregar} />
                    </>
                )}
            </main>
        </AppShell>
    )
}

function Consulta() {
    const [numero, setNumero] = useState("")
    const [consultando, setConsultando] = useState(false)
    const [resultado, setResultado] = useState<{ numero: string; alerta: boolean } | null>(null)

    async function consultar(event: React.FormEvent) {
        event.preventDefault()
        setConsultando(true)
        try {
            setResultado({ numero: numero.trim(), alerta: await bikesRoubadasService.consultar(numero.trim()) })
        } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Não foi possível consultar agora.")
        } finally {
            setConsultando(false)
        }
    }

    return (
        <section aria-labelledby="consulta-title" className="mt-8 rounded-2xl border border-border bg-surface p-5">
            <h2 id="consulta-title" className="type-h3 text-foreground">
                Consultar número de série
            </h2>
            <p className="type-body-small mt-1 text-muted-foreground">
                Peça ao vendedor para mostrar o número gravado no quadro (geralmente embaixo do movimento central) e confira aqui.
            </p>
            <form onSubmit={consultar} className="mt-4 flex gap-2">
                <Input
                    aria-label="Número de série"
                    required
                    minLength={4}
                    maxLength={60}
                    autoCapitalize="characters"
                    value={numero}
                    onChange={(e) => {
                        setNumero(e.target.value)
                        setResultado(null)
                    }}
                    placeholder="Ex.: WTU123456B"
                />
                <Button type="submit" loading={consultando}>
                    <Search aria-hidden="true" />
                    Consultar
                </Button>
            </form>
            {resultado && (
                <p
                    role="status"
                    className={`type-body-small mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5 ${resultado.alerta ? "bg-destructive/10 text-destructive" : "bg-success/10 text-foreground"}`}
                >
                    {resultado.alerta ? (
                        <>
                            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            <span>
                                <strong>Este número tem alerta de roubo confirmado.</strong> Não compre. Se puder, denuncie o anúncio e registre um boletim de
                                ocorrência informando onde viu a bike.
                            </span>
                        </>
                    ) : (
                        <>
                            <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                            <span>Nenhum alerta de roubo para este número no Imperium. Confira também se o número no quadro é o mesmo que o vendedor informou.</span>
                        </>
                    )}
                </p>
            )}
        </section>
    )
}

const VAZIO: NovoAlerta = { numeroSerie: "", marca: "", modelo: "", boletim: "", cidade: "", descricao: "" }

function Registrar({ onRegistrado }: { onRegistrado: () => Promise<void> }) {
    const [form, setForm] = useState<NovoAlerta>(VAZIO)
    const [enviando, setEnviando] = useState(false)
    const campo = (nome: keyof NovoAlerta) => ({
        id: `alerta-${nome}`,
        value: form[nome],
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [nome]: e.target.value })),
    })

    async function registrar(event: React.FormEvent) {
        event.preventDefault()
        setEnviando(true)
        try {
            await bikesRoubadasService.registrar(form)
            toast.success("Alerta registrado. A equipe confere o boletim e te avisa.")
            setForm(VAZIO)
            await onRegistrado()
        } catch (cause) {
            toast.error(mensagemDaApi(cause, "Não foi possível registrar o alerta."))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <section aria-labelledby="registrar-title" className="mt-8 rounded-2xl border border-border bg-surface p-5">
            <h2 id="registrar-title" className="type-h3 text-foreground">
                Registrar minha bike roubada
            </h2>
            <p className="type-body-small mt-1 text-muted-foreground">
                Precisa do número do boletim de ocorrência. A equipe confere antes de ativar o alerta: assim ninguém derruba o anúncio de outra
                pessoa com um alerta falso. Alerta falso é crime (comunicação falsa de crime) e leva à suspensão da conta.
            </p>
            <form onSubmit={registrar} className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="alerta-numeroSerie">Número de série do quadro</Label>
                    <Input required minLength={4} maxLength={60} autoCapitalize="characters" {...campo("numeroSerie")} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="alerta-marca">Marca</Label>
                    <Input maxLength={100} {...campo("marca")} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="alerta-modelo">Modelo</Label>
                    <Input maxLength={100} {...campo("modelo")} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="alerta-boletim">Nº do boletim de ocorrência</Label>
                    <Input required minLength={4} maxLength={60} {...campo("boletim")} />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="alerta-cidade">Cidade</Label>
                    <Input maxLength={100} {...campo("cidade")} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                    <Label htmlFor="alerta-descricao">Detalhes (cor, adesivos, peças trocadas)</Label>
                    <Textarea rows={3} maxLength={1000} {...campo("descricao")} />
                </div>
                <Button type="submit" loading={enviando} className="sm:col-span-2 sm:justify-self-start">
                    Registrar alerta
                </Button>
            </form>
        </section>
    )
}

function MeusAlertas({ alertas, onMudou }: { alertas: AlertaRoubo[] | null; onMudou: () => Promise<void> }) {
    const [ocupado, setOcupado] = useState<string | null>(null)
    if (!alertas || alertas.length === 0) return null

    async function recuperada(a: AlertaRoubo) {
        setOcupado(a.id)
        try {
            await bikesRoubadasService.recuperada(a.id)
            toast.success("Que bom! O alerta foi encerrado.")
            await onMudou()
        } catch (cause) {
            toast.error(mensagemDaApi(cause, "Não foi possível encerrar o alerta."))
        } finally {
            setOcupado(null)
        }
    }

    return (
        <section aria-labelledby="meus-title" className="mt-10">
            <h2 id="meus-title" className="type-h3 border-b border-border pb-3 text-foreground">
                Meus alertas
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
                {alertas.map((a) => (
                    <li key={a.id} className="rounded-xl border border-border bg-surface p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="type-label font-mono text-foreground">{a.numeroSerie}</p>
                            <StatusBadge tone={STATUS_ALERTA[a.status].tone}>{STATUS_ALERTA[a.status].label}</StatusBadge>
                        </div>
                        <p className="type-caption mt-1 text-muted-foreground">
                            {[a.marca, a.modelo, a.cidade].filter(Boolean).join(" · ") || "Sem detalhes"} · B.O. {a.boletim}
                        </p>
                        {a.status === "RECUSADO" && a.motivoRecusa && <p className="type-caption mt-2 text-destructive">Motivo: {a.motivoRecusa}</p>}
                        {(a.status === "PENDENTE" || a.status === "CONFIRMADO") && (
                            <Button size="sm" variant="outline" className="mt-3" loading={ocupado === a.id} onClick={() => recuperada(a)}>
                                Recuperei a bike
                            </Button>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    )
}
