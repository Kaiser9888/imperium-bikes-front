"use client"

import Link from "next/link"
import { useEffect, useSyncExternalStore } from "react"
import { Analytics } from "@vercel/analytics/next"

import { Button } from "@/components/ui/button"

/*
  Consentimento (LGPD, art. 7º, I e art. 8º): cookies necessários (login, pagamento) não
  dependem de aceite; as estatísticas de uso (Vercel Analytics, sem cookies) só carregam
  depois do "Aceitar". A escolha fica no aparelho e pode ser revista pelo rodapé.
*/
const CHAVE = "imperium:consentimento-cookies"
const REABRIR = "imperium:preferencias-cookies"
type Escolha = "aceito" | "recusado" | null

const ouvintes = new Set<() => void>()
let reaberto = false

function ler(): Escolha {
    try {
        const v = localStorage.getItem(CHAVE)
        return v === "aceito" || v === "recusado" ? v : null
    } catch {
        return null
    }
}

function salvar(escolha: Exclude<Escolha, null>) {
    try {
        localStorage.setItem(CHAVE, escolha)
    } catch {
        // sem armazenamento: vale só nesta visita
    }
    memoria = escolha
    reaberto = false
    ouvintes.forEach((avisar) => avisar())
}

let memoria: Escolha = null
const assinar = (avisar: () => void) => {
    ouvintes.add(avisar)
    return () => ouvintes.delete(avisar)
}
// "pendente" no servidor: nada aparece nem carrega antes de ler a escolha no navegador
const estado = () => `${memoria ?? ler() ?? "nenhuma"}|${reaberto}`

/** Link "Preferências de cookies" do rodapé. */
export function abrirPreferenciasCookies() {
    window.dispatchEvent(new Event(REABRIR))
}

export function AvisoCookies() {
    const [escolha, aberto] = useSyncExternalStore(assinar, estado, () => "pendente|false").split("|")

    useEffect(() => {
        const reabrir = () => {
            reaberto = true
            ouvintes.forEach((avisar) => avisar())
        }
        window.addEventListener(REABRIR, reabrir)
        return () => window.removeEventListener(REABRIR, reabrir)
    }, [])

    const mostrar = escolha === "nenhuma" || aberto === "true"

    return (
        <>
            {escolha === "aceito" && <Analytics />}
            {mostrar && escolha !== "pendente" && (
                <div
                    role="dialog"
                    aria-labelledby="cookies-titulo"
                    aria-describedby="cookies-texto"
                    className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-lg rounded-2xl border border-border bg-surface p-4 shadow-lg md:bottom-6"
                >
                    <p id="cookies-titulo" className="type-label text-foreground">
                        Cookies e privacidade
                    </p>
                    <p id="cookies-texto" className="type-body-small mt-1 text-muted-foreground">
                        Usamos só o necessário para você entrar na conta e pagar com segurança. Com sua permissão, também contamos visitas
                        de forma anônima, sem cookies, para melhorar o app.{" "}
                        <Link href="/privacidade#cookies" className="font-semibold text-primary underline underline-offset-2">
                            Saiba mais
                        </Link>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => salvar("aceito")}>
                            Aceitar estatísticas
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => salvar("recusado")}>
                            Só o necessário
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}
