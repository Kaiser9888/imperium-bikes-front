"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { bannerService, type Banner } from "@/services/adminService"

/** Tempo de cada banner na tela antes de passar para o próximo. */
const DURACAO_MS = 6000

/**
 * Carrossel dos banners da Home (cadastrados em /admin). Passa sozinho e, no lugar das
 * bolinhas, mostra barras que enchem de vermelho no ritmo da troca, como stories.
 * Pausa com o mouse em cima, com foco no teclado e ao arrastar; sem animação para quem
 * pediu menos movimento.
 */
export function Banners() {
    const [banners, setBanners] = useState<Banner[]>([])
    const varios = banners.length > 1
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: varios, align: "start" })
    const [atual, setAtual] = useState(0)
    const [pausado, setPausado] = useState(false)
    const [menosMovimento, setMenosMovimento] = useState(false)

    useEffect(() => {
        let ativo = true
        bannerService.ativos().then((lista) => ativo && setBanners(lista)).catch(() => {})
        return () => {
            ativo = false
        }
    }, [])

    useEffect(() => {
        const consulta = window.matchMedia("(prefers-reduced-motion: reduce)")
        const atualizar = () => setMenosMovimento(consulta.matches)
        atualizar()
        consulta.addEventListener("change", atualizar)
        return () => consulta.removeEventListener("change", atualizar)
    }, [])

    useEffect(() => {
        if (!emblaApi) return
        const aoSelecionar = () => setAtual(emblaApi.selectedScrollSnap())
        const aoArrastar = () => setPausado(true)
        const aoSoltar = () => setPausado(false)
        emblaApi.on("select", aoSelecionar).on("pointerDown", aoArrastar).on("pointerUp", aoSoltar)
        return () => {
            emblaApi.off("select", aoSelecionar).off("pointerDown", aoArrastar).off("pointerUp", aoSoltar)
        }
    }, [emblaApi])

    // Troca automática: recomeça a contagem a cada banner novo
    useEffect(() => {
        if (!emblaApi || !varios || pausado || menosMovimento) return
        const timer = window.setTimeout(() => emblaApi.scrollNext(), DURACAO_MS)
        return () => window.clearTimeout(timer)
    }, [emblaApi, varios, pausado, menosMovimento, atual])

    const irPara = useCallback((indice: number) => emblaApi?.scrollTo(indice), [emblaApi])

    if (banners.length === 0) return null

    return (
        <section
            aria-roledescription="carrossel"
            aria-label="Anúncios e promoções"
            className="group/banners relative"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocusCapture={() => setPausado(true)}
            onBlurCapture={() => setPausado(false)}
        >
            <div ref={emblaRef} className="overflow-hidden rounded-2xl">
                <ul className="flex">
                    {banners.map(({ id, imageUrl, alt, linkUrl }, indice) => (
                        <li
                            key={id}
                            className="min-w-0 shrink-0 grow-0 basis-full"
                            aria-roledescription="slide"
                            aria-label={`${indice + 1} de ${banners.length}`}
                        >
                            <Link
                                href={linkUrl}
                                className="relative block aspect-[16/7] overflow-hidden bg-surface-muted"
                                tabIndex={indice === atual ? 0 : -1}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element -- arte do painel: data URL ou link externo */}
                                <img
                                    src={imageUrl}
                                    alt={alt}
                                    loading={indice === 0 ? "eager" : "lazy"}
                                    className="size-full object-cover"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {varios && (
                <>
                    <SetaBanner lado="esquerda" onClick={() => emblaApi?.scrollPrev()} />
                    <SetaBanner lado="direita" onClick={() => emblaApi?.scrollNext()} />

                    <div className="mt-3 flex gap-1.5" role="group" aria-label="Escolher banner">
                        {banners.map((banner, indice) => (
                            <button
                                key={banner.id}
                                type="button"
                                onClick={() => irPara(indice)}
                                aria-label={`Ir para o banner ${indice + 1}`}
                                aria-current={indice === atual}
                                className="group/barra relative h-6 flex-1 cursor-pointer"
                            >
                                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-border transition-colors group-hover/barra:bg-muted-foreground/40">
                                    {indice < atual && <span className="absolute inset-0 bg-primary/40" />}
                                    {indice === atual && (
                                        <span
                                            // key: reinicia a animação a cada troca
                                            key={`${atual}-${menosMovimento}`}
                                            className="banner-progresso absolute inset-0 origin-left bg-primary"
                                            style={{
                                                animationDuration: `${DURACAO_MS}ms`,
                                                animationPlayState: pausado ? "paused" : "running",
                                            }}
                                        />
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}

function SetaBanner({ lado, onClick }: { lado: "esquerda" | "direita"; onClick: () => void }) {
    const Icone = lado === "esquerda" ? ChevronLeft : ChevronRight
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={lado === "esquerda" ? "Banner anterior" : "Próximo banner"}
            className={cn(
                // Aparecem no hover (desktop); no celular a troca é pelo dedo
                "absolute top-[calc(50%-0.75rem)] hidden size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-background/85 text-foreground opacity-0 shadow-md backdrop-blur transition-opacity hover:bg-background focus-visible:opacity-100 group-hover/banners:opacity-100 md:grid",
                lado === "esquerda" ? "left-4" : "right-4",
            )}
        >
            <Icone className="size-5" aria-hidden="true" />
        </button>
    )
}
