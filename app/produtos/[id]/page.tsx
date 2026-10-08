"use client"
import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"

import {
  ArrowLeft,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  User,
} from "lucide-react"

import { productService } from "@/services/publish/product.service"
import { ProductImage } from "@/components/marketplace/ProductImage"
import type {
  ProductResponse,
  ShippingQuote,
} from "@/types/publish/product"

import { iniciarConversa } from "@/lib/stream"
import { addToCart } from "@/lib/cart"
import { isFavoriteProduct, toggleFavorite } from "@/lib/favorites"

function ProdutoPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const { getToken, isSignedIn } = useAuth()

  const [produto, setProduto] =
    useState<ProductResponse | null>(null)

  const [loading, setLoading] = useState(true)

  const [erro, setErro] =
    useState<string | null>(null)

  const [activeImage, setActiveImage] =
    useState(0)

  const [favorite, setFavorite] =
    useState(false)

  const [zip, setZip] =
    useState("")

  const [shipping, setShipping] =
    useState<ShippingQuote[]>([])

  const [calculandoFrete, setCalculandoFrete] =
    useState(false)

  const [erroFrete, setErroFrete] =
    useState<string | null>(null)

  const [abrindoChat, setAbrindoChat] =
    useState(false)
  const [erroChat, setErroChat] = useState<string | null>(null)
  const [adicionadoAoCarrinho, setAdicionadoAoCarrinho] = useState(false)

  useEffect(() => {
    if (!id) return

    async function carregarProduto() {
      try {
        setLoading(true)
        setErro(null)

        console.log(
          "Buscando produto:",
          id,
        )

        const data =
          await productService.getById(id)

        console.log(
          "Produto recebido:",
          data,
        )

        setProduto(data)
        setFavorite(isFavoriteProduct(data.id))

      } catch (error) {

        console.error(
          "Erro ao carregar produto:",
          error,
        )

        setErro(
          "Não foi possível carregar este anúncio.",
        )

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

    const produtoAtual = produto as
      | (ProductResponse & {
          sellerId?: string
          userId?: string
          seller?: string | {
            id?: string
            name?: string
          }
        })
      | null

    const vendedorId =
      produtoAtual?.sellerId ??
      produtoAtual?.userId ??
      (
        typeof produtoAtual?.seller === "object"
          ? produtoAtual.seller?.id
          : undefined
      )

    if (!vendedorId || !id) {
      setErroChat("O anúncio não informa o identificador do vendedor. Entre em contato com o suporte.")
      console.error(
        "Não foi possível identificar o vendedor.",
      )
      return
    }

    try {
      setErroChat(null)
      setAbrindoChat(true)

      const canalId =
        await iniciarConversa(
          String(vendedorId),
          String(id),
          getToken,
        )

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
      <main className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="size-5 animate-spin" />
          Carregando anúncio...
        </div>
      </main>
    )
  }

  // ---------- ERRO ----------

  if (erro || !produto) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div>

          <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
            Imperium Bikes
          </p>

          <h1 className="mt-4 font-serif text-4xl">
            Anúncio não encontrado
          </h1>

          <p className="mt-3 text-muted-foreground">
            {erro ??
              "Este produto não está disponível."}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 bg-foreground px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft className="size-4" />
            Voltar ao marketplace
          </Link>

        </div>
      </main>
    )
  }

  // ---------- NORMALIZAÇÃO ----------

  const p =
    produto as ProductResponse & {
      location?: string
      neighborhood?: string

      seller?: string | {
        id?: string
        name?: string
      }

      sellerId?: string
      userId?: string

      seller_initials?: string
      initials?: string

      seller_since?: number | string
      sellerSince?: number | string

      rating?: number | string
      reviews?: number | string

      active_listings?: number | string
      active?: number | string

      specs?: [string, string][]

      imageUrl?: string
      image?: string
      photos?: string[]
      images?: {
        url: string
      }[]
    }

  const titulo =
    p.title ??
    "Produto"

  const marca =
    p.brand ??
    ""

  const ano =
    p.year ??
    ""

  const descricao =
    p.description ??
    "Este anúncio ainda não possui uma descrição."

  const preco =
    p.price

  const imagens =
    p.photos?.length
      ? p.photos
      : p.images?.length
        ? p.images.map(
            (image) => image.url,
          )
        : p.imageUrl
          ? [p.imageUrl]
          : p.image
            ? [p.image]
            : []

  const localizacao =
    p.location ??
    [p.city, p.state]
      .filter(Boolean)
      .join(", ")

  const bairro =
    p.neighborhood ??
    ""

  const vendedorNome =
    typeof p.seller === "string"
      ? p.seller
      : p.seller?.name ??
        "Vendedor"

  const iniciais =
    p.seller_initials ??
    p.initials ??
    vendedorNome
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  const sellerSince =
    p.seller_since ??
    p.sellerSince ??
    ""

  const rating =
    p.rating ??
    "—"

  const reviews =
    p.reviews ??
    0

  const activeListings =
    p.active_listings ??
    p.active ??
    0

  const specs: [string, string][] =
    p.specs ??
    []

  const precoFormatado =
    typeof preco === "number"
      ? preco.toLocaleString(
          "pt-BR",
          {
            style: "currency",
            currency: "BRL",
          },
        )
      : preco ??
        "Preço sob consulta"

  // ---------- FRETE ----------

  async function calculateShipping() {

    const cep =
      zip.replace(/\D/g, "")

    if (cep.length !== 8) {

      setShipping([])

      setErroFrete(
        "Digite um CEP válido com 8 dígitos.",
      )

      return
    }

    if (!id) {
      return
    }

    try {

      setCalculandoFrete(true)
      setErroFrete(null)
      setShipping([])

      const cotacoes =
        await productService.calculateShipping(
          id,
          cep,
        )

      setShipping(cotacoes)

    } catch (error) {

      console.error(
        "Erro ao calcular frete:",
        error,
      )

      let mensagem =
        "Não foi possível calcular o frete."

      if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {

        const response =
          (
            error as {
              response?: {
                data?: {
                  message?: string
                }
              }
            }
          ).response

        if (
          response?.data?.message
        ) {
          mensagem =
            response.data.message
        }
      }

      setErroFrete(mensagem)

    } finally {

      setCalculandoFrete(false)
    }
  }

  function formatarFrete(
    valor: number,
  ) {
    return valor.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      },
    )
  }

  // ---------- RENDER ----------

  return (
    <main className="min-h-screen bg-background text-foreground">

      <header className="border-b border-border bg-background/95">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">

          <div className="flex items-center gap-5">

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Link>

            <span className="hidden h-5 w-px bg-border sm:block" />

            <span className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Imperium Bikes / Marketplace
            </span>

          </div>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">

            <Image src="/logo1.png" alt="Imperium Bikes" width={64} height={32} className="h-7 w-14 object-contain" />

            <span className="hidden sm:block">
              Imperium
            </span>

          </div>

        </div>

      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">

        <nav
          className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <span>Marketplace</span>
          <span>/</span>
          <span>Bicicletas</span>
          <span>/</span>

          <span className="text-foreground">
            {marca}
          </span>

          <span>/</span>

          <span className="text-foreground">
            {titulo}
          </span>

        </nav>

        <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(380px,0.94fr)] lg:gap-16">

          {/* GALERIA */}

          <div>

            <div className="group relative aspect-[4/3] overflow-hidden bg-surface-muted">

              {imagens.length > 0 ? (

                <ProductImage
                  src={imagens[activeImage]}
                  alt={`${marca} ${titulo}`}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />

              ) : (

                <div className="grid h-full place-items-center text-sm text-muted-foreground">
                  Sem imagem disponível
                </div>

              )}

              {imagens.length > 1 && (
                <>

                  <button
                    onClick={() =>
                      setActiveImage(
                        (activeImage +
                          imagens.length -
                          1) %
                          imagens.length,
                      )
                    }
                    className="absolute left-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-black/20 text-white backdrop-blur hover:bg-black/50"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft />
                  </button>

                  <button
                    onClick={() =>
                      setActiveImage(
                        (activeImage + 1) %
                          imagens.length,
                      )
                    }
                    className="absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-black/20 text-white backdrop-blur hover:bg-black/50"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight />
                  </button>

                  <span className="absolute bottom-4 left-4 bg-foreground/85 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                    {activeImage + 1} / {imagens.length}
                  </span>

                </>
              )}

            </div>

            {imagens.length > 1 && (
              <div className="mt-3 grid grid-cols-3 gap-3">

                {imagens.map(
                  (image, index) => (

                    <button
                      key={`${image}-${index}`}
                      onClick={() =>
                        setActiveImage(index)
                      }
                      className={`aspect-[4/3] overflow-hidden border-2 bg-surface-muted ${
  activeImage === index
    ? "border-primary"
    : "border-transparent opacity-70 hover:opacity-100"
}`}
                      aria-label={`Ver foto ${index + 1}`}
                    >

                      <ProductImage
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />

                    </button>

                  ),
                )}

              </div>
            )}

          </div>

          {/* INFO */}

          <div className="flex flex-col">

            <div className="flex items-start justify-between gap-4">

              <div>

                {(marca || ano) && (
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    {marca}{" "}
                    {ano &&
                      `· ${ano}`}
                  </p>
                )}

                <h1 className="max-w-xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] sm:text-5xl">
                  {titulo}
                </h1>

              </div>

              <Button
                onClick={() => {
                  if (produto) setFavorite(toggleFavorite(produto))
                }}
                variant="outline" size="icon" className="shrink-0"
                aria-label={
                  favorite
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
              >

                <Heart
                  className={`size-5 ${
  favorite
    ? "fill-primary text-primary"
    : "text-muted-foreground"
}`}
                />

              </Button>

            </div>

            <div className="mt-7 flex items-end justify-between border-b border-border pb-7">

              <div>

                <p className="mb-1 text-xs text-muted-foreground">
                  Preço anunciado
                </p>

                <p className="text-3xl font-semibold tracking-tight">
                  {precoFormatado}
                </p>

              </div>

              <span className="inline-flex items-center gap-1.5 bg-success/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-success">
                <ShieldCheck className="size-4" />
                Compra segura
              </span>

            </div>

            {/* SPECS */}

            {specs.length > 0 && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 border-b border-border py-6 text-sm sm:grid-cols-3">

                {specs
                  .slice(0, 3)
                  .map(
                    ([label, value]) => (

                      <div key={label}>

                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          {label}
                        </p>

                        <p className="font-semibold">
                          {value}
                        </p>

                      </div>

                    ),
                  )}

              </div>
            )}

            {/* LOCALIZAÇÃO */}

            {(localizacao || bairro) && (
              <div className="mt-6 flex items-start gap-3 text-sm">

                <MapPin className="mt-0.5 size-5 text-primary" />

                <div>

                  <p className="font-semibold">
                    {localizacao}
                  </p>

                  {bairro && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {bairro} · Retirada ou envio disponível
                    </p>
                  )}

                </div>

              </div>
            )}

            {/* CTA */}

            <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">

              <Button
                onClick={() => {
                  if (!id) return

                  router.push(`/checkout?productId=${encodeURIComponent(id)}`)
}} size="lg"
  >
  <ShoppingBag className="size-5" />
  Comprar agora
</Button>

<Button
  type="button"
  onClick={() => {
    if (!produto) return
    addToCart(produto)
    setAdicionadoAoCarrinho(true)
    window.setTimeout(() => setAdicionadoAoCarrinho(false), 2500)
  }}
  disabled={!produto}
  variant="outline" size="lg"
>
  <ShoppingCart className="size-5" />
  {adicionadoAoCarrinho ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}
</Button>

<Button
  type="button"
  onClick={falarComVendedor}
  disabled={abrindoChat}
  variant="outline" size="lg"
>

  {abrindoChat ? (
    <>
      <Loader2 className="size-5 animate-spin" />
      Abrindo conversa...
    </>
  ) : (
    <>
      <MessageCircle className="size-5" />
      Falar com vendedor
    </>
  )}

</Button>

</div>

{erroChat && <p role="alert" className="mt-3 text-sm font-semibold text-primary">{erroChat}</p>}

{/* FRETE */}

<div className="mt-5 border border-border bg-background p-5">

  <div className="mb-4 flex items-center gap-3">

    <Calculator className="size-5 text-primary" />

    <div>

      <p className="font-semibold">
        Calcule o frete
      </p>

      <p className="text-xs text-muted-foreground">
        Informe seu CEP para ver opções de entrega.
      </p>

    </div>

  </div>

  <div className="flex gap-2">

    <input
      value={zip}
      onChange={(e) => {
        setZip(e.target.value)
        setShipping([])
        setErroFrete(null)
      }}
      inputMode="numeric"
      placeholder="00000-000"
      aria-label="CEP para cálculo do frete"
      className="min-w-0 flex-1 border border-border bg-white px-3 py-3 text-sm outline-none focus:border-primary"
    />

    <Button
      onClick={calculateShipping}
      disabled={calculandoFrete}
      className="min-w-[105px]"
    >

      {calculandoFrete ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Calculando
        </>
      ) : (
        "Calcular"
      )}

    </Button>

  </div>

  {erroFrete && (
    <p className="mt-3 text-xs font-semibold text-primary">
      {erroFrete}
    </p>
  )}

  {shipping.length > 0 && (
    <div className="mt-4 space-y-2">

      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Opções de entrega
      </p>

      {shipping.map(
        (opcao) => (

          <div
            key={opcao.id}
            className="flex items-center justify-between gap-4 border border-border bg-white p-3"
          >

            <div className="min-w-0">

              <p className="text-sm font-semibold">
                {opcao.transportadora}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {opcao.servico} ·{" "}
                {opcao.prazoDias}{" "}
                {opcao.prazoDias === 1
                  ? "dia útil"
                  : "dias úteis"}
              </p>

            </div>

            <p className="shrink-0 text-sm font-bold">
              {formatarFrete(
                opcao.valor,
              )}
            </p>

          </div>

        ),
      )}

    </div>
  )}

</div>

{/* VENDEDOR */}

<div className="mt-6 border border-border bg-background p-5">

  <div className="flex items-center justify-between gap-4">

    <div className="flex items-center gap-3">

      <div className="grid size-12 place-items-center rounded-full bg-surface-muted text-sm font-bold">
        {iniciais || (
          <User className="size-5" />
        )}
      </div>

      <div>

        <p className="font-semibold">
          {vendedorNome}
        </p>

        {sellerSince && (
          <p className="mt-1 text-xs text-muted-foreground">
            Vendedor desde{" "}
            {sellerSince}
          </p>
        )}

      </div>

    </div>

    <a
      href="#vendedor"
      className="text-xs font-bold uppercase tracking-[0.1em] text-primary hover:underline"
    >
      Ver perfil
    </a>

  </div>

  <div className="mt-4 flex items-center gap-5 border-t border-border pt-4 text-xs text-muted-foreground">

                <span className="flex items-center gap-1.5">

                  <Star className="size-4 fill-primary text-primary" />

                  {rating} (
                  {reviews} avaliações)

                </span>

    <span>
                  {activeListings} anúncios ativos
                </span>

  </div>

</div>

</div>

</section>

{/* DESCRIÇÃO + FICHA TÉCNICA */}

<section className="mt-16 grid gap-10 border-t border-border pt-12 lg:grid-cols-[1.35fr_0.65fr]">

  <div>

    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
      Sobre este anúncio
    </p>

    <h2 className="font-serif text-3xl tracking-[-0.03em]">
      Detalhes do produto.
    </h2>

    <p className="mt-5 max-w-2xl whitespace-pre-line text-[15px] leading-7 text-muted-foreground">
      {descricao}
    </p>

    <div className="mt-8 grid gap-3 sm:grid-cols-2">

      <div className="flex gap-3 border-t border-border pt-4">

        <PackageCheck className="size-5 text-primary" />

        <div>

          <p className="text-sm font-semibold">
            Envio protegido
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Embalagem segura e acompanhamento da entrega.
          </p>

        </div>

      </div>

      <div className="flex gap-3 border-t border-border pt-4">

        <ShieldCheck className="size-5 text-primary" />

        <div>

          <p className="text-sm font-semibold">
            Anúncio verificado
          </p>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Dados e vendedor conferidos pela equipe.
          </p>

        </div>

      </div>

    </div>

  </div>

  {specs.length > 0 && (
    <aside className="border-l border-border pl-0 lg:pl-8">

      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
        Ficha técnica
      </p>

      <dl className="flex flex-col gap-4 text-sm">

        {specs.map(
          ([label, value]) => (

            <div
              key={label}
              className="flex justify-between gap-4 border-b border-border pb-3"
            >

              <dt className="text-muted-foreground">
                {label}
              </dt>

              <dd className="text-right font-semibold">
                {value}
              </dd>

            </div>

          ),
        )}

      </dl>

    </aside>
  )}

</section>

{/* RODAPÉ */}

<section className="mt-16 border-t border-border pt-12">

  <div className="flex items-center gap-3">

    <Truck className="size-5 text-primary" />

    <p className="text-sm text-muted-foreground">
      Envio para todo o Brasil · Pagamento protegido pelo Imperium Bikes
    </p>

  </div>

</section>

</div>
</main>
)
}

export default ProdutoPage
