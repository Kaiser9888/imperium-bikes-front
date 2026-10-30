"use client"

import Link from "next/link"
import { useState } from "react"
import { Crown, Download } from "lucide-react"

import { cn } from "@/lib/utils"
import { marcaDe, type ModoPontuacao } from "@/lib/placar"
import type { InscritoPublico } from "@/services/tournamentService"

/** Ouro, prata e bronze: cor da medalha, do degrau e do anel da foto. */
const MEDALHA: Record<number, { cor: string; anel: string; degrau: string; altura: string }> = {
    1: { cor: "text-[#E8B931]", anel: "ring-[#E8B931]", degrau: "from-[#E8B931] to-[#B8860B]", altura: "h-28 sm:h-32" },
    2: { cor: "text-[#C0C4CC]", anel: "ring-[#C0C4CC]", degrau: "from-[#D7DAE0] to-[#8E939C]", altura: "h-20 sm:h-24" },
    3: { cor: "text-[#C7834A]", anel: "ring-[#C7834A]", degrau: "from-[#D9955C] to-[#8A5528]", altura: "h-14 sm:h-16" },
}

export function Avatar({ inscrito, className }: { inscrito: InscritoPublico; className: string }) {
    return inscrito.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- foto do perfil, domínio do Clerk
        <img src={inscrito.avatarUrl} alt="" className={cn(className, "rounded-full bg-surface-muted object-cover")} />
    ) : (
        <span aria-hidden="true" className={cn(className, "grid place-items-center rounded-full bg-surface-muted font-semibold text-muted-foreground")}>
            {inscrito.nome.slice(0, 1).toUpperCase()}
        </span>
    )
}

/** Os três primeiros, com o campeão no meio e mais alto. Some enquanto ninguém tem colocação. */
export function Podio({
    inscritos,
    modo,
    aoVivo,
    imagemHref,
}: {
    inscritos: InscritoPublico[]
    modo: ModoPontuacao
    /** Evento acontecendo: o pódio ainda pode mudar. */
    aoVivo: boolean
    /** Link da imagem do pódio para baixar e postar. */
    imagemHref: string
}) {
    const lugar = (n: number) => inscritos.filter((i) => i.posicao === n)
    if (![1, 2, 3].some((n) => lugar(n).length > 0)) return null

    return (
        <section
            aria-labelledby="podio-titulo"
            className="overflow-hidden rounded-lg border border-foreground bg-[oklch(0.21_0.03_255)] text-white shadow-[4px_4px_0_var(--foreground)]"
        >
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
                <h2 id="podio-titulo" className="type-h2 flex items-center gap-3">
                    Pódio
                    {aoVivo && (
                        <span className="inline-flex items-center gap-1.5 rounded bg-primary px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-widest text-primary-foreground">
                            <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
                            Ao vivo
                        </span>
                    )}
                </h2>
                <a href={imagemHref} download className="type-caption inline-flex min-h-9 items-center gap-1.5 font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline">
                    <Download className="size-4" aria-hidden="true" />
                    Baixar imagem
                </a>
            </div>

            <ol className="mt-6 grid grid-cols-3 items-end gap-2 px-3 sm:gap-4 sm:px-6">
                {[2, 1, 3].map((pos) => {
                    const m = MEDALHA[pos]
                    const pessoas = lugar(pos)
                    const primeira = pessoas[0]
                    return (
                        <li
                            key={pos}
                            className="flex min-w-0 flex-col items-center text-center"
                            aria-label={primeira ? `${pos}º lugar: ${pessoas.map((p) => p.nome).join(" e ")}` : `${pos}º lugar: sem resultado`}
                        >
                            {primeira ? (
                                <Link href={`/perfil/${primeira.userId}`} className="flex w-full min-w-0 flex-col items-center gap-2 px-1">
                                    {pos === 1 && <Crown className={cn("size-6", m.cor)} aria-hidden="true" />}
                                    <Avatar inscrito={primeira} className={cn("ring-4", m.anel, pos === 1 ? "size-20 sm:size-24" : "size-14 sm:size-16")} />
                                    <span className="type-label line-clamp-2 w-full break-words">
                                        {primeira.nome}
                                        {pessoas.length > 1 && <span className="text-white/60"> +{pessoas.length - 1}</span>}
                                    </span>
                                    {marcaDe(primeira, modo) && (
                                        <span className={cn("type-caption font-semibold tabular-nums", m.cor)}>{marcaDe(primeira, modo)}</span>
                                    )}
                                </Link>
                            ) : (
                                <span className="type-caption pb-2 text-white/50">—</span>
                            )}
                            <span
                                className={cn(
                                    "mt-3 grid w-full place-items-center rounded-t-md bg-gradient-to-b text-2xl font-black text-black/70 sm:text-3xl",
                                    m.degrau,
                                    m.altura,
                                )}
                            >
                                {pos}º
                            </span>
                        </li>
                    )
                })}
            </ol>
        </section>
    )
}

/**
 * Lista dos inscritos. Com resultado, segue a classificação e mostra a marca de cada um;
 * sem resultado, é a lista de quem confirmou, na ordem de inscrição.
 */
export function Classificacao({ inscritos, modo, titulo }: { inscritos: InscritoPublico[]; modo: ModoPontuacao; titulo: string }) {
    const [todos, setTodos] = useState(false)
    if (inscritos.length === 0) return null
    const ordenados = [...inscritos].sort((a, b) => (a.posicao ?? Infinity) - (b.posicao ?? Infinity))
    const visiveis = todos ? ordenados : ordenados.slice(0, 12)
    const algumResultado = ordenados.some((i) => i.posicao !== null)

    return (
        <section aria-labelledby="classificacao-titulo">
            <h2 id="classificacao-titulo" className="type-h2">
                {titulo} <span className="text-muted-foreground tabular-nums">({inscritos.length})</span>
            </h2>
            <ul className="mt-4 divide-y divide-border border-y border-border">
                {visiveis.map((i) => {
                    const marca = marcaDe(i, modo)
                    return (
                        <li key={i.userId}>
                            <Link href={`/perfil/${i.userId}`} className="flex min-h-14 items-center gap-3 py-2 hover:bg-surface-muted">
                                <span
                                    className={cn(
                                        "type-label w-8 shrink-0 text-right font-bold tabular-nums",
                                        i.posicao && i.posicao <= 3 ? MEDALHA[i.posicao].cor : "text-muted-foreground",
                                    )}
                                >
                                    {i.posicao ? `${i.posicao}º` : algumResultado ? "–" : ""}
                                </span>
                                <Avatar inscrito={i} className="size-10 shrink-0" />
                                <span className="min-w-0 flex-1">
                                    <span className="type-body-small block truncate font-medium text-foreground">{i.nome}</span>
                                    {i.numero !== null && <span className="type-caption tabular-nums text-muted-foreground">nº {i.numero}</span>}
                                </span>
                                {marca ? (
                                    <span className="type-label shrink-0 tabular-nums text-foreground">{marca}</span>
                                ) : (
                                    algumResultado && <span className="type-caption shrink-0 text-muted-foreground">sem marca</span>
                                )}
                            </Link>
                        </li>
                    )
                })}
            </ul>
            {ordenados.length > visiveis.length && (
                <button type="button" onClick={() => setTodos(true)} className="line-btn line-btn--sm mt-4">
                    Ver todos os {ordenados.length}
                </button>
            )}
        </section>
    )
}
