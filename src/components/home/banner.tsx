import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

export type BannerAnuncio = {
    /** Arte do anúncio, proporção 16:7 (ex.: 1600x700), em /public/banners. */
    image: string
    /** Descreve o anúncio para leitores de tela. */
    alt: string
    href: string
}

// ponytail: lista fixa até existir backend de banners; cada item é uma campanha real
// com arte própria. Vazia, a Home simplesmente não mostra a faixa de anúncios.
const anuncios: BannerAnuncio[] = []

/** Faixa de anúncios e promoções da Home: até dois lado a lado no desktop, deslizável no celular. */
export function Banners({ banners = anuncios }: { banners?: BannerAnuncio[] }) {
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
                {banners.map(({ image, alt, href }, index) => (
                    <li key={href + image} className={cn("shrink-0 snap-center md:w-auto", unico ? "w-full" : "w-[88%]")}>
                        {/* Sem borda nem sombra: a arte encosta direto no fundo da página */}
                        <Link
                            href={href}
                            className="relative block aspect-[16/7] overflow-hidden rounded-2xl bg-surface-muted transition-opacity hover:opacity-90"
                        >
                            <Image
                                src={image}
                                alt={alt}
                                fill
                                priority={index === 0}
                                sizes={unico ? "(min-width: 1280px) 1216px, 100vw" : "(min-width: 768px) 50vw, 88vw"}
                                className="object-cover"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
