"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Flag } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import type { MotivoDenuncia, TipoDenunciado } from "@/services/adminService"
import { mensagemDaApi } from "@/services/tournamentService"

const MOTIVOS: { id: MotivoDenuncia; label: string }[] = [
    { id: "SCAM", label: "Golpe ou fraude" },
    { id: "FAKE", label: "Falso ou enganoso" },
    { id: "COPYRIGHT", label: "Usa foto, vídeo, música ou marca sem autorização" },
    { id: "INAPPROPRIATE", label: "Conteúdo impróprio" },
    { id: "ABUSE", label: "Ofensa ou assédio" },
    { id: "SPAM", label: "Spam" },
    { id: "OTHER", label: "Outro motivo" },
]

/**
 * Tudo entra no ar na hora; o que violar as regras sai depois da denúncia ser analisada.
 * Este botão é a porta de entrada dessa moderação.
 */
export function DenunciarButton({ tipo, id, className }: { tipo: TipoDenunciado; id: string; className?: string }) {
    const { isSignedIn } = useAuth()
    const [aberto, setAberto] = useState(false)
    const [motivo, setMotivo] = useState<MotivoDenuncia | null>(null)
    const [detalhes, setDetalhes] = useState("")
    const [enviando, setEnviando] = useState(false)

    function abrir() {
        if (!isSignedIn) {
            window.location.assign(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
            return
        }
        setAberto(true)
    }

    async function enviar(event: React.FormEvent) {
        event.preventDefault()
        if (!motivo) return
        setEnviando(true)
        try {
            await api.post("/api/reports", { reportedType: tipo, reportedId: id, reason: motivo, details: detalhes.trim() || undefined })
            toast.success("Denúncia enviada. A equipe vai analisar.")
            setAberto(false)
            setMotivo(null)
            setDetalhes("")
        } catch (cause) {
            toast.error(mensagemDaApi(cause, "Não foi possível enviar a denúncia."))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={abrir}
                className={cn("type-caption inline-flex min-h-9 items-center gap-1.5 text-muted-foreground transition-colors hover:text-destructive", className)}
            >
                <Flag className="size-3.5" aria-hidden="true" />
                Denunciar
            </button>

            <Dialog open={aberto} onOpenChange={setAberto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Denunciar</DialogTitle>
                        <DialogDescription>
                            A denúncia é anônima para quem publicou. Denúncias falsas de propósito podem levar à suspensão da conta.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={enviar} className="flex flex-col gap-4">
                        <fieldset>
                            <legend className="type-label text-foreground">Qual o problema?</legend>
                            <div className="mt-2 flex flex-col gap-1">
                                {MOTIVOS.map((m) => (
                                    <label key={m.id} className="type-body-small flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2 hover:bg-surface-muted">
                                        <input
                                            type="radio"
                                            name="motivo"
                                            value={m.id}
                                            checked={motivo === m.id}
                                            onChange={() => setMotivo(m.id)}
                                            className="size-4 accent-[var(--primary)]"
                                        />
                                        {m.label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="denuncia-detalhes">Detalhes (opcional)</Label>
                            <Textarea
                                id="denuncia-detalhes"
                                value={detalhes}
                                onChange={(e) => setDetalhes(e.target.value)}
                                maxLength={2000}
                                rows={3}
                                placeholder={motivo === "COPYRIGHT" ? "Diga de quem é o conteúdo e onde está o original." : "Conte o que aconteceu."}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" loading={enviando} disabled={!motivo}>
                                Enviar denúncia
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
