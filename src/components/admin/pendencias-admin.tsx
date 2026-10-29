"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, Loader2, type LucideIcon, Megaphone, Flag, LifeBuoy, Snowflake, ShieldAlert, Scale, Tag, Timer, Truck } from "lucide-react"

import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"
import { usuarioAdminService } from "@/services/adminService"
import { mensagemDaApi } from "@/services/tournamentService"

type Contagens = { campanhas: number; denuncias: number; chamados: number; contasCongeladas: number; bikesRoubadas: number; disputas: number; anunciosEmAnalise: number; retiradasParadas: number; enviosAtrasados: number }
type ContaCongelada = { userId: string; fullName: string | null; email: string | null; congeladaEm: string }
type AnuncioEmAnalise = { productId: string; title: string; price: number; vendedor: string | null; contaCriadaEm: string | null; createdAt: string }
type RetiradaParada = { orderId: string; productTitle: string; valor: number; comprador: string | null; vendedor: string | null; createdAt: string }

/** Abas do painel que cada fila abre. */
export type AbaPendencia = "disputas" | "anuncios" | "denuncias" | "suporte" | "bikes-roubadas"

const FILAS: { chave: keyof Contagens; aba?: AbaPendencia; titulo: string; texto: string; icon: LucideIcon; urgente?: boolean }[] = [
    { chave: "disputas", aba: "disputas", titulo: "Disputas de pedido", texto: "Dinheiro retido esperando decisão", icon: Scale, urgente: true },
    { chave: "contasCongeladas", titulo: "Contas congeladas", texto: "Confirme quem é o dono antes de liberar", icon: Snowflake, urgente: true },
    { chave: "anunciosEmAnalise", titulo: "Anúncios caros em análise", texto: "Conta nova ou sem vendas", icon: Tag },
    { chave: "retiradasParadas", titulo: "Retiradas paradas", texto: "Pagas há mais de 30 dias sem o código", icon: Timer, urgente: true },
    { chave: "enviosAtrasados", titulo: "Envios atrasados", texto: "Pagos há mais de 3 dias úteis sem rastreio", icon: Truck, urgente: true },
    { chave: "bikesRoubadas", aba: "bikes-roubadas", titulo: "Alertas de bike roubada", texto: "Conferir o boletim de ocorrência", icon: ShieldAlert },
    { chave: "campanhas", aba: "anuncios", titulo: "Anúncios em vídeo", texto: "Campanhas pagas esperando aprovação", icon: Megaphone },
    { chave: "denuncias", aba: "denuncias", titulo: "Denúncias", texto: "Conteúdo denunciado para analisar", icon: Flag },
    { chave: "chamados", aba: "suporte", titulo: "Suporte, ideias e erros", texto: "Chamados sem resposta", icon: LifeBuoy },
]

/** Primeira aba do painel: tudo que espera uma decisão, com atalho para a fila. */
export function PendenciasAdmin({ onAbrir }: { onAbrir: (aba: AbaPendencia) => void }) {
    const [contagens, setContagens] = useState<Contagens | null>(null)
    const [congeladas, setCongeladas] = useState<ContaCongelada[]>([])
    const [emAnalise, setEmAnalise] = useState<AnuncioEmAnalise[]>([])
    const [retiradas, setRetiradas] = useState<RetiradaParada[]>([])
    const [atrasados, setAtrasados] = useState<RetiradaParada[]>([])
    const [erro, setErro] = useState<string | null>(null)

    const carregar = useCallback(async () => {
        setErro(null)
        try {
            const [c, contas, anuncios, paradas, envios] = await Promise.all([
                api.get<Contagens>("/api/admin/pendencias"),
                api.get<ContaCongelada[]>("/api/admin/pendencias/contas-congeladas"),
                api.get<AnuncioEmAnalise[]>("/api/admin/pendencias/anuncios-em-analise"),
                api.get<RetiradaParada[]>("/api/admin/pendencias/retiradas-paradas"),
                api.get<RetiradaParada[]>("/api/admin/pendencias/envios-atrasados"),
            ])
            setContagens(c.data)
            setCongeladas(contas.data)
            setEmAnalise(anuncios.data)
            setRetiradas(paradas.data)
            setAtrasados(envios.data)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível carregar as pendências."))
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga ao abrir a aba
        void carregar()
    }, [carregar])

    async function descongelar(conta: ContaCongelada) {
        setErro(null)
        try {
            await usuarioAdminService.descongelar(conta.userId)
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível descongelar a conta."))
        }
    }

    async function decidir(anuncio: AnuncioEmAnalise, aprovar: boolean) {
        setErro(null)
        try {
            await api.post(`/api/admin/pendencias/anuncios-em-analise/${anuncio.productId}`, null, { params: { aprovar } })
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível decidir o anúncio."))
        }
    }

    if (!contagens) {
        return erro ? <p role="alert" className="type-body-small border-l-2 border-destructive pl-3 text-destructive">{erro}</p> : <Loader2 className="size-5 animate-spin text-muted-foreground" />
    }

    const total = FILAS.reduce((soma, f) => soma + contagens[f.chave], 0)

    return (
        <section>
            <p className="type-body-small text-muted-foreground">
                {total === 0 ? "Nada esperando por você. Tudo em dia." : `${total} ${total === 1 ? "item espera" : "itens esperam"} uma decisão.`}
            </p>
            {erro && <p role="alert" className="type-body-small mt-3 border-l-2 border-destructive pl-3 text-destructive">{erro}</p>}

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {FILAS.map((f) => {
                    const n = contagens[f.chave]
                    const Icone = n === 0 ? CheckCircle2 : f.icon
                    const conteudo = (
                        <>
                            <Icone className={cn("mt-0.5 size-5 shrink-0", n === 0 ? "text-success" : f.urgente ? "text-destructive" : "text-primary")} aria-hidden="true" />
                            <span className="min-w-0 flex-1">
                                <span className="type-label block text-foreground">{f.titulo}</span>
                                <span className="type-caption block text-muted-foreground">{n === 0 ? "Nada esperando" : f.texto}</span>
                            </span>
                            <span className={cn("type-h3 tabular-nums", n === 0 ? "text-muted-foreground" : "text-foreground")}>{n}</span>
                        </>
                    )
                    return (
                        <li key={f.chave}>
                            {f.aba && n > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => onAbrir(f.aba!)}
                                    className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/40"
                                >
                                    {conteudo}
                                </button>
                            ) : (
                                <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">{conteudo}</div>
                            )}
                        </li>
                    )
                })}
            </ul>

            {retiradas.length > 0 && (
                <section aria-labelledby="retiradas-title" className="mt-8">
                    <h2 id="retiradas-title" className="type-label uppercase tracking-wider text-muted-foreground">
                        Retiradas paradas
                    </h2>
                    <ul className="mt-3 divide-y divide-border border-y border-border">
                        {retiradas.map((r) => (
                            <li key={r.orderId} className="py-3">
                                <p className="truncate text-sm font-semibold">{r.productTitle} · {formatarPreco(Number(r.valor))}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {r.comprador} → {r.vendedor} · pago em {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {atrasados.length > 0 && (
                <section aria-labelledby="atrasados-title" className="mt-8">
                    <h2 id="atrasados-title" className="type-label uppercase tracking-wider text-muted-foreground">
                        Envios atrasados
                    </h2>
                    <p className="type-caption mt-1 text-muted-foreground">Fale com o vendedor pelo chat; sem envio, reembolse o comprador no painel do Stripe.</p>
                    <ul className="mt-3 divide-y divide-border border-y border-border">
                        {atrasados.map((r) => (
                            <li key={r.orderId} className="py-3">
                                <p className="truncate text-sm font-semibold">{r.productTitle} · {formatarPreco(Number(r.valor))}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {r.comprador} → {r.vendedor} · pago em {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {emAnalise.length > 0 && (
                <section aria-labelledby="em-analise-title" className="mt-8">
                    <h2 id="em-analise-title" className="type-label uppercase tracking-wider text-muted-foreground">
                        Anúncios caros em análise
                    </h2>
                    <ul className="mt-3 divide-y divide-border border-y border-border">
                        {emAnalise.map((a) => (
                            <li key={a.productId} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                                <div className="min-w-0 flex-1">
                                    <Link href={`/produtos/${a.productId}`} className="block truncate text-sm font-semibold hover:underline">
                                        {a.title} · {formatarPreco(Number(a.price))}
                                    </Link>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {a.vendedor || "Sem nome"}
                                        {a.contaCriadaEm && ` · conta de ${new Date(a.contaCriadaEm).toLocaleDateString("pt-BR")}`}
                                    </p>
                                </div>
                                <button type="button" onClick={() => decidir(a, false)} className="line-btn line-btn--sm line-btn--danger">
                                    Recusar
                                </button>
                                <button type="button" onClick={() => decidir(a, true)} className="line-btn line-btn--sm">
                                    Aprovar
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {congeladas.length > 0 && (
                <section aria-labelledby="congeladas-title" className="mt-8">
                    <h2 id="congeladas-title" className="type-label uppercase tracking-wider text-muted-foreground">
                        Contas congeladas
                    </h2>
                    <p className="type-caption mt-1 text-muted-foreground">
                        O dono pede para voltar pelo suporte. Libere só depois de confirmar que é ele (documento, pedidos antigos, cartão usado).
                    </p>
                    <ul className="mt-3 divide-y divide-border border-y border-border">
                        {congeladas.map((c) => (
                            <li key={c.userId} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">{c.fullName || "Sem nome"}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {c.email} · congelada em {new Date(c.congeladaEm).toLocaleString("pt-BR")}
                                    </p>
                                </div>
                                <button type="button" onClick={() => descongelar(c)} className="line-btn line-btn--sm">
                                    Descongelar
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </section>
    )
}
