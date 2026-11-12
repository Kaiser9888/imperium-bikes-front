"use client"

import { useCallback, useEffect, useState } from "react"
import { Ticket, X } from "lucide-react"

import { formatarPreco } from "@/lib/format"
import { mensagemDaApi, tournamentService, type Cupom } from "@/services/tournamentService"

/** Abaixo disso a tarifa do cartão come a inscrição (igual ao servidor). */
const MINIMO = 10

/**
 * Cupons de desconto do organizador. O desconto sai do valor cobrado: o organizador recebe 90% do
 * que a pessoa pagou de fato. 100% deixa a inscrição grátis.
 */
export function CuponsEvento({ torneioId, valorInscricao }: { torneioId: string; valorInscricao: number }) {
    const [cupons, setCupons] = useState<Cupom[] | null>(null)
    const [codigo, setCodigo] = useState("")
    const [percentual, setPercentual] = useState("")
    const [limite, setLimite] = useState("")
    const [ocupado, setOcupado] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const carregar = useCallback(async () => {
        setCupons(await tournamentService.cupons(torneioId).catch(() => []))
    }, [torneioId])
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial dos cupons
        void carregar()
    }, [carregar])

    const pct = Number(percentual)
    const preco = pct >= 1 && pct <= 100 ? Math.round(valorInscricao * (100 - pct)) / 100 : null
    const abaixoDoMinimo = preco !== null && preco > 0 && preco < MINIMO

    async function criar(e: React.FormEvent) {
        e.preventDefault()
        setErro(null)
        if (codigo.trim().length < 3) return setErro("O código precisa de pelo menos 3 letras ou números.")
        if (!(pct >= 1 && pct <= 100)) return setErro("O desconto vai de 1% a 100%.")
        setOcupado(true)
        try {
            await tournamentService.criarCupom(torneioId, { codigo: codigo.trim(), percentual: pct, limiteUsos: limite ? Number(limite) : null })
            setCodigo("")
            setPercentual("")
            setLimite("")
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível criar o cupom."))
        } finally {
            setOcupado(false)
        }
    }

    async function desativar(c: Cupom) {
        if (!window.confirm(`Desativar o cupom ${c.codigo}? Quem já usou continua com o desconto.`)) return
        try {
            await tournamentService.desativarCupom(torneioId, c.id)
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível desativar."))
        }
    }

    return (
        <section aria-labelledby="cupons-titulo" className="mt-12">
            <h2 id="cupons-titulo" className="type-h2">Cupons de desconto</h2>
            <p className="type-body-small mt-1 text-muted-foreground">
                Para promoções: quem digita o código paga menos. O desconto sai do valor da inscrição, e você recebe 90% do que a pessoa pagou
                de fato.
            </p>

            <form onSubmit={criar} className="mt-4 rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-end gap-2">
                    <label className="flex flex-col gap-1">
                        <span className="type-caption text-muted-foreground">Código</span>
                        <input
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 30))}
                            autoComplete="off"
                            autoCapitalize="characters"
                            placeholder="Ex.: AMIGO10"
                            className="h-10 w-36 rounded-lg bg-surface px-3 text-base uppercase"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="type-caption text-muted-foreground">Desconto (%)</span>
                        <input
                            inputMode="numeric"
                            value={percentual}
                            onChange={(e) => setPercentual(e.target.value.replace(/\D/g, "").slice(0, 3))}
                            placeholder="10"
                            className="h-10 w-20 rounded-lg bg-surface px-2 text-base tabular-nums"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="type-caption text-muted-foreground">Limite de usos</span>
                        <input
                            inputMode="numeric"
                            value={limite}
                            onChange={(e) => setLimite(e.target.value.replace(/\D/g, "").slice(0, 5))}
                            placeholder="Sem limite"
                            className="h-10 w-28 rounded-lg bg-surface px-2 text-base tabular-nums"
                        />
                    </label>
                    <button type="submit" disabled={ocupado || abaixoDoMinimo} className="line-btn line-btn--sm min-h-10">
                        <Ticket aria-hidden="true" />
                        {ocupado ? "Criando…" : "Criar cupom"}
                    </button>
                </div>
                {preco !== null && (
                    <p className={`type-caption mt-2 ${abaixoDoMinimo ? "text-destructive" : "text-muted-foreground"}`}>
                        {abaixoDoMinimo
                            ? `Fica ${formatarPreco(preco)}: abaixo de ${formatarPreco(MINIMO)} não dá para cobrar. Use um desconto menor ou 100% (grátis).`
                            : preco === 0
                              ? "Inscrição grátis com esse cupom: você não recebe nada por quem usar."
                              : `A pessoa paga ${formatarPreco(preco)} e você recebe ${formatarPreco(Math.round(preco * 90) / 100)}.`}
                    </p>
                )}
                {erro && (
                    <p role="alert" className="type-caption mt-2 text-destructive">
                        {erro}
                    </p>
                )}
            </form>

            {cupons && cupons.length > 0 && (
                <ul className="mt-4 divide-y divide-border border-y border-border">
                    {cupons.map((c) => (
                        <li key={c.id} className="flex items-center gap-3 py-3">
                            <span className="rounded border border-foreground px-2 py-0.5 font-mono text-sm font-bold">{c.codigo}</span>
                            <span className="type-body-small min-w-0 flex-1 text-muted-foreground">
                                {c.percentual}% · {c.valorComDesconto > 0 ? formatarPreco(c.valorComDesconto) : "grátis"} ·{" "}
                                {c.limiteUsos ? `${c.usos} de ${c.limiteUsos} usos` : c.usos === 1 ? "1 uso" : `${c.usos} usos`}
                            </span>
                            <button
                                type="button"
                                onClick={() => desativar(c)}
                                aria-label={`Desativar o cupom ${c.codigo}`}
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
