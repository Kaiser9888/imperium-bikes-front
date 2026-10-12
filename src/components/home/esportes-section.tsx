import { HomeSection } from "@/components/home/home-section"
import { SportCard } from "@/components/home/SportCard"
import { esportes } from "@/lib/esportes"

export const sportGridClasses = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"

export function EsportesSection() {
    return (
        <HomeSection id="esportes" title="Esportes" description="Escolha um esporte para ver as modalidades.">
            <ul className={sportGridClasses}>
                {esportes.map(({ slug, nome, imagem }) => (
                    <li key={slug}>
                        <SportCard label={nome} image={imagem} href={`/esportes/${slug}`} />
                    </li>
                ))}
            </ul>
        </HomeSection>
    )
}
