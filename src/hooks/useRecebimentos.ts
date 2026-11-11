"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"

import api from "@/lib/api"
import type { ContaConectadaResponse } from "@/types/contaConectada"

/**
 * Se a conta de recebimentos (Stripe) está pronta. "desconhecido" quando não deu para
 * consultar: a tela segue e o servidor recusa se faltar, então ninguém fica preso por erro de rede.
 */
export type Recebimentos = "carregando" | "pronto" | "pendente" | "analise" | "desconhecido"

/** Devolve o estado e uma função para conferir de novo (ex.: depois de ativar em outra aba). */
export function useRecebimentos(): [Recebimentos, () => void] {
    const { isLoaded, isSignedIn } = useAuth()
    const [estado, setEstado] = useState<Recebimentos>("carregando")
    const [rodada, setRodada] = useState(0)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- sem login o servidor decide
            setEstado("desconhecido")
            return
        }
        let ativo = true
        ;(async () => {
            try {
                const { data } = await api.get<ContaConectadaResponse>("/api/conta-conectada/status")
                let atual = data
                // Terminou o cadastro sem passar pela página de retorno: confere direto no Stripe
                if (!atual.onboardingCompleto && atual.temConta && !atual.emAnalise) {
                    atual = (await api.post<ContaConectadaResponse>("/api/conta-conectada/atualizar-status")).data
                }
                if (ativo) setEstado(atual.onboardingCompleto ? "pronto" : atual.emAnalise ? "analise" : "pendente")
            } catch {
                if (ativo) setEstado("desconhecido")
            }
        })()
        return () => {
            ativo = false
        }
    }, [isLoaded, isSignedIn, rodada])

    return [estado, () => setRodada((n) => n + 1)]
}
