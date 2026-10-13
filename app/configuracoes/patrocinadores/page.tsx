"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { ImagePlus, Trash2 } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { sponsorImageUrl, type Sponsor } from "@/components/perfil/SponsorBanners"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import api from "@/lib/api"

const MAX_BANNERS = 6
const MAX_BYTES = 2 * 1024 * 1024

function motivo(cause: unknown): string {
    const data = (cause as { response?: { data?: { message?: unknown } } })?.response?.data
    return typeof data?.message === "string" ? data.message : "Tente novamente."
}

export default function PatrocinadoresPage() {
    const { isSignedIn, isLoaded } = useUser()
    const [sponsors, setSponsors] = useState<Sponsor[] | null>(null)
    const [falhou, setFalhou] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [ocupado, setOcupado] = useState(false)
    const [salvo, setSalvo] = useState(false)
    const fileInput = useRef<HTMLInputElement>(null)

    const carregar = useCallback(async () => {
        setFalhou(false)
        try {
            const { data } = await api.get("/api/users/me")
            setSponsors(data.sponsors ?? [])
        } catch {
            setFalhou(true)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial ao entrar na conta
        if (isSignedIn) void carregar()
    }, [isSignedIn, carregar])

    async function adicionar(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file || !sponsors) return
        setErro(null)
        setSalvo(false)
        if (file.size > MAX_BYTES) {
            setErro("A imagem deve ter no máximo 2 MB.")
            return
        }
        setOcupado(true)
        try {
            const form = new FormData()
            form.append("file", file)
            // Content-Type indefinido: o navegador define o multipart com o boundary correto
            const { data } = await api.post("/api/files/upload/image", form, { headers: { "Content-Type": undefined } })
            const imageUrl = data?.data?.publicUrl
            if (typeof imageUrl !== "string") throw new Error("upload sem URL")
            setSponsors([...sponsors, { name: "", imageUrl: sponsorImageUrl(imageUrl), linkUrl: "" }])
        } catch (cause) {
            setErro(`Não foi possível enviar a imagem. ${motivo(cause)}`)
        } finally {
            setOcupado(false)
        }
    }

    function alterar(index: number, campo: "name" | "linkUrl", valor: string) {
        setSalvo(false)
        setSponsors((atual) => atual && atual.map((sponsor, i) => (i === index ? { ...sponsor, [campo]: valor } : sponsor)))
    }

    async function salvar() {
        if (!sponsors) return
        setErro(null)
        setOcupado(true)
        try {
            const { data } = await api.put(
                "/api/users/me/sponsors",
                sponsors.map((sponsor) => ({
                    name: sponsor.name?.trim() || null,
                    imageUrl: sponsor.imageUrl,
                    linkUrl: sponsor.linkUrl?.trim() || null,
                })),
            )
            setSponsors(data.sponsors ?? [])
            setSalvo(true)
        } catch (cause) {
            setErro(`Não foi possível salvar. ${motivo(cause)}`)
        } finally {
            setOcupado(false)
        }
    }

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4 sm:px-6">
                <PageHeading
                    title="Patrocinadores"
                    description={`Até ${MAX_BANNERS} banners no seu perfil. PNG, JPG ou WEBP de até 2 MB.`}
                    back={{ href: "/perfil", label: "Perfil" }}
                />

                {(!isLoaded || (isSignedIn && !sponsors && !falhou)) && <Loader className="py-16" />}
                {isLoaded && !isSignedIn && <p className="type-body mt-8 text-muted-foreground">Entre para gerenciar seus patrocinadores.</p>}
                {falhou && <ErrorState onRetry={carregar} />}

                {sponsors && (
                    <div className="mt-8 flex flex-col gap-4">
                        {sponsors.map((sponsor, index) => (
                            <div key={`${sponsor.imageUrl}-${index}`} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-end">
                                {/* eslint-disable-next-line @next/next/no-img-element -- imagem enviada pelo usuário */}
                                <img src={sponsorImageUrl(sponsor.imageUrl)} alt="" className="h-16 w-32 shrink-0 rounded-lg border border-border object-contain p-1.5" />
                                <div className="flex flex-1 flex-col gap-2">
                                    <Label htmlFor={`sponsor-name-${index}`}>Nome</Label>
                                    <Input id={`sponsor-name-${index}`} maxLength={100} value={sponsor.name ?? ""} onChange={(e) => alterar(index, "name", e.target.value)} />
                                </div>
                                <div className="flex flex-1 flex-col gap-2">
                                    <Label htmlFor={`sponsor-link-${index}`}>Link (opcional)</Label>
                                    <Input id={`sponsor-link-${index}`} type="url" placeholder="https://" value={sponsor.linkUrl ?? ""} onChange={(e) => alterar(index, "linkUrl", e.target.value)} />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Remover ${sponsor.name || "patrocinador"}`}
                                    onClick={() => {
                                        setSalvo(false)
                                        setSponsors(sponsors.filter((_, i) => i !== index))
                                    }}
                                >
                                    <Trash2 aria-hidden="true" />
                                </Button>
                            </div>
                        ))}

                        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={adicionar} className="sr-only" tabIndex={-1} aria-hidden="true" />
                        <Button type="button" variant="outline" disabled={ocupado || sponsors.length >= MAX_BANNERS} onClick={() => fileInput.current?.click()}>
                            <ImagePlus aria-hidden="true" />
                            {sponsors.length >= MAX_BANNERS ? "Limite de banners atingido" : "Adicionar banner"}
                        </Button>

                        {erro && <p role="alert" className="type-body-small rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">{erro}</p>}
                        {salvo && <p role="status" className="type-body-small text-success">Patrocinadores salvos.</p>}

                        <Button type="button" size="lg" loading={ocupado} onClick={salvar}>
                            Salvar
                        </Button>
                    </div>
                )}
            </main>
        </AppShell>
    )
}
