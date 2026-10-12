import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PageHeading } from "@/components/layout/page-heading"
import { CatalogoFiltrado } from "@/components/marketplace/catalogo-filtrado"
import { modalidades } from "@/lib/esportes"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
    return modalidades.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const modalidade = modalidades.find((item) => item.slug === slug)
    return modalidade ? { title: `${modalidade.label} | Imperium Bikes` } : {}
}

export default async function ModalidadePage({ params }: Props) {
    const { slug } = await params
    const modalidade = modalidades.find((item) => item.slug === slug)
    if (!modalidade) notFound()

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-3 sm:px-6 lg:px-8 lg:pt-6">
            <PageHeading
                title={modalidade.label}
                description="Bikes, peças e acessórios anunciados nesta modalidade."
                back={{ href: "/modalidades", label: "Modalidades" }}
            />
            <CatalogoFiltrado category={modalidade.categoria} tipos={modalidade.tipos} />
        </main>
    )
}
