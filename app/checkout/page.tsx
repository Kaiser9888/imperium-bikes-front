"use client"

import { Suspense, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Handshake, Loader2, ShieldCheck, Truck } from "lucide-react"

import { ProductImage } from "@/components/marketplace/ProductImage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"
import { paymentService } from "@/services/publish/payment.service"
import { productService } from "@/services/publish/product.service"
import type { ProductResponse, ShippingQuote } from "@/types/publish/product"

// Valor mínimo aceito pelo Stripe em BRL. Mantenha igual ao MIN_AMOUNT do PaymentService.
const MIN_AMOUNT = 0.5

/** "combinar": retirada ou entrega combinada com o vendedor, sem frete pelo site. */
type Entrega = { tipo: "envio"; opcao: ShippingQuote } | { tipo: "combinar" } | null

function mensagemDe(cause: unknown, padrao: string): string {
  const data = (cause as { response?: { data?: { message?: unknown } } })?.response?.data
  if (typeof data?.message === "string") return data.message
  return cause instanceof Error && cause.message ? cause.message : padrao
}

function CheckoutContent() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const params = useSearchParams()
  const router = useRouter()
  const productId = params.get("productId")
  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [cep, setCep] = useState("")
  const [opcoes, setOpcoes] = useState<ShippingQuote[] | null>(null)
  const [cotando, setCotando] = useState(false)
  const [erroFrete, setErroFrete] = useState<string | null>(null)
  const [entrega, setEntrega] = useState<Entrega>(null)

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
      .then((result) => {
        if (!active) return
        setProduct(result)
        // Serviço não é enviado: data e local são combinados com o prestador
        if (result.categorySlug === "servicos") setEntrega({ tipo: "combinar" })
      })
      .catch(() => { if (active) setError("Não foi possível carregar este produto.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [getToken, isLoaded, isSignedIn, productId, router])

  const disponivel = product != null && product.status === "ACTIVE" && product.stock > 0
  const servico = product?.categorySlug === "servicos"
  const belowMinimum = product != null && product.price < MIN_AMOUNT
  const frete = entrega?.tipo === "envio" ? Number(entrega.opcao.valor) : 0
  const total = (product?.price ?? 0) + frete

  async function cotar(event: React.FormEvent) {
    event.preventDefault()
    const digitos = cep.replace(/\D/g, "")
    if (!productId || digitos.length !== 8) {
      setErroFrete("Digite um CEP válido com 8 dígitos.")
      return
    }
    setCotando(true)
    setErroFrete(null)
    setOpcoes(null)
    setEntrega(null)
    try {
      const lista = await productService.calculateShipping(productId, digitos)
      const ordenada = [...lista].sort((a, b) => Number(a.valor) - Number(b.valor))
      setOpcoes(ordenada)
      if (ordenada[0]) setEntrega({ tipo: "envio", opcao: ordenada[0] })
    } catch (cause) {
      setErroFrete(mensagemDe(cause, "Não foi possível calcular o frete."))
    } finally {
      setCotando(false)
    }
  }

  async function startPayment() {
    if (!productId || !product || sending || belowMinimum || !entrega) return
    setSending(true)
    setError(null)
    try {
      const payment = await paymentService.create({
        type: "PRODUCT_PURCHASE",
        referenceId: productId,
        referenceType: "PRODUCT",
        description: product.title,
        ...(entrega.tipo === "envio" ? { cepDestino: cep.replace(/\D/g, ""), freteServiceId: entrega.opcao.id } : {}),
      }, getToken)
      if (!payment.checkoutUrl) throw new Error("O serviço de pagamento não retornou o endereço do checkout.")
      window.location.assign(payment.checkoutUrl)
    } catch (cause) {
      setError(mensagemDe(cause, "Não foi possível iniciar o pagamento. Tente novamente."))
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

  const capa = product?.images?.slice().sort((a, b) => Number(b.isMain) - Number(a.isMain))[0]?.url

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="mx-auto max-w-xl">
        <h1 className="type-h1">Finalizar compra</h1>

        {product && (
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
            <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
              <ProductImage src={capa} alt="" className="size-full object-cover" />
            </div>
            <p className="type-label min-w-0 flex-1 line-clamp-2">{product.title}</p>
            <p className="type-h3 shrink-0 tabular-nums">{formatarPreco(product.price)}</p>
          </div>
        )}

        {product && !disponivel ? (
          <p role="alert" className="mt-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Este produto já foi vendido ou está esgotado.
          </p>
        ) : belowMinimum ? (
          <div role="alert" className="mt-5 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
            <p className="font-semibold">Valor abaixo do mínimo para pagamento online</p>
            <p className="mt-1">
              O valor mínimo por compra é {formatarPreco(MIN_AMOUNT)}. Este anúncio custa {formatarPreco(product!.price)}
              e não pode ser comprado pelo site no momento.
            </p>
          </div>
        ) : servico ? (
          <p className="type-body-small mt-6 flex items-start gap-3 rounded-2xl border border-border bg-surface p-5 text-muted-foreground">
            <Handshake className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              Este é um serviço{product?.city ? ` em ${[product.city, product.state].filter(Boolean).join(", ")}` : ""}.
              Depois do pagamento, combine a data e o local com o prestador pelo chat.
            </span>
          </p>
        ) : (
          product && (
            <section aria-labelledby="entrega-title" className="mt-6 rounded-2xl border border-border bg-surface p-5">
              <h2 id="entrega-title" className="type-h3 flex items-center gap-2">
                <Truck className="size-5 text-primary" aria-hidden="true" />
                Entrega
              </h2>
              {product.freeShippingLimit ? (
                <p className="type-body-small mt-1 text-success">
                  O vendedor paga até {formatarPreco(Number(product.freeShippingLimit))} do frete.
                </p>
              ) : null}

              <form onSubmit={cotar} className="mt-4 flex gap-2">
                <Input
                  value={cep}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 8)
                    setCep(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d)
                    setOpcoes(null)
                    setErroFrete(null)
                    if (entrega?.tipo === "envio") setEntrega(null)
                  }}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="Seu CEP"
                  aria-label="CEP de entrega"
                  className="min-w-0 flex-1"
                />
                <Button type="submit" variant="outline" loading={cotando} className="min-w-[6.5rem]">
                  Calcular
                </Button>
              </form>
              {erroFrete && <p role="alert" className="type-caption mt-2 font-semibold text-destructive">{erroFrete}</p>}

              <div role="radiogroup" aria-labelledby="entrega-title" className="mt-4 flex flex-col gap-2">
                {opcoes?.map((opcao) => {
                  const escolhida = entrega?.tipo === "envio" && entrega.opcao.id === opcao.id
                  const gratis = Number(opcao.valor) === 0
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      role="radio"
                      aria-checked={escolhida}
                      onClick={() => setEntrega({ tipo: "envio", opcao })}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
                        escolhida ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="type-label block">{opcao.transportadora} · {opcao.servico}</span>
                        <span className="type-caption text-muted-foreground">
                          {opcao.prazoDias} {opcao.prazoDias === 1 ? "dia útil" : "dias úteis"}
                          {Number(opcao.pagoPeloVendedor ?? 0) > 0 && ` · vendedor paga ${formatarPreco(Number(opcao.pagoPeloVendedor))}`}
                        </span>
                      </span>
                      <span className={cn("type-label shrink-0 tabular-nums", gratis && "text-success")}>
                        {gratis ? "Grátis" : formatarPreco(Number(opcao.valor))}
                      </span>
                    </button>
                  )
                })}

                <button
                  type="button"
                  role="radio"
                  aria-checked={entrega?.tipo === "combinar"}
                  onClick={() => setEntrega({ tipo: "combinar" })}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    entrega?.tipo === "combinar" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <Handshake className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="type-label block">Retirar ou combinar com o vendedor</span>
                    <span className="type-caption text-muted-foreground">
                      Sem frete pelo site. Você paga aqui e recebe um código: entregue ao vendedor só depois de conferir o produto. Não leve dinheiro ao encontro.
                    </span>
                  </span>
                </button>
              </div>
            </section>
          )
        )}

        {product && disponivel && !belowMinimum && (
          <dl className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{servico ? "Serviço" : "Produto"}</dt><dd className="tabular-nums">{formatarPreco(product.price)}</dd></div>
            <div className={cn("flex justify-between", servico && "hidden")}>
              <dt className="text-muted-foreground">Frete</dt>
              <dd className="tabular-nums">{entrega?.tipo === "envio" ? (frete === 0 ? "Grátis" : formatarPreco(frete)) : entrega?.tipo === "combinar" ? "Combinar" : "—"}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatarPreco(total)}</dd></div>
          </dl>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

        <Button
          onClick={startPayment}
          disabled={!product || !disponivel || sending || belowMinimum || !entrega}
          size="lg" className="mt-6 w-full"
        >
          {sending && <Loader2 className="size-4 animate-spin" />}
          {sending ? "Redirecionando..." : !entrega ? "Escolha a entrega" : "Continuar para pagamento"}
        </Button>
        <p className="type-caption mt-3 flex items-center justify-center gap-1.5 text-muted-foreground">
          <ShieldCheck className="size-4 text-success" aria-hidden="true" />
          {servico ? "Pagamento retido até você confirmar que o serviço foi feito." : "Pagamento retido até você confirmar o recebimento."}
        </p>

        <Link href={`/produtos/${productId}`} className="mt-4 block text-center text-sm text-muted-foreground underline">
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
