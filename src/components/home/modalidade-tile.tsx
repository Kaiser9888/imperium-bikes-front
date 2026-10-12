import Image from "next/image"
import Link from "next/link"

import type { Modalidade } from "@/lib/esportes"

export const tileGridClasses = "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6"

/** Atalho de modalidade: miniatura à esquerda e o nome ao lado. */
export function ModalidadeTile({ label, image, href }: Modalidade) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-2 pr-3 transition-colors hover:border-primary active:bg-surface-muted"
        >
            <Image
                src={image}
                alt=""
                width={96}
                height={96}
                className="size-12 shrink-0 rounded-lg object-cover transition-transform group-hover:scale-105"
            />
            <span className="type-label min-w-0 flex-1 text-foreground group-hover:text-primary">{label}</span>
        </Link>
    )
}
