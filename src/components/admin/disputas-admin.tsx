"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

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
import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { mensagemDaApi } from "@/services/tournamentService"

type Disputa = {
    orderId: string
    productTitle: string
    productId: string
    valor: number
    comprador: string
    vendedor: string
    motivo: string | null
    retiradaEmMaos: boolean
    createdAt: string
}

/**
 * Pedidos em disputa: o dinheiro fica retido até alguém decidir. Normalmente comprador e
 * vendedor resolvem entre eles; aqui o admin decide quando não há acordo.
 */
export function DisputasAdmin() {
    const [lista, setLista] = useState<Disputa[] | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [decidindo, setDecidindo] = useState<{ disputa: Disputa; reembolsar: boolean } | null>(null)

    const carregar = useCallback(async () => {
        setErro(null)
        try {
            setLista((await api.get<Disputa[]>("/api/admin/pendencias/disputas")).data)
        } catch (cause) {
            setLista([])
            setErro(mensagemDaApi(cause, "Não foi possível carregar as disputas."))
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga ao abrir a aba
        void carregar()
    }, [carregar])

    async function decidir() {
        if (!decidindo) return
        const { disputa, reembolsar } = decidindo
        setDecidindo(null)
        setErro(null)
        try {
            await api.post(`/api/orders/${disputa.orderId}/disputa/resolver`, null, { params: { reembolsar } })
            setLista((l) => l?.filter((d) => d.orderId !== disputa.orderId) ?? null)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível resolver a disputa."))
        }
    }

    return (
        <section>
            <p className="type-body-small text-muted-foreground">
                Antes de decidir, leia a conversa dos dois no chat e peça provas (fotos, vídeo da embalagem, rastreio). Reembolsar devolve tudo
                ao comprador; liberar paga o vendedor.
            </p>
            {erro && <p role="alert" className="type-body-small mt-4 border-l-2 border-destructive pl-3 text-destructive">{erro}</p>}

            {lista === null ? (
                <Loader2 className="mt-8 size-5 animate-spin text-muted-foreground" />
            ) : lista.length === 0 ? (
                <p className="type-body-small mt-8 text-muted-foreground">Nenhuma disputa aberta. Tudo em dia.</p>
            ) : (
                <ul className="mt-5 divide-y divide-border border-y border-border">
                    {lista.map((d) => (
                        <li key={d.orderId} className="py-4">
                            <p className="text-sm font-semibold">
                                <Link href={`/produtos/${d.productId}`} className="hover:underline">{d.productTitle}</Link> · {formatarPreco(Number(d.valor))}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Comprador: <strong className="text-foreground">{d.comprador}</strong> · Vendedor: <strong className="text-foreground">{d.vendedor}</strong> ·{" "}
                                {d.retiradaEmMaos ? "retirada em mãos" : "envio"} · pedido de {new Date(d.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                            {d.motivo && <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-sm">“{d.motivo}”</p>}
                            <div className="mt-3 flex gap-5">
                                <button type="button" onClick={() => setDecidindo({ disputa: d, reembolsar: true })} className="line-btn line-btn--sm line-btn--danger">
                                    Reembolsar comprador
                                </button>
                                <button type="button" onClick={() => setDecidindo({ disputa: d, reembolsar: false })} className="line-btn line-btn--sm">
                                    Liberar ao vendedor
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <AlertDialog open={decidindo !== null} onOpenChange={(open) => !open && setDecidindo(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{decidindo?.reembolsar ? "Reembolsar o comprador?" : "Liberar o pagamento ao vendedor?"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {decidindo?.reembolsar
                                ? "O valor pago volta inteiro para o comprador pelo Stripe. Não dá para desfazer."
                                : "A disputa é encerrada e o valor vai para o vendedor na próxima rodada de repasses. Não dá para desfazer."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={decidir}>{decidindo?.reembolsar ? "Reembolsar" : "Liberar"}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}
