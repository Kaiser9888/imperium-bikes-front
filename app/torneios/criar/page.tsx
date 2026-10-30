// app/torneios/criar/page.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { ArrowRight, Check, ImagePlus, Loader2, Plus, X } from "lucide-react"

import { BottomNav } from "@/components/layout/bottom-nav"
import { Logo } from "@/components/layout/logo"
import { BackButton } from "@/components/ui/back-button"
import { formatarPreco, partesDaData } from "@/lib/format"
import { compactarImagem } from "@/lib/imagem"
import { MODOS, type ModoPontuacao } from "@/lib/placar"
import { mensagemDaApi, tournamentService } from "@/services/tournamentService"

const PASSOS = ["O evento", "Local e vagas", "Inscrição"] as const

const rotulo = "type-label text-foreground"
const ajuda = "type-caption mt-1.5 text-muted-foreground"
const campo = "mt-2 w-full rounded-lg bg-surface px-3.5 py-3 text-base outline-none md:text-sm"

export default function CriarTorneioPage() {
    const { isSignedIn } = useUser()

    const [form, setForm] = useState({
        nome: "",
        descricao: "",
        local: "",
        cidade: "",
        estado: "",
        dataInicio: "",
        dataFim: "",
        prazoInscricao: "",
        maxParticipantes: "",
        minParticipantes: "2",
        valorInscricao: "",
        premiacao: "",
        regras: "",
        capa: "",
    })
    // Sem padrão de propósito: quem escolhe tempo ou pontos ganha o placar ao vivo
    const [modo, setModo] = useState<ModoPontuacao | null>(null)
    // Categorias (ex.: Elite Masculino): vazio = todo mundo em "Geral"
    const [categorias, setCategorias] = useState<string[]>([])
    const [novaCategoria, setNovaCategoria] = useState("")
    // Inscrição solidária: o que o inscrito leva no dia
    const [solidaria, setSolidaria] = useState(false)
    const [doacao, setDoacao] = useState("1 kg de alimento não perecível")

    const adicionarCategoria = () => {
        const nome = novaCategoria.trim().slice(0, 50)
        if (!nome || categorias.some((c) => c.toLowerCase() === nome.toLowerCase()) || categorias.length >= 12) return
        setCategorias([...categorias, nome])
        setNovaCategoria("")
    }

    const [passo, setPasso] = useState(1)
    const [criadoId, setCriadoId] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)
    const [erroEnvio, setErroEnvio] = useState<string | null>(null)
    // Se a publicação falhar depois de criar, tentar de novo só publica (sem rascunho repetido)
    const [rascunhoId, setRascunhoId] = useState<string | null>(null)
    const [preparandoCapa, setPreparandoCapa] = useState(false)
    const [erroCapa, setErroCapa] = useState<string | null>(null)

    const escolherCapa = async (arquivo: File | undefined) => {
        if (!arquivo) return
        setPreparandoCapa(true)
        setErroCapa(null)
        try {
            update("capa", await compactarImagem(arquivo, 1200, 350 * 1024))
        } catch (cause) {
            setErroCapa(cause instanceof Error ? cause.message : "Não foi possível usar essa imagem.")
        } finally {
            setPreparandoCapa(false)
        }
    }

    const update = (campo: keyof typeof form, valor: string) => {
        setForm((prev) => ({ ...prev, [campo]: valor }))
    }

    const handleSubmit = async () => {
        if (!isSignedIn) {
            window.location.assign(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        setEnviando(true)
        setErroEnvio(null)
        try {
            const id = rascunhoId ?? (await tournamentService.criarRascunho({
                name: form.nome.trim(), description: form.descricao.trim(),
                location: form.local.trim(), city: form.cidade.trim(), state: form.estado.trim().toUpperCase(),
                startDate: form.dataInicio, endDate: form.dataFim || form.dataInicio, registrationDeadline: form.prazoInscricao,
                maxParticipants: Number(form.maxParticipantes), minParticipants: Number(form.minParticipantes),
                registrationFee: Number(form.valorInscricao) || 0, prizes: form.premiacao.trim(), rules: form.regras.trim(), coverImageUrl: form.capa,
                scoringMode: modo ?? "posicao",
                solidariaDescricao: solidaria ? doacao.trim() : "",
                categoriasInscricao: categorias,
            }))
            setRascunhoId(id)
            const publicado = await tournamentService.publicar(id)
            setCriadoId(publicado.id)
        } catch (cause) {
            setErroEnvio(mensagemDaApi(cause, "Não foi possível criar o evento. Confira os dados e tente novamente."))
        } finally {
            setEnviando(false)
        }
    }

    /** O que falta para sair de cada passo; null quando está tudo certo. */
    const pendencia = (p: number): string | null => {
        if (p === 1) {
            if (form.nome.trim().length < 5) return "Dê um nome com pelo menos 5 letras."
            if (!form.dataInicio) return "Escolha a data de início."
            if (!modo) return "Escolha como o resultado é decidido."
        }
        if (p === 2) {
            if (!form.local.trim()) return "Informe onde vai acontecer."
            if (!form.maxParticipantes) return "Defina quantas vagas o evento tem."
        }
        return null
    }
    // Pode pular para um passo se todos os anteriores estiverem completos
    const alcancavel = (p: number) => Array.from({ length: p - 1 }, (_, i) => i + 1).every((q) => !pendencia(q))
    const falta = pendencia(passo)

    const cabecalho = (
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-2.5">
                <BackButton href="/torneios" className="-ml-2.5" />
                <p className="type-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">Novo torneio</p>
                <Logo compact />
            </div>
        </header>
    )

    if (criadoId) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                {cabecalho}
                <main className="mx-auto max-w-3xl px-4 pb-32 pt-16">
                    <span className="grid size-12 place-items-center rounded-full bg-success text-success-foreground">
                        <Check className="size-6" aria-hidden="true" />
                    </span>
                    <h1 className="type-display mt-6">Está no ar.</h1>
                    <p className="type-body mt-3 max-w-md text-muted-foreground">
                        <strong className="font-semibold text-foreground">{form.nome.trim()}</strong> já aparece em Eventos e as inscrições estão abertas. Compartilhe o link com a sua turma.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-8">
                        <Link href={`/torneios/${criadoId}`} className="line-btn line-btn--accent">
                            Ver evento
                            <ArrowRight aria-hidden="true" />
                        </Link>
                        <Link href="/torneios" className="line-btn line-btn--muted">
                            Todos os eventos
                        </Link>
                    </div>
                </main>
                <BottomNav />
            </div>
        )
    }

    const data = partesDaData(form.dataInicio)
    const valor = Number(form.valorInscricao) || 0

    return (
        <div className="min-h-screen bg-background text-foreground">
            {cabecalho}

            <main className="mx-auto max-w-3xl px-4 pb-32 pt-6 sm:pt-10">
                {/* Passos: dá para voltar a qualquer um já liberado */}
                <nav aria-label="Passos" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
                    <ol className="flex gap-6">
                        {PASSOS.map((nome, i) => {
                            const p = i + 1
                            return (
                                <li key={nome}>
                                    <button
                                        type="button"
                                        onClick={() => setPasso(p)}
                                        disabled={!alcancavel(p)}
                                        aria-current={passo === p ? "page" : undefined}
                                        className={`line-btn line-btn--sm ${passo === p ? "" : "line-btn--muted"}`}
                                    >
                                        <span className="tabular-nums opacity-60">{String(p).padStart(2, "0")}</span>
                                        {nome}
                                        {p < passo && !pendencia(p) && <Check className="text-success" aria-label="concluído" />}
                                    </button>
                                </li>
                            )
                        })}
                    </ol>
                </nav>

                {passo === 1 && (
                    <section className="mt-10 space-y-7">
                        <div>
                            <h1 className="type-h1">Sobre o evento</h1>
                            <p className="type-body-small mt-1.5 text-muted-foreground">O básico para alguém decidir se quer participar.</p>
                        </div>

                        <div>
                            <label htmlFor="nome" className={rotulo}>Nome</label>
                            <input id="nome" type="text" value={form.nome} onChange={(e) => update("nome", e.target.value)} placeholder="Downhill Cup 2026" className={campo} />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="inicio" className={rotulo}>Começa em</label>
                                <input id="inicio" type="date" value={form.dataInicio} onChange={(e) => update("dataInicio", e.target.value)} className={campo} />
                            </div>
                            <div>
                                <label htmlFor="fim" className={rotulo}>Termina em <span className="font-normal text-muted-foreground">(opcional)</span></label>
                                <input id="fim" type="date" value={form.dataFim} min={form.dataInicio || undefined} onChange={(e) => update("dataFim", e.target.value)} className={campo} />
                            </div>
                        </div>

                        <fieldset>
                            <legend className={rotulo}>Como o resultado é decidido</legend>
                            <div className="mt-2 grid gap-3 sm:grid-cols-3">
                                {MODOS.map((m) => (
                                    <label
                                        key={m.id}
                                        className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                                            modo === m.id ? "border-foreground bg-surface shadow-[3px_3px_0_var(--foreground)]" : "border-border bg-surface hover:border-foreground/50"
                                        }`}
                                    >
                                        <input type="radio" name="modo" value={m.id} checked={modo === m.id} onChange={() => setModo(m.id)} className="sr-only" />
                                        <span className="type-label flex items-center justify-between gap-2 text-foreground">
                                            {m.titulo}
                                            {modo === m.id && <Check className="size-4 text-success" aria-hidden="true" />}
                                        </span>
                                        <span className="type-caption text-muted-foreground">{m.texto}</span>
                                    </label>
                                ))}
                            </div>
                            <p className={ajuda}>
                                Por tempo ou por pontos, você lança as marcas no celular durante a prova e a classificação aparece ao vivo na página do evento.
                            </p>
                        </fieldset>

                        <div>
                            <label htmlFor="capa" className={rotulo}>Capa</label>
                            {form.capa ? (
                                <div className="relative mt-2 overflow-hidden rounded-lg border border-foreground">
                                    {/* eslint-disable-next-line @next/next/no-img-element -- imagem local, ainda não enviada */}
                                    <img src={form.capa} alt="Prévia da capa do evento" className="aspect-[1200/630] w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => update("capa", "")}
                                        aria-label="Remover capa"
                                        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <label
                                        htmlFor="capa"
                                        className="mt-2 flex aspect-[1200/630] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-foreground/40 bg-surface text-muted-foreground transition-colors focus-within:border-primary hover:border-foreground"
                                    >
                                        {preparandoCapa ? <Loader2 className="size-6 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-6" aria-hidden="true" />}
                                        <span className="type-label">{preparandoCapa ? "Preparando imagem…" : "Escolher foto do dispositivo"}</span>
                                        <input
                                            id="capa"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            disabled={preparandoCapa}
                                            onChange={(e) => {
                                                escolherCapa(e.target.files?.[0])
                                                e.target.value = ""
                                            }}
                                        />
                                    </label>
                                    <p className={ajuda}>Fica melhor em 1200×630. Use só fotos suas ou que você tem permissão para usar.</p>
                                    {erroCapa && <p role="alert" className="type-caption mt-1.5 text-destructive">{erroCapa}</p>}
                                </>
                            )}
                        </div>

                        <div>
                            <label htmlFor="descricao" className={rotulo}>Descrição</label>
                            <textarea id="descricao" value={form.descricao} onChange={(e) => update("descricao", e.target.value)} rows={4} placeholder="Percurso, categorias, horário de largada…" className={`${campo} resize-none`} />
                        </div>

                        <div>
                            <label htmlFor="regras" className={rotulo}>Regras</label>
                            <textarea id="regras" value={form.regras} onChange={(e) => update("regras", e.target.value)} rows={3} placeholder="Equipamento obrigatório, idade mínima, critérios de desempate…" className={`${campo} resize-none`} />
                        </div>
                    </section>
                )}

                {passo === 2 && (
                    <section className="mt-10 space-y-7">
                        <div>
                            <h1 className="type-h1">Onde e quantos</h1>
                            <p className="type-body-small mt-1.5 text-muted-foreground">Quando as vagas acabam, as inscrições fecham sozinhas.</p>
                        </div>

                        <div>
                            <label htmlFor="local" className={rotulo}>Local</label>
                            <input id="local" type="text" value={form.local} onChange={(e) => update("local", e.target.value)} placeholder="Parque Municipal" className={campo} />
                        </div>

                        <div className="grid grid-cols-[1fr_6rem] gap-5">
                            <div>
                                <label htmlFor="cidade" className={rotulo}>Cidade</label>
                                <input id="cidade" type="text" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} placeholder="Campos do Jordão" className={campo} />
                            </div>
                            <div>
                                <label htmlFor="uf" className={rotulo}>UF</label>
                                <input id="uf" type="text" value={form.estado} onChange={(e) => update("estado", e.target.value)} maxLength={2} placeholder="SP" className={`${campo} uppercase`} />
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="vagas" className={rotulo}>Vagas</label>
                                <input id="vagas" type="number" inputMode="numeric" value={form.maxParticipantes} onChange={(e) => update("maxParticipantes", e.target.value)} min={2} placeholder="50" className={campo} />
                            </div>
                            <div>
                                <label htmlFor="prazo" className={rotulo}>Inscrições até <span className="font-normal text-muted-foreground">(opcional)</span></label>
                                <input id="prazo" type="date" value={form.prazoInscricao} max={form.dataInicio || undefined} onChange={(e) => update("prazoInscricao", e.target.value)} className={campo} />
                            </div>
                        </div>
                    </section>
                )}

                {passo === 3 && (
                    <section className="mt-10 space-y-7">
                        <div>
                            <h1 className="type-h1">Inscrição e prêmio</h1>
                            <p className="type-body-small mt-1.5 text-muted-foreground">Confira o resumo e publique.</p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="valor" className={rotulo}>Valor da inscrição (R$)</label>
                                <input id="valor" type="number" inputMode="decimal" value={form.valorInscricao} onChange={(e) => update("valorInscricao", e.target.value)} min={0} max={500} step="0.01" placeholder="0,00" className={campo} />
                                <p className={ajuda}>Vazio ou zero deixa o evento grátis. Em evento pago, 90% de cada inscrição vai para a sua Carteira quando você encerrar o evento.</p>
                            </div>
                            <div>
                                <label htmlFor="premio" className={rotulo}>Premiação <span className="font-normal text-muted-foreground">(opcional)</span></label>
                                <input id="premio" type="text" value={form.premiacao} onChange={(e) => update("premiacao", e.target.value)} placeholder="R$ 2.000 + troféu" className={campo} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="categoria-nova" className={rotulo}>Categorias <span className="font-normal text-muted-foreground">(opcional)</span></label>
                            <div className="mt-2 flex gap-2">
                                <input
                                    id="categoria-nova"
                                    type="text"
                                    value={novaCategoria}
                                    maxLength={50}
                                    onChange={(e) => setNovaCategoria(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            adicionarCategoria()
                                        }
                                    }}
                                    placeholder="Ex.: Elite Masculino"
                                    className={`${campo} mt-0 flex-1`}
                                />
                                <button type="button" onClick={adicionarCategoria} disabled={!novaCategoria.trim() || categorias.length >= 12} className="line-btn line-btn--sm shrink-0 self-center">
                                    <Plus aria-hidden="true" />
                                    Adicionar
                                </button>
                            </div>
                            {categorias.length > 0 && (
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {categorias.map((c) => (
                                        <li key={c} className="type-label flex items-center gap-1 rounded-full border border-foreground py-1 pl-3 pr-1">
                                            {c}
                                            <button
                                                type="button"
                                                onClick={() => setCategorias(categorias.filter((x) => x !== c))}
                                                aria-label={`Tirar a categoria ${c}`}
                                                className="grid size-6 place-items-center rounded-full hover:bg-surface-muted"
                                            >
                                                <X className="size-3.5" aria-hidden="true" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className={ajuda}>
                                Cada pessoa escolhe a dela ao se inscrever, e cada categoria tem a sua classificação e o seu pódio. Sem categorias, todo mundo
                                disputa junto.
                            </p>
                        </div>

                        <div>
                            <label className="flex cursor-pointer items-start gap-3">
                                <input type="checkbox" checked={solidaria} onChange={(e) => setSolidaria(e.target.checked)} className="mt-1 size-4 accent-[var(--accent)]" />
                                <span>
                                    <span className={rotulo}>Inscrição solidária</span>
                                    <span className={`${ajuda} block`}>Cada inscrito leva uma doação no dia; você confere na chegada, na tela Gerenciar.</span>
                                </span>
                            </label>
                            {solidaria && (
                                <div className="mt-3">
                                    <label htmlFor="doacao" className={rotulo}>O que levar</label>
                                    <input id="doacao" type="text" value={doacao} maxLength={200} onChange={(e) => setDoacao(e.target.value)} className={campo} />
                                </div>
                            )}
                        </div>

                        {/* Resumo no mesmo painel escuro da Central do vendedor, com o mesmo botão */}
                        <div className="rounded-2xl bg-[oklch(0.21_0.03_255)] p-5 text-white sm:p-7 dark:bg-surface-secondary dark:ring-1 dark:ring-border">
                            <div className="flex gap-4">
                                {data && (
                                    <div className="shrink-0 border border-white/30 px-2.5 py-2 text-center">
                                        <p className="text-3xl font-bold leading-none tabular-nums">{data.dia}</p>
                                        <p className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/70">{data.mes} {data.ano}</p>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="type-h2 line-clamp-2">{form.nome.trim() || "Sem nome"}</p>
                                    <p className="type-body-small mt-1 text-white/70">
                                        {[form.local.trim(), form.cidade.trim(), form.estado.trim().toUpperCase()].filter(Boolean).join(", ")}
                                    </p>
                                </div>
                            </div>
                            <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/15 pt-4">
                                <div>
                                    <dt className="type-caption text-white/60">Vagas</dt>
                                    <dd className="mt-0.5 font-semibold tabular-nums">{form.maxParticipantes || "—"}</dd>
                                </div>
                                <div>
                                    <dt className="type-caption text-white/60">Inscrição</dt>
                                    <dd className="mt-0.5 font-semibold tabular-nums">{valor > 0 ? formatarPreco(valor) : "Grátis"}</dd>
                                </div>
                                <div className="min-w-0">
                                    <dt className="type-caption text-white/60">Prêmio</dt>
                                    <dd className="mt-0.5 truncate font-semibold">{form.premiacao.trim() || "—"}</dd>
                                </div>
                            </dl>
                            <button type="button" onClick={handleSubmit} disabled={enviando} aria-busy={enviando} className="underline-btn mt-7">
                                <span className="flex items-center gap-2 py-1.5">
                                    {enviando ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Plus className="size-5" aria-hidden="true" />}
                                    {enviando ? "Publicando…" : "Publicar torneio"}
                                </span>
                            </button>
                        </div>
                        {erroEnvio && <p role="alert" className="type-body-small border-l-2 border-destructive pl-3 text-destructive">{erroEnvio}</p>}
                    </section>
                )}

                {/* Navegação entre passos */}
                <div className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-5">
                    {passo > 1 ? (
                        <button type="button" onClick={() => setPasso(passo - 1)} className="line-btn line-btn--muted">
                            Passo anterior
                        </button>
                    ) : <span />}
                    {passo < PASSOS.length && (
                        <div className="flex flex-col items-end gap-2">
                            <button type="button" onClick={() => setPasso(passo + 1)} disabled={!!falta} className="line-btn">
                                Continuar
                                <ArrowRight aria-hidden="true" />
                            </button>
                            {falta && <p className="type-caption text-muted-foreground">{falta}</p>}
                        </div>
                    )}
                </div>
            </main>

            <BottomNav />
        </div>
    )
}
