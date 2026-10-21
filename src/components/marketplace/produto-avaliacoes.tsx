"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"

import api from "@/lib/api"
import { cn } from "@/lib/utils"

type Avaliacao = {
    id: string
    reviewerName: string
    productTitle: string | null
    rating: number
    comment: string | null
    sellerResponse: string | null
    createdAt: string
}

/** Avaliações que o vendedor recebeu de quem comprou e recebeu o produto. */
export function ProdutoAvaliacoes({ vendedorId }: { vendedorId: string }) {
    const [lista, setLista] = useState<Avaliacao[] | null>(null)
    const [total, setTotal] = useState(0)
    const [todas, setTodas] = useState(false)

    useEffect(() => {
        api.get(`/api/reviews/user/${vendedorId}`, { params: { size: 5 } })
            .then((r) => {
                setLista(r.data.content)
                setTotal(r.data.totalElements)
            })
            .catch(() => setLista([]))
    }, [vendedorId])

    if (lista === null) return null
    // Sem avaliações: uma linha só, sem seção inteira
    if (lista.length === 0) {
        return (
            <p className="type-caption mt-8 border-t border-border pt-6 text-muted-foreground">
                Vendedor ainda sem avaliações. Só quem compra e recebe o produto pode avaliar.
            </p>
        )
    }
    const visiveis = todas ? lista : lista.slice(0, 2)

    return (
        <section className="mt-10 border-t border-border pt-8" aria-labelledby="avaliacoes-title">
            <h2 id="avaliacoes-title" className="type-h3 text-foreground">
                Avaliações do vendedor <span className="font-normal text-muted-foreground">({total})</span>
            </h2>

            {(
                <>
                    <ul className="mt-4 flex flex-col">
                        {visiveis.map((a) => (
                            <li key={a.id} className="border-b border-border py-5 first:pt-0">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="flex" role="img" aria-label={`Nota ${a.rating} de 5`}>
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <Star key={n} aria-hidden="true" className={cn("size-4", n <= a.rating ? "fill-warning text-warning" : "text-border")} />
                                        ))}
                                    </span>
                                    <span className="text-sm font-semibold">{a.reviewerName}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(a.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                                        {a.productTitle && ` · comprou ${a.productTitle}`}
                                    </span>
                                </div>
                                {a.comment && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{a.comment}</p>}
                                {a.sellerResponse && (
                                    <p className="mt-3 max-w-2xl border-l-2 border-border pl-3 text-xs leading-5 text-muted-foreground">
                                        <span className="font-semibold text-foreground">Resposta do vendedor:</span> {a.sellerResponse}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                    {!todas && lista.length > visiveis.length && (
                        <button type="button" onClick={() => setTodas(true)} className="type-label mt-3 min-h-9 text-primary underline underline-offset-2">
                            Ver mais avaliações
                        </button>
                    )}
                    {todas && total > lista.length && (
                        <p className="mt-4 text-xs text-muted-foreground">
                            Mostrando {lista.length} de {total} avaliações.
                        </p>
                    )}
                </>
            )}
        </section>
    )
}
