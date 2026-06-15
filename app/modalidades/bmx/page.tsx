// app/modalidades/bmx/page.tsx
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

export default function BMXPage() {
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
                    poster="/images/bmx-poster.png"
                >
                    <source src="/videos/bmx-hero.mp4" type="video/mp4" />
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
                        BMX
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-background/80 md:text-base">
                        Das ruas da Califórnia para o mundo. O BMX é pura expressão sobre duas rodas, entre manobras, velocidade e estilo.
                    </p>
                </div>
            </section>

            {/* História */}
            <section className="mx-auto max-w-3xl px-4 py-10">
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                    A Origem do BMX
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        O BMX (Bicycle Motocross) nasceu no final dos anos 1960, no sul da Califórnia, quando jovens começaram a imitar
                        as corridas de motocross com bicicletas adaptadas em pistas de terra improvisadas. O esporte cresceu tão rápido
                        que em 1974 foi fundada a National Bicycle League (NBL), organizando as primeiras competições oficiais.
                    </p>
                    <p>
                        O grande nome por trás da popularização do BMX foi <strong className="text-foreground">Scot Breithaupt</strong>,
                        considerado o pai do esporte. Aos 13 anos, ele organizou a primeira corrida oficial em Long Beach e mais tarde
                        fundou a SE Racing, uma das marcas mais icônicas do BMX. Nos anos 80, o filme E.T. colocou o BMX no imaginário
                        mundial, com as bicicletas se tornando objeto de desejo de toda uma geração.
                    </p>
                    <p>
                        Hoje, o BMX se divide em duas vertentes principais: o <strong className="text-foreground">BMX Racing</strong>,
                        esporte olímpico desde Pequim 2008, com circuitos de terra e saltos cronometrados; e o
                        <strong className="text-foreground"> BMX Freestyle</strong>, focado em manobras e criatividade em rampas, corrimões
                        e pistas de skate, também olímpico desde Tóquio 2020.
                    </p>
                </div>
            </section>

            {/* Filtros */}
            <section className="mx-auto max-w-7xl px-4 py-10">
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground mb-5">
                    Explorar BMX
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
                        {ativo === "bikes" && "Bikes completas de BMX — em breve."}
                        {ativo === "quadros" && "Quadros e chassis para BMX — em breve."}
                        {ativo === "pecas" && "Guidões, pedais, cubos e componentes — em breve."}
                        {ativo === "vestuario" && "Capacetes, luvas, cotoveleiras e roupas casuais — em breve."}
                    </p>
                </div>
            </section>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />
        </div>
    )
}