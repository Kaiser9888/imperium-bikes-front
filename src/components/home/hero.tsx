import Image from "next/image"
import Link from "next/link"
import { KeyRound, SearchCheck, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

const GARANTIAS = [
    { icon: ShieldCheck, texto: "Pagamento retido até a entrega", href: "/reembolso" },
    { icon: KeyRound, texto: "Código na retirada em mãos", href: "/ajuda#compras" },
    { icon: SearchCheck, texto: "Consulta de bike roubada", href: "/seguranca/bike-roubada" },
]

/**
 * Topo da Home no mesmo painel escuro de Eventos e da Central do vendedor (fixo nos dois temas):
 * o que é o site, as duas ações e as garantias numa faixa só, com uma foto de pedal ao fundo.
 */
export function Hero() {
    return (
        <section
            aria-labelledby="hero-title"
            className="relative isolate overflow-hidden rounded-2xl bg-[oklch(0.21_0.03_255)] text-white dark:bg-surface-secondary dark:ring-1 dark:ring-border"
        >
            <Image
                src="/header/cadastrodownhill.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 1280px) 1216px, 100vw"
                className="-z-20 object-cover object-[70%_center] opacity-35 sm:opacity-60"
            />
            {/* Degradê da esquerda: o texto fica sempre legível sobre a foto */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-r from-[oklch(0.21_0.03_255)] via-[oklch(0.21_0.03_255)]/90 to-[oklch(0.21_0.03_255)]/30 dark:from-surface-secondary dark:via-surface-secondary/90 dark:to-surface-secondary/30"
            />

            <div className="px-5 pb-5 pt-7 sm:px-8 sm:pb-6 sm:pt-10">
                <p className="type-caption font-semibold uppercase tracking-[0.2em] text-white/60">Marketplace de bikes</p>
                <h1 id="hero-title" className="type-h1 mt-2 max-w-xl text-balance text-white sm:text-4xl">
                    Compre e venda bike sem medo de golpe
                </h1>
                <p className="type-body-small mt-2 max-w-md text-white/75 sm:text-base">
                    O pagamento fica retido até você receber. Quem vende só recebe depois da entrega.
                </p>
                <div className="mt-6 flex gap-2 sm:gap-3">
                    <Button asChild variant="accent" size="lg" className="flex-1 border-transparent sm:flex-none">
                        <Link href="/produtos">Ver bikes</Link>
                    </Button>
                    <Button asChild variant="ghost" size="lg" className="flex-1 border border-white/30 text-white hover:bg-white/10 sm:flex-none">
                        <Link href="/vendedor#publicar">Anunciar</Link>
                    </Button>
                </div>

                <ul className="mt-7 grid gap-x-6 gap-y-2.5 border-t border-white/15 pt-5 sm:grid-cols-3">
                    {GARANTIAS.map(({ icon: Icone, texto, href }) => (
                        <li key={texto}>
                            <Link href={href} className="group flex items-center gap-2.5 text-sm font-medium text-white/85 hover:text-white">
                                <Icone className="size-[18px] shrink-0 text-success" aria-hidden="true" />
                                <span className="underline-offset-4 group-hover:underline">{texto}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
