"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSignUp } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mensagemDeErro } from "@/lib/auth"
import { BotaoGoogle, CAMPO_AUTH, CampoSenha } from "@/components/auth/campos"

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
    // Aceite dos Termos e da Política, obrigatório antes de criar a conta
    const [aceite, setAceite] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)

    // Volta do Google com conta nova que ainda precisa de nome de usuário (continueSignUpUrl do /sso-callback)
    const faltaUsuario = signUp.status === "missing_requirements" && signUp.missingFields.includes("username")
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- segue o estado do cadastro no Clerk
        if (faltaUsuario) setEtapa("usuario")
    }, [faltaUsuario])

    // O botão fica sempre ativo: um botão apagado parece quebrado para quem chega
    function faltando(): string | null {
        if (etapa === "dados") {
            if (!nome.trim()) return "Informe seu nome."
            if (!email.trim()) return "Informe seu e-mail."
            if (password.length < 8) return "A senha precisa ter pelo menos 8 caracteres."
            if (!aceite) return "Para criar a conta, aceite os Termos de Uso e a Política de Privacidade."
            return null
        }
        if (etapa === "usuario") return username.trim() ? null : "Escolha um nome de usuário."
        return codigo.trim() ? null : "Digite o código que enviamos para o seu e-mail."
    }

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
        const falta = faltando()
        if (falta) return setErro(falta)
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
                    <BotaoGoogle
                        iniciar={() =>
                            signUp.sso({
                                strategy: "oauth_google",
                                redirectUrl: redirectTo,
                                redirectCallbackUrl: `/sso-callback?redirect_url=${encodeURIComponent(redirectTo)}`,
                                legalAccepted: true,
                            })
                        }
                        aviso={
                            <>
                                Ao continuar com o Google, você aceita os{" "}
                                <Link href="/termos" target="_blank" className="font-semibold text-primary underline underline-offset-2">
                                    Termos de Uso
                                </Link>{" "}
                                e a{" "}
                                <Link href="/privacidade" target="_blank" className="font-semibold text-primary underline underline-offset-2">
                                    Política de Privacidade
                                </Link>{" "}
                                e confirma ter 18 anos ou mais.
                            </>
                        }
                    />
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="nome">Nome</Label>
                        <Input id="nome" className={CAMPO_AUTH} autoComplete="given-name" required value={nome} onChange={(event) => setNome(event.target.value)} />
                        <p className="type-caption text-muted-foreground">Pode ser só o primeiro nome.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" className={CAMPO_AUTH} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Senha</Label>
                        <CampoSenha id="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
                        <p className="type-caption text-muted-foreground">Use pelo menos 8 caracteres.</p>
                    </div>
                    <label className="type-body-small flex items-start gap-2.5 text-muted-foreground">
                        <input
                            type="checkbox"
                            required
                            checked={aceite}
                            onChange={(event) => setAceite(event.target.checked)}
                            className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
                        />
                        <span>
                            Li e aceito os{" "}
                            <Link href="/termos" target="_blank" className="font-semibold text-primary underline underline-offset-2">
                                Termos de Uso
                            </Link>{" "}
                            e a{" "}
                            <Link href="/privacidade" target="_blank" className="font-semibold text-primary underline underline-offset-2">
                                Política de Privacidade
                            </Link>
                            , e tenho 18 anos ou mais (ou autorização do meu responsável).
                        </span>
                    </label>
                </>
            )}

            {etapa === "usuario" && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="username">Escolha um nome de usuário</Label>
                    <Input id="username" className={CAMPO_AUTH} autoComplete="username" required autoFocus value={username} onChange={(event) => setUsername(event.target.value)} />
                    <p className="type-caption text-muted-foreground">É como as pessoas vão encontrar você.</p>
                </div>
            )}

            {etapa === "codigo" && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="codigo">Código de verificação</Label>
                    <Input id="codigo" className={CAMPO_AUTH} inputMode="numeric" autoComplete="one-time-code" required autoFocus value={codigo} onChange={(event) => setCodigo(event.target.value)} />
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
            >
                {etapa === "dados" ? "Criar conta" : etapa === "usuario" ? "Continuar" : "Confirmar e-mail"}
            </Button>
        </form>
    )
}
