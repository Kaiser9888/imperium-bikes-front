import { CategoriasLista } from "@/components/home/categorias-lista"
import { HomeSection } from "@/components/home/home-section"

export function CategoriasSection() {
    return (
        <HomeSection id="categorias" title="Categorias" href="/modalidades" hrefLabel="Ver todas">
            <CategoriasLista />
        </HomeSection>
    )
}
