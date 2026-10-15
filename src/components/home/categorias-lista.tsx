import Link from "next/link"

import { categorias } from "@/lib/esportes"

/** Mesmo botão sublinhado do "Publicar torneio". */
export function CategoriasLista() {
    return (
        <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {categorias.map(({ label, href }) => (
                <li key={href}>
                    <Link href={href} className="underline-btn underline-btn--ink inline-block">
                        <span className="block py-1.5">{label}</span>
                    </Link>
                </li>
            ))}
        </ul>
    )
}
