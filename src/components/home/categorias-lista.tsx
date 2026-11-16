import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { categoriasLoja } from "@/lib/categorias-loja"
import { esportesPorGrupo, modalidades } from "@/lib/esportes"

const PILULA = "type-label inline-flex h-9 items-center rounded-full border border-border px-3.5 text-foreground transition-colors hover:border-foreground/40"

/**
 * Página Categorias: primeiro o que a pessoa procura, em cartões; depois as modalidades da bike
 * (e os outros esportes, quando abertos) em pílulas.
 * ponytail: cartões com ícone; quando houver fotos das categorias, entram no lugar do ícone.
 */
export function CategoriasLista() {
    return (
        <div className="flex flex-col gap-10">
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
                {categoriasLoja.map(({ slug, nome, descricao, href, icone: Icone }, i) => (
                    // O último fica com a linha inteira no celular quando a conta é ímpar
                    <li key={slug} className={categoriasLoja.length % 2 === 1 && i === categoriasLoja.length - 1 ? "col-span-2 md:col-span-1" : undefined}>
                        <Link
                            href={href}
                            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-foreground/30 hover:bg-surface-secondary"
                        >
                            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                                <Icone className="size-5" aria-hidden="true" />
                            </span>
                            <span className="flex flex-col gap-0.5">
                                <span className="type-label flex items-center gap-1 text-foreground">
                                    {nome}
                                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                </span>
                                <span className="type-caption text-muted-foreground">{descricao}</span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>

            <section aria-labelledby="modalidades-title" className="flex flex-col gap-3">
                <h2 id="modalidades-title" className="type-h3 text-foreground">Bikes por modalidade</h2>
                <ul className="flex flex-wrap gap-2">
                    {modalidades.map(({ slug, label }) => (
                        <li key={slug}>
                            <Link href={`/buscar?category=bikes&modality=${slug}`} className={PILULA}>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {esportesPorGrupo.map(({ grupo, esportes }) => (
                <section key={grupo} aria-label={grupo} className="flex flex-col gap-3">
                    <h2 className="type-h3 text-foreground">{grupo}</h2>
                    <ul className="flex flex-wrap gap-2">
                        {esportes.map(({ slug, nome }) => (
                            <li key={slug}>
                                <Link href={`/esportes/${slug}`} className={PILULA}>
                                    {nome}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    )
}
