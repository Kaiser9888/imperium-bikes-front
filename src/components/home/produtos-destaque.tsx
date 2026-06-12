"use client"

import { Heart, Star } from "lucide-react"
import { useState, useEffect } from "react"
import api from "@/lib/api"

interface Produto {
    id: number
    nome?: string
    title?: string
    modalidade?: string
    category?: string
    preco?: number
    price?: number
    precoAntigo?: number
    oldPrice?: number
    img?: string
    imageUrl?: string
    nota?: number
    rating?: number
}

function formatPreco(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
}

export function ProdutosDestaque() {
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [loading, setLoading] = useState(true)
    const [favoritos, setFavoritos] = useState<number[]>([])

    useEffect(() => {
        async function loadProdutos() {
            try {
                const response = await api.get("/api/products", {
                    params: { page: 0, size: 10, sort: "createdAt,desc" }
                })
                const data = response.data.content || response.data || []
                setProdutos(data)
            } catch (error) {
                console.error("Erro ao carregar produtos:", error)
            } finally {
                setLoading(false)
            }
        }
        loadProdutos()
    }, [])

    const toggleFavorito = (id: number) => {
        setFavoritos((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
    }

    if (loading) {
        return (
            <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-4">
                    <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                        Produtos em destaque
                    </h2>
                </div>
                <div className="grid grid-cols-2 gap-3 px-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-secondary" />
                    ))}
                </div>
            </section>
        )
    }

    if (produtos.length === 0) {
        return (
            <section className="flex flex-col gap-3 px-4 py-10 text-center">
                <p className="text-muted-foreground">Nenhum produto cadastrado ainda.</p>
            </section>
        )
    }

    return (
        <section aria-labelledby="destaque-title" className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-4">
                <h2 id="destaque-title" className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
                    Produtos em destaque
                </h2>
                <a href="/produtos" className="text-xs font-medium text-primary hover:underline">
                    Ver tudo
                </a>
            </div>

            <div className="grid grid-cols-2 gap-3 px-4">
                {produtos.map((produto) => {
                    const isFav = favoritos.includes(produto.id)
                    const nome = produto.nome || produto.title || "Sem nome"
                    const modalidade = produto.modalidade || produto.category || "Geral"
                    const preco = produto.preco || produto.price || 0
                    const precoAntigo = produto.precoAntigo || produto.oldPrice || null
                    const img = produto.img || produto.imageUrl || "/placeholder.svg"
                    const nota = produto.nota || produto.rating || 0

                    return (
                        <article
                            key={produto.id}
                            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
                        >
                            <div className="relative aspect-square bg-secondary">
                                <img
                                    src={img}
                                    alt={nome}
                                    className="size-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleFavorito(produto.id)}
                                    aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                    aria-pressed={isFav}
                                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-card"
                                >
                                    <Heart className={`size-4 ${isFav ? "fill-primary text-primary" : ""}`} />
                                </button>
                                {precoAntigo && (
                                    <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 font-heading text-[0.6rem] font-bold uppercase text-primary-foreground">
                    Oferta
                  </span>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col gap-1 p-3">
                <span className="font-heading text-[0.6rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  {modalidade}
                </span>
                                <h3 className="text-sm font-semibold leading-tight text-card-foreground">{nome}</h3>
                                {nota > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Star className="size-3 fill-accent text-accent" />
                                        {nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
                                    </div>
                                )}
                                <div className="mt-auto flex flex-col pt-1">
                                    {precoAntigo && (
                                        <span className="text-xs text-muted-foreground line-through">
                      {formatPreco(precoAntigo)}
                    </span>
                                    )}
                                    <span className="font-heading text-base font-bold text-foreground">{formatPreco(preco)}</span>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}