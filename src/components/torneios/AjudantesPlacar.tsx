"use client"

import { useCallback, useEffect, useState } from "react"
import { Copy, Link2, Share2, X } from "lucide-react"

import { mensagemDaApi, tournamentService, type EquipePlacar } from "@/services/tournamentService"

/**
 * Ajudantes do placar: o organizador manda um link; quem abre logado passa a lançar tempos, notas e
 * colocações pelo celular. Não mexem no evento, nos cupons nem no dinheiro.
 */
export function AjudantesPlacar({ torneioId }: { torneioId: string }) {
    const [equipe, setEquipe] = useState<EquipePlacar | null>(null)
    const [ocupado, setOcupado] = useState(false)
    const [aviso, setAviso] = useState<string | null>(null)

    const carregar = useCallback(async () => {
        setEquipe(await tournamentService.equipe(torneioId).catch(() => ({ codigo: null, juizes: [] })))
    }, [torneioId])
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial da equipe
        void carregar()
    }, [carregar])

    const link = equipe?.codigo ? `${window.location.origin}/torneios/${torneioId}/juiz?codigo=${equipe.codigo}` : null

    async function gerar() {
        if (equipe?.codigo && !window.confirm("Criar um link novo? O link antigo para de funcionar (quem já entrou continua).")) return
        setOcupado(true)
        setAviso(null)
        try {
            await tournamentService.gerarConvite(torneioId)
            await carregar()
        } catch (cause) {
            setAviso(mensagemDaApi(cause, "Não foi possível criar o link."))
        } finally {
            setOcupado(false)
        }
    }

    async function compartilhar() {
        if (!link) return
        const texto = "Você foi convidado para ajudar no placar do evento. Abra o link e entre na sua conta:"
        try {
            if (navigator.share) {
                await navigator.share({ title: "Ajudar no placar", text: texto, url: link })
                return
            }
        } catch {
            return // a pessoa fechou o compartilhamento
        }
        await navigator.clipboard.writeText(link).catch(() => {})
        setAviso("Link copiado.")
    }

    async function remover(userId: string, nome: string) {
        if (!window.confirm(`Tirar ${nome} da equipe do placar?`)) return
        try {
            await tournamentService.removerAjudante(torneioId, userId)
            await carregar()
        } catch (cause) {
            setAviso(mensagemDaApi(cause, "Não foi possível tirar."))
        }
    }

    return (
        <section aria-labelledby="ajudantes-titulo" className="mt-12">
            <h2 id="ajudantes-titulo" className="type-h2">Ajudantes do placar</h2>
            <p className="type-body-small mt-1 text-muted-foreground">
                Chame alguém para lançar os tempos ou as notas pelo celular durante a prova. A pessoa precisa ter conta no site. Ajudante não
                edita o evento nem vê valores.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                {link ? (
                    <>
                        <button type="button" onClick={compartilhar} className="line-btn line-btn--sm">
                            <Share2 aria-hidden="true" />
                            Enviar link de convite
                        </button>
                        <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(link).then(() => setAviso("Link copiado."), () => {})}
                            className="line-btn line-btn--sm line-btn--muted"
                        >
                            <Copy aria-hidden="true" />
                            Copiar
                        </button>
                        <button type="button" onClick={gerar} disabled={ocupado} className="type-caption font-semibold text-muted-foreground underline underline-offset-2">
                            Criar link novo
                        </button>
                    </>
                ) : (
                    <button type="button" onClick={gerar} disabled={ocupado || !equipe} className="line-btn line-btn--sm">
                        <Link2 aria-hidden="true" />
                        {ocupado ? "Criando…" : "Criar link de convite"}
                    </button>
                )}
            </div>
            {aviso && (
                <p role="status" className="type-caption mt-2 text-muted-foreground">
                    {aviso}
                </p>
            )}

            {equipe && equipe.juizes.length > 0 && (
                <ul className="mt-4 divide-y divide-border border-y border-border">
                    {equipe.juizes.map((j) => (
                        <li key={j.userId} className="flex items-center gap-3 py-2.5">
                            {j.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element -- foto do perfil, domínio do Clerk
                                <img src={j.avatarUrl} alt="" className="size-8 shrink-0 rounded-full bg-surface-muted object-cover" />
                            ) : (
                                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-muted text-sm font-semibold text-muted-foreground">
                                    {j.nome.slice(0, 1).toUpperCase()}
                                </span>
                            )}
                            <span className="type-body-small min-w-0 flex-1 truncate font-medium">{j.nome}</span>
                            <button
                                type="button"
                                onClick={() => remover(j.userId, j.nome)}
                                aria-label={`Tirar ${j.nome} da equipe`}
                                className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-destructive"
                            >
                                <X className="size-4" aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}
