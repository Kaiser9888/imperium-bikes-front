import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type PageHeadingProps = {
    title: string
    description?: string
    back: { href: string; label: string }
}

/** Topo das páginas de listagem: link de volta, título e uma linha de apoio. */
export function PageHeading({ title, description, back }: PageHeadingProps) {
    return (
        <div>
            <Link
                href={back.href}
                className="type-label inline-flex h-11 items-center gap-2 text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {back.label}
            </Link>
            <h1 className="type-h1 mt-2 text-foreground">{title}</h1>
            {description && <p className="type-body-small mt-1 text-muted-foreground">{description}</p>}
        </div>
    )
}
