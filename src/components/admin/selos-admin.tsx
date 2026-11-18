"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { mensagemDaApi } from "@/services/tournamentService"

type Item = {
    id: string
    userId: string
    nome: string | null
    tipo: "CRIADOR" | "LOJA"
    status: "PENDENTE" | "APROVADA"
    link: string
    seguidores: number | null
    cnpj: string | null
    empresaNome: string | null
    observacao: string | null
    codigo: string
    criadoEm: string
}

type Acao = { item: Item; tipo: "recusar" | "remover" }

const cnpjFormatado = (c: string) => c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")

/**
 * Pedidos de selo de criador e de loja. Antes de aprovar: abra o link e confira se o código está
 * na bio (prova que o perfil é da pessoa) e se o número de seguidores bate.
 */
export function SelosAdmin() {
    const [pendentes, setPendentes] = useState<Item[] | null>(null)
    const [ativos, setAtivos] = useState<Item[]>([])
    const [erro, setErro] = useState<string | null>(null)
    const [acao, setAcao] = useState<Acao | null>(null)
    const [motivo, setMotivo] = useState("")
    const [enviando, setEnviando] = useState(false)

    const carregar = useCallback(async () => {
        setErro(null)
        try {
            const [p, a] = await Promise.all([
                api.get<Item[]>("/api/admin/pendencias/verificacoes", { params: { status: "PENDENTE" } }),
                api.get<Item[]>("/api/admin/pendencias/verificacoes", { params: { status: "APROVADA" } }),
            ])
            setPendentes(p.data)
            setAtivos(a.data)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível carregar os pedidos de selo."))
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga ao abrir a aba
        void carregar()
    }, [carregar])

    async function aprovar(item: Item) {
        setErro(null)
        try {
            await api.post(`/api/admin/pendencias/verificacoes/${item.id}`, null, { params: { aprovar: true } })
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível aprovar."))
        }
    }

    async function confirmar(event: React.FormEvent) {
        event.preventDefault()
        if (!acao || !motivo.trim()) return
        setEnviando(true)
        try {
            if (acao.tipo === "recusar") {
                await api.post(`/api/admin/pendencias/verificacoes/${acao.item.id}`, null, { params: { aprovar: false, motivo: motivo.trim() } })
            } else {
                await api.post(`/api/admin/pendencias/verificacoes/${acao.item.id}/remover`, null, { params: { motivo: motivo.trim() } })
            }
            setAcao(null)
            await carregar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível concluir."))
        } finally {
            setEnviando(false)
        }
    }

    const abrir = (item: Item, tipo: Acao["tipo"]) => {
        setMotivo("")
        setAcao({ item, tipo })
    }

    return (
        <section>
            <p className="type-body-small text-muted-foreground">
                Antes de aprovar, abra o link e confira: o <strong>código está na bio</strong> (prova que o perfil é da pessoa) e o número de
                seguidores bate (criador: 10 mil ou mais). Na loja, confira se o nome da empresa combina com o perfil.
            </p>
            {erro && <p role="alert" className="type-body-small mt-4 border-l-2 border-destructive pl-3 text-destructive">{erro}</p>}

            {pendentes === null ? (
                <Loader2 className="mt-8 size-5 animate-spin text-muted-foreground" />
            ) : pendentes.length === 0 ? (
                <p className="type-body-small mt-8 text-muted-foreground">Nenhum pedido de selo esperando.</p>
            ) : (
                <ul className="mt-5 divide-y divide-border border-y border-border">
                    {pendentes.map((p) => (
                        <li key={p.id} className="py-4">
                            <Resumo item={p} />
                            <div className="mt-3 flex flex-wrap gap-5">
                                <button type="button" onClick={() => abrir(p, "recusar")} className="line-btn line-btn--sm line-btn--danger">
                                    Recusar
                                </button>
                                <button type="button" onClick={() => aprovar(p)} className="line-btn line-btn--sm">
                                    Aprovar
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {ativos.length > 0 && (
                <div className="mt-10">
                    <h2 className="type-label uppercase tracking-wider text-muted-foreground">Selos ativos</h2>
                    <ul className="mt-3 divide-y divide-border border-y border-border">
                        {ativos.map((a) => (
                            <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                                <Resumo item={a} />
                                <button type="button" onClick={() => abrir(a, "remover")} className="line-btn line-btn--sm line-btn--danger">
                                    Remover selo
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Dialog open={acao !== null} onOpenChange={(open) => !open && !enviando && setAcao(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{acao?.tipo === "recusar" ? "Recusar o pedido?" : "Remover o selo?"}</DialogTitle>
                        <DialogDescription>A pessoa recebe o motivo no sino. Seja direto, ex.: &quot;O código não está na bio&quot;.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={confirmar} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="selo-motivo">Motivo</Label>
                            <Textarea id="selo-motivo" rows={3} maxLength={300} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAcao(null)} disabled={enviando}>
                                Voltar
                            </Button>
                            <Button type="submit" variant="destructive" loading={enviando} disabled={!motivo.trim()}>
                                {acao?.tipo === "recusar" ? "Recusar" : "Remover"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    )
}

/**
 * "Dar selo" na aba Usuários: criador ou loja direto, sem a pessoa pedir (atleta ou loja parceira
 * que a equipe conhece). Vendedor verificado fica de fora: é automático.
 */
export function DarSelo({ userId, nome }: { userId: string; nome: string }) {
    const [aberto, setAberto] = useState(false)
    const [tipo, setTipo] = useState<"CRIADOR" | "LOJA">("CRIADOR")
    const [link, setLink] = useState("")
    const [cnpj, setCnpj] = useState("")
    const [enviando, setEnviando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [feito, setFeito] = useState<string | null>(null)

    const valido = tipo === "CRIADOR" ? link.trim().length > 4 : cnpj.replace(/\D/g, "").length === 14

    function abrir() {
        setTipo("CRIADOR")
        setLink("")
        setCnpj("")
        setErro(null)
        setAberto(true)
    }

    async function dar(event: React.FormEvent) {
        event.preventDefault()
        if (!valido) return
        setEnviando(true)
        setErro(null)
        try {
            await api.post("/api/admin/pendencias/verificacoes/dar", { link: link.trim() || null, cnpj: cnpj || null }, { params: { userId, tipo } })
            setFeito(tipo === "CRIADOR" ? "Selo de criador dado" : "Selo de loja dado")
            setAberto(false)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível dar o selo."))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <>
            {feito ? (
                <span className="text-xs font-medium text-success">{feito}</span>
            ) : (
                <button type="button" onClick={abrir} className="line-btn line-btn--sm">
                    Dar selo
                </button>
            )}

            <Dialog open={aberto} onOpenChange={(open) => !open && !enviando && setAberto(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dar selo a {nome}</DialogTitle>
                        <DialogDescription>
                            A pessoa é avisada no sino. Para remover depois, use &quot;Selos ativos&quot; na aba Selos.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={dar} className="flex flex-col gap-4">
                        <div className="flex gap-2" role="radiogroup" aria-label="Tipo de selo">
                            {(["CRIADOR", "LOJA"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    role="radio"
                                    aria-checked={tipo === t}
                                    onClick={() => setTipo(t)}
                                    className={`line-btn line-btn--sm ${tipo === t ? "" : "line-btn--muted"}`}
                                >
                                    {t === "CRIADOR" ? "Criador" : "Loja"}
                                </button>
                            ))}
                        </div>
                        {tipo === "LOJA" && (
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="dar-cnpj">CNPJ</Label>
                                <Input id="dar-cnpj" inputMode="numeric" maxLength={18} value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                                <p className="text-xs text-muted-foreground">O site confere na Receita se está ativo e usa o nome oficial no selo.</p>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="dar-link">{tipo === "CRIADOR" ? "Link do perfil na outra rede" : "Instagram ou site da loja (opcional)"}</Label>
                            <Input id="dar-link" inputMode="url" maxLength={300} value={link} onChange={(e) => setLink(e.target.value)} placeholder="instagram.com/perfil" />
                        </div>
                        {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAberto(false)} disabled={enviando}>
                                Voltar
                            </Button>
                            <Button type="submit" loading={enviando} disabled={!valido}>
                                Dar selo
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

function Resumo({ item }: { item: Item }) {
    return (
        <div className="min-w-0">
            <p className="text-sm font-semibold">
                {item.tipo === "CRIADOR" ? "Criador" : "Loja"} · {item.nome || "Sem nome"}
            </p>
            <a href={item.link} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-primary hover:underline">
                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.link}</span>
            </a>
            <p className="mt-1 text-xs text-muted-foreground">
                {item.seguidores != null && `${item.seguidores.toLocaleString("pt-BR")} seguidores informados · `}
                {item.cnpj && `CNPJ ${cnpjFormatado(item.cnpj)}${item.empresaNome ? ` · ${item.empresaNome}` : ""} · `}
                código <code className="font-mono font-semibold text-foreground">{item.codigo}</code> ·{" "}
                {new Date(item.criadoEm).toLocaleDateString("pt-BR")}
            </p>
            {item.observacao && item.status === "PENDENTE" && <p className="mt-1 text-xs font-medium text-warning">{item.observacao}</p>}
        </div>
    )
}
