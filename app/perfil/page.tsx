"use client"

import axios from "axios"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Camera, MapPin, Pencil, Settings, Store, UserRound } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { ProdutoGrid } from "@/components/perfil/ProdutoGrid"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { sellerProductService, type ProdutoItem } from "@/services/publish/seller-products.service"

type Perfil = { fullName: string; bio: string; city: string; state: string; country: string }
type Estado = { status: "loading" } | { status: "error" } | { status: "ok"; perfil: Perfil; produtos: ProdutoItem[] }

/** Mostra o motivo real da falha (status e mensagem do backend) em vez de engolir o erro. */
function motivoDaFalha(cause: unknown): string {
    if (axios.isAxiosError(cause)) {
        const data = cause.response?.data as { message?: unknown } | undefined
        const detalhe = typeof data?.message === "string" ? data.message : cause.message
        return cause.response ? `Erro ${cause.response.status}: ${detalhe}` : "Sem resposta do servidor. Tente novamente."
    }
    return cause instanceof Error ? cause.message : "Não foi possível concluir."
}

export default function PerfilPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const userId = user?.id
    const [estado, setEstado] = useState<Estado>({ status: "loading" })
    const [editando, setEditando] = useState<Perfil | null>(null)
    const [salvando, setSalvando] = useState(false)
    const [erroSalvar, setErroSalvar] = useState<string | null>(null)
    const [erroFoto, setErroFoto] = useState<string | null>(null)
    const [enviandoFoto, setEnviandoFoto] = useState(false)
    const fotoInput = useRef<HTMLInputElement>(null)

    const carregar = useCallback(async () => {
        setEstado({ status: "loading" })
        try {
            const sync = await api.post("/api/users/sync")
            const { data } = await api.get(`/api/users/${sync.data.id}`)
            // Anúncios em try separado: se falharem, o perfil continua aparecendo
            const produtos = await sellerProductService.listMine().catch(() => [])
            setEstado({
                status: "ok",
                produtos,
                perfil: {
                    fullName: data.fullName ?? "",
                    bio: data.bio ?? "",
                    city: data.city ?? "",
                    state: data.state ?? "",
                    country: data.country ?? "Brasil",
                },
            })
        } catch {
            setEstado({ status: "error" })
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial ao entrar na conta
        if (userId) void carregar()
    }, [userId, carregar])

    async function salvar(event: React.FormEvent) {
        event.preventDefault()
        if (!editando || !user) return
        setSalvando(true)
        setErroSalvar(null)
        const perfil: Perfil = {
            fullName: editando.fullName.trim(),
            bio: editando.bio.trim(),
            city: editando.city.trim(),
            state: editando.state.trim(),
            country: editando.country.trim(),
        }
        try {
            await api.put("/api/users/me", perfil)
            setEstado((atual) => (atual.status === "ok" ? { ...atual, perfil } : atual))
            setEditando(null)
        } catch (cause) {
            setErroSalvar(motivoDaFalha(cause))
        } finally {
            setSalvando(false)
        }
    }

    async function trocarFoto(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file || !user) return
        setErroFoto(null)
        setEnviandoFoto(true)
        try {
            await user.setProfileImage({ file })
        } catch {
            setErroFoto("Não foi possível trocar a foto. Use uma imagem JPG ou PNG de até 10 MB.")
        } finally {
            setEnviandoFoto(false)
        }
    }

    if (isLoaded && !isSignedIn) {
        return (
            <AppShell>
                <main className="mx-auto max-w-3xl px-4 py-10">
                    <EmptyState
                        icon={UserRound}
                        title="Entre para ver seu perfil"
                        description="Seu perfil reúne seus dados e seus anúncios."
                        action={
                            <Button asChild size="lg">
                                <Link href="/sign-in?redirect_url=%2Fperfil">Entrar</Link>
                            </Button>
                        }
                    />
                </main>
            </AppShell>
        )
    }

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:pt-10">
                {(!isLoaded || estado.status === "loading") && (
                    <div className="flex items-center gap-5" aria-busy="true">
                        <Skeleton className="size-24 rounded-full" />
                        <div className="flex flex-1 flex-col gap-3">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                )}

                {isLoaded && estado.status === "error" && (
                    <ErrorState title="Não foi possível carregar seu perfil" onRetry={carregar} />
                )}

                {isLoaded && user && estado.status === "ok" && (
                    <>
                        <section aria-label="Seus dados" className="flex flex-col gap-5 sm:flex-row sm:items-start">
                            <div className="relative size-24 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element -- avatar vem do domínio do Clerk */}
                                <img
                                    src={user.imageUrl}
                                    alt=""
                                    className="size-24 rounded-full bg-surface-muted object-cover"
                                />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    loading={enviandoFoto}
                                    onClick={() => fotoInput.current?.click()}
                                    aria-label="Trocar foto de perfil"
                                    className="absolute -bottom-1 -right-1 rounded-full shadow-sm"
                                >
                                    {!enviandoFoto && <Camera aria-hidden="true" />}
                                </Button>
                                <input
                                    ref={fotoInput}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={trocarFoto}
                                    className="sr-only"
                                    tabIndex={-1}
                                    aria-hidden="true"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h1 className="type-h1 truncate text-foreground">
                                    {estado.perfil.fullName || user.fullName || user.username || "Seu perfil"}
                                </h1>
                                {user.username && <p className="type-body-small text-muted-foreground">@{user.username}</p>}
                                {(estado.perfil.city || estado.perfil.state) && (
                                    <p className="type-body-small mt-2 flex items-center gap-1.5 text-muted-foreground">
                                        <MapPin className="size-4 shrink-0" aria-hidden="true" />
                                        {[estado.perfil.city, estado.perfil.state, estado.perfil.country].filter(Boolean).join(", ")}
                                    </p>
                                )}
                                {estado.perfil.bio && (
                                    <p className="type-body mt-3 whitespace-pre-line text-pretty text-foreground">{estado.perfil.bio}</p>
                                )}
                                {erroFoto && (
                                    <p role="alert" className="type-body-small mt-3 text-destructive">
                                        {erroFoto}
                                    </p>
                                )}

                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Button
                                        onClick={() => {
                                            setErroSalvar(null)
                                            setEditando({ ...estado.perfil, fullName: estado.perfil.fullName || user.fullName || "" })
                                        }}
                                    >
                                        <Pencil aria-hidden="true" />
                                        Editar perfil
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="/vendedor">
                                            <Store aria-hidden="true" />
                                            Central do vendedor
                                        </Link>
                                    </Button>
                                    <Button asChild variant="ghost" size="icon" aria-label="Configurações">
                                        <Link href="/configuracoes">
                                            <Settings aria-hidden="true" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </section>

                        <section aria-labelledby="anuncios-title" className="mt-10">
                            <h2 id="anuncios-title" className="type-h2 border-b border-border pb-3 text-foreground">
                                Meus anúncios
                            </h2>
                            <div className="pt-6">
                                <ProdutoGrid produtos={estado.produtos} dono />
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Dialog open={editando !== null} onOpenChange={(open) => !open && !salvando && setEditando(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar perfil</DialogTitle>
                        <DialogDescription>Essas informações aparecem no seu perfil público.</DialogDescription>
                    </DialogHeader>
                    {editando && (
                        <form onSubmit={salvar} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="perfil-nome">Nome</Label>
                                <Input
                                    id="perfil-nome"
                                    autoComplete="name"
                                    required
                                    value={editando.fullName}
                                    onChange={(event) => setEditando({ ...editando, fullName: event.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="perfil-bio">Bio</Label>
                                <Textarea
                                    id="perfil-bio"
                                    rows={3}
                                    maxLength={300}
                                    placeholder="Conte um pouco sobre você"
                                    value={editando.bio}
                                    onChange={(event) => setEditando({ ...editando, bio: event.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-[1fr_5rem] gap-3">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="perfil-cidade">Cidade</Label>
                                    <Input
                                        id="perfil-cidade"
                                        autoComplete="address-level2"
                                        value={editando.city}
                                        onChange={(event) => setEditando({ ...editando, city: event.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="perfil-estado">UF</Label>
                                    <Input
                                        id="perfil-estado"
                                        autoComplete="address-level1"
                                        maxLength={2}
                                        value={editando.state}
                                        onChange={(event) => setEditando({ ...editando, state: event.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="perfil-pais">País</Label>
                                <Input
                                    id="perfil-pais"
                                    autoComplete="country-name"
                                    value={editando.country}
                                    onChange={(event) => setEditando({ ...editando, country: event.target.value })}
                                />
                            </div>

                            {erroSalvar && (
                                <p role="alert" className="type-body-small rounded-lg bg-destructive/10 px-3 py-2.5 text-destructive">
                                    Não foi possível salvar. {erroSalvar}
                                </p>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditando(null)} disabled={salvando}>
                                    Cancelar
                                </Button>
                                <Button type="submit" loading={salvando} disabled={!editando.fullName.trim()}>
                                    Salvar
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppShell>
    )
}
