"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { User } from "lucide-react"

import { Rating } from "@/components/ui/rating"
import api from "@/lib/api"
import { cn } from "@/lib/utils"

type Props = {
    id: string
    nome: string
    avatarUrl?: string | null
    /** Botão no rodapé do cartão (ex.: Falar com vendedor). */
    acao?: React.ReactNode
    className?: string
}

/** Cartão do vendedor com nota e anúncios ativos reais. */
export function ProdutoVendedor({ id, nome, avatarUrl, acao, className }: Props) {
    const [nota, setNota] = useState<{ average: number; count: number } | null>(null)
    const [ativos, setAtivos] = useState<number | null>(null)
    // Foto antiga do disco do Render some (404): cai nas iniciais em vez de um buraco
    const [avatarQuebrado, setAvatarQuebrado] = useState(false)

    useEffect(() => {
        api.get(`/api/reviews/user/${id}/rating`).then((r) => setNota(r.data)).catch(() => {})
        api.get("/api/products", { params: { sellerId: id, size: 1 } })
            .then((r) => setAtivos(r.data.totalElements))
            .catch(() => {})
    }, [id])

    const iniciais = nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()

    return (
        <div className={cn("rounded-2xl border border-border bg-surface p-5", className)}>
            <p className="type-caption font-semibold uppercase tracking-[0.14em] text-muted-foreground">Vendido por</p>
            <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    {avatarUrl && !avatarQuebrado ? (
                        // eslint-disable-next-line @next/next/no-img-element -- avatar externo do Clerk
                        <img src={avatarUrl} alt="" onError={() => setAvatarQuebrado(true)} className="size-12 shrink-0 rounded-full object-cover" />
                    ) : (
                        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-surface-muted text-sm font-bold">
                            {iniciais || <User className="size-5" />}
                        </div>
                    )}
                    <p className="type-label truncate text-foreground">{nome}</p>
                </div>
                <Link href={`/perfil/${id}`} className="type-label shrink-0 text-primary hover:underline">
                    Ver perfil
                </Link>
            </div>

            <div className="type-caption mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground">
                {nota && nota.count > 0 ? <Rating media={nota.average} total={nota.count} /> : <span>Ainda sem avaliações</span>}
                {ativos !== null && (
                    <span>
                        {ativos} {ativos === 1 ? "anúncio ativo" : "anúncios ativos"}
                    </span>
                )}
            </div>

            {acao && <div className="mt-4 border-t border-border pt-4">{acao}</div>}
        </div>
    )
}
