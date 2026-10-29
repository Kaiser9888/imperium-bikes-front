"use client"

import { useEffect, useState } from "react"

import { ProductCard } from "@/components/marketplace/ProductCard"
import { productService } from "@/services/publish/product.service"
import type { ProductResponse } from "@/types/publish/product"

type Props = { produtoId: string; sport?: string | null; modality?: string | null }

const capa = (p: ProductResponse) => (p.images?.find((i) => i.isMain) ?? p.images?.[0])?.url

/** Outros anúncios da mesma modalidade/esporte; sem eles, os mais recentes. */
export function ProdutosRelacionados({ produtoId, sport, modality }: Props) {
    const [produtos, setProdutos] = useState<ProductResponse[]>([])

    useEffect(() => {
        const outros = (lista: ProductResponse[]) => lista.filter((p) => p.id !== produtoId).slice(0, 8)
        async function carregar() {
            const filtro = modality ? { modality } : sport ? { sport } : {}
            let lista = outros((await productService.getAll(0, 9, filtro)).content)
            if (lista.length === 0 && (modality || sport)) lista = outros((await productService.getAll(0, 9)).content)
            setProdutos(lista)
        }
        carregar().catch(() => {})
    }, [produtoId, sport, modality])

    if (produtos.length === 0) return null

    return (
        <section className="mt-10 border-t border-border pt-8" aria-labelledby="relacionados-title">
            <h2 id="relacionados-title" className="type-h3 text-foreground">
                Você também pode gostar
            </h2>
            {/* Celular: uma linha que rola de lado; telas maiores: grade */}
            <ul className="-mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                {produtos.map((p) => (
                    <li key={p.id} className="w-[44%] shrink-0 snap-start sm:w-auto">
                        <ProductCard id={p.id} title={p.title} price={p.price} oldPrice={p.originalPrice} aPartirDe={p.precoAPartirDe} category={p.brand || undefined} image={capa(p)} />
                    </li>
                ))}
            </ul>
        </section>
    )
}
