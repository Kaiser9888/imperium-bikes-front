"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

import { TopoFocado } from "@/components/layout/topo-focado"
import { Loader } from "@/components/ui/loader"
import { useRecebimentos } from "@/hooks/useRecebimentos"
import { AtivarRecebimentos } from "./AtivarRecebimentos"

/**
 * Anunciar só com a conta de recebimentos pronta: o dinheiro da venda precisa ter para onde ir.
 * Exceção: serviço com valor "a partir de", que é combinado direto e não passa pelo site
 * (o servidor confere de novo ao publicar, então escolher preço fixo depois ainda é barrado).
 */
export function GateRecebimentos({ children }: { children: React.ReactNode }) {
    const [estado, conferir] = useRecebimentos()
    const pathname = usePathname()
    const [soVitrine, setSoVitrine] = useState(false)

    if (estado === "pronto" || estado === "desconhecido" || soVitrine) return children
    if (estado === "carregando") return <Loader className="py-24" />

    const servico = pathname.includes("/servicos")
    return (
        <>
        <TopoFocado titulo="Novo anúncio" voltarPara="/vendedor" largura="max-w-xl" />
        <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
            <h2 className="type-h1">Antes de anunciar</h2>
            <div className="mt-6">
                <AtivarRecebimentos
                    titulo="Ative seus recebimentos"
                    emAnalise={estado === "analise"}
                    onPronto={conferir}
                    texto="Quando alguém comprar, o dinheiro fica protegido e depois vai direto para a sua conta bancária. Para isso, o Stripe (nosso parceiro de pagamentos) precisa do seu cadastro."
                >
                    {servico && (
                        <button
                            type="button"
                            onClick={() => setSoVitrine(true)}
                            className="type-body-small mt-4 text-primary underline underline-offset-2"
                        >
                            Vou anunciar um serviço com valor a combinar
                        </button>
                    )}
                </AtivarRecebimentos>
            </div>
        </main>
        </>
    )
}
