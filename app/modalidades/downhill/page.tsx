// app/modalidades/downhill/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Heart, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const produtos = [
    { id: 1, nome: "Gladius DH Pro", preco: 18990, precoAntigo: 22990, img: "/images/produto-dh-1.png", nota: 4.9 },
    { id: 2, nome: "Colossus Downhill", preco: 24990, precoAntigo: null, img: "/images/produto-dh-2.png", nota: 4.8 },
    { id: 3, nome: "Furia DH Carbon", preco: 15990, precoAntigo: 18990, img: "/images/produto-dh-3.png", nota: 4.7 },
    { id: 4, nome: "Abyss Gravity", preco: 21990, precoAntigo: null, img: "/images/produto-dh-4.png", nota: 4.6 },
]

function formatPreco(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
}

export default function DownhillPage() {
    const [favoritos, setFavoritos] = useState<number[]>([])

    const toggleFavorito = (id: number) => {
        setFavoritos((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])
    }

    return (
        <div className="min-h-screen bg-background">
            <Header onMenuClick={() => {}} cartCount={0} notificationCount={0} />

            {/* Hero com vídeo */}
            <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 size-full object-cover"
                    poster="/images/downhill-poster.png"
                >
                    <source src="/videos/downhill-hero.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                {/* Voltar */}
                <Link
                    href="/"
                    className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-background/80 px-3 py-2 text-sm font-medium text-foreground backdrop-blur hover:bg-background"
                >
                    <ArrowLeft className="size-4" />
                    Voltar
                </Link>

                {/* Texto sobre o vídeo */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <span className="inline-block rounded-full bg-primary px-3 py-1 font-heading text-xs font-semibold uppercase tracking-widest text-primary-foreground">
                        Modalidade
                    </span>
                    <h1 className="mt-3 font-blackletter text-4xl leading-none text-primary md:text-6xl">
                        Downhill
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-background/80 md:text-base">
                        Velocidade, adrenalina e precisão. O downhill nasceu nas montanhas e evoluiu para o ápice do ciclismo de gravidade.
                    </p>
                </div>
            </section>

            {/* História */}
            <section className="mx-auto max-w-3xl px-4 py-10">
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                    A Origem do Downhill
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        O downhill surgiu nos anos 1970, na Califórnia, quando ciclistas começaram a descer montanhas em bicicletas adaptadas.
                        O que era uma brincadeira entre amigos tornou-se competição oficial em 1990, no primeiro Campeonato Mundial de Mountain Bike
                        da UCI, em Durango, Colorado.
                    </p>
                    <p>
                        Considerado por muitos como <strong className="text-foreground">Gary Fisher</strong> e <strong className="text-foreground">Charlie Kelly</strong> como os precursores do mountain bike,
                        o downhill ganhou identidade própria com pilotos como <strong className="text-foreground">Nico Vouilloz</strong>, francês que dominou os anos 1990 com 10 títulos mundiais,
                        e <strong className="text-foreground">Steve Peat</strong>, lenda britânica coroada campeão mundial em 2009 após 17 temporadas.
                    </p>
                    <p>
                        Hoje, o downhill é uma das disciplinas mais extremas do ciclismo, com bikes de suspensão longa (200 mm),
                        geometria agressiva e freios a disco de alta performance, projetadas para enfrentar descidas técnicas a mais de 80 km/h.
                    </p>
                </div>
            </section>

            {/* Produtos */}
            <section className="mx-auto max-w-7xl px-4 py-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                        Bikes de Downhill
                    </h2>
                    <a href="/produtos?modalidade=downhill" className="text-xs font-medium text-primary hover:underline">
                        Ver todas
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {produtos.map((produto) => {
                        const isFav = favoritos.includes(produto.id)
                        return (
                            <article
                                key={produto.id}
                                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                            >
                                <div className="relative aspect-square bg-secondary">
                                    <img
                                        src={produto.img || "/placeholder.svg"}
                                        alt={produto.nome}
                                        className="size-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleFavorito(produto.id)}
                                        aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur hover:bg-card"
                                    >
                                        <Heart className={`size-4 ${isFav ? "fill-primary text-primary" : ""}`} />
                                    </button>
                                    {produto.precoAntigo && (
                                        <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 font-heading text-[0.6rem] font-bold uppercase text-primary-foreground">
                                            Oferta
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col gap-1 p-3">
                                    <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-widest text-muted-foreground">
                                        Downhill
                                    </span>
                                    <h3 className="text-sm font-semibold leading-tight text-card-foreground">
                                        {produto.nome}
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Star className="size-3 fill-accent text-accent" />
                                        {produto.nota.toFixed(1)}
                                    </div>
                                    <div className="mt-auto flex flex-col pt-1">
                                        {produto.precoAntigo && (
                                            <span className="text-xs text-muted-foreground line-through">
                                                {formatPreco(produto.precoAntigo)}
                                            </span>
                                        )}
                                        <span className="font-heading text-base font-bold text-foreground">
                                            {formatPreco(produto.preco)}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            </section>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}