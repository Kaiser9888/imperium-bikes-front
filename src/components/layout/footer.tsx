import Link from "next/link"

import { OrcaMark } from "@/components/layout/logo"
import { PreferenciasCookiesLink } from "@/components/layout/preferencias-cookies-link"
import { Sigillum } from "@/components/layout/sigillum"
import { documentoEmpresa, empresa } from "@/lib/empresa"

// Somente rotas que existem no app.
const grupos = [
    {
        titulo: "Explorar",
        links: [
            { label: "Eventos", href: "/torneios" },
            { label: "Vídeos", href: "/videos" },
            { label: "Categorias", href: "/modalidades" },
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
    {
        titulo: "Ajuda",
        links: [
            { label: "Central de Ajuda", href: "/ajuda" },
            { label: "Falar com o suporte", href: "/ajuda/contato" },
            { label: "Termos de Uso", href: "/termos" },
            { label: "Privacidade", href: "/privacidade" },
            { label: "Reembolso", href: "/reembolso" },
        ],
    },
]

const legais = [
    { label: "Ajuda", href: "/ajuda" },
    { label: "Termos", href: "/termos" },
    { label: "Privacidade", href: "/privacidade" },
    { label: "Reembolso", href: "/reembolso" },
]

export function Footer() {
    // Dados legais exigidos em sites de venda (Decreto 7.962/2013): só o que estiver preenchido em lib/empresa
    const dadosLegais = [empresa.razaoSocial, documentoEmpresa(), empresa.endereco].filter(Boolean)

    return (
        <footer className="border-t border-border bg-surface-secondary">
            {/* Celular: o menu e a barra de baixo já levam a tudo; aqui ficam só os links legais */}
            <nav aria-label="Rodapé" className="mx-auto flex w-full max-w-7xl flex-wrap gap-x-5 px-4 pt-6 md:hidden">
                {legais.map((link) => (
                    <Link key={link.href} href={link.href} className="type-caption inline-flex h-9 items-center text-muted-foreground hover:text-foreground">
                        {link.label}
                    </Link>
                ))}
                <PreferenciasCookiesLink className="type-caption" label="Cookies" />
            </nav>

            <div className="mx-auto hidden w-full max-w-7xl gap-10 px-4 pb-10 pt-12 sm:px-6 md:flex md:justify-between lg:px-8">
                <div className="max-w-xs">
                    <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg">
                        <OrcaMark className="h-8" />
                        <span className="brand-name text-2xl">Imperium Bikes</span>
                    </Link>
                    <p className="type-body-small mt-3 text-muted-foreground">
                        Bikes, peças, eventos e vídeos de ciclismo em um só lugar.
                    </p>
                </div>

                <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-12 gap-y-8 sm:flex sm:gap-20">
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
                                {grupo.titulo === "Ajuda" && (
                                    <li>
                                        <PreferenciasCookiesLink />
                                    </li>
                                )}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>
            <div className="mx-auto w-full max-w-7xl px-4 pb-4 pt-2 sm:px-6 md:border-t md:border-border md:pt-5 lg:px-8">
                <div className="hidden md:block">
                    <Sigillum />
                </div>
                <p className="type-caption text-muted-foreground md:mt-4">
                    © {new Date().getFullYear()} {empresa.marca}
                    {dadosLegais.length > 0 && <> · {dadosLegais.join(" · ")}</>}
                    {empresa.emailContato && (
                        <>
                            {" · "}
                            <a href={`mailto:${empresa.emailContato}`} className="underline underline-offset-2 hover:text-foreground">
                                {empresa.emailContato}
                            </a>
                        </>
                    )}
                </p>
            </div>
        </footer>
    )
}
