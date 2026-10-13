import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { CatalogoFiltrado } from "@/components/marketplace/catalogo-filtrado"
import { esportes } from "@/lib/esportes"
import { TIPOS_POR_ESPORTE } from "@/lib/publicar/taxonomia"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
    return esportes.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const esporte = esportes.find((item) => item.slug === slug)
    return esporte ? { title: `${esporte.nome} | Imperium Bikes` } : {}
}

export default async function EsportePage({ params }: Props) {
    const { slug } = await params
    const esporte = esportes.find((item) => item.slug === slug)
    if (!esporte) notFound()

    return (
        <AppShell>
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-3 sm:px-6 lg:px-8 lg:pt-6">
                <PageHeading
                    title={esporte.nome}
                    description="Produtos anunciados para este esporte."
                    back={{ href: "/", label: "Início" }}
                />
                <CatalogoFiltrado sport={esporte.slug} tipos={TIPOS_POR_ESPORTE[esporte.slug]} />
            </main>
        </AppShell>
    )
}
