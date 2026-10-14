import { BackButton } from "@/components/ui/back-button"

type PageHeadingProps = {
    title: string
    description?: string
    back: { href: string; label: string }
}

/** Topo das páginas de listagem: botão de voltar, título e uma linha de apoio. */
export function PageHeading({ title, description, back }: PageHeadingProps) {
    return (
        <div>
            <BackButton href={back.href} label={back.label} className="-ml-2.5" />
            <h1 className="type-h1 mt-2 text-foreground">{title}</h1>
            {description && <p className="type-body-small mt-1 text-muted-foreground">{description}</p>}
        </div>
    )
}
