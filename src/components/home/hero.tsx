import Link from "next/link"
import { KeyRound, SearchCheck, ShieldCheck } from "lucide-react"

const GARANTIAS = [
    { icon: ShieldCheck, texto: "Pagamento retido até a entrega", href: "/reembolso" },
    { icon: KeyRound, texto: "Código na retirada em mãos", href: "/ajuda#compras" },
    { icon: SearchCheck, texto: "Consulta de bike roubada", href: "/seguranca/bike-roubada" },
]

/**
 * Faixa fina das garantias, logo abaixo dos banners. O título da página fica só para
 * leitores de tela e para o Google: na tela, os banners e as categorias já dizem o que é o site.
 */
export function Hero() {
    return (
        <section aria-labelledby="hero-title">
            <h1 id="hero-title" className="sr-only">
                Imperium Bikes: compre e venda bike sem medo de golpe
            </h1>
            <ul className="grid grid-cols-3 gap-2 sm:gap-3">
                {GARANTIAS.map(({ icon: Icone, texto, href }) => (
                    <li key={texto}>
                        <Link
                            href={href}
                            className="flex h-full flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface px-2 py-3 text-center transition-colors hover:border-success/40 sm:flex-row sm:gap-3 sm:px-4 sm:text-left"
                        >
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success/12 text-success sm:size-9">
                                <Icone className="size-4 sm:size-5" aria-hidden="true" />
                            </span>
                            <span className="text-[0.6875rem] font-semibold leading-tight text-foreground sm:text-sm">{texto}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    )
}
