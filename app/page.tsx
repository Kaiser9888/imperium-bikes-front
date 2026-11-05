import { AppShell } from "@/components/layout/app-shell"
import { Footer } from "@/components/layout/footer"
import { Banners } from "@/components/home/banner"
import { CategoriasSection } from "@/components/home/categorias-section"
import { Hero } from "@/components/home/hero"
import { ProdutosDestaque } from "@/components/home/produtos-destaque"

export default function Page() {
    return (
        <AppShell footer={<Footer />}>
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-16 pt-5 sm:px-6 lg:gap-10 lg:px-8 lg:pt-8">
                {/* Banners primeiro (a mensagem vai na arte); garantias numa faixa fina logo abaixo */}
                <Banners />
                <Hero />
                <CategoriasSection />
                <ProdutosDestaque />
            </main>
        </AppShell>
    )
}
