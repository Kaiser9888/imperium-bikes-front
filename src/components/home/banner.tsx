"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { bannerService, type Banner } from "@/services/adminService"

/** Faixa de anúncios e promoções da Home (cadastrados em /admin): até dois lado a lado no desktop, deslizável no celular. */
export function Banners() {
    const [banners, setBanners] = useState<Banner[]>([])

    useEffect(() => {
        let ativo = true
        bannerService.ativos().then((lista) => ativo && setBanners(lista)).catch(() => {})
        return () => {
            ativo = false
        }
    }, [])

    if (banners.length === 0) return null
    const unico = banners.length === 1

    return (
        <section aria-label="Anúncios e promoções">
            <ul
                className={cn(
                    "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden",
                    unico ? "md:grid-cols-1" : "md:grid-cols-2",
                )}
            >
                {banners.map(({ id, imageUrl, alt, linkUrl }) => (
                    <li key={id} className={cn("shrink-0 snap-center md:w-auto", unico ? "w-full" : "w-[88%]")}>
                        {/* Sem borda nem sombra: a arte encosta direto no fundo da página */}
                        <Link
                            href={linkUrl}
                            className="relative block aspect-[16/7] overflow-hidden rounded-2xl bg-surface-muted transition-opacity hover:opacity-90"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element -- arte do painel: data URL ou link externo */}
                            <img src={imageUrl} alt={alt} className="size-full object-cover" />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
