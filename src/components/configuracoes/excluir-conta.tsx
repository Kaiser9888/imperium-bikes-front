"use client"

import Link from "next/link"
import { useState } from "react"
import { useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import { desconectarStream } from "@/lib/stream"
import { mensagemDaApi } from "@/services/tournamentService"

/** Exclusão definitiva da conta (LGPD, art. 18). Pede para digitar EXCLUIR, igual ao backend. */
export function ExcluirConta() {
    const { signOut } = useClerk()
    const [aberto, setAberto] = useState(false)
    const [confirmacao, setConfirmacao] = useState("")
    const [excluindo, setExcluindo] = useState(false)

    async function excluir(event: React.FormEvent) {
        event.preventDefault()
        setExcluindo(true)
        try {
            await api.delete("/api/users/me", { data: { confirmacao } })
            await desconectarStream().catch(() => {})
            try {
                localStorage.clear()
                sessionStorage.clear()
            } catch {
                // armazenamento bloqueado: nada a limpar
            }
            toast.success("Sua conta foi excluída.")
            await signOut({ redirectUrl: "/" })
        } catch (cause) {
            toast.error(mensagemDaApi(cause, "Não foi possível excluir a conta."))
            setExcluindo(false)
        }
    }

    return (
        <section id="excluir-conta" aria-labelledby="excluir-title" className="mt-10 scroll-mt-24 rounded-xl border border-destructive/40 p-4">
            <h2 id="excluir-title" className="type-h3 text-foreground">
                Excluir conta
            </h2>
            <p className="type-body-small mt-1 text-muted-foreground">
                Apaga seus dados pessoais e tira do ar seus anúncios, vídeos e eventos sem inscritos. Pedidos e pagamentos ficam guardados
                sem seus dados, como a lei exige. Não dá para desfazer.{" "}
                <Link href="/privacidade#retencao" className="font-semibold text-primary underline underline-offset-2">
                    Saiba mais
                </Link>
            </p>
            <Button variant="outline" className="mt-4 border-destructive/50 text-destructive" onClick={() => setAberto(true)}>
                Excluir minha conta
            </Button>

            <Dialog open={aberto} onOpenChange={(v) => !excluindo && setAberto(v)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir a conta de vez?</DialogTitle>
                        <DialogDescription>
                            Saque antes o saldo disponível da monetização e conclua os pedidos em andamento. Depois de excluir, não é possível
                            recuperar a conta.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={excluir} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmar-exclusao">Digite EXCLUIR para confirmar</Label>
                            <Input id="confirmar-exclusao" autoComplete="off" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value.toUpperCase())} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAberto(false)} disabled={excluindo}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="destructive" loading={excluindo} disabled={confirmacao !== "EXCLUIR"}>
                                Excluir conta
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    )
}
