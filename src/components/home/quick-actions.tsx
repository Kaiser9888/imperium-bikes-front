import { PlaySquare, MessagesSquare, Heart } from "lucide-react"

const shortcuts = [
    { icon: PlaySquare, label: "Vídeos", href: "/videos" },
    { icon: MessagesSquare, label: "Fórum", href: "/forum" },
    { icon: Heart, label: "Favoritos", href: "/favoritos" },
]

export function QuickActions() {
    return (
        <section aria-label="Atalhos" className="px-4">
            <div className="grid grid-cols-3 gap-3">
                {shortcuts.map(({ icon: Icon, label, href }) => (
                    <a
                        key={label}
                        href={href}
                        className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card py-4 transition-colors hover:border-primary/40 hover:bg-secondary"
                    >
            <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon className="size-5" />
            </span>
                        <span className="font-heading text-xs font-semibold uppercase tracking-wider text-card-foreground">
              {label}
            </span>
                    </a>
                ))}
            </div>
        </section>
    )
}