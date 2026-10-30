"use client"

import { useCallback, useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Check } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import api from "@/lib/api"
import { mensagemDaApi } from "@/services/tournamentService"

type Remetente = {
    documento: string
    telefone: string
    cep: string
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    uf: string
}

const VAZIO: Remetente = { documento: "", telefone: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" }
const digitos = (v: string) => v.replace(/\D/g, "")

/** Endereço de onde o vendedor posta. Vai como remetente na etiqueta que o site gera depois da venda. */
export default function EnderecoEnvioPage() {
    const { isSignedIn, isLoaded } = useUser()
    const [form, setForm] = useState<Remetente | null>(null)
    const [falhou, setFalhou] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [salvo, setSalvo] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const carregar = useCallback(async () => {
        setFalhou(false)
        try {
            const { data } = await api.get<Partial<Record<keyof Remetente, string | null>>>("/api/users/me/remetente")
            setForm(Object.fromEntries(Object.keys(VAZIO).map((k) => [k, data[k as keyof Remetente] ?? ""])) as Remetente)
        } catch {
            setFalhou(true)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial ao entrar na conta
        if (isSignedIn) void carregar()
    }, [isSignedIn, carregar])

    const mudar = (campo: keyof Remetente, valor: string) => {
        setSalvo(false)
        setForm((atual) => (atual ? { ...atual, [campo]: valor } : atual))
    }

    async function buscarCep(valor: string) {
        const cep = digitos(valor)
        if (cep.length !== 8) return
        const viaCep = (await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(6000) })
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null)) as { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean } | null
        if (!viaCep || viaCep.erro) return
        setForm((atual) =>
            atual
                ? {
                      ...atual,
                      logradouro: viaCep.logradouro || atual.logradouro,
                      bairro: viaCep.bairro || atual.bairro,
                      cidade: viaCep.localidade || atual.cidade,
                      uf: viaCep.uf || atual.uf,
                  }
                : atual,
        )
    }

    async function salvar(event: React.FormEvent) {
        event.preventDefault()
        if (!form) return
        setSalvando(true)
        setErro(null)
        try {
            await api.put("/api/users/me/remetente", {
                ...form,
                documento: digitos(form.documento),
                telefone: digitos(form.telefone),
                cep: digitos(form.cep),
                uf: form.uf.trim().toUpperCase(),
            })
            setSalvo(true)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível salvar. Confira os campos."))
        } finally {
            setSalvando(false)
        }
    }

    const campo = (id: keyof Remetente, rotulo: string, props: React.ComponentProps<typeof Input> = {}) => (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{rotulo}</Label>
            <Input id={id} value={form?.[id] ?? ""} onChange={(e) => mudar(id, e.target.value)} {...props} />
        </div>
    )

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading
                    title="Endereço de envio"
                    description="De onde você posta. Quando alguém compra, o site gera a etiqueta com este endereço e você só imprime e leva para postar."
                    back={{ href: "/configuracoes", label: "Configurações" }}
                />

                {(!isLoaded || (isSignedIn && !form && !falhou)) && <Loader className="py-16" />}
                {isLoaded && !isSignedIn && <p className="type-body mt-8 text-muted-foreground">Entre para cadastrar seu endereço de envio.</p>}
                {falhou && <ErrorState onRetry={carregar} />}

                {form && (
                    <form onSubmit={salvar} className="mt-8 flex flex-col gap-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            {campo("documento", "CPF ou CNPJ", { inputMode: "numeric", autoComplete: "off", maxLength: 18, required: true })}
                            {campo("telefone", "Celular com DDD", { inputMode: "tel", autoComplete: "tel", maxLength: 15, required: true })}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
                            {campo("cep", "CEP", {
                                inputMode: "numeric",
                                autoComplete: "postal-code",
                                maxLength: 9,
                                required: true,
                                onBlur: (e) => void buscarCep(e.target.value),
                            })}
                            {campo("logradouro", "Rua", { autoComplete: "address-line1", maxLength: 200, required: true })}
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            {campo("numero", "Número", { maxLength: 20, required: true })}
                            {campo("complemento", "Complemento (opcional)", { maxLength: 100 })}
                        </div>
                        {campo("bairro", "Bairro", { maxLength: 100, required: true })}
                        <div className="grid grid-cols-[1fr_5rem] gap-5">
                            {campo("cidade", "Cidade", { autoComplete: "address-level2", maxLength: 100, required: true })}
                            {campo("uf", "UF", { maxLength: 2, required: true, className: "uppercase" })}
                        </div>

                        <p className="type-caption text-muted-foreground">
                            O CPF ou CNPJ e o telefone vão só na etiqueta da transportadora (é obrigatório por lei para o envio). Não aparecem no seu perfil nem para o comprador.
                        </p>

                        {erro && (
                            <p role="alert" className="type-body-small border-l-2 border-destructive pl-3 text-destructive">
                                {erro}
                            </p>
                        )}
                        <div className="flex items-center gap-3">
                            <Button type="submit" loading={salvando}>
                                Salvar endereço
                            </Button>
                            {salvo && (
                                <span role="status" className="type-label flex items-center gap-1.5 text-success">
                                    <Check className="size-4" aria-hidden="true" />
                                    Salvo
                                </span>
                            )}
                        </div>
                    </form>
                )}
            </main>
        </AppShell>
    )
}
