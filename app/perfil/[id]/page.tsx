/* eslint-disable @typescript-eslint/no-explicit-any */
// app/perfil/[id]/page.tsx
"use client"

import { ArrowLeft, Trophy, Grid3X3, ShoppingBag, MapPin, Camera } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { BottomNav } from "@/components/layout/bottom-nav"
import { ProdutoGrid } from "@/components/perfil/ProdutoGrid"
import { sellerProductService, type ProdutoItem } from "@/services/publish/seller-products.service"

type Aba = "fotos" | "produtos" | "torneios"

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
}

const API_URL = 'https://imperium-bikes.onrender.com'

export default function PerfilPublicoPage() {
    const params = useParams<{ id: string }>()
    const id = params?.id
    const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
    const [produtos, setProdutos] = useState<ProdutoItem[]>([])
    const [loading, setLoading] = useState(true)
    const [aba, setAba] = useState<Aba>("fotos")

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
      <header className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm" style={{ backgroundImage: "url(/images/marble-light.png)" }}>
          <div className="bg-marble/15 backdrop-blur-[2px]">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                      <Link href="/buscar" className="flex shrink-0 items-center"><ArrowLeft className="size-5" /></Link>
                      {titulo && <span className="font-heading text-lg font-bold text-foreground truncate">{titulo}</span>}
                  </div>
                  <div className="size-10" />
              </div>
          </div>
      </header>
    )

    if (loading) {
        return (
          <div className="min-h-screen bg-background">
              {header()}
              <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Carregando...</p></div>
              <BottomNav onMenuClick={() => {}} />
          </div>
        )
    }

    if (!perfil) {
        return (
          <div className="min-h-screen bg-background">
              {header()}
              <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Usuário não encontrado</p></div>
              <BottomNav onMenuClick={() => {}} />
          </div>
        )
    }

    const stats: { key: Aba; label: string; valor: number }[] = [
        { key: "fotos", label: "Fotos", valor: 0 },
        { key: "produtos", label: "Produtos", valor: produtos.length },
        { key: "torneios", label: "Torneios", valor: 0 },
    ]

    const abas: { key: Aba; label: string; icon: typeof Grid3X3 }[] = [
        { key: "fotos", label: "Fotos", icon: Grid3X3 },
        { key: "produtos", label: "Produtos", icon: ShoppingBag },
        { key: "torneios", label: "Torneios", icon: Trophy },
    ]

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

              {/* Estatísticas reais */}
              <div className="mt-8 grid grid-cols-3 gap-2">
                  {stats.map((s) => (
                    <button key={s.key} onClick={() => setAba(s.key)} className="rounded-xl bg-card border border-border p-4 text-center hover:border-primary/30 transition-colors">
                        <p className="font-heading text-2xl font-bold text-foreground">{s.valor}</p>
                        <p className="text-[0.65rem] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
                    </button>
                  ))}
              </div>

              <div className="mt-8 flex border-b border-border">
                  {abas.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setAba(key)} className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${aba === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                        <Icon className="size-4" />{label}
                    </button>
                  ))}
              </div>

              <div className="py-6">
                  {aba === "fotos" && <div className="text-center py-12"><Camera className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhuma foto postada</p></div>}
                  {aba === "produtos" && <ProdutoGrid produtos={produtos} />}
                  {aba === "torneios" && <div className="text-center py-12"><Trophy className="size-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Nenhum torneio disputado</p></div>}
              </div>
          </main>

          <div className="pb-24" />
          <BottomNav onMenuClick={() => {}} />
      </div>
    )
}