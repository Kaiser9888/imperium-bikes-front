"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Handshake, Loader2, MessageCircle, ShieldCheck, Truck } from "lucide-react"

import { ProductImage } from "@/components/marketplace/ProductImage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CHECKOUT_ITENS_KEY } from "@/lib/cart"
import { formatarPreco } from "@/lib/format"
import { FRETE_COMBINADO, protecaoCentavos } from "@/lib/taxas"
import { cn } from "@/lib/utils"
import { paymentService } from "@/services/publish/payment.service"
import { productService } from "@/services/publish/product.service"
import type { ProductResponse, ShippingQuote } from "@/types/publish/product"
import type { EnderecoEntrega } from "@/types/payment"

// Valor mínimo aceito pelo Stripe em BRL. Mantenha igual ao MIN_AMOUNT do PaymentService.
const MIN_AMOUNT = 0.5

/** "retirada": em mãos com o vendedor. "combinado": envio combinado com o vendedor, frete pago entre os dois. */
type Entrega = { tipo: "envio"; opcao: ShippingQuote } | { tipo: "retirada" } | { tipo: "combinado" }
type Frete = { opcoes: ShippingQuote[]; erro: string | null }

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

/** Serviço e anúncio "retirada no local" não são enviados. */
const soRetirada = (p: ProductResponse) => p.categorySlug === "servicos" || Boolean(p.somenteRetirada)
const localDe = (p: ProductResponse) => [p.city, p.state].filter(Boolean).join(", ")
const disponivel = (p: ProductResponse) => p.status === "ACTIVE" && p.stock > 0 && !p.precoAPartirDe

function CheckoutContent() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const params = useSearchParams()
  const router = useRouter()
  // Um produto (botão Comprar) ou vários (carrinho): ?productId=x ou ?itens=a,b
  const chaveIds = useMemo(() => {
    const lista = (params.get("itens") ?? params.get("productId") ?? "").split(",").map((s) => s.trim()).filter(Boolean)
    return [...new Set(lista)].join(",")
  }, [params])
  const paymentIdCancelado = params.get("cancelled") === "1" ? params.get("paymentId") : null
  // Mesmo id em cliques repetidos: o backend reaproveita o pagamento em vez de criar outro
  const carrinhoId = useMemo(() => crypto.randomUUID(), [])

  const [produtos, setProdutos] = useState<ProductResponse[] | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [cep, setCep] = useState("")
  const [cotando, setCotando] = useState(false)
  const [erroCep, setErroCep] = useState<string | null>(null)
  const [fretes, setFretes] = useState<Record<string, Frete>>({})
  const [entregas, setEntregas] = useState<Record<string, Entrega>>({})
  const [endereco, setEndereco] = useState<EnderecoEntrega>(ENDERECO_VAZIO)
  const campo = (chave: keyof EnderecoEntrega) => ({
    id: `entrega-${chave}`,
    value: endereco[chave] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEndereco((atual) => ({ ...atual, [chave]: e.target.value })),
  })

  // Voltou do Stripe sem pagar: leva de volta ao anúncio, carrinho, evento ou anúncio pago de onde saiu
  useEffect(() => {
    if (!isLoaded || !isSignedIn || chaveIds || !paymentIdCancelado) return
    paymentService.findById(paymentIdCancelado, getToken)
      .then((pagamento) => {
        const ref = pagamento.referenceId
        const destino =
          pagamento.type === "PRODUCT_PURCHASE" && ref ? `/checkout?productId=${encodeURIComponent(ref)}&cancelado=1`
            : pagamento.type === "CART_PURCHASE" ? "/carrinho?cancelado=1"
              : pagamento.type === "TOURNAMENT_INSCRIPTION" && ref ? `/torneios/${ref}`
                : pagamento.type?.startsWith("PRODUCT_HIGHLIGHT") ? "/vendedor"
                  : pagamento.type === "AD_CAMPAIGN" ? "/anunciar"
                    : "/"
        router.replace(destino)
      })
      .catch(() => router.replace("/"))
  }, [chaveIds, getToken, isLoaded, isSignedIn, paymentIdCancelado, router])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      const returnTo = chaveIds ? `/checkout?itens=${encodeURIComponent(chaveIds)}` : "/checkout"
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`)
      return
    }
    if (!chaveIds) return
    let active = true
    Promise.allSettled(chaveIds.split(",").map((id) => productService.getById(id)))
      .then((resultados) => {
        if (!active) return
        const lista = resultados.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
        setProdutos(lista)
        if (lista.length < resultados.length) setError("Algum item saiu do ar e não está nesta compra.")
        // Quem só pode ser retirado já começa assim; os outros esperam o CEP
        setEntregas(Object.fromEntries(lista.filter(soRetirada).map((p) => [p.id, { tipo: "retirada" } as Entrega])))
      })
    return () => { active = false }
  }, [chaveIds, isLoaded, isSignedIn, router])

  const comprando = (produtos ?? []).filter(disponivel)
  const indisponiveis = (produtos ?? []).filter((p) => !disponivel(p))
  const enviaveis = comprando.filter((p) => !soRetirada(p))
  const subtotal = comprando.reduce((soma, p) => soma + p.price, 0)
  const frete = comprando.reduce((soma, p) => {
    const e = entregas[p.id]
    return soma + (e?.tipo === "envio" ? Number(e.opcao.valor) : 0)
  }, 0)
  // Cada item tem a sua Proteção (cartão + 3% do Imperium, teto de R$ 60), igual ao backend
  const protecao = comprando.reduce((soma, p) => {
    const e = entregas[p.id]
    const freteItem = e?.tipo === "envio" ? Math.round(Number(e.opcao.valor) * 100) : 0
    return soma + protecaoCentavos(Math.round(p.price * 100), freteItem) / 100
  }, 0)
  const total = subtotal + frete + protecao
  const temCombinado = comprando.some((p) => entregas[p.id]?.tipo === "combinado")
  const faltaEscolher = comprando.some((p) => !entregas[p.id])
  const temEnvio = comprando.some((p) => entregas[p.id]?.tipo === "envio")
  const faltaEndereco = temEnvio && !enderecoCompleto(endereco)
  const abaixoDoMinimo = comprando.length > 0 && total < MIN_AMOUNT
  const varios = comprando.length > 1

  async function cotar(event: React.FormEvent) {
    event.preventDefault()
    const digitos = soDigitos(cep)
    if (digitos.length !== 8) {
      setErroCep("Digite um CEP válido com 8 dígitos.")
      return
    }
    setCotando(true)
    setErroCep(null)
    const resultados = await Promise.allSettled(enviaveis.map((p) => productService.calculateShipping(p.id, digitos)))
    const novosFretes: Record<string, Frete> = {}
    const novasEntregas: Record<string, Entrega> = { ...entregas }
    enviaveis.forEach((p, i) => {
      const r = resultados[i]
      if (r.status === "fulfilled") {
        const opcoes = [...r.value].sort((a, b) => Number(a.valor) - Number(b.valor))
        novosFretes[p.id] = { opcoes, erro: null }
        // Começa no mais barato; quem já tinha escolhido retirada ou envio combinado continua assim
        const fora = novasEntregas[p.id]?.tipo === "retirada" || novasEntregas[p.id]?.tipo === "combinado"
        if (opcoes[0] && !fora) novasEntregas[p.id] = { tipo: "envio", opcao: opcoes[0] }
        if (!opcoes[0] && !fora) novasEntregas[p.id] = { tipo: "retirada" }
      } else {
        novosFretes[p.id] = { opcoes: [], erro: mensagemDe(r.reason, "Não foi possível calcular o frete deste item.") }
        if (novasEntregas[p.id]?.tipo !== "combinado") novasEntregas[p.id] = { tipo: "retirada" }
      }
    })
    setFretes(novosFretes)
    setEntregas(novasEntregas)
    setCotando(false)
    // Rua, bairro e cidade vêm do CEP; o resto fica do que a pessoa já usou neste aparelho
    const salvo = lerEnderecoSalvo()
    const viaCep = await fetch(`https://viacep.com.br/ws/${digitos}/json/`, { signal: AbortSignal.timeout(6000) })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null) as { logradouro?: string; bairro?: string; localidade?: string; uf?: string } | null
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
  }

  async function pagar() {
    if (sending || comprando.length === 0 || faltaEscolher || faltaEndereco || abaixoDoMinimo) return
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
      if (temEnvio) guardarEndereco(destino)
      const comEnvio = temEnvio ? { cepDestino: soDigitos(cep), endereco: destino } : {}
      const freteDe = (p: ProductResponse) => {
        const e = entregas[p.id]
        return e?.tipo === "envio" ? e.opcao.id : e?.tipo === "combinado" ? FRETE_COMBINADO : undefined
      }
      const unico = comprando.length === 1 ? comprando[0] : null
      const unicoFrete = unico ? freteDe(unico) : undefined
      const payment = await paymentService.create(
        unico
          ? {
            type: "PRODUCT_PURCHASE",
            referenceId: unico.id,
            referenceType: "PRODUCT",
            description: unico.title,
            ...(unicoFrete ? { ...comEnvio, freteServiceId: unicoFrete } : {}),
          }
          : {
            type: "CART_PURCHASE",
            referenceId: carrinhoId,
            referenceType: "CART",
            itens: comprando.map((p) => ({ productId: p.id, freteServiceId: freteDe(p) })),
            ...comEnvio,
          },
        getToken,
      )
      if (!payment.checkoutUrl) throw new Error("O serviço de pagamento não retornou o endereço do checkout.")
      try {
        sessionStorage.setItem(CHECKOUT_ITENS_KEY, JSON.stringify(comprando.map((p) => p.id)))
      } catch {
        // sem armazenamento: o carrinho só não se limpa sozinho
      }
      window.location.assign(payment.checkoutUrl)
    } catch (cause) {
      setError(mensagemDe(cause, "Não foi possível iniciar o pagamento. Tente novamente."))
      setSending(false)
    }
  }

  if (!isLoaded || (isSignedIn && chaveIds && produtos === null)) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Carregando checkout" />
      </main>
    )
  }
  if (!chaveIds) {
    if (paymentIdCancelado) return <Loader2 className="mx-auto mt-24 size-8 animate-spin text-primary" aria-label="Voltando" />
    return (
      <main className="grid min-h-[60vh] place-items-center px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum produto selecionado. <Link href="/carrinho" className="font-semibold text-primary underline">Ver carrinho</Link>
        </p>
      </main>
    )
  }

  const voltar = params.get("itens")
    ? { href: "/carrinho", label: "Voltar ao carrinho" }
    : { href: `/produtos/${chaveIds}`, label: "Voltar ao anúncio" }

  return (
    <main className="bg-background px-4 pb-10 pt-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-xl">
        <h1 className="type-h1">Finalizar compra</h1>
        {params.get("cancelado") === "1" && (
          <p role="status" className="type-body-small mt-3 rounded-xl bg-surface-muted px-4 py-3 text-muted-foreground">
            Pagamento cancelado. Nada foi cobrado; você pode tentar de novo quando quiser.
          </p>
        )}

        {/* Itens e a entrega de cada um */}
        <ul className="mt-6 flex flex-col gap-3">
          {comprando.map((p) => {
            const capa = p.images?.slice().sort((a, b) => Number(b.isMain) - Number(a.isMain))[0]?.url
            const e = entregas[p.id]
            const f = fretes[p.id]
            const local = localDe(p)
            return (
              <li key={p.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                    <ProductImage src={capa} alt="" className="size-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="type-label line-clamp-2">{p.title}</p>
                    <p className="type-caption truncate text-muted-foreground">{p.seller?.name}{local ? ` · ${local}` : ""}</p>
                  </div>
                  <p className="type-h3 shrink-0 tabular-nums">{formatarPreco(p.price)}</p>
                </div>

                {soRetirada(p) ? (
                  <p className="type-caption mt-3 flex items-start gap-2 text-muted-foreground">
                    <Handshake className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    {p.categorySlug === "servicos"
                      ? "Serviço: combine data e local com o prestador pelo chat depois do pagamento."
                      : `Só retirada em mãos${local ? ` em ${local}` : ""}. Você recebe um código para passar na retirada.`}
                  </p>
                ) : (
                  <div role="radiogroup" aria-label={`Entrega de ${p.title}`} className="mt-3 flex flex-col gap-2">
                    {f?.erro && <p className="type-caption font-semibold text-destructive">{f.erro}</p>}
                    {f?.opcoes.map((opcao) => {
                      const escolhida = e?.tipo === "envio" && e.opcao.id === opcao.id
                      const gratis = Number(opcao.valor) === 0
                      return (
                        <button
                          key={opcao.id}
                          type="button"
                          role="radio"
                          aria-checked={escolhida}
                          onClick={() => setEntregas((atual) => ({ ...atual, [p.id]: { tipo: "envio", opcao } }))}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
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
                      aria-checked={e?.tipo === "combinado"}
                      onClick={() => setEntregas((atual) => ({ ...atual, [p.id]: { tipo: "combinado" } }))}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                        e?.tipo === "combinado" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                      )}
                    >
                      <MessageCircle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="type-label block">Combinar envio com o vendedor</span>
                        <span className="type-caption text-muted-foreground">
                          Ônibus, transportadora ou outro jeito. O frete é pago direto a ele. Combine antes pelo chat.
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={e?.tipo === "retirada"}
                      onClick={() => setEntregas((atual) => ({ ...atual, [p.id]: { tipo: "retirada" } }))}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                        e?.tipo === "retirada" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                      )}
                    >
                      <Handshake className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="type-label block">Retirar em mãos{local ? ` em ${local}` : ""}</span>
                        <span className="type-caption text-muted-foreground">Passe o código ao vendedor só depois de conferir.</span>
                      </span>
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {indisponiveis.length > 0 && (
          <p role="alert" className="type-body-small mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-destructive">
            {indisponiveis.length === 1
              ? `"${indisponiveis[0].title}" já foi vendido ou saiu do ar`
              : `${indisponiveis.length} itens já foram vendidos ou saíram do ar`} e não estão nesta compra.
          </p>
        )}

        {/* CEP uma vez só, para todos os itens que podem ser enviados */}
        {enviaveis.length > 0 && (
          <section aria-labelledby="entrega-title" className="mt-6 rounded-2xl border border-border bg-surface p-5">
            <h2 id="entrega-title" className="type-h3 flex items-center gap-2">
              <Truck className="size-5 text-primary" aria-hidden="true" />
              Calcular frete
            </h2>
            <form onSubmit={cotar} className="mt-3 flex gap-2">
              <Input
                value={cep}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 8)
                  setCep(d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d)
                  setErroCep(null)
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
            {erroCep && <p role="alert" className="type-caption mt-2 font-semibold text-destructive">{erroCep}</p>}
            {Object.keys(fretes).length === 0 && (
              <p className="type-caption mt-2 text-muted-foreground">Ou escolha combinar o envio ou retirar em mãos no item.</p>
            )}

            {temEnvio && (
              <fieldset className="mt-6 border-t border-border pt-5">
                <legend className="type-label">Para onde enviar</legend>
                <p className="type-caption mt-1 text-muted-foreground">Vai na etiqueta da transportadora. Só o vendedor do pedido vê.</p>
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
        )}

        {comprando.length > 0 && (
          <dl className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{varios ? `Produtos (${comprando.length})` : "Produto"}</dt>
              <dd className="tabular-nums">{formatarPreco(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Frete</dt>
              <dd className="tabular-nums">{temEnvio ? (frete === 0 ? "Grátis" : formatarPreco(frete)) : faltaEscolher ? "—" : temCombinado ? "A combinar" : "Retirada"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                <Link href="/protecao" className="underline underline-offset-2 hover:text-foreground">Proteção Imperium</Link>
              </dt>
              <dd className="tabular-nums">{formatarPreco(protecao)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatarPreco(total)}</dd></div>
          </dl>
        )}

        {abaixoDoMinimo && (
          <p role="alert" className="mt-4 text-sm text-destructive">O valor mínimo por compra é {formatarPreco(MIN_AMOUNT)}.</p>
        )}
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

        <Button
          onClick={pagar}
          disabled={comprando.length === 0 || sending || faltaEscolher || faltaEndereco || abaixoDoMinimo}
          size="lg" className="mt-6 w-full"
        >
          {sending && <Loader2 className="size-4 animate-spin" />}
          {sending
            ? "Redirecionando..."
            : comprando.length === 0 ? "Nada para pagar"
              : faltaEscolher ? "Calcule o frete ou escolha como receber"
                : faltaEndereco ? "Preencha o endereço"
                  : `Pagar ${formatarPreco(total)}`}
        </Button>
        <p className="type-caption mt-3 flex items-center justify-center gap-1.5 text-center text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
          {varios ? "Um pagamento só. Cada vendedor recebe depois que você confirma a entrega do item dele." : "Pagamento retido até você confirmar o recebimento."}
        </p>
        {temCombinado && (
          <p className="type-caption mt-2 text-center text-muted-foreground">
            Envio combinado: o vendedor só recebe quando você passar o código. Só passe o código depois que a bike chegar.
          </p>
        )}

        <Link href={voltar.href} className="mt-4 block text-center text-sm text-muted-foreground underline">
          {voltar.label}
        </Link>
      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="grid min-h-[60vh] place-items-center bg-background"><Loader2 className="size-8 animate-spin text-primary" /></main>}>
      <CheckoutContent />
    </Suspense>
  )
}
