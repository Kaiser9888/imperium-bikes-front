import { HomeSection } from "@/components/home/home-section"
import { ModalidadeTile, tileGridClasses } from "@/components/home/modalidade-tile"
import { modalidades } from "@/lib/esportes"

export function ModalidadesSection() {
    return (
        <HomeSection id="modalidades" title="Modalidades" href="/modalidades" hrefLabel="Ver todas">
            <ul className={tileGridClasses}>
                {modalidades.map((modalidade) => (
                    <li key={modalidade.href}>
                        <ModalidadeTile {...modalidade} />
                    </li>
                ))}
            </ul>
        </HomeSection>
    )
}
