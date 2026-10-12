import Link from "next/link"

import { HomeSection } from "@/components/home/home-section"
import { esportes } from "@/lib/esportes"

export function EsportesSection() {
    return (
        <HomeSection id="esportes" title="Esportes">
            <ul className="flex flex-wrap gap-2">
                {esportes.map(({ slug, nome }) => (
                    <li key={slug}>
                        <Link
                            href={`/esportes/${slug}`}
                            className="type-label inline-flex h-11 items-center rounded-full bg-surface-muted px-5 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground active:bg-primary-hover active:text-primary-foreground"
                        >
                            {nome}
                        </Link>
                    </li>
                ))}
            </ul>
        </HomeSection>
    )
}
