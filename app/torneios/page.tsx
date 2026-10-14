// app/torneios/page.tsx
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"

import { BottomNav } from "@/components/layout/bottom-nav"
import { Logo } from "@/components/layout/logo"
import { formatarPreco, partesDaData } from "@/lib/format"
import { tournamentService, type Tournament, type TournamentStatus } from "@/services/tournamentService"

type Filtro = "todos" | TournamentStatus

const FILTROS: { id: Filtro; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "aberto", label: "Inscrições abertas" },
    { id: "andamento", label: "Acontecendo" },
    { id: "encerrado", label: "Encerrados" },
]

export default function TorneiosPage() {
    const [filtro, setFiltro] = useState<Filtro>("todos")
    const [busca, setBusca] = useState("")
    const [torneios, setTorneios] = useState<Tournament[]>([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        tournamentService.listar().then((result) => {
            if (active) setTorneios(result)
        }).catch(() => {
            if (active) setErro("Não foi possível carregar os eventos. Tente de novo em instantes.")
        }).finally(() => { if (active) setCarregando(false) })
        return () => { active = false }
    }, [])

    const contagem = useMemo(() => {
        const c: Record<Filtro, number> = { todos: torneios.length, aberto: 0, andamento: 0, encerrado: 0 }
        for (const t of torneios) c[t.status]++
        return c
    }, [torneios])

    const visiveis = useMemo(() => {
        const termo = busca.trim().toLowerCase()
        return torneios.filter((t) =>
            (filtro === "todos" || t.status === filtro) &&
            (!termo || t.nome.toLowerCase().includes(termo) || t.local.toLowerCase().includes(termo)))
    }, [torneios, filtro, busca])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
                <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    <Logo />
                    <Link href="/torneios/criar" className="line-btn line-btn--sm hidden sm:inline-flex">
                        <Plus aria-hidden="true" />
                        Criar torneio
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8">
                {/* Faixa escura fixa nos dois temas, como o painel da Central do vendedor */}
                <section className="relative isolate overflow-hidden rounded-2xl bg-[oklch(0.21_0.03_255)] px-5 py-7 text-white sm:px-8 sm:py-10 dark:bg-surface-secondary dark:ring-1 dark:ring-border">
                    <span aria-hidden="true" className="pointer-events-none absolute -bottom-8 -right-3 -z-10 select-none text-[7rem] font-black leading-none tracking-tighter text-white/[0.04] sm:-bottom-14 sm:text-[12rem]">
                        {new Date().getFullYear()}
                    </span>
                    <p className="type-caption font-semibold uppercase tracking-[0.2em] text-white/60">Calendário</p>
                    <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
                        <div>
                            <h1 className="type-display">Eventos</h1>
                            <p className="type-body-small mt-2 max-w-sm text-white/75">
                                {carregando
                                    ? "Buscando o que vem por aí…"
                                    : contagem.aberto > 0
                                        ? `${contagem.aberto} ${contagem.aberto === 1 ? "evento com inscrição aberta" : "eventos com inscrições abertas"} agora.`
                                        : "Nenhuma inscrição aberta no momento. Que tal organizar o próximo?"}
                            </p>
                        </div>
                        <Link href="/torneios/criar" className="underline-btn inline-block">
                            <span className="flex items-center gap-2 py-1.5">
                                <Plus className="size-5" aria-hidden="true" />
                                Publicar torneio
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Filtros + busca */}
                <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
                        <div className="flex gap-6">
                            {FILTROS.map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setFiltro(f.id)}
                                    aria-pressed={filtro === f.id}
                                    className="line-btn line-btn--sm line-btn--muted"
                                >
                                    {f.label}
                                    <span className="font-medium tabular-nums opacity-60">{contagem[f.id]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="relative md:w-72">
                        <span className="sr-only">Buscar evento</span>
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <input
                            type="search"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Nome ou cidade"
                            className="w-full rounded-lg bg-surface py-2.5 pl-10 pr-3 text-base outline-none md:text-sm"
                        />
                    </label>
                </div>

                {erro && (
                    <p role="alert" className="type-body-small mt-6 border-l-2 border-destructive pl-3 text-destructive">{erro}</p>
                )}

                <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                    {carregando && [0, 1, 2].map((i) => (
                        <li key={i} aria-hidden="true">
                            <div className="aspect-[4/3] animate-pulse rounded-lg bg-surface-muted" />
                            <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
                            <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-surface-muted" />
                        </li>
                    ))}
                    {visiveis.map((t) => <CartaoEvento key={t.id} torneio={t} />)}
                </ul>

                {!carregando && !erro && visiveis.length === 0 && (
                    <div className="border-t border-border py-16">
                        <p className="type-h2">
                            {torneios.length === 0 ? "Ainda não tem nenhum evento por aqui." : "Nada com esse filtro."}
                        </p>
                        <p className="type-body-small mt-2 max-w-md text-muted-foreground">
                            {torneios.length === 0
                                ? "Crie o primeiro: coloque nome, data e local, e as inscrições abrem na hora."
                                : "Tente outro nome, outra cidade ou volte para todos os eventos."}
                        </p>
                        <div className="mt-6">
                            {torneios.length === 0 ? (
                                <Link href="/torneios/criar" className="underline-btn underline-btn--ink inline-block">
                                    <span className="flex items-center gap-2 py-1.5">
                                        <Plus className="size-5" aria-hidden="true" />
                                        Publicar torneio
                                    </span>
                                </Link>
                            ) : (
                                <button type="button" onClick={() => { setFiltro("todos"); setBusca("") }} className="line-btn line-btn--sm">
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    )
}

function CartaoEvento({ torneio: t }: { torneio: Tournament }) {
    const data = partesDaData(t.dataInicio)
    const cidade = t.local.split(",").slice(-2).join(",").trim() || t.local
    const limite = t.maxParticipantes > 0
    const restantes = Math.max(0, t.maxParticipantes - t.participantes)
    const ocupacao = limite ? Math.min(1, t.participantes / t.maxParticipantes) : 0
    const encerrado = t.status === "encerrado"

    return (
        <li>
            <Link href={`/torneios/${t.id}`} className="group block outline-none">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-foreground bg-surface-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- capa enviada pelo organizador, domínio variável */}
                    <img
                        src={t.banner}
                        alt=""
                        className={`size-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${encerrado ? "grayscale" : ""}`}
                    />
                    {data && (
                        <div className="absolute left-3 top-3 min-w-14 border border-foreground bg-surface px-2 py-1.5 text-center text-foreground">
                            <p className="text-2xl font-bold leading-none tabular-nums">{data.dia}</p>
                            <p className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em]">{data.mes}</p>
                        </div>
                    )}
                    {t.status === "andamento" && (
                        <span className="absolute right-3 top-3 bg-accent px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-accent-foreground">
                            Acontecendo
                        </span>
                    )}
                    {encerrado && (
                        <span className="absolute right-3 top-3 bg-foreground px-2 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-background">
                            {t.cancelado ? "Cancelado" : "Encerrado"}
                        </span>
                    )}
                </div>

                <p className="type-caption mt-4 truncate uppercase tracking-[0.12em] text-muted-foreground">
                    {cidade}{t.organizadorNome && ` · ${t.organizadorNome}`}
                </p>
                <h2 className="type-h3 mt-1 line-clamp-2 decoration-accent decoration-2 underline-offset-4 group-hover:underline group-focus-visible:underline">
                    {t.nome}
                </h2>
                {t.premiacao && <p className="type-body-small mt-1 line-clamp-1 text-muted-foreground">Prêmio: {t.premiacao}</p>}

                <div className="mt-4 flex items-end justify-between gap-4 border-t border-border pt-3">
                    <div>
                        <p className="type-caption text-muted-foreground">Inscrição</p>
                        <p className="font-bold tabular-nums">{t.valorInscricao > 0 ? formatarPreco(t.valorInscricao) : "Grátis"}</p>
                    </div>
                    {limite && !encerrado && (
                        <div className="w-28 text-right">
                            <p className={`type-caption tabular-nums ${restantes <= t.maxParticipantes * 0.2 ? "font-semibold text-accent" : "text-muted-foreground"}`}>
                                {restantes === 0 ? "Esgotado" : `${restantes} ${restantes === 1 ? "vaga" : "vagas"}`}
                            </p>
                            <div className="mt-1.5 h-1 bg-surface-muted">
                                <div className="h-full bg-foreground" style={{ width: `${ocupacao * 100}%` }} />
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </li>
    )
}
