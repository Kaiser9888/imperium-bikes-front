"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ShieldCheck, Snowflake } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/api-config"

/**
 * Destino do link "não fui eu" do e-mail. Congela só com o clique (POST): leitores de e-mail
 * que abrem links sozinhos não podem congelar a conta de ninguém.
 */
function Congelar() {
    const token = useSearchParams().get("token")
    const [estado, setEstado] = useState<"pronto" | "enviando" | "feito">("pronto")
    const [erro, setErro] = useState<string | null>(null)

    async function congelar() {
        setEstado("enviando")
        setErro(null)
        try {
            const res = await fetch(`${API_BASE_URL}/api/seguranca/congelar/link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => null)
                throw new Error(typeof data?.message === "string" ? data.message : "Não foi possível congelar a conta.")
            }
            setEstado("feito")
        } catch (cause) {
            setErro(cause instanceof Error ? cause.message : "Não foi possível congelar a conta.")
            setEstado("pronto")
        }
    }

    if (!token) {
        return <p className="type-body-small mt-6 text-muted-foreground">Link incompleto. Abra de novo o link do e-mail ou fale com o suporte.</p>
    }

    if (estado === "feito") {
        return (
            <div className="mt-6 rounded-xl border border-success/40 bg-surface p-5">
                <p className="type-label flex items-center gap-2 text-foreground">
                    <ShieldCheck className="size-5 text-success" aria-hidden="true" />
                    Conta congelada
                </p>
                <p className="type-body-small mt-2 text-muted-foreground">
                    Todos os aparelhos foram desconectados e ninguém entra até o suporte confirmar que você é o dono. Escreva para{" "}
                    <a href="mailto:imperiumbikes@gmail.com" className="font-semibold text-primary underline underline-offset-2">
                        imperiumbikes@gmail.com
                    </a>{" "}
                    a partir deste e-mail para recuperar o acesso.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-6 rounded-xl border border-border bg-surface p-5">
            <p className="type-body-small text-muted-foreground">
                Se você não trocou o e-mail da sua conta, congele agora. Quem trocou sai na hora, e a conta só volta depois que o suporte
                confirmar que ela é sua. Seu dinheiro continua indo só para a sua conta de recebimentos.
            </p>
            {erro && (
                <p role="alert" className="type-body-small mt-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                    {erro}
                </p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
                <Button onClick={congelar} loading={estado === "enviando"}>
                    <Snowflake aria-hidden="true" />
                    Não fui eu: congelar a conta
                </Button>
                <Button asChild variant="outline">
                    <Link href="/">Fui eu, voltar</Link>
                </Button>
            </div>
        </div>
    )
}

export default function CongelarPage() {
    return (
        <AppShell>
            <main className="mx-auto w-full max-w-xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading title="Proteger minha conta" back={{ href: "/", label: "Início" }} />
                <Suspense>
                    <Congelar />
                </Suspense>
            </main>
        </AppShell>
    )
}
