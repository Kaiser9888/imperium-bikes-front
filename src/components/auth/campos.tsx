"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Nas telas de entrar e cadastrar os campos ficam sem a sombra deslocada; a sombra fica só no cartão. */
export const CAMPO_AUTH = "shadow-none! focus-visible:shadow-none! focus-visible:ring-2 focus-visible:ring-primary/40"

/** Senha com botão de mostrar/ocultar. */
export function CampoSenha({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
    const [visivel, setVisivel] = useState(false)
    return (
        <div className="relative">
            <Input {...props} type={visivel ? "text" : "password"} className={cn(CAMPO_AUTH, "pr-11", className)} />
            <button
                type="button"
                onClick={() => setVisivel((v) => !v)}
                aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={visivel}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-muted-foreground hover:text-foreground"
            >
                {visivel ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    )
}

/** "Continuar com Google" + divisória "ou". O Clerk leva ao Google e volta por /sso-callback. */
export function BotaoGoogle({ iniciar, aviso }: { iniciar: () => Promise<{ error: unknown }>; aviso?: React.ReactNode }) {
    const [indo, setIndo] = useState(false)
    const [erro, setErro] = useState(false)

    async function clicar() {
        setErro(false)
        setIndo(true)
        const { error } = await iniciar()
        // Sem erro o navegador já está indo para o Google; o botão fica carregando até sair da página
        if (error) {
            setErro(true)
            setIndo(false)
        }
    }

    return (
        <div className="flex flex-col gap-5">
            <Button type="button" variant="outline" size="lg" onClick={clicar} loading={indo} className="w-full gap-2.5">
                {!indo && <LogoGoogle />}
                Continuar com Google
            </Button>
            {erro && (
                <p role="alert" className="type-body-small -mt-2 text-destructive">
                    Não foi possível abrir o Google. Tente de novo ou use seu e-mail.
                </p>
            )}
            {aviso && <p className="type-caption -mt-2 text-muted-foreground">{aviso}</p>}
            <div className="type-caption flex items-center gap-3 text-muted-foreground" aria-hidden="true">
                <span className="h-px flex-1 bg-border" />
                ou com e-mail
                <span className="h-px flex-1 bg-border" />
            </div>
        </div>
    )
}

/** Logo oficial do Google (as cores fazem parte da marca e não mudam com o tema). */
function LogoGoogle() {
    return (
        <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
    )
}
