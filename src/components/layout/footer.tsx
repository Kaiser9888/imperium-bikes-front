import Link from "next/link"

import { OrcaMark } from "@/components/layout/logo"

// Somente rotas que existem no app.
const grupos = [
    {
        titulo: "Explorar",
        links: [
            { label: "Eventos", href: "/torneios" },
            { label: "Vídeos", href: "/videos" },
            { label: "Modalidades", href: "/modalidades" },
        ],
    },
    {
        titulo: "Marketplace",
        links: [
            { label: "Produtos", href: "/produtos" },
            { label: "Favoritos", href: "/favoritos" },
            { label: "Central do vendedor", href: "/vendedor" },
        ],
    },
]

export function Footer() {
    return (
        <footer className="border-t border-border bg-surface-secondary">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-32 pt-12 sm:px-6 md:flex-row md:justify-between lg:px-8">
                <div className="max-w-xs">
                    <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg">
                        <OrcaMark className="h-8" />
                        <span className="type-h3 text-foreground">Imperium Bikes</span>
                    </Link>
                    <p className="type-body-small mt-3 text-muted-foreground">
                        Bikes, peças, eventos e vídeos de ciclismo em um só lugar.
                    </p>
                </div>

                <nav aria-label="Rodapé" className="flex gap-12 sm:gap-20">
                    {grupos.map((grupo) => (
                        <div key={grupo.titulo}>
                            <p className="type-label text-foreground">{grupo.titulo}</p>
                            <ul className="mt-2 flex flex-col">
                                {grupo.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="type-body-small inline-flex h-9 items-center rounded-lg text-muted-foreground hover:text-foreground"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>
        </footer>
    )
}
