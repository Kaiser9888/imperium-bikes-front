"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ImagePlus, Loader2, Pencil, Plus, Trash2 } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { compactarImagem } from "@/lib/imagem"
import { bannerService, type Banner, type BannerInput } from "@/services/adminService"
import { mensagemDaApi } from "@/services/tournamentService"

const VAZIO: BannerInput = { imageUrl: "", alt: "", linkUrl: "", displayOrder: 0, active: true }

/** Banners da Home: criar, editar, ligar/desligar e excluir. */
export function BannersAdmin() {
    const [banners, setBanners] = useState<Banner[] | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const [editando, setEditando] = useState<{ id?: string; dados: BannerInput } | null>(null)
    const [excluindo, setExcluindo] = useState<Banner | null>(null)

    const carregar = useCallback(async () => {
        setErro(null)
        try {
            setBanners(await bannerService.todos())
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível carregar os banners."))
            setBanners([])
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
        void carregar()
    }, [carregar])

    async function alternar(b: Banner) {
        const { id, ...dados } = b
        try {
            const salvo = await bannerService.atualizar(id, { ...dados, active: !b.active })
            setBanners((l) => l?.map((x) => (x.id === id ? salvo : x)) ?? null)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível alterar o banner."))
        }
    }

    async function excluir() {
        if (!excluindo) return
        try {
            await bannerService.excluir(excluindo.id)
            setBanners((l) => l?.filter((x) => x.id !== excluindo.id) ?? null)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível excluir o banner."))
        }
        setExcluindo(null)
    }

    const proximaOrdem = (banners?.reduce((m, b) => Math.max(m, b.displayOrder), -1) ?? -1) + 1

    return (
        <section>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="type-h3">Banners da Home</h2>
                    <p className="type-body-small mt-1 text-muted-foreground">
                        Os ativos aparecem no topo da página inicial, na ordem abaixo. Arte em 16:7 (ex.: 1600×700).
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setEditando({ dados: { ...VAZIO, displayOrder: proximaOrdem } })}
                    className="line-btn line-btn--sm"
                >
                    <Plus aria-hidden="true" />
                    Novo banner
                </button>
            </div>

            {erro && <p role="alert" className="type-body-small mt-4 border-l-2 border-destructive pl-3 text-destructive">{erro}</p>}

            {banners === null ? (
                <Loader2 className="mt-8 size-5 animate-spin text-muted-foreground" />
            ) : banners.length === 0 ? (
                <p className="type-body-small mt-8 rounded-2xl border border-dashed border-border px-5 py-10 text-center text-muted-foreground">
                    Nenhum banner ainda. Sem banners, a Home simplesmente não mostra a faixa.
                </p>
            ) : (
                <ul className="mt-5 space-y-3">
                    {banners.map((b) => (
                        <li key={b.id} className={`flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 sm:flex-row sm:items-center ${b.active ? "" : "opacity-60"}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element -- data URL ou link externo */}
                            <img src={b.imageUrl} alt="" className="aspect-[16/7] w-full rounded-lg bg-surface-muted object-cover sm:w-48" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{b.alt}</p>
                                <p className="truncate text-xs text-muted-foreground">→ {b.linkUrl}</p>
                                <p className="mt-1 text-xs tabular-nums text-muted-foreground">Ordem {b.displayOrder}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <label className="mr-2 flex items-center gap-2 text-xs text-muted-foreground">
                                    <Switch checked={b.active} onCheckedChange={() => alternar(b)} aria-label={b.active ? "Desativar banner" : "Ativar banner"} />
                                    {b.active ? "Ativo" : "Oculto"}
                                </label>
                                <Button variant="ghost" size="icon" aria-label="Editar banner" onClick={() => setEditando({ id: b.id, dados: { ...b } })}>
                                    <Pencil />
                                </Button>
                                <Button variant="ghost" size="icon" aria-label="Excluir banner" className="text-destructive" onClick={() => setExcluindo(b)}>
                                    <Trash2 />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog open={!!editando} onOpenChange={(aberto) => !aberto && setEditando(null)}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editando?.id ? "Editar banner" : "Novo banner"}</DialogTitle>
                        <DialogDescription>A arte é compactada no navegador e salva junto com o banner.</DialogDescription>
                    </DialogHeader>
                    {editando && (
                        <FormBanner
                            inicial={editando.dados}
                            onCancelar={() => setEditando(null)}
                            onSalvar={async (dados) => {
                                const salvo = editando.id ? await bannerService.atualizar(editando.id, dados) : await bannerService.criar(dados)
                                setBanners((l) => {
                                    const lista = editando.id ? (l ?? []).map((x) => (x.id === salvo.id ? salvo : x)) : [...(l ?? []), salvo]
                                    return lista.sort((a, b) => a.displayOrder - b.displayOrder)
                                })
                                setEditando(null)
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!excluindo} onOpenChange={(aberto) => !aberto && setExcluindo(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir este banner?</AlertDialogTitle>
                        <AlertDialogDescription>“{excluindo?.alt}” sai da Home e não dá para desfazer. Para tirar só por um tempo, desative.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Manter</AlertDialogCancel>
                        <AlertDialogAction onClick={excluir}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}

function FormBanner({
    inicial,
    onSalvar,
    onCancelar,
}: {
    inicial: BannerInput
    onSalvar: (dados: BannerInput) => Promise<void>
    onCancelar: () => void
}) {
    const [dados, setDados] = useState(inicial)
    const [processando, setProcessando] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const arquivo = useRef<HTMLInputElement>(null)

    const set = <K extends keyof BannerInput>(campo: K, valor: BannerInput[K]) => setDados((d) => ({ ...d, [campo]: valor }))

    async function escolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0]
        e.target.value = ""
        if (!f) return
        setErro(null)
        setProcessando(true)
        try {
            set("imageUrl", await compactarImagem(f))
        } catch (cause) {
            setErro(cause instanceof Error ? cause.message : "Não foi possível usar essa imagem.")
        }
        setProcessando(false)
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault()
        if (!dados.imageUrl) return setErro("Escolha a arte do banner.")
        if (!dados.alt.trim()) return setErro("Descreva o banner em poucas palavras.")
        if (!dados.linkUrl.trim()) return setErro("Informe para onde o banner leva.")
        setErro(null)
        setSalvando(true)
        try {
            await onSalvar(dados)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível salvar o banner."))
            setSalvando(false)
        }
    }

    const campo = "mt-1.5 w-full rounded-lg bg-surface px-3.5 py-2.5 text-base outline-none md:text-sm"
    const rotulo = "type-label"

    return (
        <form onSubmit={salvar} className="space-y-5">
            <div>
                <span className={rotulo}>Arte</span>
                <button
                    type="button"
                    onClick={() => arquivo.current?.click()}
                    className="relative mt-1.5 grid aspect-[16/7] w-full place-items-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-surface-muted text-muted-foreground transition-colors hover:border-foreground"
                >
                    {dados.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- prévia local
                        <img src={dados.imageUrl} alt="Prévia do banner" className="absolute inset-0 size-full object-cover" />
                    ) : (
                        <span className="flex flex-col items-center gap-1 text-sm">
                            {processando ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
                            {processando ? "Compactando…" : "Escolher imagem"}
                        </span>
                    )}
                </button>
                <input ref={arquivo} type="file" accept="image/*" onChange={escolherArquivo} className="hidden" />
                <div className="mt-2 flex items-center gap-3">
                    {dados.imageUrl && (
                        <button type="button" onClick={() => arquivo.current?.click()} className="line-btn line-btn--sm line-btn--muted">
                            Trocar imagem
                        </button>
                    )}
                    <span className="text-xs text-muted-foreground">ou cole um link:</span>
                </div>
                <input
                    type="url"
                    value={dados.imageUrl.startsWith("data:") ? "" : dados.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                    placeholder="https://…/banner.jpg"
                    className={campo}
                />
            </div>

            <div>
                <label htmlFor="banner-alt" className={rotulo}>Descrição</label>
                <input id="banner-alt" value={dados.alt} maxLength={200} onChange={(e) => set("alt", e.target.value)} placeholder="Promoção de pneus MTB até domingo" className={campo} />
                <p className="mt-1 text-xs text-muted-foreground">Lida por leitores de tela. Diga o que a arte anuncia.</p>
            </div>

            <div>
                <label htmlFor="banner-link" className={rotulo}>Leva para</label>
                <input id="banner-link" value={dados.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} placeholder="/torneios/123 ou https://loja.com" className={campo} />
            </div>

            <div className="flex items-end gap-6">
                <div className="w-28">
                    <label htmlFor="banner-ordem" className={rotulo}>Ordem</label>
                    <input id="banner-ordem" type="number" value={dados.displayOrder} onChange={(e) => set("displayOrder", Number(e.target.value) || 0)} className={campo} />
                </div>
                <label className="flex items-center gap-2 pb-2.5 text-sm">
                    <Switch checked={dados.active} onCheckedChange={(v) => set("active", v)} />
                    Mostrar na Home
                </label>
            </div>

            {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}

            <div className="flex justify-end gap-6 pt-2">
                <button type="button" onClick={onCancelar} className="line-btn line-btn--sm line-btn--muted">
                    Cancelar
                </button>
                <button type="submit" disabled={salvando || processando} aria-busy={salvando} className="line-btn line-btn--sm line-btn--accent">
                    {salvando && <Loader2 className="animate-spin" aria-hidden="true" />}
                    Salvar banner
                </button>
            </div>
        </form>
    )
}
