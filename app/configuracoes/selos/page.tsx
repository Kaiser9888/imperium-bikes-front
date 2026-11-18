"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { BadgeCheck, Check, Circle, Clapperboard, Copy, Store, type LucideIcon } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import { StatusBadge } from "@/components/ui/status-badge"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

type Pedido = { status: "PENDENTE" | "APROVADA" | "RECUSADA" | "REMOVIDA"; link: string; seguidores?: number | null; empresaNome?: string | null; motivo?: string | null }
type Minhas = {
    vendedor: { identidade: boolean; vendas: number; nota: number | null; avaliacoes: number; diasConta: number; semProblemas: boolean }
    vendedorVerificado: boolean
    vendasMeta: number
    criadorVerificado: boolean
    criador: Pedido | null
    seguidoresMeta: number
    lojaVerificada: boolean
    lojaNome: string | null
    loja: Pedido | null
    codigo: string
}

function mensagem(cause: unknown): string {
    const data = (cause as { response?: { data?: { message?: unknown } } })?.response?.data
    return typeof data?.message === "string" ? data.message : "Não foi possível enviar. Tente de novo."
}

export default function SelosPage() {
    const { isSignedIn, isLoaded } = useUser()
    const [dados, setDados] = useState<Minhas | null>(null)
    const [falhou, setFalhou] = useState(false)

    const carregar = useCallback(async () => {
        setFalhou(false)
        try {
            setDados((await api.get<Minhas>("/api/verificacoes/minhas")).data)
        } catch {
            setFalhou(true)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial ao entrar na conta
        if (isSignedIn) void carregar()
    }, [isSignedIn, carregar])

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading
                    title="Selos de verificado"
                    description="Selos que aparecem no seu perfil e nos seus anúncios. Ninguém compra selo: o Imperium confere antes."
                    back={{ href: "/configuracoes", label: "Configurações" }}
                />

                {(!isLoaded || (isSignedIn && !dados && !falhou)) && <Loader className="py-16" />}
                {isLoaded && !isSignedIn && <p className="type-body mt-8 text-muted-foreground">Entre para ver seus selos.</p>}
                {falhou && <ErrorState onRetry={carregar} />}

                {dados && (
                    <div className="mt-8 flex flex-col gap-5">
                        <Vendedor dados={dados} />
                        <PedidoSelo
                            tipo="criador"
                            icone={Clapperboard}
                            titulo="Criador verificado"
                            explica={`Para quem tem pelo menos ${dados.seguidoresMeta.toLocaleString("pt-BR")} seguidores no Instagram, TikTok, YouTube ou outra rede.`}
                            ativo={dados.criadorVerificado}
                            pedido={dados.criador}
                            codigo={dados.codigo}
                            onEnviado={carregar}
                        />
                        <PedidoSelo
                            tipo="loja"
                            icone={Store}
                            titulo="Loja verificada"
                            explica="Para bicicletarias, lojas e marcas com CNPJ ativo."
                            ativo={dados.lojaVerificada}
                            nomeAtivo={dados.lojaNome}
                            pedido={dados.loja}
                            codigo={dados.codigo}
                            onEnviado={carregar}
                        />
                    </div>
                )}
            </main>
        </AppShell>
    )
}

function Cartao({ icone: Icone, titulo, status, children }: { icone: LucideIcon; titulo: string; status?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="type-label flex items-center gap-2 text-foreground">
                    <Icone className="size-4" aria-hidden="true" />
                    {titulo}
                </h2>
                {status}
            </div>
            <div className="mt-3">{children}</div>
        </section>
    )
}

/** Automático: mostra cada requisito com ✓ ou o que falta. */
function Vendedor({ dados }: { dados: Minhas }) {
    const v = dados.vendedor
    const notaOk = v.avaliacoes === 0 || (v.nota ?? 0) >= 4.5
    const itens: [boolean, string][] = [
        [v.identidade, v.identidade ? "Identidade confirmada pela Stripe" : "Ative os recebimentos na Carteira (a Stripe confirma sua identidade)"],
        [v.vendas >= dados.vendasMeta, `${Math.min(v.vendas, dados.vendasMeta)} de ${dados.vendasMeta} vendas entregues pelo Imperium`],
        [notaOk, v.avaliacoes === 0 ? "Avaliação: ainda sem avaliações (não atrapalha)" : `Avaliação média ${Number(v.nota ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} (precisa de 4,5 ou mais)`],
        [v.diasConta >= 30, v.diasConta >= 30 ? "Conta com mais de 30 dias" : `Conta com ${v.diasConta} dias (precisa de 30)`],
        [v.semProblemas, v.semProblemas ? "Nenhuma denúncia procedente recente" : "Há uma suspensão ou denúncia procedente recente na conta"],
    ]
    return (
        <Cartao
            icone={BadgeCheck}
            titulo="Vendedor verificado"
            status={dados.vendedorVerificado ? <StatusBadge tone="success">Ativo</StatusBadge> : <StatusBadge tone="neutral">Automático</StatusBadge>}
        >
            <p className="type-body-small text-muted-foreground">
                Não precisa pedir: o selo aparece sozinho quando tudo abaixo estiver certo, e sai sozinho se deixar de estar.
            </p>
            <ul className="mt-3 flex flex-col gap-2">
                {itens.map(([ok, texto]) => (
                    <li key={texto} className="type-body-small flex items-start gap-2">
                        {ok ? <Check className="mt-0.5 size-4 shrink-0 text-success" aria-label="Feito" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-label="Falta" />}
                        <span className={ok ? "text-foreground" : "text-muted-foreground"}>{texto}</span>
                    </li>
                ))}
            </ul>
            {!v.identidade && (
                <Button asChild size="sm" variant="outline" className="mt-4">
                    <Link href="/carteira">Abrir a Carteira</Link>
                </Button>
            )}
        </Cartao>
    )
}

const ROTULO_STATUS: Record<Pedido["status"], { texto: string; tom: "warning" | "success" | "destructive" | "neutral" }> = {
    PENDENTE: { texto: "Em análise", tom: "warning" },
    APROVADA: { texto: "Ativo", tom: "success" },
    RECUSADA: { texto: "Não aprovado", tom: "destructive" },
    REMOVIDA: { texto: "Removido", tom: "destructive" },
}

function PedidoSelo({
    tipo,
    icone,
    titulo,
    explica,
    ativo,
    nomeAtivo,
    pedido,
    codigo,
    onEnviado,
}: {
    tipo: "criador" | "loja"
    icone: LucideIcon
    titulo: string
    explica: string
    ativo: boolean
    nomeAtivo?: string | null
    pedido: Pedido | null
    codigo: string
    onEnviado: () => void
}) {
    const [link, setLink] = useState("")
    const [seguidores, setSeguidores] = useState("")
    const [cnpj, setCnpj] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [copiado, setCopiado] = useState(false)

    const emAnalise = pedido?.status === "PENDENTE"
    const status = ativo ? ROTULO_STATUS.APROVADA : pedido ? ROTULO_STATUS[pedido.status] : null
    const pode = !ativo && !emAnalise
    const valido = link.trim().length > 4 && (tipo === "criador" ? Number(seguidores) > 0 : cnpj.replace(/\D/g, "").length === 14)

    async function enviar(event: React.FormEvent) {
        event.preventDefault()
        if (!valido) return
        setEnviando(true)
        setErro(null)
        try {
            await api.post(
                `/api/verificacoes/${tipo}`,
                tipo === "criador" ? { link: link.trim(), seguidores: Number(seguidores) } : { link: link.trim(), cnpj },
            )
            onEnviado()
        } catch (cause) {
            setErro(mensagem(cause))
        } finally {
            setEnviando(false)
        }
    }

    async function copiar() {
        try {
            await navigator.clipboard.writeText(codigo)
            setCopiado(true)
            setTimeout(() => setCopiado(false), 2000)
        } catch {
            /* sem área de transferência: o código está na tela para copiar à mão */
        }
    }

    return (
        <Cartao icone={icone} titulo={titulo} status={status && <StatusBadge tone={status.tom}>{status.texto}</StatusBadge>}>
            <p className="type-body-small text-muted-foreground">{explica}</p>

            {ativo && nomeAtivo && <p className="type-body-small mt-2 text-foreground">Aparece como: {nomeAtivo}</p>}
            {emAnalise && (
                <p className="type-body-small mt-3 text-foreground">
                    Recebemos seu pedido. <strong>Deixe o código {codigo} na bio</strong> até a resposta; avisamos pelo sino.
                </p>
            )}
            {!ativo && pedido && (pedido.status === "RECUSADA" || pedido.status === "REMOVIDA") && pedido.motivo && (
                <p className="type-body-small mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-destructive">Motivo: {pedido.motivo}</p>
            )}

            {pode && (
                <form onSubmit={enviar} className="mt-4 flex flex-col gap-4">
                    <div className={cn("rounded-lg bg-surface-muted p-3")}>
                        <p className="type-body-small text-foreground">
                            <strong>1.</strong> Para provar que {tipo === "criador" ? "o perfil é seu" : "a conta é da empresa"}, coloque este código na
                            bio {tipo === "criador" ? "do perfil" : "do Instagram da loja ou numa página do site"}:
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <code className="rounded bg-background px-2 py-1 font-mono text-sm font-semibold text-foreground">{codigo}</code>
                            <Button type="button" size="sm" variant="ghost" onClick={copiar}>
                                <Copy aria-hidden="true" />
                                {copiado ? "Copiado" : "Copiar"}
                            </Button>
                        </div>
                        <p className="type-caption mt-2 text-muted-foreground">Depois da aprovação você pode tirar.</p>
                    </div>

                    <p className="type-body-small text-foreground"><strong>2.</strong> Preencha e envie:</p>
                    {tipo === "loja" && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="selo-cnpj">CNPJ</Label>
                            <Input id="selo-cnpj" inputMode="numeric" maxLength={18} placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <Label htmlFor={`selo-link-${tipo}`}>{tipo === "criador" ? "Link do seu perfil" : "Instagram ou site da loja"}</Label>
                        <Input
                            id={`selo-link-${tipo}`}
                            inputMode="url"
                            maxLength={300}
                            placeholder={tipo === "criador" ? "instagram.com/seuperfil" : "instagram.com/sualoja"}
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </div>
                    {tipo === "criador" && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="selo-seguidores">Quantos seguidores tem lá</Label>
                            <Input id="selo-seguidores" type="number" inputMode="numeric" min={0} placeholder="Ex.: 12500" value={seguidores} onChange={(e) => setSeguidores(e.target.value)} />
                        </div>
                    )}

                    {erro && <p role="alert" className="type-body-small text-destructive">{erro}</p>}

                    <Button type="submit" loading={enviando} disabled={!valido} className="self-start">
                        Pedir selo
                    </Button>
                </form>
            )}
        </Cartao>
    )
}
