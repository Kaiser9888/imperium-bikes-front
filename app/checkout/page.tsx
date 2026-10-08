"use client"
import { Button } from "@/components/ui/button"

import { Suspense, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { paymentService } from "@/services/publish/payment.service"
import { productService } from "@/services/publish/product.service"
import type { ProductResponse } from "@/types/publish/product"
import { formatarPreco } from "@/lib/format"

// Valor mínimo aceito pelo Stripe em BRL. Mantenha igual ao MIN_AMOUNT do PaymentService.
const MIN_AMOUNT = 0.5


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

  const belowMinimum = product != null && product.price < MIN_AMOUNT

  async function startPayment() {
    if (!productId || !product || sending || belowMinimum) return
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
      setError(cause instanceof Error ? cause.message : "Não foi possível iniciar o pagamento. Tente novamente.")
      setSending(false)
    }
  }

  const loadingPage = !isLoaded || (Boolean(isSignedIn) && Boolean(productId) && loading)
  if (loadingPage) {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Carregando checkout" />
      </main>
    )
  }
  if (!productId) {
    return (
      <main className="grid min-h-screen place-items-center px-4 text-center">
        <p role="alert" className="text-sm text-destructive">Nenhum produto foi selecionado.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-lg">
        <h1 className="font-serif text-3xl">Finalizar compra</h1>

        {product && (
          <div className="mt-6 flex items-baseline justify-between border-b border-border pb-4">
            <span className="text-sm">{product.title}</span>
            <span className="font-serif text-xl">{formatarPreco(product.price)}</span>
          </div>
        )}

        {belowMinimum ? (
          <div role="alert" className="mt-5 border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
            <p className="font-semibold">Valor abaixo do mínimo para pagamento online</p>
            <p className="mt-1">
              O valor mínimo por compra é {formatarPreco(MIN_AMOUNT)}. Este anúncio custa {formatarPreco(product.price)}
              e não pode ser comprado pelo site no momento.
            </p>
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted-foreground">
            O pagamento será processado com segurança pelo provedor de pagamentos.
          </p>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-primary">{error}</p>}

        <Button
          onClick={startPayment}
          disabled={!product || sending || belowMinimum}
          size="lg" className="mt-6 w-full"
        >
          {sending && <Loader2 className="size-4 animate-spin" />}
          {sending ? "Redirecionando..." : "Continuar para pagamento"}
        </Button>

        <Link href={productId ? `/produtos/${productId}` : "/produtos"} className="mt-4 block text-center text-sm text-muted-foreground underline">
          Voltar ao anúncio
        </Link>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-background"><Loader2 className="size-8 animate-spin text-primary" /></main>}>
      <CheckoutContent />
    </Suspense>
  )
}