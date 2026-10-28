// app/admin/page.tsx  →  Painel de administração
"use client"

import Link from "next/link"
import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Loader2, ShieldAlert } from "lucide-react"

import { AnunciosAdmin } from "@/components/admin/anuncios-admin"
import { BannersAdmin } from "@/components/admin/banners-admin"
import { BikesRoubadasAdmin } from "@/components/admin/bikes-roubadas-admin"
import { DisputasAdmin } from "@/components/admin/disputas-admin"
import { PendenciasAdmin } from "@/components/admin/pendencias-admin"
import { DenunciasAdmin } from "@/components/admin/denuncias-admin"
import { SuporteAdmin } from "@/components/admin/suporte-admin"
import { UsuariosAdmin } from "@/components/admin/usuarios-admin"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Logo } from "@/components/layout/logo"
import { BackButton } from "@/components/ui/back-button"
import { useIsAdmin } from "@/lib/use-is-admin"

const ABAS = [
    // Pendências primeiro: o que espera decisão, com atalho para cada fila
    { id: "pendencias", label: "Pendências" },
    { id: "disputas", label: "Disputas" },
    { id: "banners", label: "Banners" },
    { id: "anuncios", label: "Anúncios" },
    { id: "denuncias", label: "Denúncias" },
    { id: "suporte", label: "Suporte" },
    { id: "usuarios", label: "Usuários" },
    { id: "bikes-roubadas", label: "Bikes roubadas" },
] as const

type Aba = (typeof ABAS)[number]["id"]

export default function AdminPage() {
    const { isLoaded, isSignedIn } = useUser()
    const { isAdmin, carregando } = useIsAdmin()
    const [aba, setAba] = useState<Aba>("pendencias")

    let conteudo: React.ReactNode
    if (!isLoaded || (isSignedIn && carregando)) {
        conteudo = (
            <div className="grid place-items-center py-24">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    } else if (!isSignedIn || !isAdmin) {
        conteudo = (
            <div className="py-20">
                <ShieldAlert className="size-8 text-muted-foreground" aria-hidden="true" />
                <h1 className="type-h1 mt-4">Área restrita</h1>
                <p className="type-body-small mt-2 max-w-md text-muted-foreground">
                    {isSignedIn
                        ? "Sua conta não tem permissão de administrador."
                        : "Entre com uma conta de administrador para continuar."}
                </p>
                {!isSignedIn && (
                    <Link href="/sign-in?redirect_url=/admin" className="line-btn mt-6">
                        Entrar
                    </Link>
                )}
            </div>
        )
    } else {
        conteudo = (
            <>
                <h1 className="type-h1">Painel admin</h1>
                <nav aria-label="Seções do painel" className="-mx-4 mt-5 overflow-x-auto px-4 [scrollbar-width:none]">
                    <div className="flex gap-6 border-b border-border pb-2">
                        {ABAS.map((a) => (
                            <button
                                key={a.id}
                                type="button"
                                onClick={() => setAba(a.id)}
                                aria-pressed={aba === a.id}
                                className="line-btn line-btn--sm line-btn--muted"
                            >
                                {a.label}
                            </button>
                        ))}
                    </div>
                </nav>
                <div className="mt-6">
                    {aba === "pendencias" && <PendenciasAdmin onAbrir={setAba} />}
                    {aba === "disputas" && <DisputasAdmin />}
                    {aba === "banners" && <BannersAdmin />}
                    {aba === "anuncios" && <AnunciosAdmin />}
                    {aba === "denuncias" && <DenunciasAdmin />}
                    {aba === "suporte" && <SuporteAdmin />}
                    {aba === "usuarios" && <UsuariosAdmin />}
                    {aba === "bikes-roubadas" && <BikesRoubadasAdmin />}
                </div>
            </>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2.5 md:px-6">
                    <BackButton href="/" />
                    <p className="type-caption font-semibold uppercase tracking-[0.18em] text-muted-foreground">Administração</p>
                    <Logo compact className="ml-auto" />
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 pb-32 pt-6 md:px-6">{conteudo}</main>
            <BottomNav />
        </div>
    )
}
