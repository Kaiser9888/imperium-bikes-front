import Link from "next/link"

import { HomeSection } from "@/components/home/home-section"

const modalidades = [
    { label: "Downhill", href: "/modalidades/downhill" },
    { label: "BMX", href: "/modalidades/bmx" },
    { label: "Mountain Bike", href: "/modalidades/mountain" },
    { label: "Speed", href: "/modalidades/speed" },
    { label: "Urbana", href: "/modalidades/urbana" },
    { label: "Outros", href: "/modalidades/outros" },
]

export function ModalidadesSection() {
    return (
        <HomeSection id="modalidades" title="Modalidades" href="/modalidades" hrefLabel="Ver todas">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {modalidades.map(({ label, href }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className="type-label flex h-14 items-center justify-center rounded-xl bg-surface-muted px-3 text-center text-foreground transition-colors hover:bg-primary hover:text-primary-foreground active:bg-primary-hover active:text-primary-foreground"
                        >
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </HomeSection>
    )
}
