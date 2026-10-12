import Link from "next/link"
import { ArrowRight } from "lucide-react"

type HomeSectionProps = {
    id: string
    title: string
    description?: string
    /** Só informe quando a página de destino existir de verdade. */
    href?: string
    hrefLabel?: string
    children: React.ReactNode
}

/** Cabeçalho padrão das seções da Home: título sobre um filete e o atalho "Ver todos". */
export function HomeSection({ id, title, description, href, hrefLabel = "Ver todos", children }: HomeSectionProps) {
    const titleId = `${id}-title`
    return (
        <section aria-labelledby={titleId} className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                <div className="min-w-0">
                    <h2 id={titleId} className="type-h2 text-foreground">
                        {title}
                    </h2>
                    {description && <p className="type-body-small mt-1 text-muted-foreground">{description}</p>}
                </div>
                {href && (
                    <Link
                        href={href}
                        className="type-label group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border px-4 text-foreground transition-colors hover:bg-surface-muted"
                    >
                        {hrefLabel}
                        <ArrowRight
                            className="size-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                        />
                    </Link>
                )}
            </div>
            {children}
        </section>
    )
}
