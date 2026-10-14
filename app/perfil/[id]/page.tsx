/* eslint-disable @typescript-eslint/no-explicit-any */
// app/perfil/[id]/page.tsx
"use client"

import { MapPin } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ProdutoGrid } from "@/components/perfil/ProdutoGrid"
import { SponsorBanners, type Sponsor } from "@/components/perfil/SponsorBanners"
import { Loader } from "@/components/ui/loader"
import { sellerProductService, type ProdutoItem } from "@/services/publish/seller-products.service"

interface PerfilUsuario {
    userId: string
    fullName: string
    avatarUrl: string | null
    bio: string | null
    city: string | null
    state: string | null
    userLevel: string
    reputationScore: number
    totalReviews: number
    totalSales: number
    sponsors?: Sponsor[]
}

import { API_BASE_URL } from '@/lib/api-config'

import { BackButton } from "@/components/ui/back-button"

const API_URL = API_BASE_URL

export default function PerfilPublicoPage() {
    const params = useParams<{ id: string }>()
    const id = params?.id
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
    const [produtos, setProdutos] = useState<ProdutoItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        let cancelado = false

        async function carregar() {
            setLoading(true)
            try {
                const r = await fetch(`${API_URL}/api/users/${id}`)
                if (!r.ok) throw new Error("Usuário não encontrado")
                const data = await r.json()
                if (!cancelado) setPerfil(data)
            } catch {
                if (!cancelado) setPerfil(null)
            }

            // Produtos em try separado: se falhar, o perfil continua aparecendo
            try {
                const lista = await sellerProductService.listBySeller(String(id))
                // Perfil público só mostra anúncios ativos
                if (!cancelado) setProdutos(lista.filter((p) => (p.status ?? "ATIVO") === "ATIVO"))
            } catch {
                if (!cancelado) setProdutos([])
            }

            if (!cancelado) setLoading(false)
        }

        carregar()
        return () => { cancelado = true }
    }, [id])

    const header = (titulo?: string) => (
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
          <div>
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                      <BackButton href="/buscar" />
                      {titulo && <span className="font-heading text-lg font-bold text-foreground truncate">{titulo}</span>}
                  </div>
                  <Logo compact />
              </div>
          </div>
      </header>
    )

    if (loading) {
        return (
          <div className="min-h-screen bg-background">
              {header()}
              <Loader className="py-20" />
              <BottomNav />
          </div>
        )
    }

    if (!perfil) {
        return (
          <div className="min-h-screen bg-background">
              {header()}
              <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Usuário não encontrado</p></div>
              <BottomNav />
          </div>
        )
    }

    return (
      <div className="min-h-screen bg-background">
          {header(perfil.fullName)}

          <main className="mx-auto max-w-2xl px-4 py-8">
              <div className="flex items-start gap-5">
                  <div className="relative shrink-0">
                      <img src={perfil.avatarUrl || "/placeholder.svg"} alt={perfil.fullName} className="size-20 rounded-xl border-2 border-primary/20 object-cover md:size-24" />
                  </div>
                  <div className="flex-1 min-w-0">
                      <h1 className="font-heading text-xl font-bold text-foreground">{perfil.fullName}</h1>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {[perfil.city, perfil.state].filter(Boolean).join(", ") || "Brasil"}
                      </div>
                      {perfil.bio && <p className="text-sm text-foreground mt-2">{perfil.bio}</p>}
                      <span className="inline-block mt-2 rounded-full bg-primary/10 px-3 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-primary">{perfil.userLevel}</span>
                  </div>
              </div>

              <SponsorBanners sponsors={perfil.sponsors ?? []} />

              <h2 className="type-h2 mt-10 border-b border-border pb-3 text-foreground">Anúncios</h2>
              <div className="py-6">
                  <ProdutoGrid produtos={produtos} />
              </div>
          </main>

          <div className="pb-24" />
          <BottomNav />
      </div>
    )
}
