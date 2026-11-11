"use client"

import { usePathname } from "next/navigation"
import { Wallet } from "lucide-react"

import ConnectStripeButton from "./ConnectStripeButton"
import { EmAnaliseStripe } from "./EmAnaliseStripe"

/**
 * Aviso de quem ainda não pode receber pelo site. O botão leva ao cadastro do Stripe e
 * a volta cai de novo nesta página (ver /onboarding/completo).
 */
export function AtivarRecebimentos({ titulo, texto, novaAba = false, emAnalise = false, onPronto, children }: {
    titulo: string
    texto: string
    novaAba?: boolean
    /** Cadastro já enviado: mostra a espera em vez de mandar ao formulário de novo. */
    emAnalise?: boolean
    onPronto?: () => void
    children?: React.ReactNode
}) {
    const pathname = usePathname()
    if (emAnalise) return <EmAnaliseStripe onPronto={() => onPronto?.()} />
    return (
        <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Wallet className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="type-label text-foreground">{titulo}</p>
                    <p className="type-body-small mt-1 text-muted-foreground">{texto}</p>
                    <p className="type-caption mt-2 text-muted-foreground">
                        Leva poucos minutos: nome, CPF, data de nascimento, endereço e a conta bancária onde o dinheiro vai cair.
                    </p>
                    <div className="mt-4">
                        <ConnectStripeButton voltarPara={pathname} texto="Ativar recebimentos" novaAba={novaAba} />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}
