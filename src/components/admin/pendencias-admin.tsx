"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, CircleAlert, HandCoins, Landmark, Loader2, type LucideIcon, Megaphone, Flag, LifeBuoy, Printer, Receipt, Snowflake, ShieldAlert, Scale, Tag, Timer, Truck } from "lucide-react"

import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"
import { usuarioAdminService } from "@/services/adminService"
import { mensagemDaApi } from "@/services/tournamentService"

type Contagens = { campanhas: number; denuncias: number; chamados: number; contasCongeladas: number; bikesRoubadas: number; disputas: number; anunciosEmAnalise: number; retiradasParadas: number; enviosAtrasados: number; etiquetas: number; repassesTravados: number; pagosSemRegistro: number; dinheiroARecuperar: number; dividas: number }
type Devedor = { userId: string; nome: string | null; email: string | null; valor: number }
type ContaCongelada = { userId: string; fullName: string | null; email: string | null; congeladaEm: string }
type AnuncioEmAnalise = { productId: string; title: string; price: number; vendedor: string | null; contaCriadaEm: string | null; createdAt: string }
type RetiradaParada = { orderId: string; productTitle: string; valor: number; comprador: string | null; vendedor: string | null; createdAt: string; motivo?: string | null }
/** Pagos sem registro podem não ter pagamento nem título no site. */
type ItemSemId = Omit<RetiradaParada, "orderId" | "productTitle"> & { orderId: string | null; productTitle: string | null }
type Etiquetas = { saldoMelhorEnvio: number | null; automaticaLigada: boolean; itens: RetiradaParada[] }

/** Abas do painel que cada fila abre. */
export type AbaPendencia = "disputas" | "anuncios" | "denuncias" | "suporte" | "bikes-roubadas"

const FILAS: { chave: keyof Contagens; aba?: AbaPendencia; titulo: string; texto: string; icon: LucideIcon; urgente?: boolean }[] = [
    { chave: "disputas", aba: "disputas", titulo: "Disputas de pedido", texto: "Dinheiro retido esperando decisão", icon: Scale, urgente: true },
    { chave: "contasCongeladas", titulo: "Contas congeladas", texto: "Confirme quem é o dono antes de liberar", icon: Snowflake, urgente: true },
    { chave: "anunciosEmAnalise", titulo: "Anúncios caros em análise", texto: "Conta nova ou sem vendas", icon: Tag },
    { chave: "retiradasParadas", titulo: "Retiradas paradas", texto: "Envio combinado sem código há 15 dias, ou retirada parada", icon: Timer, urgente: true },
    { chave: "enviosAtrasados", titulo: "Envios atrasados", texto: "Pagos há mais de 3 dias úteis sem rastreio", icon: Truck, urgente: true },
    { chave: "etiquetas", titulo: "Etiquetas com problema", texto: "O site não conseguiu gerar a etiqueta", icon: Printer, urgente: true },
    { chave: "repassesTravados", titulo: "Repasses travados", texto: "Vendas que já deviam ter ido para o vendedor", icon: Landmark, urgente: true },
    { chave: "pagosSemRegistro", titulo: "Pagos sem registro", texto: "O Stripe cobrou e o site não registrou", icon: CircleAlert, urgente: true },
    { chave: "dinheiroARecuperar", titulo: "Dinheiro a recuperar", texto: "Devolvido depois do repasse: reverter no Stripe", icon: HandCoins, urgente: true },
    { chave: "dividas", titulo: "Vendedores com dívida", texto: "Tarifa de reembolso a descontar; perdoe se não foi culpa dele", icon: Receipt },
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
    const [travados, setTravados] = useState<RetiradaParada[]>([])
    const [semRegistro, setSemRegistro] = useState<ItemSemId[]>([])
    const [recuperar, setRecuperar] = useState<ItemSemId[]>([])
    const [devedores, setDevedores] = useState<Devedor[]>([])
    const [etiquetas, setEtiquetas] = useState<Etiquetas | null>(null)
    const [gerando, setGerando] = useState<string | null>(null)
    const [erro, setErro] = useState<string | null>(null)

    const carregar = useCallback(async () => {
        setErro(null)
        try {
            const [c, contas, anuncios, paradas, envios, etiq, repasses, pagos, perdas, dividas] = await Promise.all([
                api.get<Contagens>("/api/admin/pendencias"),
                api.get<ContaCongelada[]>("/api/admin/pendencias/contas-congeladas"),
                api.get<AnuncioEmAnalise[]>("/api/admin/pendencias/anuncios-em-analise"),
                api.get<RetiradaParada[]>("/api/admin/pendencias/retiradas-paradas"),
                api.get<RetiradaParada[]>("/api/admin/pendencias/envios-atrasados"),
                // Complemento: sem ele o resto do painel continua
                api.get<Etiquetas>("/api/admin/pendencias/etiquetas").catch(() => ({ data: null })),
                api.get<RetiradaParada[]>("/api/admin/pendencias/repasses-travados").catch(() => ({ data: [] as RetiradaParada[] })),
                api.get<ItemSemId[]>("/api/admin/pendencias/pagos-sem-registro").catch(() => ({ data: [] as ItemSemId[] })),
                api.get<ItemSemId[]>("/api/admin/pendencias/dinheiro-a-recuperar").catch(() => ({ data: [] as ItemSemId[] })),
                api.get<Devedor[]>("/api/admin/pendencias/dividas").catch(() => ({ data: [] as Devedor[] })),
            ])
            setContagens(c.data)
            setCongeladas(contas.data)
            setEmAnalise(anuncios.data)
            setRetiradas(paradas.data)
            setAtrasados(envios.data)
            setEtiquetas(etiq.data)
            setTravados(repasses.data)
            setSemRegistro(pagos.data)
            setRecuperar(perdas.data)
            setDevedores(dividas.data)
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

    async function gerarEtiqueta(orderId: string) {
        setErro(null)
        setGerando(orderId)
        try {
            await api.post(`/api/admin/pendencias/etiquetas/${orderId}/gerar`)
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível gerar a etiqueta."))
        } finally {
            setGerando(null)
        }
    }

    /** Envio combinado travado: o admin decide pelas provas (mesma rota da disputa). */
    async function decidirEnvio(orderId: string, reembolsar: boolean) {
        if (!window.confirm(reembolsar ? "Devolver o dinheiro ao comprador?" : "Liberar o valor ao vendedor?")) return
        setErro(null)
        try {
            await api.post(`/api/orders/${orderId}/disputa/resolver`, null, { params: { reembolsar } })
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível decidir o pedido."))
        }
    }

    async function perdoar(d: Devedor) {
        if (!window.confirm(`Perdoar ${formatarPreco(Number(d.valor))} de ${d.nome || "este vendedor"}? A plataforma assume a tarifa.`)) return
        setErro(null)
        try {
            await api.post(`/api/admin/pendencias/dividas/${d.userId}/perdoar`)
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível perdoar a dívida."))
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

    // Fila nova no front antes do backend subir vem sem número: conta como zero
    const total = FILAS.reduce((soma, f) => soma + (contagens[f.chave] ?? 0), 0)

    return (
        <section>
            <p className="type-body-small text-muted-foreground">
                {total === 0 ? "Nada esperando por você. Tudo em dia." : `${total} ${total === 1 ? "item espera" : "itens esperam"} uma decisão.`}
            </p>
            {erro && <p role="alert" className="type-body-small mt-3 border-l-2 border-destructive pl-3 text-destructive">{erro}</p>}

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {FILAS.map((f) => {
                    const n = contagens[f.chave] ?? 0
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

            {etiquetas?.automaticaLigada && (
                <section aria-labelledby="etiquetas-title" className="mt-8">
                    <h2 id="etiquetas-title" className="type-label uppercase tracking-wider text-muted-foreground">
                        Etiquetas do Melhor Envio
                    </h2>
                    <p className="type-caption mt-1 text-muted-foreground">
                        Saldo da plataforma:{" "}
                        <strong className={cn("tabular-nums", etiquetas.saldoMelhorEnvio !== null && etiquetas.saldoMelhorEnvio < 100 ? "text-destructive" : "text-foreground")}>
                            {etiquetas.saldoMelhorEnvio === null ? "não deu para consultar" : formatarPreco(Number(etiquetas.saldoMelhorEnvio))}
                        </strong>
                        . Cada venda com envio gasta o valor do frete; recarregue por Pix no painel do Melhor Envio antes de acabar.
                    </p>
                    {etiquetas.itens.length > 0 && (
                        <ul className="mt-3 divide-y divide-border border-y border-border">
                            {etiquetas.itens.map((r) => (
                                <li key={r.orderId} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">{r.productTitle} · {formatarPreco(Number(r.valor))}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {r.comprador} → {r.vendedor} · pago em {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                                        </p>
                                        {r.motivo && <p className="mt-1 text-xs text-destructive">{r.motivo}</p>}
                                    </div>
                                    <button type="button" onClick={() => gerarEtiqueta(r.orderId)} disabled={gerando === r.orderId} className="line-btn line-btn--sm">
                                        {gerando === r.orderId ? "Gerando…" : "Gerar de novo"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

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
                                {r.motivo && (
                                    <>
                                        <p className="mt-1 text-xs text-foreground">{r.motivo}</p>
                                        <div className="mt-2 flex gap-2">
                                            <button type="button" onClick={() => decidirEnvio(r.orderId, false)} className="line-btn line-btn--sm">
                                                Liberar ao vendedor
                                            </button>
                                            <button type="button" onClick={() => decidirEnvio(r.orderId, true)} className="line-btn line-btn--sm">
                                                Devolver ao comprador
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {[
                { lista: semRegistro, id: "sem-registro", titulo: "Pagos sem registro", ajuda: "O comprador pagou e não tem pedido ou inscrição no site. Confira o pagamento no Stripe e reembolse ou registre à mão." },
                { lista: recuperar, id: "recuperar", titulo: "Dinheiro a recuperar", ajuda: "Foi devolvido ao comprador depois de já ter ido para o vendedor ou organizador. Reverta a transferência no Stripe (Connect → conta → Transferências). Some da lista 90 dias depois do repasse." },
            ].map((g) =>
                g.lista.length > 0 && (
                    <section key={g.id} aria-labelledby={`${g.id}-title`} className="mt-8">
                        <h2 id={`${g.id}-title`} className="type-label uppercase tracking-wider text-muted-foreground">
                            {g.titulo}
                        </h2>
                        <p className="type-caption mt-1 text-muted-foreground">{g.ajuda}</p>
                        <ul className="mt-3 divide-y divide-border border-y border-border">
                            {g.lista.map((r, i) => (
                                <li key={`${r.orderId ?? "sem-id"}-${i}`} className="py-3">
                                    <p className="truncate text-sm font-semibold">{r.productTitle} · {formatarPreco(Number(r.valor))}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {[r.comprador, r.vendedor].filter(Boolean).join(" → ")} · {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                                    </p>
                                    {r.motivo && <p className="mt-1 text-xs text-destructive">{r.motivo}</p>}
                                </li>
                            ))}
                        </ul>
                    </section>
                ),
            )}

            {travados.length > 0 && (
                <section aria-labelledby="travados-title" className="mt-8">
                    <h2 id="travados-title" className="type-label uppercase tracking-wider text-muted-foreground">
                        Repasses travados
                    </h2>
                    <p className="type-caption mt-1 text-muted-foreground">
                        O site tenta de novo toda noite. Se o vendedor está sem conta ativa, peça para ele ativar os recebimentos na Carteira.
                    </p>
                    <ul className="mt-3 divide-y divide-border border-y border-border">
                        {travados.map((r) => (
                            <li key={r.orderId} className="py-3">
                                <p className="truncate text-sm font-semibold">{r.productTitle} · a receber {formatarPreco(Number(r.valor))}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {r.comprador} → {r.vendedor} · pago em {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                                </p>
                                {r.motivo && <p className="mt-1 text-xs text-destructive">{r.motivo}</p>}
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

            {devedores.length > 0 && (
                <section aria-labelledby="dividas-title" className="mt-8">
                    <h2 id="dividas-title" className="type-label uppercase tracking-wider text-muted-foreground">
                        Vendedores com dívida
                    </h2>
                    <p className="type-caption mt-1 text-muted-foreground">
                        Tarifa do cartão de um reembolso por culpa do vendedor. Sai sozinha da próxima venda dele; até lá, ele não publica
                        anúncio novo. Perdoe se provou que não teve culpa (ex.: o Correio perdeu o pacote).
                    </p>
                    <ul className="mt-3 divide-y divide-border border-y border-border">
                        {devedores.map((d) => (
                            <li key={d.userId} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">{d.nome || "Sem nome"} · {formatarPreco(Number(d.valor))}</p>
                                    {d.email && <p className="truncate text-xs text-muted-foreground">{d.email}</p>}
                                </div>
                                <button type="button" onClick={() => perdoar(d)} className="line-btn line-btn--sm">
                                    Perdoar
                                </button>
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
