import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export type BannerContent = {
    eyebrow: string
    title: string
    description: string
    primaryAction: { label: string; href: string }
    secondaryAction?: { label: string; href: string }
}

// Banner institucional. Sem backend de banners não há campanha, preço ou desconto aqui.
const institucional: BannerContent = {
    eyebrow: "Imperium Sports",
    title: "Eventos, vídeos e produtos esportivos em um só lugar",
    description: "Inscreva-se em competições, acompanhe quem pratica e compre ou venda equipamentos.",
    primaryAction: { label: "Criar evento", href: "/torneios/criar" },
    secondaryAction: { label: "Ver eventos", href: "/torneios" },
}

type BannerProps = {
    /** Futuro: conteúdo vindo do backend de banners. Sem ele, usa o institucional. */
    content?: BannerContent
}

export function Banner({ content = institucional }: BannerProps) {
    const { eyebrow, title, description, primaryAction, secondaryAction } = content
    return (
        <section aria-labelledby="banner-title" className="relative overflow-hidden rounded-2xl bg-surface-muted">
            <div className="relative z-10 flex max-w-2xl flex-col items-start gap-4 px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20">
                <p className="type-label flex items-center gap-2 text-primary">
                    <span className="h-px w-6 bg-primary" aria-hidden="true" />
                    {eyebrow}
                </p>
                <h1 id="banner-title" className="type-display text-balance text-foreground">
                    {title}
                </h1>
                <p className="type-body max-w-md text-pretty text-muted-foreground">{description}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                    <Button asChild variant="accent" size="lg">
                        <Link href={primaryAction.href}>{primaryAction.label}</Link>
                    </Button>
                    {secondaryAction && (
                        <Button asChild variant="outline" size="lg">
                            <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* A orca é a marca: decorativa aqui, o nome já está no texto */}
            <Image
                src="/logo1.png"
                alt=""
                width={446}
                height={331}
                priority
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-6 -right-10 w-56 opacity-10 mix-blend-multiply sm:w-80 md:-right-6 md:bottom-auto md:top-1/2 md:w-[26rem] md:-translate-y-1/2 md:opacity-90 lg:right-10 lg:w-[30rem] dark:invert dark:mix-blend-screen"
            />
        </section>
    )
}
