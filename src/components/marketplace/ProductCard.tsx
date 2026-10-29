"use client"

import Link from "next/link"
import { Heart } from "lucide-react"

import { ProductImage } from "@/components/marketplace/ProductImage"
import { Price } from "@/components/ui/price"
import { cn } from "@/lib/utils"

export type ProductCardProps = {
    id: string
    title: string
    price: number
    /** Preço anterior real vindo da API; nunca inventado. */
    oldPrice?: number | null
    /** Serviço "a partir de" (combinado direto). */
    aPartirDe?: boolean
    category?: string
    image?: string | null
    favorite?: boolean
    onToggleFavorite?: () => void
}

export function ProductCard({ id, title, price, oldPrice, aPartirDe, category, image, favorite = false, onToggleFavorite }: ProductCardProps) {
    return (
        <article className="group relative flex flex-col gap-3">
            <Link href={`/produtos/${id}`} className="flex flex-col gap-3 rounded-xl">
                <div className="aspect-square overflow-hidden rounded-xl bg-surface-muted">
                    <ProductImage
                        src={image}
                        alt={title}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    {category && <p className="type-caption text-muted-foreground">{category}</p>}
                    <h3 className="type-body-small line-clamp-2 font-medium text-foreground group-hover:text-primary">
                        {title}
                    </h3>
                    <Price valor={price} valorAntigo={oldPrice} aPartirDe={aPartirDe} className="mt-0.5" />
                </div>
            </Link>

            {onToggleFavorite && (
                <button
                    type="button"
                    onClick={onToggleFavorite}
                    aria-label={favorite ? `Remover ${title} dos favoritos` : `Adicionar ${title} aos favoritos`}
                    aria-pressed={favorite}
                    className="absolute right-2 top-2 flex size-10 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95"
                >
                    <Heart className={cn("size-[18px]", favorite && "fill-accent text-accent")} aria-hidden="true" />
                </button>
            )}
        </article>
    )
}
