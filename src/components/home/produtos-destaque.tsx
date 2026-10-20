"use client"

import Link from "next/link"
import { Package } from "lucide-react"
import { useEffect, useState } from "react"

import { HomeSection } from "@/components/home/home-section"
import { ProductCard } from "@/components/marketplace/ProductCard"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { FAVORITES_UPDATED_EVENT, readFavorites, toggleFavorite, type FavoriteProduct } from "@/lib/favorites"

interface Produto {
    id: string | number
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
    images?: { id?: string; url: string; isMain?: boolean; displayOrder?: number }[]
    photos?: string[]
}

type Estado = { status: "loading" } | { status: "error" } | { status: "ok"; produtos: Produto[] }

const gridClasses = "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"

export function ProdutosDestaque() {
    const [estado, setEstado] = useState<Estado>({ status: "loading" })
    const [favoritos, setFavoritos] = useState<string[]>([])

    useEffect(() => {
        const atualizarFavoritos = () => setFavoritos(readFavorites().map((product) => product.id))
        atualizarFavoritos()
        window.addEventListener(FAVORITES_UPDATED_EVENT, atualizarFavoritos)
        window.addEventListener("storage", atualizarFavoritos)
        return () => {
            window.removeEventListener(FAVORITES_UPDATED_EVENT, atualizarFavoritos)
            window.removeEventListener("storage", atualizarFavoritos)
        }
    }, [])

    const [tentativa, setTentativa] = useState(0)

    useEffect(() => {
        let ativo = true
        api
            .get("/api/products", { params: { page: 0, size: 10, sort: "createdAt,desc" } })
            .then((response) => response.data?.content ?? response.data)
            .then((dados) => {
                if (ativo) setEstado({ status: "ok", produtos: Array.isArray(dados) ? dados : [] })
            })
            .catch(() => {
                if (ativo) setEstado({ status: "error" })
            })
        return () => {
            ativo = false
        }
    }, [tentativa])

    const tentarNovamente = () => {
        setEstado({ status: "loading" })
        setTentativa((n) => n + 1)
    }

    return (
        <HomeSection id="marketplace" title="Anúncios recentes" href="/produtos" hrefLabel="Ver todos" linkStyle="cta">
            {estado.status === "loading" && (
                <div className={gridClasses} aria-busy="true">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <Skeleton className="aspect-square rounded-xl" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-5 w-2/5" />
                        </div>
                    ))}
                </div>
            )}

            {estado.status === "error" && (
                <ErrorState
                    title="Não foi possível carregar os produtos"
                    onRetry={tentarNovamente}
                    className="rounded-xl bg-surface-secondary"
                />
            )}

            {estado.status === "ok" && estado.produtos.length === 0 && (
                <EmptyState
                    icon={Package}
                    title="Nenhum produto anunciado ainda"
                    description="Os anúncios publicados aparecem aqui."
                    className="rounded-xl bg-surface-secondary"
                    action={
                        <Button asChild variant="outline">
                            <Link href="/vendedor">Anunciar um produto</Link>
                        </Button>
                    }
                />
            )}

            {estado.status === "ok" && estado.produtos.length > 0 && (
                <ul className={gridClasses}>
                    {estado.produtos.map((produto) => {
                        const id = String(produto.id)
                        const nome = produto.nome || produto.title || "Produto"
                        const preco = produto.preco ?? produto.price ?? 0
                        const img =
                            produto.photos?.[0] ||
                            produto.images?.find((image) => image.isMain)?.url ||
                            produto.images?.[0]?.url ||
                            produto.img ||
                            produto.imageUrl ||
                            null

                        const produtoParaFavorito: FavoriteProduct = {
                            id,
                            title: nome,
                            price: preco,
                            images:
                                produto.images?.map((image, index) => ({
                                    id: String(image.id ?? index),
                                    url: image.url,
                                    isMain: Boolean(image.isMain),
                                    displayOrder: image.displayOrder ?? index,
                                })) ?? (img ? [{ id: "legacy-image", url: img, isMain: true, displayOrder: 0 }] : []),
                        }

                        return (
                            <li key={id}>
                                <ProductCard
                                    id={id}
                                    title={nome}
                                    price={preco}
                                    oldPrice={produto.precoAntigo ?? produto.oldPrice}
                                    category={produto.modalidade || produto.category}
                                    image={img}
                                    favorite={favoritos.includes(id)}
                                    onToggleFavorite={() => toggleFavorite(produtoParaFavorito)}
                                />
                            </li>
                        )
                    })}
                </ul>
            )}
        </HomeSection>
    )
}
