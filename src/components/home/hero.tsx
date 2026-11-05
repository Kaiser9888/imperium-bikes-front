import Link from "next/link"
import { KeyRound, SearchCheck, ShieldCheck } from "lucide-react"

const GARANTIAS = [
    { icon: ShieldCheck, texto: "Dinheiro de volta", href: "/protecao" },
    { icon: KeyRound, texto: "Código na retirada", href: "/ajuda#compras" },
    { icon: SearchCheck, texto: "Bike roubada?", href: "/seguranca/bike-roubada" },
]

/**
 * Faixa fina de garantias logo abaixo dos banners: uma linha só, para os anúncios
 * aparecerem na primeira tela.
 */
export function Hero() {
    return (
        <section aria-labelledby="hero-title" className="flex flex-col items-center gap-2">
            <h1 id="hero-title" className="sr-only">
                Imperium Bikes: compre e venda bike sem medo de golpe
            </h1>
            <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                {GARANTIAS.map(({ icon: Icone, texto, href }) => (
                    <li key={texto}>
                        <Link href={href} className="flex items-center gap-1 text-xs font-medium text-foreground/80 hover:text-foreground sm:text-sm">
                            <Icone className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                            {texto}
                        </Link>
                    </li>
                ))}
            </ul>
            <p className="text-xs text-muted-foreground sm:text-sm">
                Quer vender?{" "}
                <Link href="/vendedor#publicar" className="font-medium text-foreground underline underline-offset-4">
                    Anunciar é grátis
                </Link>
            </p>
        </section>
    )
}
