// app/modalidades/mountain/page.tsx
"use client"

import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ArrowLeft, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const categorias = [
    "Bike Completa",
    "Quadro",
    "Suspensão Dianteira",
    "Suspensão Traseira",
    "Freios",
    "Rodas",
    "Pneus",
    "Guidão",
    "Pedais",
    "Capacete",
    "Luva",
    "Joelheira",
    "Camisa",
    "Bermuda",
    "Sapato",
    "Óculos",
]

export default function MountainPage() {
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
                    poster="/images/mountain-poster.png"
                >
                    <source src="/videos/mountain-hero.mp4" type="video/mp4" />
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
                        Mountain
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-background/80 md:text-base">
                        Explorar trilhas, vencer montanhas e desafiar limites. O mountain bike é a união perfeita entre natureza e aventura.
                    </p>
                </div>
            </section>

            {/* História */}
            <section className="mx-auto max-w-3xl px-4 py-10">
                <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                    A Origem do Mountain Bike
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        O mountain bike nasceu no início dos anos 1970, no condado de Marin, Califórnia, quando um grupo de amigos
                        começou a modificar bicicletas antigas para descer as trilhas íngremes do Monte Tamalpais. Eles pegavam
                        bicicletas cruiser dos anos 1930 e 1940, reforçavam os quadros, colocavam pneus mais largos e freios melhores,
                        criando as primeiras "klunkers".
                    </p>
                    <p>
                        Os pioneiros do esporte foram <strong className="text-foreground">Gary Fisher</strong>,
                        <strong className="text-foreground"> Joe Breeze</strong>, <strong className="text-foreground">Charlie Kelly</strong> e
                        <strong className="text-foreground"> Tom Ritchey</strong>. Joe Breeze construiu o primeiro quadro específico para
                        mountain bike em 1977, chamado Breezer #1. Gary Fisher fundou a primeira empresa dedicada ao esporte, a
                        MountainBikes, e Tom Ritchey revolucionou a fabricação de quadros e componentes.
                    </p>
                    <p>
                        Em 1981, a Specialized lançou a Stumpjumper, a primeira mountain bike produzida em massa. Desde então, o esporte
                        explodiu em popularidade, tornando-se categoria olímpica em Atlanta 1996. Hoje, o mountain bike abrange diversas
                        disciplinas: cross-country, trail, enduro, downhill e freeride, cada uma com bikes e equipamentos especializados.
                    </p>
                </div>
            </section>

            {/* Barra de filtro */}
            <section className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                        Explorar Mountain
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
                    <p className="text-muted-foreground text-sm">Produtos de Mountain Bike — em breve.</p>
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