import type { Metadata } from "next"
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"

import { destinoSeguro } from "@/lib/auth"

export const metadata: Metadata = { title: "Entrando | Imperium Bikes", robots: { index: false } }

type Props = { searchParams: Promise<{ redirect_url?: string | string[] }> }

/** Volta do "Continuar com Google": o Clerk conclui o acesso e segue para onde a pessoa ia. */
export default async function SsoCallbackPage({ searchParams }: Props) {
    const destino = destinoSeguro((await searchParams).redirect_url)
    const comDestino = (rota: string) => `${rota}?redirect_url=${encodeURIComponent(destino)}`
    return (
        <div className="grid min-h-dvh place-items-center bg-background">
            <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Entrando" />
            <AuthenticateWithRedirectCallback
                signInFallbackRedirectUrl={destino}
                signUpFallbackRedirectUrl={destino}
                signInUrl={comDestino("/sign-in")}
                signUpUrl={comDestino("/sign-up")}
                // Conta nova pelo Google que ainda precisa de nome de usuário: o formulário de cadastro continua daí
                continueSignUpUrl={comDestino("/sign-up")}
            />
            <div id="clerk-captcha" />
        </div>
    )
}
