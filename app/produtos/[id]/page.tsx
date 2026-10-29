"use client"

import { useEffect, useState } from "react"
import { DenunciarButton } from "@/components/ui/denunciar-button"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { GaleriaTelaCheia } from "@/components/marketplace/galeria-tela-cheia"
import { ProductImage } from "@/components/marketplace/ProductImage"
import { ProdutoAvaliacoes } from "@/components/marketplace/produto-avaliacoes"
import { ProdutoVendedor } from "@/components/marketplace/produto-vendedor"
import { ProdutosRelacionados } from "@/components/marketplace/produtos-relacionados"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import { addToCart } from "@/lib/cart"
import { esportes, modalidades } from "@/lib/esportes"
import { isFavoriteProduct, toggleFavorite } from "@/lib/favorites"
import { iniciarConversa } from "@/lib/stream"
import { cn } from "@/lib/utils"
import { productService } from "@/services/publish/product.service"
import { PRODUCT_CONDITIONS, type ProductResponse, type ShippingQuote } from "@/types/publish/product"

const brl = (valor: number) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

/** Cabeçalho próprio da página de produto: voltar e uma única marca. */
function Topo() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <BackButton href="/" />
        <Logo />
      </div>
    </header>
  )
}

/** Título pequeno em caixa alta usado em todas as seções da página. */
function Sobretitulo({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("type-caption font-semibold uppercase tracking-[0.16em] text-muted-foreground", className)}>
      {children}
    </p>
  )
}

/** Ícone de cartão do botão de pagar (Uiverse.io, vinodjangid07). */
function IconeCartao() {
  return (
    <svg viewBox="0 0 576 512" aria-hidden="true">
      <path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z" />
    </svg>
  )
}

function ProdutoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const { getToken, isSignedIn } = useAuth()

  const [produto, setProduto] = useState<ProductResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [telaCheia, setTelaCheia] = useState(false)
  const [favorite, setFavorite] = useState(false)

  const [zip, setZip] = useState("")
  const [shipping, setShipping] = useState<ShippingQuote[]>([])
  const [calculandoFrete, setCalculandoFrete] = useState(false)
  const [erroFrete, setErroFrete] = useState<string | null>(null)

  const [abrindoChat, setAbrindoChat] = useState(false)
  const [erroChat, setErroChat] = useState<string | null>(null)
  const [adicionadoAoCarrinho, setAdicionadoAoCarrinho] = useState(false)

  useEffect(() => {
    if (!id) return

    async function carregarProduto() {
      try {
        setLoading(true)
        setErro(null)
        const data = await productService.getById(id)
        setProduto(data)
        setFavorite(isFavoriteProduct(data.id))
      } catch (error) {
        console.error("Erro ao carregar produto:", error)
        setErro("Não foi possível carregar este anúncio.")
      } finally {
        setLoading(false)
      }
    }

    carregarProduto()
  }, [id])

  // ---------- CHAT COM VENDEDOR ----------

  async function falarComVendedor() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(`/produtos/${id}`)}`)
      return
    }

    const vendedorId = produto?.seller?.id

    if (!vendedorId || !id) {
      setErroChat("O anúncio não informa o identificador do vendedor. Entre em contato com o suporte.")
      console.error("Não foi possível identificar o vendedor.")
      return
    }

    try {
      setErroChat(null)
      setAbrindoChat(true)
      const canalId = await iniciarConversa(String(vendedorId), String(id), getToken)
      router.push(`/chat/${canalId}`)
    } catch (error) {
      console.error("Erro ao iniciar conversa com vendedor:", error)
      setErroChat(error instanceof Error ? error.message : "Não foi possível iniciar a conversa. O serviço de chat pode estar indisponível.")
    } finally {
      setAbrindoChat(false)
    }
  }

  // ---------- LOADING ----------

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Topo />
        <div className="flex items-center justify-center gap-3 py-32 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Carregando anúncio...
        </div>
      </main>
    )
  }

  // ---------- ERRO ----------

  if (erro || !produto) {
    return (
      <main className="min-h-screen bg-background">
        <Topo />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="type-h1 text-foreground">Anúncio não encontrado</h1>
          <p className="type-body mt-3 text-muted-foreground">{erro ?? "Este produto não está disponível."}</p>
          <Button asChild className="mt-8">
            <Link href="/">
              <ArrowLeft aria-hidden="true" />
              Voltar ao marketplace
            </Link>
          </Button>
        </div>
      </main>
    )
  }

  // ---------- NORMALIZAÇÃO ----------

  const p = produto
  const titulo = p.title ?? "Produto"
  const marca = p.brand ?? ""
  const ano = p.year ?? ""
  const descricao = p.description ?? "Este anúncio ainda não possui uma descrição."

  const imagens = [...(p.images ?? [])]
    .sort((a, b) => Number(b.isMain) - Number(a.isMain) || a.displayOrder - b.displayOrder)
    .map((image) => image.url)

  const localizacao = [p.city, p.state].filter(Boolean).join(", ")

  // Categoria real do anúncio (modalidade de ciclismo ou esporte), com link para a lista
  const modalidade = modalidades.find((m) => m.slug === p.modality)
  const esporte = esportes.find((e) => e.slug === p.sport)
  const categoria = modalidade
    ? { label: modalidade.label, href: modalidade.href }
    : esporte
      ? { label: esporte.nome, href: `/esportes/${esporte.slug}` }
      : null

  const servico = p.categorySlug === "servicos"
  // Serviço não tem "novo/usado" nem estoque à mostra
  const condicao = servico ? undefined : PRODUCT_CONDITIONS.find((c) => c.value === p.condition)?.label
  // Vendido, pausado ou sem estoque: não dá para comprar
  const esgotado = p.status !== "ACTIVE" || p.stock < 1
  const freteGratis = p.freeShippingLimit ? Number(p.freeShippingLimit) : 0
  // Serviço "a partir de": vitrine, sem compra pelo site (valor e pagamento combinados direto)
  const combinadoDireto = servico && Boolean(p.precoAPartirDe)
  const localDoServico = [p.bairro, localizacao].filter(Boolean).join(" · ")

  // Ficha técnica só com o que o vendedor preencheu
  const specs = ([
    ["Condição", condicao],
    ["Marca", p.brand],
    ["Modelo", p.model],
    ["Ano", p.year ? String(p.year) : undefined],
    // Bike sem número de série: o comprador vê que não foi informado (perde um pouco de confiança, não é proibido)
    ["Nº de série", p.numeroSerieFinal ?? (p.categorySlug === "bikes" ? "Não informado" : undefined)],
    ["Tipo", p.productType],
    ["Estoque", !servico && p.stock > 1 ? `${p.stock} unidades` : undefined],
    ["Peso", p.weightKg ? `${p.weightKg.toLocaleString("pt-BR")} kg` : undefined],
  ] as [string, string | undefined | null][]).filter((s): s is [string, string] => Boolean(s[1]))

  const precoFormatado = typeof p.price === "number" ? brl(p.price) : (p.price ?? "Preço sob consulta")

  // ---------- FRETE ----------

  async function calculateShipping() {
    const cep = zip.replace(/\D/g, "")

    if (cep.length !== 8) {
      setShipping([])
      setErroFrete("Digite um CEP válido com 8 dígitos.")
      return
    }

    if (!id) return

    try {
      setCalculandoFrete(true)
      setErroFrete(null)
      setShipping([])
      setShipping(await productService.calculateShipping(id, cep))
    } catch (error) {
      console.error("Erro ao calcular frete:", error)
      const mensagem = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErroFrete(mensagem || "Não foi possível calcular o frete.")
    } finally {
      setCalculandoFrete(false)
    }
  }

  // ---------- RENDER ----------

  return (
    <main className="min-h-screen bg-background pb-32 text-foreground lg:pb-16">
      <Topo />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <nav className="type-caption flex min-w-0 items-center gap-2 text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/produtos" className="shrink-0 hover:text-foreground">
            Marketplace
          </Link>
          {categoria && (
            <>
              <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
              <Link href={categoria.href} className="shrink-0 hover:text-foreground">
                {categoria.label}
              </Link>
            </>
          )}
          <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate text-foreground" aria-current="page">
            {titulo}
          </span>
        </nav>

        <section className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_440px]">
          {/* GALERIA */}

          <div className="min-w-0">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-muted">
              {imagens.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setTelaCheia(true)}
                  className="block h-full w-full cursor-zoom-in"
                  aria-label="Ver foto em tela cheia"
                >
                  <ProductImage
                    src={imagens[activeImage]}
                    alt={`${marca} ${titulo}`.trim()}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                </button>
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">Sem imagem disponível</div>
              )}

              {imagens.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImage((activeImage + imagens.length - 1) % imagens.length)}
                    className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage((activeImage + 1) % imagens.length)}
                    className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <span className="type-caption absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 font-semibold tabular-nums text-white">
                    {activeImage + 1} / {imagens.length}
                  </span>
                </>
              )}
            </div>

            {imagens.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {imagens.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "aspect-[4/3] w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-surface-muted transition sm:w-24",
                      activeImage === index ? "border-primary" : "border-transparent opacity-60 hover:opacity-100",
                    )}
                    aria-label={`Ver foto ${index + 1}`}
                    aria-current={activeImage === index}
                  >
                    <ProductImage src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <GaleriaTelaCheia
              imagens={imagens}
              indice={activeImage}
              onIndice={setActiveImage}
              aberta={telaCheia}
              onAberta={setTelaCheia}
              alt={`${marca} ${titulo}`.trim()}
            />
          </div>

          {/* COMPRA: fica visível ao rolar no desktop */}

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {(marca || ano) && (
                    <Sobretitulo className="text-primary">{[marca, ano].filter(Boolean).join(" · ")}</Sobretitulo>
                  )}
                  <h1 className="type-h1 mt-1.5 break-words text-foreground">{titulo}</h1>
                </div>
                <Button
                  onClick={() => setFavorite(toggleFavorite(p))}
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full"
                  aria-pressed={favorite}
                  aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Heart className={cn("size-5", favorite ? "fill-primary text-primary" : "text-muted-foreground")} />
                </Button>
              </div>

              {(condicao || p.hasSecurePayment || freteGratis > 0 || p.numeroSerieFinal) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {condicao && <StatusBadge tone="neutral">{condicao}</StatusBadge>}
                  {p.numeroSerieFinal && (
                    <StatusBadge tone="success" title="Número conferido no cadastro de bikes roubadas na hora de anunciar">
                      <BadgeCheck className="size-3.5" aria-hidden="true" />
                      Nº de série informado
                    </StatusBadge>
                  )}
                  {freteGratis > 0 && (
                    <StatusBadge tone="success">
                      <Truck className="size-3.5" aria-hidden="true" />
                      Frete grátis até {brl(freteGratis)}
                    </StatusBadge>
                  )}
                  {p.hasSecurePayment && (
                    <StatusBadge tone="success">
                      <ShieldCheck className="size-3.5" aria-hidden="true" />
                      Compra segura
                    </StatusBadge>
                  )}
                </div>
              )}

              {combinadoDireto && <p className="type-label mt-5 text-muted-foreground">A partir de</p>}
              <p className={cn("type-display tabular-nums text-foreground", combinadoDireto ? "mt-0.5" : "mt-5")}>{precoFormatado}</p>
              {/* Ancoragem honesta: só com o preço anterior informado no anúncio e maior que o atual */}
              {typeof p.price === "number" && typeof p.originalPrice === "number" && p.originalPrice > p.price && (
                <p className="type-body-small mt-1 flex items-center gap-2 text-muted-foreground">
                  <s className="tabular-nums">
                    <span className="sr-only">Preço anterior: </span>
                    {brl(p.originalPrice)}
                  </s>
                  <span className="type-caption rounded-full bg-success/12 px-2 py-0.5 font-semibold text-success">
                    {Math.round((1 - p.price / p.originalPrice) * 100)}% off
                  </span>
                </p>
              )}
              {/* Escassez real: só aparece quando o estoque é de fato baixo */}
              {!esgotado && p.stock > 0 && p.stock <= 3 && (
                <p className="type-label mt-2 text-primary">
                  {p.stock === 1 ? "Última unidade" : `Últimas ${p.stock} unidades`}
                </p>
              )}

              {(servico ? localDoServico : localizacao) && (
                <p className="type-body-small mt-2 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" aria-hidden="true" />
                  {servico ? "Atende em" : "Enviado de"}{" "}
                  <span className="font-medium text-foreground">{servico ? localDoServico : localizacao}</span>
                </p>
              )}

              {esgotado && (
                <p role="status" className="type-label mt-5 rounded-xl bg-surface-muted px-4 py-3 text-center text-muted-foreground">
                  {p.status === "SOLD" ? "Vendido · este anúncio não está mais disponível" : "Anúncio indisponível no momento"}
                </p>
              )}

              {combinadoDireto ? (
              <div className="mt-6 flex flex-col gap-3">
                <button type="button" className="pay-btn" disabled={esgotado || abrindoChat} onClick={falarComVendedor}>
                  {abrindoChat ? "Abrindo conversa..." : "Falar com o prestador"}
                  <MessageCircle aria-hidden="true" />
                </button>
                {erroChat && <p role="alert" className="type-caption font-semibold text-destructive">{erroChat}</p>}
                <p className="type-caption flex items-start gap-2 text-muted-foreground">
                  <Handshake className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    Valor e pagamento combinados direto com o prestador, sem garantia do Imperium.{" "}
                    <Link href="/termos#servicos" className="underline underline-offset-2 hover:text-foreground">Saiba mais</Link>
                  </span>
                </p>
              </div>
              ) : (
              <>
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  className="pay-btn"
                  disabled={esgotado}
                  onClick={() => router.push(`/checkout?productId=${encodeURIComponent(p.id)}`)}
                >
                  {esgotado ? "Esgotado" : "Comprar agora"}
                  <IconeCartao />
                </button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={esgotado}
                  onClick={() => {
                    addToCart(p)
                    setAdicionadoAoCarrinho(true)
                    window.setTimeout(() => setAdicionadoAoCarrinho(false), 2500)
                  }}
                >
                  {adicionadoAoCarrinho ? <Check className="size-5" /> : <ShoppingCart className="size-5" />}
                  {adicionadoAoCarrinho ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}
                </Button>
              </div>

              <p className="type-caption mt-5 flex items-start gap-2 text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
                <span>
                  O vendedor só recebe depois que você confirma a entrega.{" "}
                  <Link href="/reembolso" className="underline underline-offset-2 hover:text-foreground">Como funciona</Link>
                </span>
              </p>
              </>
              )}
            </div>

            {/* FRETE (serviço não é enviado: data e local são combinados pelo chat) */}

            {servico ? (
              <p className="type-body-small flex items-start gap-2.5 rounded-2xl border border-border bg-surface px-5 py-4 text-muted-foreground">
                <Handshake className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  {combinadoDireto
                    ? <>Atendimento{localDoServico ? ` em ${localDoServico}` : ""}.{p.enderecoAtendimento ? <> Endereço: <span className="font-medium text-foreground">{p.enderecoAtendimento}</span>.</> : ""} O valor final depende da avaliação: combine com o prestador pelo chat.</>
                    : `Serviço${localDoServico ? ` em ${localDoServico}` : ""}. Depois do pagamento, combine data e local com o prestador pelo chat.`}
                </span>
              </p>
            ) : (
            <details className="group rounded-2xl border border-border bg-surface px-5 py-1 open:pb-5">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2.5 [&::-webkit-details-marker]:hidden">
                <Truck className="size-5 text-primary" aria-hidden="true" />
                <span className="type-label flex-1 text-foreground">Calcular frete</span>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>

              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  void calculateShipping()
                }}
              >
                <Input
                  value={zip}
                  onChange={(e) => {
                    // Máscara 00000-000
                    const digitos = e.target.value.replace(/\D/g, "").slice(0, 8)
                    setZip(digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos)
                    setShipping([])
                    setErroFrete(null)
                  }}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={9}
                  placeholder="Seu CEP"
                  aria-label="CEP para cálculo do frete"
                  className="min-w-0 flex-1"
                />
                <Button type="submit" variant="outline" loading={calculandoFrete} className="min-w-[6.5rem]">
                  Calcular
                </Button>
              </form>

              {erroFrete && (
                <p role="alert" className="type-caption mt-3 font-semibold text-destructive">
                  {erroFrete}
                </p>
              )}

              {shipping.length > 0 && (
                <ul className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
                  {shipping.map((opcao) => (
                    <li key={opcao.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <p className="type-label truncate text-foreground">{opcao.transportadora}</p>
                        <p className="type-caption mt-0.5 text-muted-foreground">
                          {opcao.servico} · {opcao.prazoDias} {opcao.prazoDias === 1 ? "dia útil" : "dias úteis"}
                          {Number(opcao.pagoPeloVendedor ?? 0) > 0 && ` · vendedor paga ${brl(Number(opcao.pagoPeloVendedor))}`}
                        </p>
                      </div>
                      {Number(opcao.valor) === 0 ? (
                        <p className="type-label shrink-0 text-success">Grátis</p>
                      ) : (
                        <p className="type-label shrink-0 tabular-nums text-foreground">{brl(opcao.valor)}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </details>
            )}

            {/* VENDEDOR */}

            {p.seller && (
              <ProdutoVendedor
                id={p.seller.id}
                nome={p.seller.name || "Vendedor"}
                avatarUrl={p.seller.avatarUrl}
                acao={
                  <>
                    <Button type="button" variant="outline" className="w-full" onClick={falarComVendedor} loading={abrindoChat}>
                      {!abrindoChat && <MessageCircle aria-hidden="true" />}
                      {abrindoChat ? "Abrindo conversa..." : servico ? "Falar com o prestador" : "Falar com vendedor"}
                    </Button>
                    {erroChat && (
                      <p role="alert" className="type-caption mt-3 font-semibold text-destructive">
                        {erroChat}
                      </p>
                    )}
                    <DenunciarButton tipo="PRODUCT" id={p.id} className="mt-2" />
                  </>
                }
              />
            )}
          </aside>
        </section>

        {/* DESCRIÇÃO + FICHA TÉCNICA */}

        <section className="mt-10 grid items-start gap-6 border-t border-border pt-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_440px]">
          <Descricao texto={descricao} />

          {specs.length > 0 && (
            <details className="group rounded-2xl border border-border bg-surface px-5 py-1 open:pb-5">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                <span className="type-label flex-1 text-foreground">
                  Ficha técnica <span className="font-normal text-muted-foreground">({specs.length})</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden="true" />
              </summary>
              <dl className="type-body-small mt-2 divide-y divide-border">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </section>

        {/* Outros produtos antes das avaliações: é o que a pessoa procura ao rolar */}
        <ProdutosRelacionados produtoId={p.id} sport={p.sport} modality={p.modality} />

        {p.seller && <ProdutoAvaliacoes vendedorId={p.seller.id} />}
      </div>

      {/* Celular: preço e Comprar sempre à mão enquanto a pessoa rola as fotos e a descrição */}
      {!esgotado && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <p className="type-h3 min-w-0 flex-1 truncate tabular-nums text-foreground">
              {combinadoDireto && <span className="type-caption block font-medium text-muted-foreground">a partir de</span>}
              {precoFormatado}
            </p>
            {combinadoDireto ? (
              <button type="button" className="pay-btn !w-auto flex-1" disabled={abrindoChat} onClick={falarComVendedor}>
                Falar com o prestador
                <MessageCircle aria-hidden="true" />
              </button>
            ) : (
            <button
              type="button"
              className="pay-btn !w-auto flex-1"
              onClick={() => router.push(`/checkout?productId=${encodeURIComponent(p.id)}`)}
            >
              Comprar
              <IconeCartao />
            </button>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

export default ProdutoPage

/** Descrição em até 4 linhas; o resto abre com "Ler mais". */
function Descricao({ texto }: { texto: string }) {
  const [aberta, setAberta] = useState(false)
  const longa = texto.length > 280 || texto.split("\n").length > 4
  return (
    <div>
      <h2 className="type-h3 text-foreground">Descrição</h2>
      <p className={cn("type-body mt-3 max-w-prose whitespace-pre-line text-pretty text-muted-foreground", longa && !aberta && "line-clamp-4")}>
        {texto}
      </p>
      {longa && (
        <button type="button" onClick={() => setAberta(!aberta)} aria-expanded={aberta} className="type-label mt-2 min-h-9 text-primary underline underline-offset-2">
          {aberta ? "Ler menos" : "Ler mais"}
        </button>
      )}
    </div>
  )
}
