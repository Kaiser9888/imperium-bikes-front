"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

type BackButtonProps = {
    /** Destino fixo. Sem href, volta uma página no histórico (ou chama onClick). */
    href?: string
    onClick?: () => void
    label?: string
    className?: string
}

/** Botão Voltar padrão do app (Uiverse.io, Jedi-hongbin). Estilo em `.back-btn` no globals.css. */
export function BackButton({ href, onClick, label = "Voltar", className }: BackButtonProps) {
    const router = useRouter()
    const conteudo = (
        <>
            <svg viewBox="0 0 1024 1024" aria-hidden="true">
                <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z" />
            </svg>
            <span>{label}</span>
        </>
    )

    if (href) {
        return (
            <Link href={href} className={cn("back-btn", className)}>
                {conteudo}
            </Link>
        )
    }
    return (
        <button type="button" onClick={onClick ?? (() => router.back())} className={cn("back-btn", className)}>
            {conteudo}
        </button>
    )
}
