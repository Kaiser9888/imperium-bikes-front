"use client"

import { useCallback, useEffect, useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
