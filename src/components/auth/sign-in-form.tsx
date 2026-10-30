"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSignIn } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mensagemDeErro } from "@/lib/auth"
import { BotaoGoogle, CAMPO_AUTH, CampoSenha } from "@/components/auth/campos"

/** senha: entrar · codigo: código por e-mail em dispositivo novo · reset: código + nova senha */
type Etapa = "senha" | "codigo" | "reset"

export function SignInForm({ redirectTo }: { redirectTo: string }) {
    const { signIn, fetchStatus } = useSignIn()
    const router = useRouter()
    const [etapa, setEtapa] = useState<Etapa>("senha")
    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [codigo, setCodigo] = useState("")
    const [erro, setErro] = useState<string | null>(null)
    const [aviso, setAviso] = useState<string | null>(null)
    const [enviando, setEnviando] = useState(false)

    // Depois de cada passo o Clerk diz o que falta; devolve a mensagem de erro, se houver
    async function avancar(): Promise<string | null> {
        if (signIn.status === "complete") {
            const { error } = await signIn.finalize()
            if (error) return mensagemDeErro(error)
            router.replace(redirectTo)
            return null
        }
        if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
            if (!signIn.supportedSecondFactors.some((fator) => fator.strategy === "email_code")) {
                // ponytail: só código por e-mail; app autenticador (TOTP) e SMS não têm tela
                return "Sua conta usa uma verificação em duas etapas que esta tela ainda não oferece."
            }
            const { error } = await signIn.mfa.sendEmailCode()
            if (error) return mensagemDeErro(error)
            setCodigo("")
            setAviso("Enviamos um código de verificação para o seu e-mail.")
            setEtapa("codigo")
            return null
        }
        return "Não foi possível concluir o acesso. Tente novamente."
    }

    // O botão fica sempre ativo: um botão apagado parece quebrado para quem chega
    function faltando(): string | null {
        if (etapa === "senha") return !identifier.trim() ? "Informe seu e-mail ou nome de usuário." : !password ? "Informe sua senha." : null
        if (!codigo.trim()) return "Digite o código que enviamos para o seu e-mail."
        return etapa === "reset" && password.length < 8 ? "A nova senha precisa ter pelo menos 8 caracteres." : null
    }

    async function enviar(event: React.FormEvent) {
        event.preventDefault()
        const falta = faltando()
        if (falta) return setErro(falta)
        setErro(null)
        setEnviando(true)

        let error
        if (etapa === "senha") {
            ;({ error } = await signIn.password({ identifier: identifier.trim(), password }))
        } else if (etapa === "codigo") {
            ;({ error } = await signIn.mfa.verifyEmailCode({ code: codigo.trim() }))
        } else {
            ;({ error } = await signIn.resetPasswordEmailCode.verifyCode({ code: codigo.trim() }))
            if (!error) ({ error } = await signIn.resetPasswordEmailCode.submitPassword({ password }))
        }

        setErro(error ? mensagemDeErro(error) : await avancar())
        setEnviando(false)
    }

    async function esqueciSenha() {
        setErro(null)
        if (!identifier.trim()) {
            setErro("Informe seu e-mail para receber o código de redefinição.")
            return
        }
        setEnviando(true)
        let { error } = await signIn.create({ identifier: identifier.trim() })
        if (!error) ({ error } = await signIn.resetPasswordEmailCode.sendCode())
        if (error) {
            setErro(mensagemDeErro(error))
        } else {
            setPassword("")
            setCodigo("")
            setAviso("Enviamos um código para o seu e-mail. Digite-o e escolha uma nova senha.")
            setEtapa("reset")
        }
        setEnviando(false)
    }

    function voltar() {
        setEtapa("senha")
        setErro(null)
        setAviso(null)
        setCodigo("")
        setPassword("")
    }

    return (
        <form onSubmit={enviar} className="flex flex-col gap-5" noValidate>
            {etapa === "senha" && (
                <BotaoGoogle
                    iniciar={() =>
                        signIn.sso({
                            strategy: "oauth_google",
                            redirectUrl: redirectTo,
                            redirectCallbackUrl: `/sso-callback?redirect_url=${encodeURIComponent(redirectTo)}`,
                        })
                    }
                />
            )}

            {aviso && etapa !== "senha" && (
                <p role="status" className="type-body-small text-muted-foreground">
                    {aviso}
                </p>
            )}

            {etapa === "senha" && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="identifier">E-mail ou nome de usuário</Label>
                    <Input
                        id="identifier"
                        className={CAMPO_AUTH}
                        autoComplete="username"
                        required
                        value={identifier}
                        onChange={(event) => setIdentifier(event.target.value)}
                        aria-invalid={erro ? true : undefined}
                    />
                </div>
            )}

            {etapa !== "senha" && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="codigo">Código de verificação</Label>
                    <Input
                        id="codigo"
                        className={CAMPO_AUTH}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        autoFocus
                        value={codigo}
                        onChange={(event) => setCodigo(event.target.value)}
                    />
                </div>
            )}

            {etapa !== "codigo" && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">{etapa === "reset" ? "Nova senha" : "Senha"}</Label>
                        {etapa === "senha" && (
                            <button type="button" onClick={esqueciSenha} className="type-caption font-semibold text-primary hover:underline">
                                Esqueci minha senha
                            </button>
                        )}
                    </div>
                    <CampoSenha
                        id="password"
                        autoComplete={etapa === "reset" ? "new-password" : "current-password"}
                        required
                        minLength={etapa === "reset" ? 8 : undefined}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        aria-invalid={erro ? true : undefined}
                    />
                    {etapa === "reset" && <p className="type-caption text-muted-foreground">Use pelo menos 8 caracteres.</p>}
                </div>
            )}

            {erro && (
                <p role="alert" className="type-body-small rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                    {erro}
                </p>
            )}

            <Button
                type="submit"
                size="lg"
                loading={enviando || fetchStatus === "fetching"}
            >
                {etapa === "senha" ? "Entrar" : etapa === "codigo" ? "Confirmar código" : "Salvar nova senha"}
            </Button>

            {etapa !== "senha" && (
                <button type="button" onClick={voltar} className="type-body-small text-muted-foreground hover:text-foreground hover:underline">
                    Voltar
                </button>
            )}
        </form>
    )
}
