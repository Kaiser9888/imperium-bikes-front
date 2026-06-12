"use client"

import { Heart, Star } from "lucide-react"
import { useState } from "react"

const produtos = [
    { id: 1, nome: "Imperator Trail X1", modalidade: "Mountain", preco: 8990, precoAntigo: 10990, img: "/images/produto-1.png", nota: 4.9 },
    { id: 2, nome: "Velox Carbon Pro", modalidade: "Speed", preco: 14990, precoAntigo: null, img: "/images/produto-2.png", nota: 4.8 },
    { id: 3, nome: "Gladius BMX Street", modalidade: "BMX", preco: 3290, precoAntigo: 3990, img: "/images/produto-3.png", nota: 4.7 },
    { id: 4, nome: "Civis Urban Comfort", modalidade: "Urbana", preco: 4590, precoAntigo: null, img: "/images/produto-4.png", nota: 4.6 },
]

function formatPreco(valor: number) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
}

export function ProdutosDestaque() {
    const [favoritos, setFavoritos] = useState<number[]>([])

    const toggleFavorito = (id: number) => {
        setFavoritos((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
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
                                    aria-pressed={isFav}
                                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-card"
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
                  {produto.modalidade}
                </span>
                                <h3 className="text-sm font-semibold leading-tight text-card-foreground">{produto.nome}</h3>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="size-3 fill-accent text-accent" />
                                    {produto.nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
                                </div>
                                <div className="mt-auto flex flex-col pt-1">
                                    {produto.precoAntigo && (
                                        <span className="text-xs text-muted-foreground line-through">
                      {formatPreco(produto.precoAntigo)}
                    </span>
                                    )}
                                    <span className="font-heading text-base font-bold text-foreground">{formatPreco(produto.preco)}</span>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}