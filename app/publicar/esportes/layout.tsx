import { notFound } from "next/navigation"

import { ESPORTES_ABERTOS } from "@/lib/esportes"

export default function PublicarEsportesLayout({ children }: { children: React.ReactNode }) {
    if (!ESPORTES_ABERTOS) notFound()
    return children
}
