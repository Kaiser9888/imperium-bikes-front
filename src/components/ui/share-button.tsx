"use client"

import { Share2 } from "lucide-react"
import { toast } from "sonner"

/** Compartilha a página atual: folha nativa do celular ou, sem ela, copia o link. */
export function ShareButton({ title, className }: { title?: string; className?: string }) {
    async function share() {
        const url = window.location.href
        if (navigator.share) {
            try {
                await navigator.share({ title, url })
            } catch {
                // a pessoa fechou a folha de compartilhamento
            }
            return
        }
        try {
            await navigator.clipboard.writeText(url)
            toast("Link copiado")
        } catch {
            toast.error("Não foi possível copiar o link")
        }
    }

    return (
        <button type="button" onClick={share} className={`galaxy-btn ${className ?? ""}`}>
            <span className="galaxy-btn__stars" aria-hidden="true" />
            <span className="galaxy-btn__content">
                <Share2 aria-hidden="true" />
                Compartilhar
            </span>
        </button>
    )
}
