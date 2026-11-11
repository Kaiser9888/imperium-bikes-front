"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/apiClient"
import type { ContaConectadaResponse } from "@/types/contaConectada"

/**
 * Cadastro enviado e o Stripe conferindo os dados. Antes o vendedor via "incompleto" e era mandado
 * de volta ao formulário, num laço. Aqui ele só espera e confere de novo quando quiser.
 */
export function EmAnaliseStripe({ onPronto }: { onPronto?: (status: ContaConectadaResponse) => void }) {
    const { getToken } = useAuth()
    const [conferindo, setConferindo] = useState(false)
    const [aviso, setAviso] = useState<string | null>(null)

    async function conferir() {
        setConferindo(true)
        setAviso(null)
        try {
            const status = await apiFetch<ContaConectadaResponse>("/api/conta-conectada/atualizar-status", getToken, { method: "POST" })
            if (status.onboardingCompleto) onPronto?.(status)
            else setAviso(status.emAnalise ? "Ainda em análise. Tente de novo mais tarde." : "A Stripe pediu mais alguma informação. Recarregue a página.")
        } catch {
            setAviso("Não deu para conferir agora. Tente de novo em instantes.")
        } finally {
            setConferindo(false)
        }
    }

    return (
        <div className="rounded-lg border border-border bg-muted px-4 py-4">
            <p className="text-sm font-semibold text-foreground">Cadastro enviado. A Stripe está conferindo seus dados.</p>
            <p className="mt-1 text-sm text-muted-foreground">
                Costuma levar de alguns minutos a 1 ou 2 dias úteis. Você não precisa preencher nada de novo; se a Stripe precisar de
                algo, ela avisa por e-mail.
            </p>
            <Button className="mt-3" variant="secondary" onClick={conferir} disabled={conferindo}>
                {conferindo ? "Conferindo..." : "Conferir de novo"}
            </Button>
            {aviso && <p className="mt-2 text-xs text-muted-foreground">{aviso}</p>}
        </div>
    )
}
