"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Handshake, ShieldCheck, ShoppingCart, Store, Trash2 } from "lucide-react"

import { PageHeading } from "@/components/layout/page-heading"
import { ProductImage } from "@/components/marketplace/ProductImage"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { CART_UPDATED_EVENT, readCart, removeFromCart, type CartItem } from "@/lib/cart"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"
import { productService } from "@/services/publish/product.service"
import type { ProductResponse } from "@/types/publish/product"

/** O que o carrinho guardou, atualizado com o anúncio de agora (preço, estoque, entrega). */
type Linha = { item: CartItem; atual: ProductResponse | null }

const aVenda = (p: ProductResponse | null) => Boolean(p && p.status === "ACTIVE" && p.stock > 0 && !p.precoAPartirDe)

function CarrinhoConteudo() {
  const router = useRouter()
  const params = useSearchParams()
  const [items, setItems] = useState<CartItem[]>([])
  const [atuais, setAtuais] = useState<Record<string, ProductResponse | null>>({})
  // Quem a pessoa desmarcou; o resto (à venda) vai para o pagamento
  const [desmarcados, setDesmarcados] = useState<Set<string>>(new Set())
  const refresh = useCallback(() => setItems(readCart()), [])

  useEffect(() => {
    queueMicrotask(refresh)
    window.addEventListener(CART_UPDATED_EVENT, refresh)
    window.addEventListener("storage", refresh)
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refresh)
      window.removeEventListener("storage", refresh)
    }
  }, [refresh])

  // Confere cada anúncio no servidor: vendido, pausado ou com preço novo aparece aqui antes de pagar
  const chave = items.map((i) => i.id).join(",")
  useEffect(() => {
    if (!chave) return
    let ativo = true
    const ids = chave.split(",")
    Promise.allSettled(ids.map((id) => productService.getById(id))).then((rs) => {
      if (!ativo) return
      setAtuais(Object.fromEntries(ids.map((id, i) => [id, rs[i].status === "fulfilled" ? rs[i].value : null])))
    })
    return () => { ativo = false }
  }, [chave])

  const conferido = items.every((i) => i.id in atuais)
  const linhas: Linha[] = items.map((item) => ({ item, atual: item.id in atuais ? atuais[item.id] : null }))
  const selecionadas = linhas.filter((l) => aVenda(l.atual) && !desmarcados.has(l.item.id))
  const subtotal = selecionadas.reduce((soma, l) => soma + (l.atual?.price ?? l.item.price), 0)

  // Itens do mesmo vendedor juntos: cada vendedor envia (ou entrega) os dele
  const grupos = (() => {
    const mapa = new Map<string, { vendedor: string; local: string; linhas: Linha[] }>()
    for (const l of linhas) {
      const vendedor = l.atual?.seller ?? l.item.seller
      const chaveGrupo = vendedor?.id ?? "?"
      if (!mapa.has(chaveGrupo)) {
        mapa.set(chaveGrupo, {
          vendedor: vendedor?.name || "Vendedor",
          local: [l.atual?.city, l.atual?.state].filter(Boolean).join(", "),
          linhas: [],
        })
      }
      mapa.get(chaveGrupo)!.linhas.push(l)
    }
    return [...mapa.values()]
  })()

  function alternar(id: string) {
    setDesmarcados((atual) => {
      const novo = new Set(atual)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  function continuar() {
    if (selecionadas.length === 0) return
    router.push(`/checkout?itens=${encodeURIComponent(selecionadas.map((l) => l.item.id).join(","))}`)
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-10 pt-3 sm:px-6 lg:pt-6">
      <PageHeading title="Carrinho" back={{ href: "/", label: "Continuar comprando" }} />

      {params.get("cancelado") === "1" && (
        <p role="status" className="type-body-small rounded-xl bg-surface-muted px-4 py-3 text-muted-foreground">
          Pagamento cancelado. Nada foi cobrado e seus itens continuam aqui.
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Junte aqui o que quer comprar e pague tudo de uma vez."
          action={
            <Button asChild>
              <Link href="/produtos">Ver anúncios</Link>
            </Button>
          }
        />
      ) : (
        <>
          {grupos.map((grupo) => (
            <section key={grupo.vendedor + grupo.local} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <header className="flex items-center gap-2 border-b border-border bg-surface-secondary px-4 py-2.5">
                <Store className="size-4 text-muted-foreground" aria-hidden="true" />
                <p className="type-caption min-w-0 truncate text-muted-foreground">
                  Vendido por <span className="font-semibold text-foreground">{grupo.vendedor}</span>
                  {grupo.local && ` · ${grupo.local}`}
                </p>
              </header>
              <ul className="divide-y divide-border">
                {grupo.linhas.map(({ item, atual }) => {
                  const venda = aVenda(atual)
                  const marcado = venda && !desmarcados.has(item.id)
                  const preco = atual?.price ?? item.price
                  const mudouPreco = atual != null && atual.price !== item.price
                  const capa = (atual?.images ?? item.images)?.find((image) => image.isMain)?.url ?? (atual?.images ?? item.images)?.[0]?.url
                  return (
                    <li key={item.id} className={cn("flex items-center gap-3 p-3 sm:gap-4 sm:p-4", !venda && conferido && "opacity-60")}>
                      <input
                        type="checkbox"
                        checked={marcado}
                        disabled={!venda}
                        onChange={() => alternar(item.id)}
                        aria-label={`Incluir ${item.title} na compra`}
                        className="size-5 shrink-0 cursor-pointer accent-[var(--primary)] disabled:cursor-not-allowed"
                      />
                      <Link href={`/produtos/${item.id}`} className="shrink-0">
                        <ProductImage src={capa} alt={item.title} className="size-16 rounded-xl object-cover sm:size-20" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/produtos/${item.id}`} className="type-label line-clamp-2 text-foreground hover:text-primary">
                          {atual?.title ?? item.title}
                        </Link>
                        <p className="type-body-small mt-0.5 font-semibold tabular-nums text-foreground">{formatarPreco(preco)}</p>
                        {conferido && !venda && (
                          <p className="type-caption font-semibold text-destructive">
                            {atual?.precoAPartirDe ? "Combinado direto com o prestador" : "Vendido ou indisponível"}
                          </p>
                        )}
                        {venda && mudouPreco && <p className="type-caption text-warning">Preço atualizado pelo vendedor</p>}
                        {venda && (atual?.somenteRetirada || atual?.categorySlug === "servicos") && (
                          <p className="type-caption flex items-center gap-1 text-muted-foreground">
                            <Handshake className="size-3.5" aria-hidden="true" />
                            {atual?.categorySlug === "servicos" ? "Serviço, combinado pelo chat" : "Só retirada em mãos"}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remover ${item.title} do carrinho`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}

          {/* Resumo fixo acima da barra de baixo: o total está sempre à vista */}
          <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 rounded-2xl border border-border bg-surface/95 p-4 shadow-lg backdrop-blur lg:bottom-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="type-body-small text-muted-foreground">
                {selecionadas.length} {selecionadas.length === 1 ? "item selecionado" : "itens selecionados"}
              </span>
              <strong className="type-h3 tabular-nums text-foreground">{formatarPreco(subtotal)}</strong>
            </div>
            <p className="type-caption mt-0.5 text-right text-muted-foreground">Frete calculado no próximo passo</p>
            <Button size="lg" className="mt-3 w-full" disabled={!conferido || selecionadas.length === 0} onClick={continuar}>
              {!conferido ? "Conferindo itens..." : selecionadas.length === 0 ? "Selecione um item" : "Continuar para o pagamento"}
            </Button>
            <p className="type-caption mt-2 flex items-center justify-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
              Um pagamento só. O dinheiro fica retido até cada item chegar.
            </p>
          </div>
        </>
      )}
    </main>
  )
}

export default function CartPage() {
  return (
    <Suspense>
      <CarrinhoConteudo />
    </Suspense>
  )
}
