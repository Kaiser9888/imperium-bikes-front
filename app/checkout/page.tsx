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
import type { EnderecoEntrega } from "@/types/payment"
import { Label } from "@/components/ui/label"

// Valor mínimo aceito pelo Stripe em BRL. Mantenha igual ao MIN_AMOUNT do PaymentService.
const MIN_AMOUNT = 0.5

/** "combinar": retirada ou entrega combinada com o vendedor, sem frete pelo site. */
type Entrega = { tipo: "envio"; opcao: ShippingQuote } | { tipo: "combinar" } | null

const ENDERECO_VAZIO: EnderecoEntrega = { nome: "", telefone: "", cpf: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" }
// O endereço fica no aparelho para a próxima compra; o CPF não é guardado
const ENDERECO_KEY = "imperium:endereco-entrega"

function lerEnderecoSalvo(): EnderecoEntrega {
  try {
    const salvo = JSON.parse(localStorage.getItem(ENDERECO_KEY) ?? "null")
    return salvo && typeof salvo === "object" ? { ...ENDERECO_VAZIO, ...salvo, cpf: "" } : ENDERECO_VAZIO
  } catch {
    return ENDERECO_VAZIO
  }
}

function guardarEndereco(e: EnderecoEntrega) {
  try {
    const semCpf: Partial<EnderecoEntrega> = { ...e }
    delete semCpf.cpf
    localStorage.setItem(ENDERECO_KEY, JSON.stringify(semCpf))
  } catch {
    // armazenamento bloqueado: só não lembra na próxima vez
  }
}

const soDigitos = (v: string) => v.replace(/\D/g, "")

/** CPF com dígitos verificadores certos (evita etiqueta recusada por número digitado errado). */
function cpfValido(valor: string): boolean {
  const cpf = soDigitos(valor)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  const dv = (n: number) => {
    let soma = 0
    for (let i = 0; i < n; i++) soma += Number(cpf[i]) * (n + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return dv(9) === Number(cpf[9]) && dv(10) === Number(cpf[10])
}

function enderecoCompleto(e: EnderecoEntrega): boolean {
  const tel = soDigitos(e.telefone)
  return Boolean(
    e.nome.trim() && (tel.length === 10 || tel.length === 11) && cpfValido(e.cpf) &&
    e.logradouro.trim() && e.numero.trim() && e.bairro.trim() && e.cidade.trim() && /^[A-Za-z]{2}$/.test(e.uf.trim()),
  )
}

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
  const [endereco, setEndereco] = useState<EnderecoEntrega>(ENDERECO_VAZIO)
  const campo = (chave: keyof EnderecoEntrega) => ({
    id: `entrega-${chave}`,
    value: endereco[chave] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEndereco((atual) => ({ ...atual, [chave]: e.target.value })),
  })

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
      // Rua, bairro e cidade vêm do CEP; o resto fica do que a pessoa já usou neste aparelho
      const salvo = lerEnderecoSalvo()
      const viaCep = await fetch(`https://viacep.com.br/ws/${digitos}/json/`, { signal: AbortSignal.timeout(6000) })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null) as { logradouro?: string; bairro?: string; localidade?: string; uf?: string; erro?: boolean } | null
      setEndereco((atual) => ({
        ...salvo,
        nome: atual.nome || salvo.nome,
        telefone: atual.telefone || salvo.telefone,
        cpf: atual.cpf,
        logradouro: viaCep?.logradouro || (viaCep ? "" : salvo.logradouro),
        bairro: viaCep?.bairro || (viaCep ? "" : salvo.bairro),
        cidade: viaCep?.localidade || salvo.cidade,
        uf: viaCep?.uf || salvo.uf,
        numero: viaCep && viaCep.logradouro !== salvo.logradouro ? "" : salvo.numero,
        complemento: viaCep && viaCep.logradouro !== salvo.logradouro ? "" : salvo.complemento,
      }))
    } catch (cause) {
      setErroFrete(mensagemDe(cause, "Não foi possível calcular o frete."))
    } finally {
      setCotando(false)
    }
  }

  const faltaEndereco = entrega?.tipo === "envio" && !enderecoCompleto(endereco)

  async function startPayment() {
    if (!productId || !product || sending || belowMinimum || !entrega || faltaEndereco) return
    setSending(true)
    setError(null)
    try {
      const destino: EnderecoEntrega = {
        ...endereco,
        nome: endereco.nome.trim(),
        telefone: soDigitos(endereco.telefone),
        cpf: soDigitos(endereco.cpf),
        uf: endereco.uf.trim().toUpperCase(),
      }
      if (entrega.tipo === "envio") guardarEndereco(destino)
      const payment = await paymentService.create({
        type: "PRODUCT_PURCHASE",
        referenceId: productId,
        referenceType: "PRODUCT",
        description: product.title,
        ...(entrega.tipo === "envio" ? { cepDestino: cep.replace(/\D/g, ""), freteServiceId: entrega.opcao.id, endereco: destino } : {}),
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
                      Passe o código ao vendedor só depois de conferir. Não leve dinheiro.
                    </span>
                  </span>
                </button>
              </div>

              {entrega?.tipo === "envio" && (
                <fieldset className="mt-6 border-t border-border pt-5">
                  <legend className="type-label">Para onde enviar</legend>
                  <p className="type-caption mt-1 text-muted-foreground">Vai na etiqueta da transportadora. Só o vendedor deste pedido vê.</p>
                  <div className="mt-4 grid grid-cols-6 gap-3">
                    <div className="col-span-6">
                      <Label htmlFor="entrega-nome">Nome de quem recebe</Label>
                      <Input {...campo("nome")} autoComplete="name" maxLength={120} className="mt-1.5" />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor="entrega-cpf">CPF</Label>
                      <Input {...campo("cpf")} inputMode="numeric" maxLength={14} placeholder="Só números" className="mt-1.5" aria-invalid={endereco.cpf.length >= 11 && !cpfValido(endereco.cpf)} />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor="entrega-telefone">Telefone</Label>
                      <Input {...campo("telefone")} type="tel" autoComplete="tel-national" maxLength={15} placeholder="DDD + número" className="mt-1.5" />
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <Label htmlFor="entrega-logradouro">Rua</Label>
                      <Input {...campo("logradouro")} autoComplete="address-line1" maxLength={200} className="mt-1.5" />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="entrega-numero">Número</Label>
                      <Input {...campo("numero")} maxLength={20} className="mt-1.5" />
                    </div>
                    <div className="col-span-4">
                      <Label htmlFor="entrega-complemento">Complemento <span className="font-normal text-muted-foreground">(opcional)</span></Label>
                      <Input {...campo("complemento")} autoComplete="address-line2" maxLength={100} placeholder="Apto, bloco" className="mt-1.5" />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Label htmlFor="entrega-bairro">Bairro</Label>
                      <Input {...campo("bairro")} maxLength={100} className="mt-1.5" />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Label htmlFor="entrega-cidade">Cidade</Label>
                      <Input {...campo("cidade")} autoComplete="address-level2" maxLength={100} className="mt-1.5" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <Label htmlFor="entrega-uf">UF</Label>
                      <Input {...campo("uf")} autoComplete="address-level1" maxLength={2} className="mt-1.5 uppercase" />
                    </div>
                  </div>
                  {endereco.cpf.length >= 11 && !cpfValido(endereco.cpf) && (
                    <p role="alert" className="type-caption mt-2 font-semibold text-destructive">Confira o CPF: os números não batem.</p>
                  )}
                </fieldset>
              )}
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
          disabled={!product || !disponivel || sending || belowMinimum || !entrega || faltaEndereco}
          size="lg" className="mt-6 w-full"
        >
          {sending && <Loader2 className="size-4 animate-spin" />}
          {sending ? "Redirecionando..." : !entrega ? "Escolha a entrega" : faltaEndereco ? "Preencha o endereço" : "Continuar para pagamento"}
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
