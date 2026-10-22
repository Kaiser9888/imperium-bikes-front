import Link from "next/link"

import { categoriasDestaque, categoriasPorGrupo, type Categoria } from "@/lib/esportes"
import { cn } from "@/lib/utils"

/**
 * Mesmo botão sublinhado do "Publicar torneio", em tamanho menor.
 * Com `rolar`, uma linha que rola de lado (Home); sem ele, quebra linha.
 */
function Itens({ itens, rolar }: { itens: Categoria[]; rolar?: boolean }) {
    return (
        <ul
            className={cn(
                "flex gap-x-6 gap-y-1",
                rolar ? "-mx-4 overflow-x-auto whitespace-nowrap px-4 [scrollbar-width:none] sm:mx-0 sm:px-0" : "flex-wrap",
            )}
        >
            {itens.map(({ label, href }) => (
                <li key={href} className="shrink-0">
                    <Link href={href} className="underline-btn underline-btn--ink underline-btn--sm inline-block">
                        <span className="block py-1.5">{label}</span>
                    </Link>
                </li>
            ))}
        </ul>
    )
}

/** Home: só os atalhos principais, numa linha que rola de lado no celular. */
export function CategoriasDestaque() {
    return <Itens itens={categoriasDestaque} rolar />
}

/** Página Categorias: tudo, separado por grupo. */
export function CategoriasLista() {
    return (
        <div className="flex flex-col gap-7">
            {categoriasPorGrupo.map(({ titulo, itens }) => (
                <section key={titulo} aria-label={titulo} className="flex flex-col gap-3">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{titulo}</h2>
                    <Itens itens={itens} />
                </section>
            ))}
        </div>
    )
}
