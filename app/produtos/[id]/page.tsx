"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    ArrowLeft,
    Heart,
    Loader2,
    MapPin,
    ShoppingCart,
    User,
} from "lucide-react"

import { productService } from "@/services/publish/product.service"
import type { ProductResponse } from "@/types/publish/product"

export default function ProdutoPage() {
    const params = useParams<{ id: string }>()
    const id = params?.id

    const [produto, setProduto] = useState<ProductResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return

        async function carregarProduto() {
            try {
                setLoading(true)
                setErro(null)

                console.log("🔎 Buscando produto:", id)

                const data = await productService.getById(id)

                console.log("✅ Produto recebido:", data)

                setProduto(data)
            } catch (error) {
                console.error("❌ Erro ao carregar produto:", error)
                setErro("Não foi possível carregar este anúncio.")
            } finally {
                setLoading(false)
            }
        }

        carregarProduto()
    }, [id])

    if (loading) {
        return (
            <main className="min-h-screen bg-background">
                <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Loader2 className="size-5 animate-spin" />
                        Carregando anúncio...
                    </div>
                </div>
            </main>
        )
    }

    if (erro || !produto) {
        return (
            <main className="min-h-screen bg-background">
                <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                    <h1 className="font-heading text-2xl text-foreground">
                        Anúncio não encontrado
                    </h1>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {erro ?? "Este produto não está disponível."}
                    </p>

                    <Link
                        href="/"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Voltar para o início
                    </Link>
                </div>
            </main>
        )
    }

    const produtoComCampos = produto as ProductResponse & {
        title?: string
        description?: string
        price?: number
        imageUrl?: string
        image?: string
        photos?: string[]
        images?: string[]
        city?: string
        state?: string
    }

    const titulo = produtoComCampos.title ?? "Produto"
    const descricao =
        produtoComCampos.description ??
        "Este anúncio ainda não possui uma descrição."

    const preco = produtoComCampos.price

    const imagens =
        produtoComCampos.photos?.length
            ? produtoComCampos.photos
            : produtoComCampos.images?.length
                ? produtoComCampos.images
                : produtoComCampos.imageUrl
                    ? [produtoComCampos.imageUrl]
                    : produtoComCampos.image
                        ? [produtoComCampos.image]
                        : []

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Voltar
                </Link>

                <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                    {/* GALERIA */}
                    <section>
                        <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
                            {imagens.length > 0 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={imagens[0]}
                                    alt={titulo}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center px-6 text-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Este anúncio não possui imagem.
                                        </p>

                                        <p className="mt-2 font-mono text-xs text-muted-foreground">
                                            Produto: {id}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {imagens.length > 1 && (
                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {imagens.slice(0, 4).map((imagem, index) => (
                                    <div
                                        key={`${imagem}-${index}`}
                                        className="aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imagem}
                                            alt={`${titulo} - foto ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* INFORMAÇÕES */}
                    <section>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Anúncio
                                </p>

                                <h1 className="mt-1 font-heading text-3xl font-semibold">
                                    {titulo}
                                </h1>
                            </div>

                            <button
                                type="button"
                                aria-label="Favoritar anúncio"
                                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
                            >
                                <Heart className="size-5" />
                            </button>
                        </div>

                        {typeof preco === "number" && (
                            <div className="mt-6">
                                <p className="text-3xl font-semibold">
                                    {preco.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    })}
                                </p>
                            </div>
                        )}

                        <div className="my-6 h-px bg-border" />

                        {(produtoComCampos.city || produtoComCampos.state) && (
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

                                <div>
                                    <p className="text-sm font-medium">
                                        Localização
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {[
                                            produtoComCampos.city,
                                            produtoComCampos.state,
                                        ]
                                            .filter(Boolean)
                                            .join(" - ")}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 space-y-3">
                            <Link
                                href={`/produtos/${id}/comprar`}
className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
  >
  <ShoppingCart className="size-5" />
  Comprar
  </Link>

<button
  type="button"
  className="w-full rounded-xl border border-border px-5 py-3.5 text-sm font-medium transition-colors hover:bg-muted"
>
  Fazer uma pergunta
</button>
</div>

<div className="mt-6 rounded-2xl border border-border p-4">
  <div className="flex items-center gap-3">
    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
      <User className="size-5" />
    </div>

    <div>
      <p className="text-sm font-medium">
        Vendedor
      </p>

      <p className="text-xs text-muted-foreground">
        Vendedor do Imperium Bikes
      </p>
    </div>
  </div>
</div>
</section>
</div>

{/* DESCRIÇÃO */}
<section className="mt-10 border-t border-border pt-8">
  <h2 className="font-heading text-2xl font-semibold">
    Descrição
  </h2>

  <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
    {descricao}
  </p>
</section>

{/* DEBUG */}
<section className="mt-8 rounded-2xl border border-dashed border-border p-4">
  <p className="text-xs uppercase tracking-wider text-muted-foreground">
    Debug
  </p>

  <p className="mt-2 font-mono text-xs">
    Produto ID: {id}
  </p>

  <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
    Imagens encontradas: {imagens.length}
  </p>
</section>
</div>
</main>
)
}

