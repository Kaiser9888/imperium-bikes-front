import Link from "next/link"

import { categoriasDestaque } from "@/lib/esportes"

const BOTAO = "type-label inline-flex h-9 items-center rounded-xl border border-border px-3.5 text-foreground transition-colors hover:border-primary/40"

/** Atalhos de categoria em botões, numa linha que rola de lado no celular (sem título: menos é mais). */
export function CategoriasSection() {
    return (
        <nav aria-label="Categorias">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
                {categoriasDestaque.map(({ label, href }) => (
                    <li key={href} className="shrink-0">
                        <Link href={href} className={BOTAO}>
                            {label}
                        </Link>
                    </li>
                ))}
                <li className="shrink-0">
                    <Link href="/modalidades" className={`${BOTAO} text-muted-foreground`}>
                        Ver todas
                    </Link>
                </li>
            </ul>
        </nav>
    )
}
