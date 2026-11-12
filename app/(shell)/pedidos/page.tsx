import { redirect } from "next/navigation"

import { PageHeading } from "@/components/layout/page-heading"
import { ListaPedidos } from "@/components/marketplace/lista-pedidos"

/** Só as compras. As vendas ficam na Central do vendedor. */
export default async function PedidosPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
    // Link antigo das vendas (/pedidos?aba=vendas)
    if ((await searchParams).aba === "vendas") redirect("/vendedor/vendas")

    return (
        <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 sm:px-6">
            <PageHeading title="Meus pedidos" back={{ href: "/", label: "Início" }} />
            <ListaPedidos lado="compras" />
        </main>
    )
}
