"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mensagemDeErro } from "@/lib/auth"

export function SignInForm({ redirectTo }: { redirectTo: string }) {
    const { signIn, fetchStatus } = useSignIn()
    const router = useRouter()
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [erro, setErro] = useState<string | null>(null)
    const [entrando, setEntrando] = useState(false)

    async function entrar(event: React.FormEvent) {
        event.preventDefault()
        setErro(null)
        setEntrando(true)

        const { error } = await signIn.password({ identifier: identifier.trim(), password })
        if (error) {
            setErro(mensagemDeErro(error))
        } else if (signIn.status !== "complete") {
            // ponytail: verificação em duas etapas não tem tela própria ainda
            setErro("Sua conta pede uma etapa extra de verificação que esta tela ainda não oferece.")
        } else {
            const finalizado = await signIn.finalize()
            if (!finalizado.error) {
                router.replace(redirectTo)
                return
            }
            setErro(mensagemDeErro(finalizado.error))
        }
        setEntrando(false)
    }

    return (
        <form onSubmit={entrar} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
                <Label htmlFor="identifier">E-mail ou nome de usuário</Label>
                <Input
                    id="identifier"
                    autoComplete="username"
                    required
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    aria-invalid={erro ? true : undefined}
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={erro ? true : undefined}
                />
            </div>

            {erro && (
                <p role="alert" className="type-body-small rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                    {erro}
                </p>
            )}

            <Button
                type="submit"
                size="lg"
                loading={entrando || fetchStatus === "fetching"}
                disabled={!identifier.trim() || !password}
            >
                Entrar
            </Button>
        </form>
    )
}
