"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"

type Caixa = {
    stripeDisponivel: number | null
    stripeAEntrar: number | null
    devidoAVendedores: number
    guardarNoBanco: number | null
    ganhoConfirmado: number
    ganhoAConfirmar: number
    dividasDeVendedores: number
}

/**
 * Quanto do dinheiro é dos vendedores e quanto é do Imperium. No Brasil a Stripe manda tudo para o
 * banco todo dia (inclusive a parte dos vendedores que espera a entrega): esta tela diz quanto
 * do banco precisa ficar parado.
 */
export function CaixaAdmin() {
    const [caixa, setCaixa] = useState<Caixa | null>(null)
    const [erro, setErro] = useState(false)

    const carregar = useCallback(async () => {
        setErro(false)
        try {
            setCaixa((await api.get<Caixa>("/api/admin/pendencias/caixa")).data)
        } catch {
            setErro(true)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga ao abrir a aba
        void carregar()
    }, [carregar])

    if (erro) {
        return (
            <p role="alert" className="type-body-small text-destructive">
                Não foi possível carregar o caixa.{" "}
                <button type="button" onClick={carregar} className="underline">Tentar de novo</button>
            </p>
        )
    }
    if (!caixa) return <Loader2 className="mt-8 size-5 animate-spin text-muted-foreground" />

    const reais = (v: number | null | undefined) => (v == null ? "—" : formatarPreco(Number(v)))
    const semStripe = caixa.stripeDisponivel == null

    return (
        <section className="flex flex-col gap-6">
            {/* O número que importa: quanto do banco não é seu */}
            <div className="rounded-xl border border-border bg-surface p-5">
                <p className="type-label uppercase tracking-wider text-muted-foreground">Guarde no banco</p>
                <p className="type-h1 mt-1 tabular-nums text-foreground">{semStripe ? "—" : reais(caixa.guardarNoBanco)}</p>
                <p className="type-body-small mt-2 text-muted-foreground">
                    {semStripe
                        ? "A Stripe não respondeu agora. Tente de novo em alguns minutos."
                        : Number(caixa.guardarNoBanco) > 0
                          ? "Esse valor está no seu banco, mas é de vendedores que ainda esperam a entrega. Não gaste: a Stripe tira de volta das próximas vendas quando liberar para eles."
                          : "Nada a separar: o que os vendedores têm a receber ainda está na Stripe."}
                </p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
                <Linha rotulo="Na Stripe agora" valor={reais(caixa.stripeDisponivel)} ajuda="Disponível. Negativo é normal: já foi para o banco e volta com as próximas vendas." negativo={Number(caixa.stripeDisponivel) < 0} />
                <Linha rotulo="Entrando na Stripe" valor={reais(caixa.stripeAEntrar)} ajuda="Pagamentos ainda em processamento (Pix ~2 dias úteis, cartão até 30 dias)." />
                <Linha rotulo="Devido a vendedores e organizadores" valor={reais(caixa.devidoAVendedores)} ajuda="Vendas e inscrições pagas que ainda esperam entrega ou prazo para liberar." />
                <Linha rotulo="Vendedores devendo ao Imperium" valor={reais(caixa.dividasDeVendedores)} ajuda="Tarifas de reembolso; descontadas na próxima venda deles." />
            </dl>

            <div>
                <h2 className="type-label uppercase tracking-wider text-muted-foreground">Seu ganho nas vendas</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Linha rotulo="Confirmado" valor={reais(caixa.ganhoConfirmado)} ajuda="Parte do Imperium (3%, até R$ 60 por item) em vendas já entregues." destaque />
                    <Linha rotulo="A confirmar" valor={reais(caixa.ganhoAConfirmar)} ajuda="Vendas pagas que ainda podem ser devolvidas (sem entrega ou em disputa)." />
                </dl>
                <p className="type-caption mt-2 text-muted-foreground">
                    A parte do Imperium nas inscrições de eventos ainda não entra nesta conta. A Stripe cobra a tarifa do cartão/Pix por fora
                    (já paga pela Proteção do comprador).
                </p>
            </div>

            <Button type="button" variant="outline" className="self-start" onClick={carregar}>
                Atualizar
            </Button>
        </section>
    )
}

function Linha({ rotulo, valor, ajuda, destaque, negativo }: { rotulo: string; valor: string; ajuda: string; destaque?: boolean; negativo?: boolean }) {
    return (
        <div className="rounded-xl border border-border p-4">
            <dt className="type-caption text-muted-foreground">{rotulo}</dt>
            <dd className={cn("type-h3 mt-1 tabular-nums", destaque ? "text-success" : negativo ? "text-warning" : "text-foreground")}>{valor}</dd>
            <dd className="type-caption mt-1 text-muted-foreground">{ajuda}</dd>
        </div>
    )
}
