import Image from "next/image"
import Link from "next/link"

type SportCardProps = {
    label: string
    href: string
    image: string
}

export function SportCard({ label, href, image }: SportCardProps) {
    return (
        <Link
            href={href}
            className="group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-xl bg-surface-muted"
        >
            <Image
                src={image}
                alt=""
                fill
                sizes="(min-width: 1024px) 16vw, 9rem"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden="true" />
            <span className="type-label relative p-3 text-white">{label}</span>
        </Link>
    )
}
