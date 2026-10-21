"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"

/*
  Caminho percorrido dentro do site nesta aba. Com página anterior, o Voltar volta para
  ela (quem veio da Busca volta para a Busca); sem ela (link aberto direto), usa o href.
  Se a nova página é a penúltima da pilha, foi um "voltar": desempilha.
*/
const CHAVE = "imperium:caminho"
let caminho: string[] = []
const ouvintes = new Set<() => void>()

function lerCaminho(): string[] {
    try {
        return JSON.parse(sessionStorage.getItem(CHAVE) ?? "[]")
    } catch {
        return []
    }
}

/** Carga completa vinda de fora (Stripe, Google, link direto): o histórico anterior não é do site. */
function veioDeDentro(): boolean {
    try {
        return Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin
    } catch {
        return false
    }
}

function registrar(pagina: string) {
    if (!caminho.length && veioDeDentro()) caminho = lerCaminho()
    if (caminho[caminho.length - 1] === pagina) return
    if (caminho[caminho.length - 2] === pagina) caminho = caminho.slice(0, -1)
    else caminho = [...caminho, pagina].slice(-30)
    try {
        sessionStorage.setItem(CHAVE, JSON.stringify(caminho))
    } catch {
        // sem sessionStorage: vale só até recarregar
    }
    ouvintes.forEach((avisar) => avisar())
}

/** Fica no layout raiz: anota cada página visitada. */
export function RastreioNavegacao() {
    const pathname = usePathname()
    useEffect(() => {
        if (pathname) registrar(pathname)
    }, [pathname])
    return null
}

function useTemPaginaAnterior() {
    return useSyncExternalStore(
        (avisar) => {
            ouvintes.add(avisar)
            return () => ouvintes.delete(avisar)
        },
        () => caminho.length > 1,
        () => false,
    )
}

type BackButtonProps = {
    /** Destino quando não há página anterior no site. Sem href, sempre volta no histórico (ou chama onClick). */
    href?: string
    onClick?: () => void
    label?: string
    className?: string
}

/** Botão Voltar padrão do app (Uiverse.io, Jedi-hongbin). Estilo em `.back-btn` no globals.css. */
export function BackButton({ href, onClick, label = "Voltar", className }: BackButtonProps) {
    const router = useRouter()
    const temAnterior = useTemPaginaAnterior()
    const conteudo = (texto: string) => (
        <>
            <svg viewBox="0 0 1024 1024" aria-hidden="true">
                <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z" />
            </svg>
            <span>{texto}</span>
        </>
    )

    if (href && !temAnterior) {
        return (
            <Link href={href} className={cn("back-btn", className)}>
                {conteudo(label)}
            </Link>
        )
    }
    return (
        <button type="button" onClick={onClick ?? (() => router.back())} className={cn("back-btn", className)}>
            {/* Voltando no histórico o destino nem sempre é o do rótulo fixo ("Início") */}
            {conteudo(href ? "Voltar" : label)}
        </button>
    )
}
