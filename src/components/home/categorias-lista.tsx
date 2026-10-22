import Link from "next/link"

import { categoriasDestaque, categoriasPorGrupo, type Categoria } from "@/lib/esportes"
import { cn } from "@/lib/utils"

/** Pílula pequena e discreta; vários esportes cabem sem pesar na tela. */
function Itens({ itens, rolar }: { itens: Categoria[]; rolar?: boolean }) {
    return (
        <ul
            className={cn(
                "flex gap-2",
                rolar ? "-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" : "flex-wrap",
            )}
        >
            {itens.map(({ label, href }) => (
                <li key={href} className="shrink-0">
                    <Link
                        href={href}
                        className="inline-flex h-9 items-center whitespace-nowrap rounded-full border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        {label}
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
