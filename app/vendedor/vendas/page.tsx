import { BottomNav } from "@/components/layout/bottom-nav"
import { TopoFocado } from "@/components/layout/topo-focado"
import { ListaPedidos } from "@/components/marketplace/lista-pedidos"

/** Vendas do usuário: digitar o código de retirada, enviar, resolver disputa. */
export default function MinhasVendasPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <TopoFocado titulo="Minhas vendas" voltarPara="/vendedor" largura="max-w-3xl" />
            <main className="mx-auto w-full max-w-3xl px-4 pb-28 sm:px-6">
                <ListaPedidos lado="vendas" />
            </main>
            <BottomNav />
        </div>
    )
}
