import Link from "next/link"
import { KeyRound, SearchCheck, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

const GARANTIAS = [
    { icon: ShieldCheck, texto: "Pagamento retido até a entrega" },
    { icon: KeyRound, texto: "Código na retirada em mãos" },
    { icon: SearchCheck, texto: "Consulta de bike roubada" },
]

/** Primeira coisa da Home: o que é o site e por que comprar aqui, sem parágrafo. */
export function Hero() {
    return (
        <section aria-labelledby="hero-title">
            <h1 id="hero-title" className="type-display max-w-2xl text-balance text-foreground">
                Compre e venda bike <span className="text-primary">sem medo de golpe.</span>
            </h1>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {GARANTIAS.map(({ icon: Icone, texto }) => (
                    <li key={texto} className="type-caption flex items-center gap-1.5 text-muted-foreground">
                        <Icone className="size-4 text-success" aria-hidden="true" />
                        {texto}
                    </li>
                ))}
            </ul>
            <div className="mt-5 flex gap-3">
                <Button asChild size="lg" className="flex-1 sm:flex-none">
                    <Link href="/produtos">Ver anúncios</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="flex-1 sm:flex-none">
                    <Link href="/publicar">Vender</Link>
                </Button>
            </div>
        </section>
    )
}
