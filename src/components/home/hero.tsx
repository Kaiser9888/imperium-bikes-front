import Link from "next/link"
import { KeyRound, SearchCheck, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

const GARANTIAS = [
    { icon: ShieldCheck, texto: "Pagamento retido até a entrega", href: "/reembolso" },
    { icon: KeyRound, texto: "Código na retirada em mãos", href: "/ajuda#compras" },
    { icon: SearchCheck, texto: "Consulta de bike roubada", href: "/seguranca/bike-roubada" },
]

/** Topo da Home: o que é o site em uma frase, as duas ações principais e as garantias. */
export function Hero() {
    return (
        <section aria-labelledby="hero-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 id="hero-title" className="type-h1 text-foreground">
                        Compre e venda bike sem medo de golpe
                    </h1>
                    <p className="type-body-small mt-1.5 text-muted-foreground">
                        O pagamento fica retido até você receber. Quem vende só recebe depois da entrega.
                    </p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button asChild className="flex-1 sm:flex-none">
                        <Link href="/produtos">Ver bikes</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 sm:flex-none">
                        <Link href="/vendedor#publicar">Anunciar</Link>
                    </Button>
                </div>
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
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
