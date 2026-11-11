"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { chegouPeloVoltar } from "@/lib/navegacao-voltar"
import { acabouDePublicar, limparPublicado } from "@/lib/publicar/storage"

/**
 * Anúncio recém-publicado: o botão voltar do navegador pula todas as etapas de uma vez e cai onde a
 * pessoa estava antes de começar (antes parava em cada etapa, ou prendia na Central). Entrar no
 * fluxo por um clique (Anunciar, escolher categoria) é um anúncio novo e apaga a marca.
 */
export function VoltaDepoisDePublicar({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [pulando, setPulando] = useState(false)

    useEffect(() => {
        const categoria = pathname.split("/").filter(Boolean)[1] ?? ""
        if (chegouPeloVoltar(pathname) && acabouDePublicar(categoria)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- reage à rota
            setPulando(true)
            window.history.back()
            return
        }
        if (!chegouPeloVoltar(pathname)) limparPublicado()
        setPulando(false)
    }, [pathname])

    return pulando ? null : children
}
