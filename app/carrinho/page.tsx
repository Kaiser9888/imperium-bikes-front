"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { CART_UPDATED_EVENT, cartItemCount, readCart, removeFromCart, type CartItem } from "@/lib/cart"

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()
  const refresh = useCallback(() => setItems(readCart()), [])
  useEffect(() => { queueMicrotask(refresh); window.addEventListener(CART_UPDATED_EVENT, refresh); window.addEventListener("storage", refresh); return () => { window.removeEventListener(CART_UPDATED_EVENT, refresh); window.removeEventListener("storage", refresh) } }, [refresh])
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return <main className="mx-auto min-h-screen max-w-4xl px-4 py-10"><Link href="/" className="text-sm text-muted-foreground">← Continuar comprando</Link><h1 className="mt-4 font-heading text-3xl font-bold">Seu carrinho</h1>{items.length === 0 ? <section className="mt-8 rounded-xl border border-border bg-card p-10 text-center"><p className="font-semibold">Seu carrinho está vazio</p><p className="mt-2 text-sm text-muted-foreground">Adicione produtos a partir da página do anúncio.</p><Link href="/produtos" className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Ver produtos</Link></section> : <><ul className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">{items.map((item) => <li key={item.id} className="flex items-center gap-4 p-4"><img src={item.images?.find((image) => image.isMain)?.url ?? item.images?.[0]?.url ?? "/placeholder.svg"} alt="" className="size-20 rounded-lg object-cover"/><div className="min-w-0 flex-1"><Link href={`/produtos/${item.id}`} className="font-semibold hover:text-primary">{item.title}</Link><p className="mt-1 text-sm text-muted-foreground">{item.quantity} × {money(item.price)}</p></div><button onClick={() => removeFromCart(item.id)} className="text-sm text-destructive underline">Remover</button></li>)}</ul><div className="mt-5 flex items-center justify-between"><span className="text-sm text-muted-foreground">{cartItemCount(items)} itens</span><strong className="font-heading text-xl">{money(total)}</strong></div><p className="mt-3 text-xs text-muted-foreground">Os itens são comprados individualmente. O frete é calculado no anúncio.</p><div className="mt-5 flex flex-wrap gap-3">{items.map((item) => <button key={item.id} onClick={() => { if (!isLoaded) return; router.push(isSignedIn ? `/checkout?productId=${encodeURIComponent(item.id)}` : `/sign-in?redirect_url=${encodeURIComponent(`/checkout?productId=${item.id}`)}`) }} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Comprar {item.title}</button>)}</div></>}</main>
}
