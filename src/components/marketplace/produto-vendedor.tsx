"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { User } from "lucide-react"

import { Rating } from "@/components/ui/rating"
import api from "@/lib/api"

type Props = { id: string; nome: string; avatarUrl?: string | null }

/** Cartão do vendedor com nota e anúncios ativos reais. */
export function ProdutoVendedor({ id, nome, avatarUrl }: Props) {
    const [nota, setNota] = useState<{ average: number; count: number } | null>(null)
    const [ativos, setAtivos] = useState<number | null>(null)

    useEffect(() => {
        api.get(`/api/reviews/user/${id}/rating`).then((r) => setNota(r.data)).catch(() => {})
        api.get("/api/products", { params: { sellerId: id, size: 1 } })
            .then((r) => setAtivos(r.data.totalElements))
            .catch(() => {})
    }, [id])

    const iniciais = nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()

    return (
        <div className="mt-6 border border-border bg-background p-5">
            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- avatar externo do Clerk
                        <img src={avatarUrl} alt="" className="size-12 shrink-0 rounded-full object-cover" />
                    ) : (
                        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-muted text-sm font-bold">
                            {iniciais || <User className="size-5" />}
                        </div>
                    )}
                    <p className="truncate font-semibold">{nome}</p>
                </div>
                <Link
                    href={`/perfil/${id}`}
                    className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-primary hover:underline"
                >
                    Ver perfil
                </Link>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                {nota && nota.count > 0 ? <Rating media={nota.average} total={nota.count} /> : <span>Ainda sem avaliações</span>}
                {ativos !== null && (
                    <span>
                        {ativos} {ativos === 1 ? "anúncio ativo" : "anúncios ativos"}
                    </span>
                )}
            </div>
        </div>
    )
}
