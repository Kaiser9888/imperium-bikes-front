import { AppShell } from "@/components/layout/app-shell"
import { Footer } from "@/components/layout/footer"
import { Banners } from "@/components/home/banner"
import { CategoriasSection } from "@/components/home/categorias-section"
import { Hero } from "@/components/home/hero"
import { ProdutosDestaque } from "@/components/home/produtos-destaque"

export default function Page() {
    return (
        <AppShell>
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-5 sm:px-6 lg:gap-14 lg:px-8 lg:pt-8">
                {/* Banners no topo e, colada neles, a faixa das garantias */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    <Banners />
                    <Hero />
                </div>
                <CategoriasSection />
                <ProdutosDestaque />
            </main>

            <Footer />
        </AppShell>
    )
}
