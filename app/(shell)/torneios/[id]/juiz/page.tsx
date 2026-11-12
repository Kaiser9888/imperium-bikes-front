"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"

import { PageHeading } from "@/components/layout/page-heading"
import { competidoresDe, PlacarOrganizador, type Competidor } from "@/components/torneios/PlacarOrganizador"
import { ErrorState } from "@/components/ui/error-state"
import { Loader } from "@/components/ui/loader"
import api from "@/lib/api"
import { mensagemDaApi, tournamentService, type Tournament } from "@/services/tournamentService"

type Estado =
    | { status: "loading" }
    | { status: "error"; mensagem: string }
    | { status: "ok"; torneio: Tournament; competidores: Competidor[] }

/**
 * Placar para o ajudante convidado pelo organizador. O link de convite traz ?codigo=...: quem abre
 * logado entra na equipe e já vê o placar. Depois disso, abre direto pelo botão na página do evento.
 */
export default function PlacarAjudantePage() {
    const { id } = useParams<{ id: string }>()
    const { isLoaded, isSignedIn } = useUser()
    const [estado, setEstado] = useState<Estado>({ status: "loading" })

    const recarregar = useCallback(async () => {
        const { data } = await api.get(`/api/tournaments/${id}/participants`, { params: { size: 500 } })
        setEstado((atual) => (atual.status === "ok" ? { ...atual, competidores: competidoresDe(data.content) } : atual))
    }, [id])

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return
        let ativo = true
        const codigo = new URLSearchParams(window.location.search).get("codigo")
        ;(async () => {
            try {
                if (codigo) {
                    await tournamentService.entrarComoAjudante(id, codigo)
                    // O código não precisa ficar no endereço (nem no histórico de quem pegar o celular)
                    window.history.replaceState(null, "", window.location.pathname)
                }
                const [torneio, { data }] = await Promise.all([
                    tournamentService.buscarPorId(id),
                    api.get(`/api/tournaments/${id}/participants`, { params: { size: 500 } }),
                ])
                if (ativo) setEstado({ status: "ok", torneio, competidores: competidoresDe(data.content) })
            } catch (cause) {
                if (ativo) setEstado({ status: "error", mensagem: mensagemDaApi(cause, "Você não está na equipe do placar deste evento. Peça o link ao organizador.") })
            }
        })()
        return () => {
            ativo = false
        }
    }, [id, isLoaded, isSignedIn])

    if (isLoaded && !isSignedIn) {
        const volta = typeof window === "undefined" ? `/torneios/${id}/juiz` : window.location.pathname + window.location.search
        return (
            <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading title="Ajudar no placar" description="Entre na sua conta para lançar os resultados." back={{ href: `/torneios/${id}`, label: "Evento" }} />
                <Link href={`/sign-in?redirect_url=${encodeURIComponent(volta)}`} className="line-btn mt-6">
                    Entrar
                </Link>
            </main>
        )
    }
    if (estado.status === "loading") return <Loader className="py-24" />
    if (estado.status === "error") return <ErrorState title="Não foi possível abrir o placar" description={estado.mensagem} />

    const { torneio, competidores } = estado
    return (
        <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
            <PageHeading title={torneio.nome} description="Você está ajudando no placar" back={{ href: `/torneios/${id}`, label: "Evento" }} />
            {torneio.cancelado || torneio.status === "encerrado" ? (
                <p className="type-body-small mt-6 text-muted-foreground">Este evento já terminou. O placar não muda mais.</p>
            ) : (
                <PlacarOrganizador
                    torneioId={id}
                    modo={torneio.modo}
                    aberto={torneio.status !== "aberto"}
                    numeracaoAberta
                    competidores={competidores}
                    categorias={torneio.categorias}
                    recarregar={recarregar}
                    podeNumerarTodos={false}
                    comColocacao
                />
            )}
        </main>
    )
}
