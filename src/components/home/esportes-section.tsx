import { HomeSection } from "@/components/home/home-section"
import { SportCard } from "@/components/home/SportCard"

// Ordem fixa por enquanto; no futuro pode vir ordenada por buscas, eventos ou participantes.
const modalidades = [
    { label: "Downhill", image: "/images/mod-downhill.png", href: "/modalidades/downhill" },
    { label: "BMX", image: "/images/mod-bmx.png", href: "/modalidades/bmx" },
    { label: "Mountain", image: "/images/mod-mountain.png", href: "/modalidades/mountain" },
    { label: "Speed", image: "/images/mod-speed.png", href: "/modalidades/speed" },
    { label: "Urbana", image: "/images/mod-urbana.png", href: "/modalidades/urbana" },
    { label: "Outros", image: "/images/mod-outros.png", href: "/modalidades/outros" },
]

export function ModalidadesSection() {
    return (
        <HomeSection
            id="esportes"
            title="Esportes"
            description="Escolha uma modalidade e veja o que há para ela."
            href="/modalidades"
            hrefLabel="Ver todas"
        >
            <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
                {modalidades.map((modalidade) => (
                    <li key={modalidade.label} className="w-36 shrink-0 snap-start lg:w-auto">
                        <SportCard {...modalidade} />
                    </li>
                ))}
            </ul>
        </HomeSection>
    )
}
