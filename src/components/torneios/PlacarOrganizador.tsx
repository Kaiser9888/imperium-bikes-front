"use client"

import { useState } from "react"
import { Hash, Search, X } from "lucide-react"

import { formatarPontos, formatarTempo, lerPontos, lerTempo, type ModoPontuacao } from "@/lib/placar"
import { cn } from "@/lib/utils"
import { mensagemDaApi, tournamentService } from "@/services/tournamentService"

/** Inscrito confirmado, como vem da lista do organizador. */
export type Competidor = {
    id: string
    userName: string
    userAvatarUrl: string | null
    bibNumber: number | null
    rankPosition: number | null
    finalTimeMs: number | null
    points: number | null
    categoria: string
}

const marcaAtual = (c: Competidor, modo: ModoPontuacao) =>
    modo === "tempo" ? (c.finalTimeMs !== null ? formatarTempo(c.finalTimeMs) : "") : c.points !== null ? formatarPontos(c.points) : ""

/** Campo da marca de um atleta: Enter salva, e a classificação de todos é refeita no servidor. */
function CampoMarca({ competidor, modo, aoMudar }: { competidor: Competidor; modo: ModoPontuacao; aoMudar: () => Promise<void> }) {
    const salva = marcaAtual(competidor, modo)
    const [valor, setValor] = useState(salva)
    const [ocupado, setOcupado] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const lido = modo === "tempo" ? lerTempo(valor) : lerPontos(valor)
    const mudou = valor.trim() !== salva

    async function executar(acao: () => Promise<void>) {
        setOcupado(true)
        setErro(null)
        try {
            await acao()
            await aoMudar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível salvar."))
        } finally {
            setOcupado(false)
        }
    }

    function salvar(event: React.FormEvent) {
        event.preventDefault()
        if (!mudou || lido === null) return
        void executar(async () => {
            await tournamentService.lancarMarca(competidor.id, modo === "tempo" ? { tempoMs: lido } : { pontos: lido })
            // Mostra como ficou guardado (ex.: "2:15.4" vira "02:15.4")
            setValor(modo === "tempo" ? formatarTempo(lido) : formatarPontos(lido))
        })
    }

    function apagar() {
        void executar(async () => {
            await tournamentService.apagarMarca(competidor.id)
            setValor("")
        })
    }

    return (
        <form onSubmit={salvar} className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
                <label htmlFor={`marca-${competidor.id}`} className="sr-only">
                    {modo === "tempo" ? "Tempo" : "Pontos"} de {competidor.userName}
                </label>
                <input
                    id={`marca-${competidor.id}`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={modo === "tempo" ? "0:00.0" : "0,0"}
                    aria-invalid={mudou && valor.trim() !== "" && lido === null}
                    className="h-11 w-28 rounded-lg bg-surface px-2 text-center text-base tabular-nums aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive"
                />
                <button type="submit" disabled={!mudou || lido === null || ocupado} className="line-btn line-btn--sm min-h-11">
                    {ocupado ? "…" : salva && !mudou ? "Salvo" : "Salvar"}
                </button>
                {salva && (
                    <button
                        type="button"
                        onClick={apagar}
                        disabled={ocupado}
                        aria-label={`Apagar a marca de ${competidor.userName}`}
                        className="grid size-11 place-items-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-destructive"
                    >
                        <X className="size-4" aria-hidden="true" />
                    </button>
                )}
            </div>
            {mudou && valor.trim() !== "" && lido === null && (
                <span className="type-caption text-destructive">{modo === "tempo" ? "Use min:seg, ex.: 2:15.4" : "Use um número, ex.: 8,75"}</span>
            )}
            {erro && (
                <span role="alert" className="type-caption text-destructive">
                    {erro}
                </span>
            )}
        </form>
    )
}

/**
 * Placar do organizador: acha o atleta pelo número de peito ou pelo nome e lança o tempo ou a nota.
 * A página pública do evento acompanha sozinha.
 */
export function PlacarOrganizador({
    torneioId,
    modo,
    aberto,
    competidores,
    categorias,
    recarregar,
}: {
    torneioId: string
    modo: Exclude<ModoPontuacao, "posicao">
    /** Evento já começou: dá para lançar marcas. Antes disso, só numerar. */
    aberto: boolean
    competidores: Competidor[]
    /** Categorias do evento: cada uma tem a sua classificação. */
    categorias: string[]
    recarregar: () => Promise<void>
}) {
    const [busca, setBusca] = useState("")
    const [categoria, setCategoria] = useState<string | null>(null)
    const [numerando, setNumerando] = useState(false)
    const [aviso, setAviso] = useState<string | null>(null)
    const semNumero = competidores.filter((c) => c.bibNumber === null).length

    const termo = busca.trim().toLowerCase()
    const filtrados = competidores
        .filter((c) => !categoria || c.categoria === categoria)
        .filter((c) => !termo || String(c.bibNumber ?? "") === termo || c.userName.toLowerCase().includes(termo))
        .sort((a, b) => (a.rankPosition ?? Infinity) - (b.rankPosition ?? Infinity) || (a.bibNumber ?? Infinity) - (b.bibNumber ?? Infinity))

    async function numerar() {
        setNumerando(true)
        setAviso(null)
        try {
            const n = await tournamentService.numerarInscritos(torneioId)
            await recarregar()
            setAviso(n === 1 ? "1 pessoa recebeu número." : `${n} pessoas receberam número.`)
        } catch (cause) {
            setAviso(mensagemDaApi(cause, "Não foi possível numerar."))
        } finally {
            setNumerando(false)
        }
    }

    return (
        <section aria-labelledby="placar-titulo" className="mt-12">
            <h2 id="placar-titulo" className="type-h2">Placar ao vivo</h2>
            <p className="type-body-small mt-1 text-muted-foreground">
                {aberto
                    ? modo === "tempo"
                        ? "Digite o tempo de cada um (2:15.4 ou 1:02:15) e toque em Salvar. A classificação da página do evento muda na hora."
                        : "Digite a nota de cada um (ex.: 8,75) e toque em Salvar. Maior nota fica na frente."
                    : "O placar abre no dia do evento. Antes disso, dê os números de peito para entregar na largada."}
            </p>

            {semNumero > 0 && (
                <button type="button" onClick={numerar} disabled={numerando} className="line-btn line-btn--sm mt-4">
                    <Hash aria-hidden="true" />
                    {numerando ? "Numerando…" : `Dar número de peito (${semNumero} sem número)`}
                </button>
            )}
            {aviso && (
                <p role="status" className="type-caption mt-2 text-muted-foreground">
                    {aviso}
                </p>
            )}

            {competidores.length === 0 ? (
                <p className="type-body-small mt-4 text-muted-foreground">Ninguém confirmou a inscrição ainda.</p>
            ) : (
                <>
                    <label className="relative mt-5 block">
                        <span className="sr-only">Buscar atleta</span>
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <input
                            type="search"
                            inputMode="search"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Nº de peito ou nome"
                            className="h-12 w-full rounded-lg bg-surface pl-9 pr-3 text-base"
                        />
                    </label>

                    {categorias.length > 0 && (
                        <div role="group" aria-label="Categoria" className="mt-3 flex flex-wrap gap-2">
                            {[null, ...categorias].map((c) => (
                                <button
                                    key={c ?? "todas"}
                                    type="button"
                                    aria-pressed={categoria === c}
                                    onClick={() => setCategoria(c)}
                                    className={cn(
                                        "type-caption rounded-full border px-3 py-1 font-semibold",
                                        categoria === c ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground",
                                    )}
                                >
                                    {c ?? "Todas"}
                                </button>
                            ))}
                        </div>
                    )}

                    <ol className="mt-3 border-t border-foreground">
                        {filtrados.map((c) => (
                            <li key={c.id} className="flex flex-wrap items-center gap-3 border-b border-border py-3">
                                <span className={cn("type-label w-8 shrink-0 text-right font-bold tabular-nums", c.rankPosition ? "text-foreground" : "text-muted-foreground")}>
                                    {c.rankPosition ? `${c.rankPosition}º` : "–"}
                                </span>
                                <span className="grid h-8 min-w-10 shrink-0 place-items-center rounded border border-foreground px-1.5 text-sm font-bold tabular-nums">
                                    {c.bibNumber ?? "?"}
                                </span>
                                {c.userAvatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element -- foto do perfil, domínio do Clerk
                                    <img src={c.userAvatarUrl} alt="" className="size-9 shrink-0 rounded-full bg-surface-muted object-cover" />
                                ) : (
                                    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-muted font-semibold text-muted-foreground">
                                        {c.userName.slice(0, 1).toUpperCase()}
                                    </span>
                                )}
                                <span className="min-w-0 flex-1">
                                    <span className="type-body-small block truncate font-medium text-foreground">{c.userName}</span>
                                    {categorias.length > 0 && <span className="type-caption block truncate text-muted-foreground">{c.categoria}</span>}
                                </span>
                                {aberto && (
                                    <div className="ml-auto">
                                        {/* key com a marca: quando outra mudança refaz a lista, o campo volta ao valor salvo */}
                                        <CampoMarca key={`${c.id}-${c.finalTimeMs}-${c.points}`} competidor={c} modo={modo} aoMudar={recarregar} />
                                    </div>
                                )}
                            </li>
                        ))}
                        {filtrados.length === 0 && <li className="type-body-small py-4 text-muted-foreground">Ninguém com esse número ou nome.</li>}
                    </ol>
                </>
            )}
        </section>
    )
}
