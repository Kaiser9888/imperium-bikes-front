import type { Metadata } from "next"

import { ModalidadeTile, tileGridClasses } from "@/components/home/modalidade-tile"
import { PageHeading } from "@/components/layout/page-heading"
import { modalidades } from "@/lib/esportes"

export const metadata: Metadata = { title: "Modalidades | Imperium Bikes" }

export default function ModalidadesPage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-3 sm:px-6 lg:px-8 lg:pt-6">
            <PageHeading
                title="Modalidades"
                description="Escolha uma modalidade para ver os produtos."
                back={{ href: "/", label: "Início" }}
            />
            <ul className={tileGridClasses}>
                {modalidades.map((modalidade) => (
                    <li key={modalidade.slug}>
                        <ModalidadeTile {...modalidade} />
                    </li>
                ))}
            </ul>
        </main>
    )
}
