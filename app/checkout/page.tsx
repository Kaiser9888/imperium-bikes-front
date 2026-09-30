"use client"

import { Suspense, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { paymentService } from "@/services/publish/payment.service"
import { productService } from "@/services/publish/product.service"
import type { ProductResponse } from "@/types/publish/product"

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function CheckoutContent() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const params = useSearchParams()
  const router = useRouter()
  const productId = params.get("productId")
  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      const returnTo = productId ? `/checkout?productId=${encodeURIComponent(productId)}` : "/checkout"
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`)
      return
    }
    if (!productId) return
    let active = true
    productService.getById(productId)
      .then((result) => { if (active) setProduct(result) })
      .catch(() => { if (active) setError("Não foi possível carregar este produto.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [getToken, isLoaded, isSignedIn, productId, router])

  async function startPayment() {
    if (!productId || !product || sending) return
    setSending(true)
    setError(null)
    try {
      const payment = await paymentService.create({
        type: "PRODUCT_PURCHASE",
        referenceId: productId,
        referenceType: "PRODUCT",
        description: product.title,
      }, getToken)
      if (!payment.checkoutUrl) throw new Error("O serviço de pagamento não retornou o endereço do checkout.")
      window.location.assign(payment.checkoutUrl)
    } catch (cause) {
      console.error("Falha ao iniciar pagamento:", cause)
      setError("Não foi possível iniciar o pagamento. Tente novamente.")
      setSending(false)
    }
  }

  const loadingPage = !isLoaded || (Boolean(isSignedIn) && Boolean(productId) && loading)
  if (loadingPage) return <main className="grid min-h-screen place-items-center bg-[#f5f3ee]"><Loader2 className="size-8 animate-spin text-[#a33c36]" aria-label="Carregando checkout" /></main>
  if (!productId) return <main className="grid min-h-screen place-items-center px-4 text-center"><p role="alert" className="text-sm text-destructive">Nenhum produto foi selecionado.</p></main>

  return <main className="min-h-screen bg-[#f5f3ee] px-6 py-12 text-[#1d282b]"><div className="mx-auto max-w-lg"><h1 className="font-serif text-3xl">Finalizar compra</h1>{product && <div className="mt-6 flex items-baseline justify-between border-b border-[#1d282b]/20 pb-4"><span className="text-sm">{product.title}</span><span className="font-serif text-xl">{money(product.price)}</span></div>}<p className="mt-5 text-sm text-[#68737a]">O pagamento será processado com segurança pelo provedor de pagamentos.</p>{error && <p role="alert" className="mt-4 text-sm text-[#a33c36]">{error}</p>}<button onClick={startPayment} disabled={!product || sending} className="mt-6 flex w-full items-center justify-center gap-2 bg-[#1d282b] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{sending && <Loader2 className="size-4 animate-spin" />}{sending ? "Redirecionando..." : "Continuar para pagamento"}</button><Link href={productId ? `/produtos/${productId}` : "/produtos"} className="mt-4 block text-center text-sm text-[#68737a] underline">Voltar ao anúncio</Link></div></main>
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#f5f3ee]"><Loader2 className="size-8 animate-spin text-[#a33c36]" /></main>}><CheckoutContent /></Suspense>
}
