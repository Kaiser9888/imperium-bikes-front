/* eslint-disable react-hooks/set-state-in-effect, @typescript-eslint/no-explicit-any */
// app/buscar/page.tsx
"use client"

import { Search, Package, User, X, TrendingUp, MapPin, Star } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { searchProducts, searchUsers } from "@/lib/meilisearch"

interface ProdutoResult {
    id: number
    title?: string
    nome?: string
    price?: number
    preco?: number
    img?: string
    imageUrl?: string
    category?: string
    modalidade?: string
    rating?: number
    nota?: number
    seller?: string
    vendedor?: string
}

interface PessoaResult {
    id: string
    nome: string
    username: string
    avatar: string
    bio: string
    cidade?: string
    estado?: string
}

export default function BuscarPage() {
    const [query, setQuery] = useState("")
    const [aba, setAba] = useState<"produtos" | "pessoas">("produtos")
    const [produtos, setProdutos] = useState<ProdutoResult[]>([])
    const [pessoas, setPessoas] = useState<PessoaResult[]>([])
    const [loading, setLoading] = useState(false)
    const [historico, setHistorico] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus()
    }, [])

    useEffect(() => {
        if (query.trim().length < 2) {
            setProdutos([])
            setPessoas([])
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                if (aba === "produtos") {
                    const results = await searchProducts(query)
                    setProdutos(results as ProdutoResult[])
                } else {
                    const results = await searchUsers(query)
                    setPessoas(results as PessoaResult[])
                }
            } catch (error) {
                console.error("Erro na busca:", error)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query, aba])

    const salvarHistorico = (termo: string) => {
        if (termo.trim() && !historico.includes(termo.trim())) {
            setHistorico([termo.trim(), ...historico].slice(0, 10))
        }
    }

    const handleSearch = (termo: string) => {
        setQuery(termo)
        salvarHistorico(termo)
    }

    function formatPreco(valor: number) {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
                <div className="bg-marble/15 backdrop-blur-[2px]">
                    <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3">
                        <Link href="/" className="flex shrink-0 items-center gap-2 text-marble-foreground hover:text-foreground">
                            <X className="size-5" />
                        </Link>
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") salvarHistorico(query)
                                }}
                                placeholder="Buscar produtos e pessoas..."
                                className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/30"
                            />
                            {query && (
                                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="size-4 text-muted-foreground hover:text-foreground" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="mx-auto flex w-full max-w-7xl px-4 pb-2">
                        {[
                            { key: "produtos", label: "Produtos", icon: Package },
                            { key: "pessoas", label: "Pessoas", icon: User },
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setAba(key as "produtos" | "pessoas")}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    aba === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                <Icon className="size-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-4 py-4">
                {!query && historico.length > 0 && (
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Buscas recentes</h3>
                        <div className="space-y-1">
                            {historico.map((termo) => (
                                <button
                                    key={termo}
                                    onClick={() => handleSearch(termo)}
                                    className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                                >
                                    <TrendingUp className="size-4" />
                                    {termo}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-10">
                        <div className="inline-block size-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground mt-3">Buscando...</p>
                    </div>
                )}

                {!loading && aba === "produtos" && query.trim().length >= 2 && (
                    <>
                        {produtos.length === 0 ? (
                            <div className="text-center py-16">
                                <Package className="size-12 text-muted-foreground/40 mx-auto mb-4" />
                                <p className="text-sm font-medium text-muted-foreground">Nenhum produto encontrado</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Tente outro termo de busca</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-muted-foreground mb-3">{produtos.length} produto{produtos.length > 1 ? 's' : ''} encontrado{produtos.length > 1 ? 's' : ''}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {produtos.map((p) => (
                                        <Link key={p.id} href={`/produto/${p.id}`} className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all hover:border-primary/20">
                                            <div className="aspect-square bg-secondary relative overflow-hidden">
                                                <img src={p.img || p.imageUrl || "/placeholder.svg"} alt={p.title || p.nome || ""} className="size-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            </div>
                                            <div className="p-3">
                                                <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">{p.category || p.modalidade || "Geral"}</span>
                                                <h3 className="text-sm font-semibold mt-1 line-clamp-2 group-hover:text-primary transition-colors">{p.title || p.nome}</h3>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="size-3 fill-yellow-500 text-yellow-500" />
                                                    <span className="text-xs text-muted-foreground">{p.rating || p.nota || "—"}</span>
                                                </div>
                                                <p className="font-heading text-base font-bold text-foreground mt-1">{formatPreco(p.price || p.preco || 0)}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {!loading && aba === "pessoas" && query.trim().length >= 2 && (
                    <>
                        {pessoas.length === 0 ? (
                            <div className="text-center py-16">
                                <User className="size-12 text-muted-foreground/40 mx-auto mb-4" />
                                <p className="text-sm font-medium text-muted-foreground">Nenhuma pessoa encontrada</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">Tente outro termo de busca</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-xs text-muted-foreground mb-3">{pessoas.length} pessoa{pessoas.length > 1 ? 's' : ''} encontrada{pessoas.length > 1 ? 's' : ''}</p>
                                <div className="space-y-2">
                                    {pessoas.map((p) => (
                                        <Link key={p.id} href={`/perfil/${p.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:shadow-sm hover:border-primary/20 transition-all group">
                                            <img src={p.avatar || "/placeholder.svg"} alt={p.nome} className="size-12 rounded-full object-cover ring-2 ring-border/50 group-hover:ring-primary/30 transition-all" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.nome}</p>
                                                <p className="text-xs text-muted-foreground">@{p.username}</p>
                                                {(p.cidade || p.estado) && (
                                                    <div className="flex items-center gap-1 mt-1 text-[0.6rem] text-muted-foreground">
                                                        <MapPin className="size-3" />
                                                        {[p.cidade, p.estado].filter(Boolean).join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-[0.6rem] text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                                Perfil
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}

                {query.trim().length > 0 && query.trim().length < 2 && (
                    <p className="text-center text-sm text-muted-foreground py-16">Digite pelo menos 2 caracteres para buscar</p>
                )}
            </main>
        </div>
    )
}