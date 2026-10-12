"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mensagemDeErro } from "@/lib/auth"

type Etapa = "dados" | "usuario" | "codigo"

export function SignUpForm({ redirectTo }: { redirectTo: string }) {
    const { signUp, fetchStatus } = useSignUp()
    const router = useRouter()
    const [etapa, setEtapa] = useState<Etapa>("dados")
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")
    const [codigo, setCodigo] = useState("")
    const [erro, setErro] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)

    // Depois de cada passo o Clerk diz o que ainda falta; seguimos até a conta ficar completa
    async function avancar(): Promise<string | null> {
        if (signUp.status === "complete") {
            const { error } = await signUp.finalize()
            if (error) return mensagemDeErro(error)
            router.replace(redirectTo)
            return null
        }
        if (signUp.missingFields.includes("username")) {
            setEtapa("usuario")
            return null
        }
        if (signUp.unverifiedFields.includes("email_address")) {
            const { error } = await signUp.verifications.sendEmailCode()
            if (error) return mensagemDeErro(error)
            setEtapa("codigo")
            return null
        }
        return "O cadastro pede uma informação que esta tela ainda não oferece."
    }

    async function enviar(event: React.FormEvent) {
        event.preventDefault()
        setErro(null)
        setEnviando(true)

        let resultado
        if (etapa === "dados") {
            const [firstName, ...resto] = nome.trim().split(/\s+/)
            resultado = await signUp.password({
                emailAddress: email.trim(),
                password,
                firstName,
                lastName: resto.join(" ") || undefined,
            })
        } else if (etapa === "usuario") {
            resultado = await signUp.update({ username: username.trim() })
        } else {
            resultado = await signUp.verifications.verifyEmailCode({ code: codigo.trim() })
        }

        setErro(resultado.error ? mensagemDeErro(resultado.error) : await avancar())
        setEnviando(false)
    }

    const carregando = enviando || fetchStatus === "fetching"

    return (
        <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
            {etapa === "dados" && (
                <>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="nome">Nome completo</Label>
                        <Input id="nome" autoComplete="name" required value={nome} onChange={(event) => setNome(event.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
                        <p className="type-caption text-muted-foreground">Use pelo menos 8 caracteres.</p>
                    </div>
                </>
            )}

            {etapa === "usuario" && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="username">Escolha um nome de usuário</Label>
                    <Input id="username" autoComplete="username" required autoFocus value={username} onChange={(event) => setUsername(event.target.value)} />
                    <p className="type-caption text-muted-foreground">É como as pessoas vão encontrar você.</p>
                </div>
            )}

            {etapa === "codigo" && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="codigo">Código de verificação</Label>
                    <Input id="codigo" inputMode="numeric" autoComplete="one-time-code" required autoFocus value={codigo} onChange={(event) => setCodigo(event.target.value)} />
                    <p className="type-caption text-muted-foreground">Enviamos um código para {email.trim()}.</p>
                </div>
            )}

            {erro && (
                <p role="alert" className="type-body-small rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                    {erro}
                </p>
            )}

            {/* O Clerk monta aqui a verificação anti-robô, quando ela estiver ligada */}
            <div id="clerk-captcha" />

            <Button
                type="submit"
                size="lg"
                loading={carregando}
                disabled={
                    etapa === "dados"
                        ? !nome.trim() || !email.trim() || password.length < 8
                        : etapa === "usuario"
                          ? !username.trim()
                          : !codigo.trim()
                }
            >
                {etapa === "dados" ? "Criar conta" : etapa === "usuario" ? "Continuar" : "Confirmar e-mail"}
            </Button>
        </form>
    )
}
