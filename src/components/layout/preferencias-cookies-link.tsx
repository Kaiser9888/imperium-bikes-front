"use client"

import { abrirPreferenciasCookies } from "@/components/layout/aviso-cookies"

export function PreferenciasCookiesLink({ className = "type-body-small", label = "Preferências de cookies" }: { className?: string; label?: string }) {
    return (
        <button
            type="button"
            onClick={abrirPreferenciasCookies}
            className={`${className} inline-flex h-9 cursor-pointer items-center rounded-lg text-muted-foreground hover:text-foreground`}
        >
            {label}
        </button>
    )
}
