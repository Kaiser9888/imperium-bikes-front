import { AppShell } from "@/components/layout/app-shell"
import { Footer } from "@/components/layout/footer"
import { Banners } from "@/components/home/banner"
import { CategoriasSection } from "@/components/home/categorias-section"
import { ProdutosDestaque } from "@/components/home/produtos-destaque"

export default function Page() {
    return (
        <AppShell>
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-5 sm:px-6 lg:gap-14 lg:px-8 lg:pt-8">
                <h1 className="sr-only">Imperium Bikes</h1>
                <Banners />
                <CategoriasSection />
                <ProdutosDestaque />
            </main>

            <Footer />
        </AppShell>
    )
}
