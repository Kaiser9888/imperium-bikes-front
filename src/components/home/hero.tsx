import Link from "next/link"
import { KeyRound, SearchCheck, ShieldCheck } from "lucide-react"

const GARANTIAS = [
    { icon: ShieldCheck, texto: "Pagamento retido até a entrega", href: "/reembolso" },
    { icon: KeyRound, texto: "Código na retirada em mãos", href: "/ajuda#compras" },
    { icon: SearchCheck, texto: "Consulta de bike roubada", href: "/seguranca/bike-roubada" },
]

/**
 * Faixa fina de garantias logo abaixo dos banners: o comprador vê banners e anúncios
 * na primeira tela, e as garantias continuam à vista sem empurrar nada para baixo.
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
                            className="flex h-full flex-col items-center gap-1.5 rounded-xl border border-border px-2 py-3 text-center text-xs font-medium text-foreground/80 hover:text-foreground sm:flex-row sm:justify-center sm:gap-2 sm:text-sm"
                        >
                            <Icone className="size-[18px] shrink-0 text-success" aria-hidden="true" />
                            <span className="text-balance">{texto}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <p className="mt-3 text-center text-sm text-muted-foreground">
                Quer vender?{" "}
                <Link href="/vendedor#publicar" className="font-medium text-foreground underline underline-offset-4">
                    Anunciar é grátis e você recebe 100% do preço
                </Link>
            </p>
        </section>
    )
}
