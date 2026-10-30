import { notFound } from "next/navigation"

import { ANUNCIOS_ABERTOS } from "@/lib/anuncios"

export default function AnunciarLayout({ children }: { children: React.ReactNode }) {
    if (!ANUNCIOS_ABERTOS) notFound()
    return children
}
