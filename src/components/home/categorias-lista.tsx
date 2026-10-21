import Link from "next/link"

import { categorias } from "@/lib/esportes"
import { cn } from "@/lib/utils"

/**
 * Mesmo botão sublinhado do "Publicar torneio".
 * Com `limite`, mostra só as primeiras numa linha que rola de lado (Home);
 * sem ele, todas quebrando linha (página Categorias).
 */
export function CategoriasLista({ limite }: { limite?: number }) {
    const itens = limite ? categorias.slice(0, limite) : categorias
    return (
        <ul
            className={cn(
                "flex gap-x-7 gap-y-2",
                limite ? "-mx-4 overflow-x-auto whitespace-nowrap px-4 [scrollbar-width:none] sm:mx-0 sm:px-0" : "flex-wrap",
            )}
        >
            {itens.map(({ label, href }) => (
                <li key={href} className="shrink-0">
                    <Link href={href} className="underline-btn underline-btn--ink inline-block">
                        <span className="block py-1.5">{label}</span>
                    </Link>
                </li>
            ))}
        </ul>
    )
}
