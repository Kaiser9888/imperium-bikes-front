// app/modalidades/speed/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ArrowLeft, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const categorias = [
    "Bike Completa",
    "Quadro",
    "Rodas",
    "Pneus",
    "Guidão",
    "Selim",
    "Pedais",
    "Grupo de Transmissão",
    "Freios",
    "Capacete",
    "Luva",
    "Camisa",
    "Bermuda",
    "Sapato",
    "Óculos",
]

export default function SpeedPage() {
    const [filtroAberto, setFiltroAberto] = useState(false)
    const [condicao, setCondicao] = useState<string | null>(null)
    const [precoMin, setPrecoMin] = useState("")
    const [precoMax, setPrecoMax] = useState("")
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null)

    const limparFiltros = () => {
        setCondicao(null)
        setPrecoMin("")
        setPrecoMax("")
        setCategoriaSelecionada(null)
    }

    const filtrosAtivos = [condicao, categoriaSelecionada, precoMin && `R$ ${precoMin}`, precoMax && `até R$ ${precoMax}`].filter(Boolean).length

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
                    poster="/images/speed-poster.png"
                >
                    <source src="/videos/speed-hero.mp4" type="video/mp4" />
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
                        Speed
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-background/80 md:text-base">
                        Pura velocidade sobre asfalto. As bikes de estrada são máquinas de precisão projetadas para ir mais longe e mais rápido.
                    </p>
                </div>
            </section>

            {/* História */}
            <section className="mx-auto max-w-3xl px-4 py-10">
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                    A Origem do Speed
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        O ciclismo de estrada é a modalidade mais antiga do esporte, com raízes que remontam ao século XIX. A primeira
                        corrida documentada aconteceu em 1868, no Parc de Saint-Cloud, em Paris, e a primeira grande competição de estrada,
                        a Liège-Bastogne-Liège, foi disputada em 1892 na Bélgica. O Tour de France, criado em 1903 pelo jornalista
                        <strong className="text-foreground"> Henri Desgrange</strong>, tornou-se o maior evento do ciclismo mundial.
                    </p>
                    <p>
                        O ciclismo de estrada moderno foi moldado por lendas como <strong className="text-foreground">Fausto Coppi</strong>,
                        italiano que dominou os anos 1940 e 50 com seu estilo elegante; <strong className="text-foreground">Eddy Merckx</strong>,
                        o belga canibal que venceu tudo nos anos 1960 e 70 com 525 vitórias na carreira; e mais recentemente, nomes como
                        <strong className="text-foreground"> Miguel Indurain</strong>, pentacampeão do Tour, e
                        <strong className="text-foreground"> Lance Armstrong</strong>.
                    </p>
                    <p>
                        Hoje, as bikes de speed evoluíram para máquinas de fibra de carbono ultraleves, com quadros abaixo de 700g,
                        grupos eletrônicos de precisão milimétrica, freios a disco e aerodinâmica refinada em túnel de vento.
                        O esporte profissional atinge velocidades superiores a 50 km/h no plano e 100 km/h em descidas.
                    </p>
                </div>
            </section>

            {/* Barra de filtro */}
            <section className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                        Explorar Speed
                    </h2>
                    <button
                        onClick={() => setFiltroAberto(true)}
                        className="relative flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
                    >
                        <SlidersHorizontal className="size-4" />
                        Filtros
                        {filtrosAtivos > 0 && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                                {filtrosAtivos}
                            </span>
                        )}
                    </button>
                </div>

                {filtrosAtivos > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {condicao && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                {condicao}
                                <button onClick={() => setCondicao(null)}><X className="size-3" /></button>
                            </span>
                        )}
                        {categoriaSelecionada && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                {categoriaSelecionada}
                                <button onClick={() => setCategoriaSelecionada(null)}><X className="size-3" /></button>
                            </span>
                        )}
                        {precoMin && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                A partir de R$ {precoMin}
                                <button onClick={() => setPrecoMin("")}><X className="size-3" /></button>
                            </span>
                        )}
                        {precoMax && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                Até R$ {precoMax}
                                <button onClick={() => setPrecoMax("")}><X className="size-3" /></button>
                            </span>
                        )}
                        <button
                            onClick={limparFiltros}
                            className="text-xs text-muted-foreground hover:text-foreground underline"
                        >
                            Limpar todos
                        </button>
                    </div>
                )}
            </section>

            {/* Conteúdo (placeholder) */}
            <section className="mx-auto max-w-7xl px-4 pb-10">
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <p className="text-muted-foreground text-sm">Produtos de Speed — em breve.</p>
                </div>
            </section>

            <div className="pb-24" />
            <BottomNav onMenuClick={() => {}} />

            {/* Drawer do Filtro */}
            {filtroAberto && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-foreground/40" onClick={() => setFiltroAberto(false)} />
                    <div className="relative z-10 flex h-full w-[85%] max-w-sm flex-col bg-sidebar shadow-2xl">
                        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
                            <h3 className="font-heading text-base font-bold uppercase tracking-wide text-sidebar-foreground">
                                Filtros
                            </h3>
                            <button
                                onClick={() => setFiltroAberto(false)}
                                className="flex size-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Condição</h4>
                                <div className="flex gap-2">
                                    {["Novo", "Usado"].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCondicao(condicao === c ? null : c)}
                                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                                condicao === c
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-sidebar-foreground hover:bg-sidebar-accent"
                                            }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Faixa de Preço</h4>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Mínimo"
                                        value={precoMin}
                                        onChange={(e) => setPrecoMin(e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-sidebar px-3 py-2 text-sm text-sidebar-foreground outline-none focus:ring-2 focus:ring-ring/40"
                                    />
                                    <span className="text-muted-foreground text-sm">até</span>
                                    <input
                                        type="number"
                                        placeholder="Máximo"
                                        value={precoMax}
                                        onChange={(e) => setPrecoMax(e.target.value)}
                                        className="w-full rounded-lg border border-sidebar-border bg-sidebar px-3 py-2 text-sm text-sidebar-foreground outline-none focus:ring-2 focus:ring-ring/40"
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Categoria</h4>
                                <div className="flex flex-wrap gap-2">
                                    {categorias.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategoriaSelecionada(categoriaSelecionada === cat ? null : cat)}
                                            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                                                categoriaSelecionada === cat
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-secondary text-sidebar-foreground hover:bg-sidebar-accent"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-sidebar-border px-5 py-4 flex gap-2">
                            <button
                                onClick={limparFiltros}
                                className="flex-1 rounded-lg border border-sidebar-border py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={() => setFiltroAberto(false)}
                                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}