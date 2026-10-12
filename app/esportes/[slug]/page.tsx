import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { sportGridClasses } from "@/components/home/esportes-section"
import { SportCard } from "@/components/home/SportCard"
import { AppShell } from "@/components/layout/app-shell"
import { esportes } from "@/lib/esportes"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
    return esportes.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const esporte = esportes.find((item) => item.slug === slug)
    return esporte ? { title: `${esporte.nome} | Imperium Sports` } : {}
}

export default async function EsportePage({ params }: Props) {
    const { slug } = await params
    const esporte = esportes.find((item) => item.slug === slug)
    if (!esporte) notFound()

    return (
        <AppShell>
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-5 sm:px-6 lg:px-8 lg:pt-8">
                <Link
                    href="/"
                    className="type-label inline-flex h-11 items-center gap-2 self-start text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Início
                </Link>
                <div>
                    <h1 className="type-h1 text-foreground">{esporte.nome}</h1>
                    <p className="type-body-small mt-1 text-muted-foreground">Escolha uma modalidade.</p>
                </div>
                <ul className={sportGridClasses}>
                    {esporte.modalidades.map(({ nome, imagem, href }) => (
                        <li key={href}>
                            <SportCard label={nome} image={imagem} href={href} />
                        </li>
                    ))}
                </ul>
            </main>
        </AppShell>
    )
}
