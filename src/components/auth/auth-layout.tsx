import Image from "next/image"
import { Logo } from "@/components/layout/logo"

type AuthLayoutProps = {
    title: string
    description: string
    /** Foto de fundo da tela inteira (celular e computador). */
    image: string
    /** Frase de efeito sobre a foto: linha pequena em cima e o título grande. */
    kicker: string
    headline: string
    /** Pontos curtos abaixo da frase (opcional). */
    highlights?: string[]
    /** No computador: frase no alto ou embaixo, para não cobrir o ciclista da foto. */
    headlineAt?: "top" | "bottom"
    children: React.ReactNode
    footer: React.ReactNode
}

/**
 * Telas de entrar e cadastrar: foto em tela cheia com o formulário num cartão por cima.
 * No celular a frase fica no alto da foto e o cartão logo abaixo; no computador, lado a lado.
 */
export function AuthLayout({ title, description, image, kicker, headline, highlights, headlineAt = "bottom", children, footer }: AuthLayoutProps) {
    return (
        <div className="relative isolate min-h-dvh overflow-hidden bg-black">
            <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[50%_30%]" />
            {/* Escurece a foto para o texto branco e o cartão se destacarem */}
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-black/60 to-black lg:bg-gradient-to-r lg:from-black/90 lg:via-black/55 lg:to-black/10"
            />
            <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-gradient-to-b from-black/55 via-transparent to-black/55 lg:block" />

            <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-12">
                <section
                    className={`pt-[3vh] text-white sm:pt-[12vh] lg:order-2 lg:max-w-md ${headlineAt === "top" ? "lg:self-start lg:pt-4" : "lg:self-end lg:pt-0 lg:pb-6"}`}
                >
                    <p className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.3em] text-white/80">
                        <span aria-hidden="true" className="h-3.5 w-1 bg-primary" />
                        {kicker}
                    </p>
                    <p className="mt-3 text-2xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-4xl lg:text-5xl">
                        {headline}
                    </p>
                    {highlights && highlights.length > 0 && (
                        <ul className="mt-5 hidden flex-wrap gap-2 sm:flex">
                            {highlights.map((item) => (
                                <li
                                    key={item}
                                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <main className="w-full rounded-2xl border border-foreground/80 bg-background p-6 shadow-[6px_6px_0_var(--primary)] sm:mx-auto sm:max-w-md sm:p-8 lg:mx-0 lg:order-1">
                    <Logo className="w-fit" />
                    <h1 className="type-h1 mt-6 text-foreground">{title}</h1>
                    <p className="type-body-small mt-2 text-muted-foreground">{description}</p>
                    <div className="mt-7">{children}</div>
                    <p className="type-body-small mt-7 border-t border-border pt-5 text-center text-muted-foreground">{footer}</p>
                </main>
            </div>
        </div>
    )
}
