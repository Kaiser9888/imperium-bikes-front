"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { acabouDePublicar, limparPublicado } from "@/lib/publicar/storage"

/**
 * Anúncio recém-publicado: voltar pelo histórico para uma etapa dele leva à Central do vendedor,
 * em vez de reabrir o formulário. Escolher categoria (/publicar) ou abrir com ?novo=1 começa um novo.
 */
export function VoltaDepoisDePublicar({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [voltando, setVoltando] = useState(false)

    useEffect(() => {
        const partes = pathname.split("/").filter(Boolean) // ["publicar", categoria, etapa?]
        const novo = new URLSearchParams(window.location.search).has("novo")
        if (partes.length < 2 || novo) {
            limparPublicado()
            // eslint-disable-next-line react-hooks/set-state-in-effect -- reage à rota
            setVoltando(false)
            return
        }
        if (acabouDePublicar(partes[1])) {
            setVoltando(true)
            router.replace("/vendedor")
        } else {
            setVoltando(false)
        }
    }, [pathname, router])

    return voltando ? null : children
}
