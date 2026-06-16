// app/configuracoes/patrocinadores/page.tsx
"use client"

import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Plus, Trash2, Upload, Image, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const MAX_BANNERS = 6
const FORMATOS_ACEITOS = "PNG, JPG ou WEBP"
const TAMANHO_MAXIMO = "2 MB"
const DIMENSOES_RECOMENDADAS = "400×200px"

export default function PatrocinadoresPage() {
    const { user, isSignedIn, isLoaded } = useUser()
    const [banners, setBanners] = useState<string[]>([
        "/images/banner-patro-1.png",
        "/images/banner-patro-2.png",
        "/images/banner-patro-3.png",
    ])
    const [mostrarForm, setMostrarForm] = useState(false)
    const [novaImagem, setNovaImagem] = useState("")
    const [erro, setErro] = useState("")

    const adicionarBanner = () => {
        setErro("")
        if (!novaImagem.trim()) {
            setErro("Insira a URL da imagem.")
            return
        }
        if (banners.length >= MAX_BANNERS) {
            setErro(`Máximo de ${MAX_BANNERS} banners. Remova um para adicionar.`)
            return
        }
        setBanners([...banners, novaImagem])
        setNovaImagem("")
        setMostrarForm(false)
    }

    const removerBanner = (index: number) => {
        setBanners(banners.filter((_, i) => i !== index))
    }

    if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Carregando...</p></div>
    if (!isSignedIn) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Entre para acessar</p></div>

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center px-4 py-3">
                        <Link href="/perfil" className="flex items-center gap-2 text-marble-foreground hover:text-foreground">
                            <ArrowLeft className="size-5" />
                            <span className="text-sm">Voltar</span>
                        </Link>
                        <h1 className="flex-1 text-center font-heading text-sm font-bold uppercase tracking-widest text-marble-foreground">Gerenciar Banners</h1>
                        <div className="w-16" />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
                {/* Especificações */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-muted-foreground" />
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Especificações dos banners</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <p>• Formato: {FORMATOS_ACEITOS}</p>
                        <p>• Máximo: {TAMANHO_MAXIMO}</p>
                        <p>• Dimensão: {DIMENSOES_RECOMENDADAS}</p>
                        <p>• Limite: {MAX_BANNERS} banners</p>
                    </div>
                </div>

                {/* Banners atuais */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Seus banners ({banners.length}/{MAX_BANNERS})
                        </h2>
                    </div>

                    {banners.length === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                            <Image className="size-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Nenhum banner cadastrado</p>
                            <p className="text-xs text-muted-foreground mt-1">Adicione banners de patrocinadores ou parceiros</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {banners.map((banner, i) => (
                                <div
                                    key={i}
                                    className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all"
                                >
                                    <img
                                        src={banner}
                                        alt={`Banner ${i + 1}`}
                                        className="w-full h-24 object-cover"
                                    />
                                    <button
                                        onClick={() => removerBanner(i)}
                                        className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                                        <span className="text-[0.6rem] text-white font-medium">Banner {i + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Formulário */}
                {mostrarForm ? (
                    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground">Adicionar banner</h3>
                        <div>
                            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">URL da imagem</label>
                            <input
                                type="text"
                                value={novaImagem}
                                onChange={(e) => { setNovaImagem(e.target.value); setErro("") }}
                                placeholder="https://exemplo.com/banner.png"
                                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30"
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Aceito: {FORMATOS_ACEITOS} • Máx: {TAMANHO_MAXIMO}
                            </p>
                        </div>
                        {erro && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="size-3" /> {erro}
                            </p>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setMostrarForm(false); setErro("") }}
                                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={adicionarBanner}
                                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setMostrarForm(true)}
                        disabled={banners.length >= MAX_BANNERS}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-medium transition-all ${
                            banners.length >= MAX_BANNERS
                                ? "border-border text-muted-foreground/50 cursor-not-allowed"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                        }`}
                    >
                        <Plus className="size-4" />
                        {banners.length >= MAX_BANNERS ? "Limite de banners atingido" : "Adicionar banner"}
                    </button>
                )}
            </main>
        </div>
    )
}