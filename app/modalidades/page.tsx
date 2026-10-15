import type { Metadata } from "next"

import { CategoriasLista } from "@/components/home/categorias-lista"
import { PageHeading } from "@/components/layout/page-heading"

export const metadata: Metadata = { title: "Categorias | Imperium Bikes" }

export default function CategoriasPage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-3 sm:px-6 lg:px-8 lg:pt-6">
            <PageHeading
                title="Categorias"
                description="Escolha uma categoria para ver os produtos."
                back={{ href: "/", label: "Início" }}
            />
            <CategoriasLista />
        </main>
    )
}
