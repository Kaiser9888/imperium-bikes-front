import Link from "next/link"

import { categoriasLoja } from "@/lib/categorias-loja"

const BOTAO = "type-label inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5 text-foreground transition-colors hover:border-foreground/40 [&_svg]:size-4 [&_svg]:text-muted-foreground"

/**
 * Atalhos da Home: o que a pessoa procura (Bikes, Peças...), numa linha que rola de lado no celular.
 * "Mais" leva à página Categorias, que também tem as modalidades.
 */
export function CategoriasSection() {
    return (
        <nav aria-label="Categorias">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
                {categoriasLoja.map(({ slug, curto, href, icone: Icone }) => (
                    <li key={slug} className="shrink-0">
                        <Link href={href} className={BOTAO}>
                            <Icone aria-hidden="true" />
                            {curto}
                        </Link>
                    </li>
                ))}
                <li className="shrink-0">
                    <Link href="/modalidades" className={`${BOTAO} text-muted-foreground`}>
                        Mais
                    </Link>
                </li>
            </ul>
        </nav>
    )
}
