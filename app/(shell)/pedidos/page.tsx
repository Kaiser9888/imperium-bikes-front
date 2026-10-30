"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Package, Star } from "lucide-react"

import { PageHeading } from "@/components/layout/page-heading"
import { EnvioDoComprador, EnvioDoVendedor, type Envio } from "@/components/marketplace/envio-pedido"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import { StatusBadge, type StatusBadgeProps } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"
import { mensagemDaApi } from "@/services/tournamentService"

type Status = "PAGO" | "ENTREGUE" | "EM_DISPUTA" | "LIBERADO" | "REEMBOLSADO" | "CANCELADO"

type Pedido = {
    id: string
    productId: string
    productTitle: string
    valor: number
    status: Status
    /** true: eu comprei; false: eu vendi. */
    comprador: boolean
    outraParte: string
    disputaMotivo: string | null
    createdAt: string
    prazoDisputa: string
    /** Sem frete pelo site: o pagamento só libera com o código de retirada. */
    retiradaEmMaos: boolean
    /** Só vem para o comprador, enquanto espera a retirada. */
    codigoRetirada: string | null
    /** Com frete pelo site: etiqueta, destinatário e rastreio. */
    envio: Envio | null
}

const STATUS: Record<Status, { label: string; tone: StatusBadgeProps["tone"] }> = {
    PAGO: { label: "Pago", tone: "info" },
    ENTREGUE: { label: "Recebido", tone: "success" },
    EM_DISPUTA: { label: "Em disputa", tone: "warning" },
    LIBERADO: { label: "Concluído", tone: "success" },
    REEMBOLSADO: { label: "Reembolsado", tone: "neutral" },
    CANCELADO: { label: "Cancelado", tone: "neutral" },
}

// Ações que só pedem uma confirmação. Abrir disputa tem diálogo próprio, com o motivo.
const CONFIRMACAO = {
    recebido: {
        titulo: "Confirmar que recebeu?",
        texto: "O pagamento é liberado ao vendedor e não dá mais para abrir disputa.",
        botao: "Recebi o produto",
        chamar: (id: string) => api.post(`/api/orders/${id}/recebido`),
    },
    resolvido: {
        titulo: "Encerrar a disputa?",
        texto: "O pagamento é liberado ao vendedor e a disputa não pode ser reaberta.",
        botao: "Problema resolvido",
        chamar: (id: string) => api.post(`/api/orders/${id}/disputa/resolver`, null, { params: { reembolsar: false } }),
    },
    reembolsar: {
        titulo: "Reembolsar o comprador?",
        texto: "O valor pago volta inteiro para o comprador e sai do seu saldo pendente. Não dá para desfazer.",
        botao: "Reembolsar comprador",
        chamar: (id: string) => api.post(`/api/orders/${id}/disputa/resolver`, null, { params: { reembolsar: true } }),
    },
}
type Acao = keyof typeof CONFIRMACAO

const dia = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })

export default function PedidosPage() {
    const { isLoaded, isSignedIn } = useUser()
    const [pedidos, setPedidos] = useState<Pedido[] | null>(null)
    const [falhou, setFalhou] = useState(false)
    const [aba, setAba] = useState<"compras" | "vendas">("compras")

    const [confirmando, setConfirmando] = useState<{ pedido: Pedido; acao: Acao } | null>(null)
    const [disputando, setDisputando] = useState<Pedido | null>(null)
    const [motivo, setMotivo] = useState("")
    const [retirando, setRetirando] = useState<Pedido | null>(null)
    const [codigo, setCodigo] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    // Avaliação: liberada depois que o comprador recebe o produto
    const [avaliados, setAvaliados] = useState<Set<string>>(new Set())
    const [avaliando, setAvaliando] = useState<Pedido | null>(null)
    const [nota, setNota] = useState(0)
    const [comentario, setComentario] = useState("")

    const carregar = useCallback(async () => {
        setFalhou(false)
        try {
            const [pedidosRes, avaliacoesRes] = await Promise.all([
                api.get("/api/orders/mine"),
                // Sem a lista de avaliações, os pedidos ainda aparecem; o backend barra avaliação duplicada
                api.get("/api/reviews/me", { params: { size: 100 } }).catch(() => ({ data: { content: [] } })),
            ])
            setPedidos(pedidosRes.data)
            setAvaliados(new Set(avaliacoesRes.data.content.map((a: { productId: string }) => a.productId)))
        } catch {
            setFalhou(true)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
        if (isSignedIn) void carregar()
    }, [isSignedIn, carregar])

    // Etiqueta sendo gerada pelo site: confere de novo até ficar pronta
    const gerandoEtiqueta = pedidos?.some((p) => p.status === "PAGO" && p.envio?.etiqueta?.status === "PENDENTE") ?? false
    useEffect(() => {
        if (!gerandoEtiqueta) return
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") void carregar()
        }, 20_000)
        return () => clearInterval(timer)
    }, [gerandoEtiqueta, carregar])

    async function executar(chamada: () => Promise<unknown>) {
        setEnviando(true)
        setErro(null)
        try {
            await chamada()
            setConfirmando(null)
            setDisputando(null)
            setMotivo("")
            setRetirando(null)
            setCodigo("")
            setAvaliando(null)
            await carregar()
        } catch (cause) {
            setConfirmando(null)
            setErro(mensagemDaApi(cause, "Não foi possível concluir. Tente novamente."))
        } finally {
            setEnviando(false)
        }
    }

    const lista = pedidos?.filter((p) => p.comprador === (aba === "compras"))

    return (
        <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
            <PageHeading title="Pedidos" back={{ href: "/", label: "Início" }} />

            <div role="group" aria-label="Tipo de pedido" className="mt-6 flex gap-2">
                {(["compras", "vendas"] as const).map((opcao) => (
                    <button
                        key={opcao}
                        type="button"
                        aria-pressed={aba === opcao}
                        onClick={() => setAba(opcao)}
                        className={cn(
                            "type-label h-9 rounded-full border px-4 capitalize transition-colors",
                            aba === opcao ? "border-accent bg-accent text-accent-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {opcao}
                    </button>
                ))}
            </div>

            {erro && !disputando && !avaliando && !retirando && (
                <p role="alert" className="type-body-small mt-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                    {erro}
                </p>
            )}

            <div className="mt-6 flex flex-col gap-3">
                {isLoaded && !isSignedIn && <EmptyState icon={Package} title="Entre para ver seus pedidos" />}
                {falhou && <ErrorState onRetry={carregar} />}
                {isSignedIn && !falhou && !pedidos && <Loader className="py-16" />}
                {lista?.length === 0 && <EmptyState icon={Package} title={aba === "compras" ? "Você ainda não comprou nada" : "Você ainda não vendeu nada"} />}
                {lista?.map((pedido) => (
                    <article key={pedido.id} className="rounded-xl border border-border bg-surface p-4">
                        <div className="flex items-start justify-between gap-3">
                            <Link href={`/produtos/${pedido.productId}`} className="type-label text-foreground hover:underline">
                                {pedido.productTitle}
                            </Link>
                            <StatusBadge tone={STATUS[pedido.status].tone}>{STATUS[pedido.status].label}</StatusBadge>
                        </div>
                        <p className="type-caption mt-1 text-muted-foreground">
                            {pedido.comprador ? "Vendido por" : "Comprado por"} {pedido.outraParte} · {dia(pedido.createdAt)} · {formatarPreco(pedido.valor)}
                            {!pedido.comprador && " líquidos"}
                        </p>

                        {pedido.status === "PAGO" && pedido.retiradaEmMaos && pedido.comprador && pedido.codigoRetirada && (
                            <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-3">
                                <p className="type-caption uppercase tracking-wider text-muted-foreground">Código de retirada</p>
                                <p className="type-h2 mt-0.5 font-mono tracking-[0.3em] text-foreground">{pedido.codigoRetirada}</p>
                                <p className="type-body-small mt-2 text-muted-foreground">
                                    Só passe este código ao vendedor <strong className="text-foreground">depois de conferir o produto</strong>. Com ele, o
                                    pagamento é liberado. Combine a entrega em local público e movimentado, e não leve dinheiro: o pagamento já foi feito
                                    pelo Imperium.
                                </p>
                            </div>
                        )}
                        {pedido.status === "PAGO" && pedido.retiradaEmMaos && !pedido.comprador && (
                            <p className="type-body-small mt-3 text-muted-foreground">
                                Na entrega, peça o código ao comprador. Não aceite pagamento por fora.
                            </p>
                        )}
                        {pedido.status === "PAGO" && pedido.envio && (
                            pedido.comprador ? (
                                <EnvioDoComprador envio={pedido.envio} />
                            ) : (
                                <EnvioDoVendedor
                                    orderId={pedido.id}
                                    envio={pedido.envio}
                                    onMudou={carregar}
                                    onErro={setErro}
                                    onInformar={async (codigo) => {
                                        setErro(null)
                                        try {
                                            await api.post(`/api/orders/${pedido.id}/envio`, { codigo })
                                            await carregar()
                                        } catch (cause) {
                                            setErro(mensagemDaApi(cause, "Não foi possível salvar o código. Tente novamente."))
                                            throw cause
                                        }
                                    }}
                                />
                            )
                        )}
                        {pedido.status === "PAGO" && !pedido.retiradaEmMaos && pedido.envio?.enviadoEm && (
                            <p className="type-body-small mt-3 text-muted-foreground">
                                {pedido.comprador
                                    ? `Se algo der errado, avise até ${dia(pedido.prazoDisputa)}. Depois disso o pagamento é liberado ao vendedor.`
                                    : `O valor é liberado quando o comprador confirmar o recebimento ou em ${dia(pedido.prazoDisputa)}.`}
                            </p>
                        )}
                        {pedido.status === "EM_DISPUTA" && (
                            <p className="type-body-small mt-3 rounded-lg bg-surface-muted px-3 py-2.5 text-foreground">
                                <span className="font-semibold">Problema relatado:</span> {pedido.disputaMotivo}
                                <span className="mt-1 block text-muted-foreground">
                                    O pagamento fica retido até vocês resolverem. Combinem pelo chat.
                                </span>
                            </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 empty:hidden">
                            {!pedido.comprador && pedido.status === "PAGO" && pedido.retiradaEmMaos && (
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setErro(null)
                                        setCodigo("")
                                        setRetirando(pedido)
                                    }}
                                >
                                    Digitar código de retirada
                                </Button>
                            )}
                            {pedido.comprador && pedido.status === "PAGO" && (
                                <>
                                    {/* Na retirada em mãos, quem confirma é o código; no envio, só depois de postado */}
                                    {!pedido.retiradaEmMaos && pedido.envio?.enviadoEm && (
                                        <Button size="sm" onClick={() => setConfirmando({ pedido, acao: "recebido" })}>
                                            Recebi o produto
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setErro(null)
                                            setDisputando(pedido)
                                        }}
                                    >
                                        Tive um problema
                                    </Button>
                                </>
                            )}
                            {pedido.comprador && pedido.status === "EM_DISPUTA" && (
                                <Button size="sm" variant="outline" onClick={() => setConfirmando({ pedido, acao: "resolvido" })}>
                                    Problema resolvido
                                </Button>
                            )}
                            {pedido.comprador && (pedido.status === "ENTREGUE" || pedido.status === "LIBERADO") && (
                                avaliados.has(pedido.productId) ? (
                                    <span className="type-caption inline-flex items-center gap-1.5 text-muted-foreground">
                                        <Star className="size-3.5 fill-warning text-warning" aria-hidden="true" />
                                        Você já avaliou
                                    </span>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setErro(null)
                                            setNota(0)
                                            setComentario("")
                                            setAvaliando(pedido)
                                        }}
                                    >
                                        Avaliar vendedor
                                    </Button>
                                )
                            )}
                            {!pedido.comprador && pedido.status === "EM_DISPUTA" && (
                                <Button size="sm" variant="outline" onClick={() => setConfirmando({ pedido, acao: "reembolsar" })}>
                                    Reembolsar comprador
                                </Button>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            <AlertDialog open={confirmando !== null} onOpenChange={(open) => !open && !enviando && setConfirmando(null)}>
                {confirmando && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{CONFIRMACAO[confirmando.acao].titulo}</AlertDialogTitle>
                            <AlertDialogDescription>{CONFIRMACAO[confirmando.acao].texto}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => executar(() => CONFIRMACAO[confirmando.acao].chamar(confirmando.pedido.id))}>
                                {CONFIRMACAO[confirmando.acao].botao}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
            </AlertDialog>

            <Dialog open={disputando !== null} onOpenChange={(open) => !open && !enviando && setDisputando(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>O que aconteceu?</DialogTitle>
                        <DialogDescription>O vendedor é avisado e o pagamento fica retido até o caso ser resolvido.</DialogDescription>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault()
                            if (disputando) void executar(() => api.post(`/api/orders/${disputando.id}/disputa`, { motivo: motivo.trim() }))
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="disputa-motivo">Descreva o problema</Label>
                            <Textarea id="disputa-motivo" required rows={4} maxLength={1000} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                        </div>
                        {erro && (
                            <p role="alert" className="type-body-small rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                                {erro}
                            </p>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDisputando(null)} disabled={enviando}>
                                Cancelar
                            </Button>
                            <Button type="submit" loading={enviando} disabled={!motivo.trim()}>
                                Abrir disputa
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={retirando !== null} onOpenChange={(open) => !open && !enviando && setRetirando(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Código de retirada</DialogTitle>
                        <DialogDescription>
                            O comprador te passa depois de conferir o produto.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault()
                            if (retirando) void executar(() => api.post(`/api/orders/${retirando.id}/retirada`, { codigo }))
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="codigo-retirada">Código</Label>
                            <Input
                                id="codigo-retirada"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                required
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                                className="font-mono text-lg tracking-[0.3em]"
                            />
                        </div>
                        {erro && (
                            <p role="alert" className="type-body-small rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                                {erro}
                            </p>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRetirando(null)} disabled={enviando}>
                                Cancelar
                            </Button>
                            <Button type="submit" loading={enviando} disabled={codigo.length !== 6}>
                                Confirmar entrega
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={avaliando !== null} onOpenChange={(open) => !open && !enviando && setAvaliando(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Como foi a compra?</DialogTitle>
                        <DialogDescription>
                            {avaliando && `Sua nota para ${avaliando.outraParte} aparece no perfil e nos anúncios do vendedor.`}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault()
                            if (avaliando && nota > 0)
                                void executar(() =>
                                    api.post("/api/reviews", { productId: avaliando.productId, rating: nota, comment: comentario.trim() || null }),
                                )
                        }}
                    >
                        <fieldset className="flex flex-col gap-2">
                            <legend className="type-label mb-2">Nota</legend>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setNota(n)}
                                        aria-label={`${n} de 5`}
                                        aria-pressed={nota === n}
                                        className="grid size-11 place-items-center rounded-lg transition-colors hover:bg-surface-muted"
                                    >
                                        <Star className={cn("size-7", n <= nota ? "fill-warning text-warning" : "text-border")} aria-hidden="true" />
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="avaliacao-comentario">Comentário (opcional)</Label>
                            <Textarea
                                id="avaliacao-comentario"
                                rows={4}
                                maxLength={2000}
                                placeholder="O produto chegou como anunciado? O vendedor respondeu bem?"
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                            />
                        </div>
                        {erro && (
                            <p role="alert" className="type-body-small rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                                {erro}
                            </p>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAvaliando(null)} disabled={enviando}>
                                Cancelar
                            </Button>
                            <Button type="submit" loading={enviando} disabled={nota === 0}>
                                Enviar avaliação
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </main>
    )
}
