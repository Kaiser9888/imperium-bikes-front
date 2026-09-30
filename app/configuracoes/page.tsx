// app/configuracoes/page.tsx
"use client"

import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import axios from "axios"

export default function ConfiguracoesPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const [nome, setNome] = useState("")
    const [bio, setBio] = useState("")
    const [cidade, setCidade] = useState("")
    const [estado, setEstado] = useState("")
    const [pais, setPais] = useState("Brasil")
    const [username, setUsername] = useState("")
    const [salvo, setSalvo] = useState(false)
    const [salvando, setSalvando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [carregandoPerfil, setCarregandoPerfil] = useState(true)
    const [perfilCarregado, setPerfilCarregado] = useState(false)

    useEffect(() => {
        if (!isLoaded) return
        if (!isSignedIn || !user) return
        let active = true
        async function carregarPerfil() {
            try {
                const sync = await api.post("/api/users/sync")
                const profile = await api.get(`/api/users/${sync.data.id}`)
                if (!active) return
                setNome(profile.data.fullName ?? user?.fullName ?? "")
                setBio(profile.data.bio ?? "")
                setCidade(profile.data.city ?? "")
                setEstado(profile.data.state ?? "")
                setPais(profile.data.country ?? "Brasil")
                setPerfilCarregado(true)
            } catch (cause) {
                if (active) setErro(cause instanceof Error ? cause.message : "Não foi possível carregar seu perfil.")
            } finally {
                if (active) setCarregandoPerfil(false)
            }
        }
        void carregarPerfil()
        return () => { active = false }
    }, [isLoaded, isSignedIn, user])

    const salvar = async () => {
        if (!perfilCarregado) return
        setSalvando(true)
        setErro(null)
        setSalvo(false)
        try {
            await api.put("/api/users/me", {
                fullName: nome.trim(),
                bio: bio.trim(),
                city: cidade.trim(),
                state: estado.trim(),
                country: pais.trim(),
            })
            setSalvo(true)
        } catch (cause) {
            const response = axios.isAxiosError(cause) ? cause.response?.data as { message?: unknown; traceId?: unknown } | undefined : undefined
            const message = typeof response?.message === "string" ? response.message : cause instanceof Error ? cause.message : "Não foi possível salvar seu perfil."
            const trace = typeof response?.traceId === "string" ? ` Referência: ${response.traceId}.` : ""
            setErro(`${message}${trace}`)
        } finally {
            setSalvando(false)
        }
    }

    if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>
    if (!isSignedIn) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Entre para acessar</p></div>

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-3">
                        <Link href="/perfil" className="flex items-center gap-2 text-marble-foreground hover:text-foreground"><ArrowLeft className="size-5" /><span className="text-sm">Voltar</span></Link>
                        <h1 className="flex-1 text-center font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">Configurações</h1>
                        <div className="w-16" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6 space-y-8">
                {/* Perfil */}
                <section>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Perfil</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome completo</label>
                            <input type="text" value={nome || user?.fullName || ""} onChange={(event) => setNome(event.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">@username</label>
                            <input type="text" value={username || user?.username || ""} onChange={(e) => setUsername(e.target.value)} placeholder={user?.username || "seuusername"} disabled className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none opacity-60" />
                            <p className="text-[10px] text-muted-foreground mt-1">Único e intransferível.</p>
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Bio</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Conte sobre você..." className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30 resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[10px] text-muted-foreground uppercase tracking-wider">Cidade</label><input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" /></div>
                            <div><label className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado</label><input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" /></div>
                        </div>
                        <div><label className="text-[10px] text-muted-foreground uppercase tracking-wider">País</label><input type="text" value={pais} onChange={(e) => setPais(e.target.value)} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30" /></div>
                    </div>
                </section>

                {/* Patrocínio ainda não tem integração de backend nesta aplicação. */}
                <section>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Patrocinadores</h2>
                    <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">O gerenciamento de patrocinadores ainda não está integrado ao backend.</p>
                </section>

                {/* Histórico de torneios depende de uma API própria do backend. */}
                <section>
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Torneios</h2>
                    <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Os torneios disponíveis estão na <Link href="/torneios" className="font-medium text-primary underline">página de torneios</Link>. O perfil ainda não possui histórico de participação integrado.</p>
                </section>

                {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                {salvo && <p role="status" className="text-sm text-green-700">Perfil salvo com sucesso.</p>}
                <button onClick={salvar} disabled={salvando || carregandoPerfil || !perfilCarregado} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    {carregandoPerfil ? "Carregando perfil…" : salvando ? "Salvando…" : <><Save className="size-4" />Salvar alterações</>}
                </button>
            </main>
        </div>
    )
}
