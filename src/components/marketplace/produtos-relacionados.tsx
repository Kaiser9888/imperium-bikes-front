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
        <section className="mt-14 border-t border-border pt-10" aria-labelledby="relacionados-title">
            <p className="type-caption mb-2 font-semibold uppercase tracking-[0.16em] text-primary">Você também pode gostar</p>
            <h2 id="relacionados-title" className="type-h2 text-foreground">
                Produtos relacionados
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {produtos.map((p) => (
                    <li key={p.id}>
                        <ProductCard id={p.id} title={p.title} price={p.price} oldPrice={p.originalPrice} category={p.brand || undefined} image={capa(p)} />
                    </li>
                ))}
            </ul>
        </section>
    )
}
