// app/perfil/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Camera, Package, Trophy, Grid3X3, ShoppingBag, Medal, Settings, MapPin, Link2 } from "lucide-react"
import { useState } from "react"

type Aba = "fotos" | "produtos" | "torneios"

const fotosFake = [
    "/images/galeria-1.png",
    "/images/galeria-2.png",
    "/images/galeria-3.png",
    "/images/galeria-4.png",
    "/images/galeria-5.png",
    "/images/galeria-6.png",
]

const torneiosFake = [
    { id: 1, nome: "Downhill Cup 2026", posicao: 1, data: "Mar 2026" },
    { id: 2, nome: "Mountain Challenge", posicao: 2, data: "Jan 2026" },
    { id: 3, nome: "Urban Race SP", posicao: 3, data: "Nov 2025" },
]

export default function PerfilPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const [aba, setAba] = useState<Aba>("fotos")

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-background">
                <Header onMenuClick={() => {}} cartCount={0} notificationCount={0} />
                <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                    <h1 className="font-blackletter text-3xl text-primary mb-4">Imperium</h1>
                    <p className="text-muted-foreground mb-6">Entre para acessar seu perfil</p>
                    <SignInButton mode="modal">
                        <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                            Entrar
                        </button>
                    </SignInButton>
                </div>
                <BottomNav onMenuClick={() => {}} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <Header onMenuClick={() => {}} cartCount={0} notificationCount={0} />

            {/* Cabeçalho do perfil */}
            <section className="mx-auto max-w-2xl px-4 py-8">
                <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={user.imageUrl || "/placeholder.svg"}
                            alt={user.fullName || "Perfil"}
                            className="size-20 rounded-full border-2 border-primary/20 object-cover md:size-24"
                        />
                        <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                            <Camera className="size-3.5" />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="font-heading text-xl font-bold text-foreground truncate">
                            {user.fullName || user.username || "Usuário Imperium"}
                        </h1>
                        <p className="text-sm text-muted-foreground truncate">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                Brasil
                            </span>
                            <span className="flex items-center gap-1">
                                <Link2 className="size-3" />
                                @{user.username || "usuario"}
                            </span>
                        </div>
                    </div>

                    <button className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        <Settings className="size-4" />
                    </button>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-2">
                    {[
                        { valor: fotosFake.length, label: "Fotos" },
                        { valor: 0, label: "Produtos" },
                        { valor: torneiosFake.length, label: "Torneios" },
                    ].map((stat) => (
                        <div key={stat.label} className="rounded-xl bg-card border border-border p-3 text-center">
                            <p className="font-heading text-lg font-bold text-foreground">{stat.valor}</p>
                            <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Abas */}
            <section className="mx-auto max-w-2xl px-4">
                <div className="flex border-b border-border">
                    {[
                        { key: "fotos", label: "Fotos", icon: Grid3X3 },
                        { key: "produtos", label: "Produtos", icon: ShoppingBag },
                        { key: "torneios", label: "Torneios", icon: Trophy },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setAba(key as Aba)}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${
                                aba === key
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Icon className="size-4" />
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Conteúdo da aba */}
            <section className="mx-auto max-w-2xl px-4 py-6">
                {/* Fotos */}
                {aba === "fotos" && (
                    <div className="grid grid-cols-3 gap-1.5">
                        {fotosFake.map((foto, i) => (
                            <div key={i} className="aspect-square bg-secondary rounded-lg overflow-hidden">
                                <img src={foto} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Produtos */}
                {aba === "produtos" && (
                    <div className="text-center py-12">
                        <Package className="size-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Nenhum produto cadastrado</p>
                        <button className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                            Vender agora
                        </button>
                    </div>
                )}

                {/* Torneios */}
                {aba === "torneios" && (
                    <div className="space-y-3">
                        {torneiosFake.map((torneio) => (
                            <div
                                key={torneio.id}
                                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                            >
                                <div className={`flex size-10 items-center justify-center rounded-full text-sm font-bold ${
                                    torneio.posicao === 1
                                        ? "bg-yellow-500/10 text-yellow-600"
                                        : torneio.posicao === 2
                                            ? "bg-gray-300/20 text-gray-400"
                                            : "bg-amber-600/10 text-amber-700"
                                }`}>
                                    {torneio.posicao}º
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground">{torneio.nome}</p>
                                    <p className="text-xs text-muted-foreground">{torneio.data}</p>
                                </div>
                                <Medal className={`size-5 ${
                                    torneio.posicao === 1
                                        ? "text-yellow-500"
                                        : torneio.posicao === 2
                                            ? "text-gray-400"
                                            : "text-amber-700"
                                }`} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}