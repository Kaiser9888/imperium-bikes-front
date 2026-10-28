"use client"

import { useState } from "react"
import { useClerk, useUser } from "@clerk/nextjs"
import { ShieldCheck, ShieldAlert, Snowflake } from "lucide-react"
import { toast } from "sonner"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { desconectarStream } from "@/lib/stream"
import { mensagemDaApi } from "@/services/tournamentService"

/** Verificação em duas etapas (pelo Clerk) e o botão "não fui eu", que congela a conta. */
export function SegurancaConta() {
    const { user } = useUser()
    const { openUserProfile, signOut } = useClerk()
    const [confirmando, setConfirmando] = useState(false)
    const [congelando, setCongelando] = useState(false)
    const protegida = Boolean(user?.twoFactorEnabled)

    async function congelar() {
        setCongelando(true)
        try {
            await api.post("/api/seguranca/congelar")
            await desconectarStream().catch(() => {})
            toast.success("Conta congelada. Para liberar, fale com o suporte pelo e-mail imperiumbikes@gmail.com.")
            await signOut({ redirectUrl: "/" })
        } catch (cause) {
            toast.error(mensagemDaApi(cause, "Não foi possível congelar a conta."))
            setCongelando(false)
            setConfirmando(false)
        }
    }

    return (
        <section id="seguranca" aria-labelledby="seguranca-title" className="mt-10 scroll-mt-24">
            <h2 id="seguranca-title" className="type-h3 text-foreground">
                Segurança
            </h2>

            <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                <p className="type-label flex items-center gap-2 text-foreground">
                    {protegida ? (
                        <ShieldCheck className="size-5 text-success" aria-hidden="true" />
                    ) : (
                        <ShieldAlert className="size-5 text-warning" aria-hidden="true" />
                    )}
                    {protegida ? "Conta protegida" : "Verificação em duas etapas desligada"}
                </p>
                <p className="type-body-small mt-1 text-muted-foreground">
                    {protegida
                        ? "Além da senha, entrar pede um código do seu aplicativo autenticador ou SMS. Seu perfil mostra o selo Conta protegida."
                        : "Ligue para pedir um código além da senha ao entrar. Quem tem ganha o selo Conta protegida no perfil, e compradores confiam mais."}
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => openUserProfile()}>
                    {protegida ? "Gerenciar segurança" : "Ligar verificação em duas etapas"}
                </Button>
            </div>

            <div className="mt-3 rounded-xl border border-border bg-surface p-4">
                <p className="type-label flex items-center gap-2 text-foreground">
                    <Snowflake className="size-5 text-primary" aria-hidden="true" />
                    Não fui eu
                </p>
                <p className="type-body-small mt-1 text-muted-foreground">
                    Viu algo que você não fez (mensagem, anúncio, troca de e-mail)? Congele a conta: todos os aparelhos saem na hora e ninguém
                    entra até o suporte confirmar que você é o dono. Seu dinheiro continua indo só para a sua conta de recebimentos.
                </p>
                <Button variant="outline" size="sm" className="mt-3 border-destructive/50 text-destructive" onClick={() => setConfirmando(true)}>
                    Congelar minha conta
                </Button>
            </div>

            <AlertDialog open={confirmando} onOpenChange={(v) => !congelando && setConfirmando(v)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Congelar a conta agora?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você também sai daqui. Para voltar, fale com o suporte (imperiumbikes@gmail.com): vamos confirmar que a conta é sua
                            antes de liberar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={congelando}>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                void congelar()
                            }}
                            disabled={congelando}
                        >
                            Congelar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}
