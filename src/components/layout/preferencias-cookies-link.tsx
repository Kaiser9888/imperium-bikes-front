"use client"

import { abrirPreferenciasCookies } from "@/components/layout/aviso-cookies"

export function PreferenciasCookiesLink() {
    return (
        <button
            type="button"
            onClick={abrirPreferenciasCookies}
            className="type-body-small inline-flex h-9 cursor-pointer items-center rounded-lg text-muted-foreground hover:text-foreground"
        >
            Preferências de cookies
        </button>
    )
}
