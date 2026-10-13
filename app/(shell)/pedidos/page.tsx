"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Package } from "lucide-react"

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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
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
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const carregar = useCallback(async () => {
        setFalhou(false)
        try {
            setPedidos((await api.get("/api/orders/mine")).data)
        } catch {
            setFalhou(true)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
        if (isSignedIn) void carregar()
    }, [isSignedIn, carregar])

    async function executar(chamada: () => Promise<unknown>) {
        setEnviando(true)
        setErro(null)
        try {
            await chamada()
            setConfirmando(null)
            setDisputando(null)
            setMotivo("")
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

            {erro && !disputando && (
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

                        {pedido.status === "PAGO" && (
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
                            {pedido.comprador && pedido.status === "PAGO" && (
                                <>
                                    <Button size="sm" onClick={() => setConfirmando({ pedido, acao: "recebido" })}>
                                        Recebi o produto
                                    </Button>
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
        </main>
    )
}
