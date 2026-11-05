import Link from "next/link"

import { categoriasPorGrupo, type Categoria } from "@/lib/esportes"

/** Mesmo botão sublinhado do "Publicar evento", em tamanho menor. */
function Itens({ itens }: { itens: Categoria[] }) {
    return (
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
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
