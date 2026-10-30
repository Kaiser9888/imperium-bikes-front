"use client"

import { useEffect, useState } from "react"
import { ImagePlus, Pencil, Plus, X } from "lucide-react"

import api from "@/lib/api"
import { compactarImagem } from "@/lib/imagem"
import { MODOS, modoDaApi, modoParaApi, type ModoPontuacao } from "@/lib/placar"
import { mensagemDaApi } from "@/services/tournamentService"

type Raw = Record<string, unknown>
const texto = (v: unknown) => (typeof v === "string" ? v : "")
const campo = "mt-1.5 w-full rounded-lg bg-surface px-3 py-2.5 text-base outline-none md:text-sm"
const rotulo = "type-label text-foreground"

/**
 * Organizador corrige o evento depois de publicado. Antes de começar, mexe em quase tudo; com gente inscrita,
 * valor e categorias ficam travados (o backend confere de novo). Mudança de data ou local avisa os inscritos.
 */
export function EditarEvento({ torneioId, aoSalvar }: { torneioId: string; aoSalvar: () => Promise<void> }) {
    const [aberto, setAberto] = useState(false)
    const [raw, setRaw] = useState<Raw | null>(null)
    const [form, setForm] = useState({
        nome: "", descricao: "", regras: "", premiacao: "", local: "", cidade: "", estado: "",
        dataInicio: "", dataFim: "", prazo: "", vagas: "", valor: "", capa: "", doacao: "",
    })
    const [modo, setModo] = useState<ModoPontuacao>("posicao")
    const [solidaria, setSolidaria] = useState(false)
    const [categorias, setCategorias] = useState<string[]>([])
    const [novaCategoria, setNovaCategoria] = useState("")
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [ok, setOk] = useState(false)

    useEffect(() => {
        if (!aberto) return
        let ativo = true
        api.get(`/api/tournaments/${torneioId}`)
            .then(({ data }) => {
                if (!ativo) return
                const d = data as Raw
                setRaw(d)
                setForm({
                    nome: texto(d.name), descricao: texto(d.description), regras: texto(d.rules), premiacao: texto(d.prizes),
                    local: texto(d.location), cidade: texto(d.city), estado: texto(d.state),
                    dataInicio: texto(d.startDate).slice(0, 10), dataFim: texto(d.endDate).slice(0, 10),
                    prazo: texto(d.registrationDeadline).slice(0, 10),
                    vagas: d.maxParticipants != null ? String(d.maxParticipants) : "",
                    valor: d.registrationFee != null ? String(d.registrationFee) : "",
                    capa: "", doacao: texto(d.solidariaDescricao) || "1 kg de alimento não perecível",
                })
                setModo(modoDaApi(d.scoringMode))
                setSolidaria(Boolean(d.solidariaDescricao))
                setCategorias(Array.isArray(d.categoriasInscricao) ? d.categoriasInscricao.map(String) : [])
            })
            .catch((cause) => ativo && setErro(mensagemDaApi(cause, "Não foi possível carregar o evento.")))
        return () => {
            ativo = false
        }
    }, [aberto, torneioId])

    const status = texto(raw?.status)
    const comecou = status === "IN_PROGRESS"
    const inscritos = Number(raw?.participantsCount ?? 0)
    const travado = inscritos > 0
    const mudar = (k: keyof typeof form, v: string) => {
        setOk(false)
        setForm((f) => ({ ...f, [k]: v }))
    }

    async function escolherCapa(arquivo: File | undefined) {
        if (!arquivo) return
        try {
            mudar("capa", await compactarImagem(arquivo, 1200, 350 * 1024))
        } catch (cause) {
            setErro(cause instanceof Error ? cause.message : "Não foi possível usar essa imagem.")
        }
    }

    async function salvar(event: React.FormEvent) {
        event.preventDefault()
        setSalvando(true)
        setErro(null)
        try {
            await api.put(`/api/tournaments/${torneioId}`, {
                name: form.nome.trim(),
                description: form.descricao.trim(),
                rules: form.regras.trim(),
                prizes: form.premiacao.trim(),
                location: form.local.trim(),
                city: form.cidade.trim(),
                state: form.estado.trim().toUpperCase(),
                startDate: form.dataInicio,
                endDate: form.dataFim || form.dataInicio,
                registrationDeadline: `${form.prazo || form.dataInicio}T23:59:59`,
                maxParticipants: form.vagas ? Number(form.vagas) : null,
                registrationFee: Number(form.valor) || 0,
                // Sem foto nova, a capa atual fica
                coverImageUrl: form.capa || null,
                scoringMode: modoParaApi(modo),
                solidariaDescricao: solidaria ? form.doacao.trim() : "",
                categoriasInscricao: categorias,
            })
            setOk(true)
            setForm((f) => ({ ...f, capa: "" }))
            await aoSalvar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível salvar. Confira os campos."))
        } finally {
            setSalvando(false)
        }
    }

    if (!aberto) {
        return (
            <button type="button" onClick={() => setAberto(true)} className="line-btn line-btn--sm">
                <Pencil aria-hidden="true" />
                Editar informações do evento
            </button>
        )
    }

    return (
        <section aria-labelledby="editar-titulo" className="mt-2 w-full rounded-lg border border-foreground p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
                <h2 id="editar-titulo" className="type-h3">Editar evento</h2>
                <button type="button" onClick={() => setAberto(false)} aria-label="Fechar edição" className="grid size-9 place-items-center rounded-full hover:bg-surface-muted">
                    <X className="size-4" aria-hidden="true" />
                </button>
            </div>
            {!raw && !erro && <p className="type-body-small mt-3 text-muted-foreground">Carregando…</p>}

            {raw && (
                <form onSubmit={salvar} className="mt-4 space-y-5">
                    {inscritos > 0 && (
                        <p className="type-caption rounded-lg bg-surface-muted px-3 py-2 text-muted-foreground">
                            {inscritos === 1 ? "1 pessoa já se inscreveu" : `${inscritos} pessoas já se inscreveram`}: valor e categorias não mudam mais.
                            Se mudar data ou local, todos recebem um aviso.
                        </p>
                    )}

                    <label className="block">
                        <span className={rotulo}>Nome</span>
                        <input value={form.nome} onChange={(e) => mudar("nome", e.target.value)} maxLength={255} required className={campo} />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <label className="block">
                            <span className={rotulo}>Começa em</span>
                            <input type="date" value={form.dataInicio} onChange={(e) => mudar("dataInicio", e.target.value)} disabled={comecou} required className={campo} />
                        </label>
                        <label className="block">
                            <span className={rotulo}>Termina em</span>
                            <input type="date" value={form.dataFim} min={form.dataInicio || undefined} onChange={(e) => mudar("dataFim", e.target.value)} disabled={comecou} className={campo} />
                        </label>
                        <label className="block">
                            <span className={rotulo}>Inscrições até</span>
                            <input type="date" value={form.prazo} max={form.dataInicio || undefined} onChange={(e) => mudar("prazo", e.target.value)} disabled={comecou} className={campo} />
                        </label>
                    </div>
                    {comecou && <p className="type-caption -mt-3 text-muted-foreground">Com o evento acontecendo, datas e vagas não mudam.</p>}

                    <div className="grid gap-4 sm:grid-cols-[1fr_1fr_5rem]">
                        <label className="block">
                            <span className={rotulo}>Local</span>
                            <input value={form.local} onChange={(e) => mudar("local", e.target.value)} required className={campo} />
                        </label>
                        <label className="block">
                            <span className={rotulo}>Cidade</span>
                            <input value={form.cidade} onChange={(e) => mudar("cidade", e.target.value)} className={campo} />
                        </label>
                        <label className="block">
                            <span className={rotulo}>UF</span>
                            <input value={form.estado} onChange={(e) => mudar("estado", e.target.value)} maxLength={2} className={`${campo} uppercase`} />
                        </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className={rotulo}>Vagas</span>
                            <input type="number" inputMode="numeric" min={Math.max(inscritos, 1)} value={form.vagas} onChange={(e) => mudar("vagas", e.target.value)} disabled={comecou} className={campo} />
                        </label>
                        <label className="block">
                            <span className={rotulo}>Valor da inscrição (R$)</span>
                            <input type="number" inputMode="decimal" min={0} max={500} step="0.01" value={form.valor} onChange={(e) => mudar("valor", e.target.value)} disabled={travado} className={campo} />
                        </label>
                    </div>

                    <fieldset disabled={comecou}>
                        <legend className={rotulo}>Como o resultado é decidido</legend>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                            {MODOS.map((m) => (
                                <label key={m.id} className={`type-label cursor-pointer rounded-full border px-3 py-1.5 ${modo === m.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}>
                                    <input type="radio" name="modo-editar" className="sr-only" checked={modo === m.id} onChange={() => setModo(m.id)} />
                                    {m.titulo}
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <div>
                        <span className={rotulo}>Categorias</span>
                        {!travado && (
                            <div className="mt-1.5 flex gap-2">
                                <input
                                    value={novaCategoria}
                                    maxLength={50}
                                    onChange={(e) => setNovaCategoria(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key !== "Enter") return
                                        e.preventDefault()
                                        const n = novaCategoria.trim()
                                        if (n && !categorias.some((c) => c.toLowerCase() === n.toLowerCase()) && categorias.length < 12) setCategorias([...categorias, n])
                                        setNovaCategoria("")
                                    }}
                                    placeholder="Ex.: Elite Masculino (Enter para adicionar)"
                                    className={`${campo} mt-0 flex-1`}
                                />
                                <button
                                    type="button"
                                    className="line-btn line-btn--sm shrink-0 self-center"
                                    onClick={() => {
                                        const n = novaCategoria.trim()
                                        if (n && !categorias.some((c) => c.toLowerCase() === n.toLowerCase()) && categorias.length < 12) setCategorias([...categorias, n])
                                        setNovaCategoria("")
                                    }}
                                >
                                    <Plus aria-hidden="true" />
                                    Adicionar
                                </button>
                            </div>
                        )}
                        <ul className="mt-2 flex flex-wrap gap-2">
                            {categorias.length === 0 && <li className="type-caption text-muted-foreground">Sem categorias: todos disputam juntos.</li>}
                            {categorias.map((c) => (
                                <li key={c} className="type-label flex items-center gap-1 rounded-full border border-foreground py-1 pl-3 pr-1">
                                    {c}
                                    {!travado && (
                                        <button type="button" onClick={() => setCategorias(categorias.filter((x) => x !== c))} aria-label={`Tirar ${c}`} className="grid size-6 place-items-center rounded-full hover:bg-surface-muted">
                                            <X className="size-3.5" aria-hidden="true" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <label className="flex cursor-pointer items-center gap-2.5">
                            <input type="checkbox" checked={solidaria} onChange={(e) => setSolidaria(e.target.checked)} className="size-4" />
                            <span className={rotulo}>Inscrição solidária</span>
                        </label>
                        {solidaria && <input value={form.doacao} onChange={(e) => mudar("doacao", e.target.value)} maxLength={200} className={campo} aria-label="O que levar" />}
                    </div>

                    <label className="block">
                        <span className={rotulo}>Descrição</span>
                        <textarea value={form.descricao} onChange={(e) => mudar("descricao", e.target.value)} rows={4} className={`${campo} resize-y`} />
                    </label>
                    <label className="block">
                        <span className={rotulo}>Regras</span>
                        <textarea value={form.regras} onChange={(e) => mudar("regras", e.target.value)} rows={3} className={`${campo} resize-y`} />
                    </label>
                    <label className="block">
                        <span className={rotulo}>Premiação</span>
                        <input value={form.premiacao} onChange={(e) => mudar("premiacao", e.target.value)} className={campo} />
                    </label>

                    <div>
                        <span className={rotulo}>Capa</span>
                        <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-foreground/40 px-3 py-3 text-muted-foreground hover:border-foreground">
                            <ImagePlus className="size-5" aria-hidden="true" />
                            <span className="type-body-small">{form.capa ? "Nova capa escolhida" : "Trocar a capa (opcional)"}</span>
                            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { void escolherCapa(e.target.files?.[0]); e.target.value = "" }} />
                        </label>
                    </div>

                    {erro && <p role="alert" className="type-body-small border-l-2 border-destructive pl-3 text-destructive">{erro}</p>}
                    {ok && <p role="status" className="type-body-small text-success">Salvo. A página do evento já mostra as mudanças.</p>}

                    <div className="flex gap-3">
                        <button type="submit" disabled={salvando} className="line-btn">
                            {salvando ? "Salvando…" : "Salvar mudanças"}
                        </button>
                        <button type="button" onClick={() => setAberto(false)} className="line-btn line-btn--muted">
                            Fechar
                        </button>
                    </div>
                </form>
            )}
        </section>
    )
}
