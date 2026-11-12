import { BottomNav } from "@/components/layout/bottom-nav"
import { Logo } from "@/components/layout/logo"
import { ListaPedidos } from "@/components/marketplace/lista-pedidos"
import { BackButton } from "@/components/ui/back-button"

/** Vendas do usuário: digitar o código de retirada, enviar, resolver disputa. */
export default function MinhasVendasPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
                <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2.5 md:px-6">
                    <BackButton href="/vendedor" />
                    <h1 className="font-heading text-lg font-bold">Minhas vendas</h1>
                    <Logo compact className="ml-auto" />
                </div>
            </header>
            <main className="mx-auto w-full max-w-3xl px-4 pb-28 sm:px-6">
                <ListaPedidos lado="vendas" />
            </main>
            <BottomNav />
        </div>
    )
}
