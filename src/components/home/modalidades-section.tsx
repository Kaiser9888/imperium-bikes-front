const modalidades = [
    { label: "Downhill", img: "/images/mod-downhill.png", href: "/modalidades/downhill" },
    { label: "Mountain", img: "/images/mod-mountain.png", href: "/modalidades/mountain" },
    { label: "Speed", img: "/images/mod-speed.png", href: "/modalidades/speed" },
    { label: "BMX", img: "/images/mod-bmx.png", href: "/modalidades/bmx" },
    { label: "Urbana", img: "/images/mod-urbana.png", href: "/modalidades/urbana" },
]

export function ModalidadesSection() {
    return (
        <section aria-labelledby="modalidades-title" className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-4">
                <h2 id="modalidades-title" className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                    Modalidades
                </h2>
                <a href="/modalidades" className="text-xs font-medium text-primary hover:underline">
                    Ver todas
                </a>
            </div>

            <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {modalidades.map(({ label, img, href }) => (
                    <li key={label} className="snap-start">
                        <a
                            href={href}
                            className="group relative flex h-32 w-28 shrink-0 flex-col justify-end overflow-hidden rounded-xl border border-border"
                        >
                            <img
                                src={img || "/placeholder.svg"}
                                alt={`Modalidade ${label}`}
                                className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />
                            <span className="relative p-3 font-heading text-sm font-bold uppercase tracking-wide text-background">
                {label}
              </span>
                        </a>
                    </li>
                ))}
            </ul>
        </section>
    )
}