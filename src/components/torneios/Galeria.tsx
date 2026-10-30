"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Trash2, X } from "lucide-react"

import { sponsorImageUrl } from "@/components/perfil/SponsorBanners"
import { compactarImagem } from "@/lib/imagem"
import { cn } from "@/lib/utils"
import { mensagemDaApi, tournamentService, type FotoEvento } from "@/services/tournamentService"

/** Fotos maiores que isso são reduzidas no aparelho antes de subir (galeria não precisa de mais). */
const LARGURA_MAX = 2000
const BYTES_MAX = 1200 * 1024

/**
 * Galeria do evento: grade de fotos, tela cheia ao tocar (setas, teclado e deslizar).
 * O organizador adiciona várias de uma vez e apaga.
 */
export function Galeria({
    torneioId,
    fotos,
    organizador,
    aoMudar,
}: {
    torneioId: string
    fotos: FotoEvento[]
    organizador: boolean
    aoMudar: () => Promise<void>
}) {
    const [aberta, setAberta] = useState<number | null>(null)
    const [enviando, setEnviando] = useState<{ feitas: number; total: number } | null>(null)
    const [erro, setErro] = useState<string | null>(null)
    const input = useRef<HTMLInputElement>(null)
    const toque = useRef<number | null>(null)

    const mover = useCallback(
        (passo: number) => setAberta((atual) => (atual === null ? null : (atual + passo + fotos.length) % fotos.length)),
        [fotos.length],
    )

    useEffect(() => {
        if (aberta === null) return
        const teclas = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") mover(1)
            if (e.key === "ArrowLeft") mover(-1)
        }
        window.addEventListener("keydown", teclas)
        return () => window.removeEventListener("keydown", teclas)
    }, [aberta, mover])

    async function adicionar(event: React.ChangeEvent<HTMLInputElement>) {
        const arquivos = Array.from(event.target.files ?? [])
        event.target.value = ""
        if (arquivos.length === 0) return
        setErro(null)
        setEnviando({ feitas: 0, total: arquivos.length })
        const falhas: string[] = []
        for (const [i, arquivo] of arquivos.entries()) {
            try {
                const dataUrl = await compactarImagem(arquivo, LARGURA_MAX, BYTES_MAX)
                const blob = await (await fetch(dataUrl)).blob()
                await tournamentService.adicionarFoto(torneioId, new File([blob], "foto.jpg", { type: "image/jpeg" }))
            } catch (cause) {
                falhas.push(cause instanceof Error && !("response" in cause) ? cause.message : mensagemDaApi(cause, "falhou"))
                // Galeria cheia: as próximas também vão falhar
                if (falhas.at(-1)?.includes("até")) break
            }
            setEnviando({ feitas: i + 1, total: arquivos.length })
        }
        await aoMudar()
        setEnviando(null)
        if (falhas.length > 0) setErro(`${falhas.length} foto(s) não entraram: ${falhas[0]}`)
    }

    async function apagar(foto: FotoEvento) {
        if (!window.confirm("Apagar esta foto da galeria?")) return
        setErro(null)
        try {
            await tournamentService.removerFoto(torneioId, foto.id)
            setAberta(null)
            await aoMudar()
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível apagar a foto."))
        }
    }

    const atual = aberta === null ? null : fotos[aberta]

    return (
        <section aria-labelledby="galeria-titulo">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="galeria-titulo" className="type-h2">
                    Fotos {fotos.length > 0 && <span className="text-muted-foreground tabular-nums">({fotos.length})</span>}
                </h2>
                {organizador && (
                    <>
                        <button type="button" onClick={() => input.current?.click()} disabled={!!enviando} className="line-btn line-btn--sm">
                            {enviando ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
                            {enviando ? `Enviando ${enviando.feitas} de ${enviando.total}…` : "Adicionar fotos"}
                        </button>
                        <input ref={input} type="file" accept="image/*" multiple className="sr-only" onChange={adicionar} tabIndex={-1} aria-hidden="true" />
                    </>
                )}
            </div>
            {erro && (
                <p role="alert" className="type-body-small mt-3 border-l-2 border-destructive pl-3 text-destructive">
                    {erro}
                </p>
            )}

            {fotos.length === 0 ? (
                <p className="type-body-small mt-3 text-muted-foreground">
                    {organizador
                        ? "Mostre o percurso, a estrutura e as edições anteriores. Depois da prova, ponha as melhores fotos do dia."
                        : "O organizador ainda não colocou fotos."}
                </p>
            ) : (
                <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {fotos.map((f, i) => (
                        <li key={f.id} className="relative">
                            <button
                                type="button"
                                onClick={() => setAberta(i)}
                                className="block w-full overflow-hidden rounded-lg border border-border bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary"
                                aria-label={f.legenda ? `Abrir foto: ${f.legenda}` : `Abrir foto ${i + 1}`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element -- foto enviada pelo organizador (R2) */}
                                <img src={sponsorImageUrl(f.url)} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform hover:scale-[1.03]" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <DialogPrimitive.Root open={atual !== null} onOpenChange={(abrir) => !abrir && setAberta(null)}>
                <DialogPrimitive.Portal>
                    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95" />
                    <DialogPrimitive.Content
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 outline-none"
                        onTouchStart={(e) => (toque.current = e.touches[0].clientX)}
                        onTouchEnd={(e) => {
                            if (toque.current === null) return
                            const dx = e.changedTouches[0].clientX - toque.current
                            if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1)
                            toque.current = null
                        }}
                    >
                        <DialogPrimitive.Title className="sr-only">Foto {aberta !== null ? aberta + 1 : ""} de {fotos.length}</DialogPrimitive.Title>
                        <DialogPrimitive.Description className="sr-only">Use as setas para ver as outras fotos.</DialogPrimitive.Description>
                        {atual && (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element -- foto enviada pelo organizador (R2) */}
                                <img src={sponsorImageUrl(atual.url)} alt={atual.legenda ?? ""} className="max-h-[80vh] max-w-full rounded-md object-contain" />
                                <div className="mt-3 flex w-full max-w-3xl items-center justify-between gap-3 text-white">
                                    <p className="type-body-small min-w-0 truncate text-white/80">{atual.legenda}</p>
                                    <span className="type-caption shrink-0 tabular-nums text-white/60">
                                        {aberta! + 1} / {fotos.length}
                                    </span>
                                </div>
                            </>
                        )}
                        <DialogPrimitive.Close
                            className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                            aria-label="Fechar"
                        >
                            <X className="size-5" />
                        </DialogPrimitive.Close>
                        {organizador && atual && (
                            <button
                                type="button"
                                onClick={() => apagar(atual)}
                                className="absolute left-3 top-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-destructive"
                                aria-label="Apagar esta foto"
                            >
                                <Trash2 className="size-5" />
                            </button>
                        )}
                        {fotos.length > 1 &&
                            ([-1, 1] as const).map((passo) => {
                                const Icone = passo < 0 ? ChevronLeft : ChevronRight
                                return (
                                    <button
                                        key={passo}
                                        type="button"
                                        onClick={() => mover(passo)}
                                        aria-label={passo < 0 ? "Foto anterior" : "Próxima foto"}
                                        className={cn(
                                            "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20",
                                            passo < 0 ? "left-3" : "right-3",
                                        )}
                                    >
                                        <Icone className="size-6" />
                                    </button>
                                )
                            })}
                    </DialogPrimitive.Content>
                </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
        </section>
    )
}
