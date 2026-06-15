"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ArrowLeft, Bike, Frame, Wrench, Shirt } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const filtros = [
    { key: "bikes", label: "Bikes", icon: Bike },
    { key: "quadros", label: "Quadros", icon: Frame },
    { key: "pecas", label: "Peças", icon: Wrench },
    { key: "vestuario", label: "Vestuário", icon: Shirt },
]

export default function DownhillPage() {
    const [ativo, setAtivo] = useState("bikes")

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

                <Link
                    href="/"
                    className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-background/80 px-3 py-2 text-sm font-medium text-foreground backdrop-blur hover:bg-background"
                >
                    <ArrowLeft className="size-4" />
                    Voltar
                </Link>

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

            {/* Filtros */}
            <section className="mx-auto max-w-7xl px-4 py-10">
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground mb-5">
                    Explorar Downhill
                </h2>

                <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
                    {filtros.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setAtivo(key)}
                            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                                ativo === key
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                            }`}
                        >
                            <Icon className="size-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Conteúdo do filtro */}
                <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                        {ativo === "bikes" && "Bikes completas de downhill — em breve."}
                        {ativo === "quadros" && "Quadros e chassis para downhill — em breve."}
                        {ativo === "pecas" && "Suspensão, freios, rodas e componentes — em breve."}
                        {ativo === "vestuario" && "Capacetes, luvas, joelheiras e roupas técnicas — em breve."}
                    </p>
                </div>
            </section>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}