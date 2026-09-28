// components/perfil/ProdutoGrid.tsx
"use client"

import Link from "next/link"
import { Package, Plus } from "lucide-react"
import {
  capaDoProduto,
  formatarPreco,
  type ProdutoItem,
} from "@/services/publish/seller-products.service"

interface Props {
  produtos: ProdutoItem[]
  /** true no seu próprio perfil: mostra botão para anunciar */
  dono?: boolean
}

export function ProdutoGrid({ produtos, dono = false }: Props) {
  if (produtos.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="size-16 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm font-medium text-muted-foreground">
          {dono ? "Você ainda não anunciou nada" : "Nenhum produto anunciado"}
        </p>
        {dono && (
          <Link
            href="/publicar"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-4" />
            Anunciar produto
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {produtos.map((p) => {
        const capa = capaDoProduto(p)
        return (
          <Link
            key={p.id}
            href={`/produtos/${p.id}`}
            className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
          >
            <div className="aspect-square bg-secondary">
              {capa ? (
                <img src={capa} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center">
                  <Package className="size-8 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
              <p className="mt-0.5 text-sm font-bold text-primary">{formatarPreco(p.price)}</p>
              {p.status && p.status !== "ATIVO" && (
                <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                  {p.status.toLowerCase()}
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}