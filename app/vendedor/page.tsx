// app/vendedor/page.tsx  →  Central do Vendedor
"use client"
import { Button } from "@/components/ui/button"

import { useEffect, useMemo, useRef, useState, useCallback, useSyncExternalStore } from "react"
import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { useUser } from "@clerk/nextjs"
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  ChevronRight,
  CirclePause,
  Cog,
  Droplets,
  Eye,
  MapPin,
  Mountain,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Radio,
  Receipt,
  Search,
  Shirt,
  Store,
  Trash2,
  Wallet,
  Wrench,
  X,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import { BottomNav } from "@/components/layout/bottom-nav"
import {
  sellerProductService,
  capaDoProduto,
  formatarPreco,
  type ProdutoItem,
} from "@/services/publish/seller-products.service"
import { clearDraft } from "@/lib/publicar/categorias"
import { BackButton } from "@/components/ui/back-button"
import { ETIQUETA_AUTOMATICA } from "@/lib/etiqueta"

/*
  Paleta
  fundo #F5EEDC · superfície #FBF7EC · linha #E4D9BF
  texto #2B2A22 · apagado #7A7260
  marca #A33C36 (igual ao logo) · rosado suave #F3DDD3
*/

/*
  Tipos de anúncio. Os hrefs continuam apontando para as rotas atuais.
  Dica: renomeie /publicar/bikes para /publicar/equipamentos quando puder.
*/
const tiposDeAnuncio = [
  { slug: "bikes", label: "Bikes e equipamentos", desc: "Bike, prancha, raquete: o principal do seu esporte", icon: Bike },
  { slug: "pecas", label: "Peças e acessórios", desc: "Componentes, capacete, luvas, ciclocomputador", icon: Cog },
  { slug: "servicos", label: "Serviços e aulas", desc: "Manutenção, treino, aulas e aluguel", icon: Wrench },
  { slug: "produtos", label: "Roupas e calçados", desc: "Vestuário, tênis, mochilas e itens gerais", icon: Shirt },
  { slug: "consumiveis", label: "Nutrição e hidratação", desc: "Suplementos, géis e isotônicos", icon: Droplets },
  { slug: "esportes", label: "Outros esportes", desc: "Montanha, corrida, água, quadra e mais", icon: Mountain },
]

/*
  Rascunhos do fluxo /publicar (sessionStorage, uma chave por categoria; ver
  lib/publicar/categorias). A Central mostra os que ficaram pela metade.
*/
const PREFIXO_RASCUNHO = "imperium_publish_draft:"
const ETAPAS = [
  { id: "informacoes", label: "Informações" },
  { id: "fotos", label: "Fotos" },
  { id: "frete", label: "Frete" },
  { id: "preco", label: "Preço" },
  { id: "destacar", label: "Destaque" },
] as const

type Rascunho = { slug: string; titulo: string; etapa: number }

function lerRascunhosBrutos(): string {
  const achados: [string, string][] = []
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const chave = sessionStorage.key(i)
      if (chave?.startsWith(PREFIXO_RASCUNHO)) achados.push([chave.slice(PREFIXO_RASCUNHO.length), sessionStorage.getItem(chave) ?? ""])
    }
  } catch {
    // sessionStorage bloqueado: sem rascunhos
  }
  return JSON.stringify(achados.sort())
}

function interpretarRascunhos(brutos: string): Rascunho[] {
  return (JSON.parse(brutos) as [string, string][]).flatMap(([slug, raw]) => {
    if (!tiposDeAnuncio.some((t) => t.slug === slug)) return []
    try {
      const d = JSON.parse(raw) as { titulo?: string; photos?: unknown[]; frete?: unknown; preco?: unknown }
      // Próxima etapa = primeira que ainda não salvou nada
      const etapa = !d.titulo ? 0 : !d.photos?.length ? 1 : !d.frete ? 2 : !d.preco ? 3 : 4
      return [{ slug, titulo: d.titulo ?? "", etapa }]
    } catch {
      return []
    }
  })
}

const assinarStorage = (avisar: () => void) => {
  window.addEventListener("storage", avisar)
  return () => window.removeEventListener("storage", avisar)
}

type Status = "ATIVO" | "PAUSADO" | "VENDIDO" | "EM_ANALISE"
type Filtro = "TODOS" | Status

const statusDe = (p: ProdutoItem): Status => (p.status as Status) ?? "ATIVO"

export default function CentralVendedorPage() {
  const { isSignedIn, isLoaded } = useUser()

  const [produtos, setProdutos] = useState<ProdutoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | number | null>(null)
  const [filtro, setFiltro] = useState<Filtro>("TODOS")
  const [busca, setBusca] = useState("")

  // Lido direto do sessionStorage a cada render; descartar só precisa forçar um novo render
  const [, setVersaoRascunhos] = useState(0)
  const rascunhosBrutos = useSyncExternalStore(assinarStorage, lerRascunhosBrutos, () => "[]")
  const rascunhos = useMemo(() => interpretarRascunhos(rascunhosBrutos), [rascunhosBrutos])

  function descartarRascunho(slug: string) {
    clearDraft(slug)
    setVersaoRascunhos((v) => v + 1)
  }

  const [acoes, setAcoes] = useState<ProdutoItem | null>(null)
  const [editando, setEditando] = useState<ProdutoItem | null>(null)
  const [excluindo, setExcluindo] = useState<ProdutoItem | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      setProdutos(await sellerProductService.listMine())
    } catch (e) {
      console.error(e)
      setErro("Não foi possível carregar seus anúncios.")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    if (isSignedIn) carregar()
  }, [isSignedIn, carregar])

  const contagem = useMemo(
    () => ({
      TODOS: produtos.length,
      ATIVO: produtos.filter((p) => statusDe(p) === "ATIVO").length,
      PAUSADO: produtos.filter((p) => statusDe(p) === "PAUSADO").length,
      VENDIDO: produtos.filter((p) => statusDe(p) === "VENDIDO").length,
      EM_ANALISE: produtos.filter((p) => statusDe(p) === "EM_ANALISE").length,
    }),
    [produtos]
  )

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return produtos.filter(
      (p) =>
        (filtro === "TODOS" || statusDe(p) === filtro) &&
        (!termo || (p.title ?? "").toLowerCase().includes(termo))
    )
  }, [produtos, filtro, busca])

  async function alternarStatus(p: ProdutoItem) {
    const novo = p.status === "PAUSADO" ? "ATIVO" : "PAUSADO"
    setAcoes(null)
    setOcupado(p.id)
    try {
      await sellerProductService.setStatus(p.id, novo)
      setProdutos((lista) => lista.map((x) => (x.id === p.id ? { ...x, status: novo } : x)))
    } catch {
      setErro("Não foi possível alterar o status do anúncio.")
    }
    setOcupado(null)
  }

  async function confirmarExclusao() {
    if (!excluindo) return
    setOcupado(excluindo.id)
    try {
      await sellerProductService.remove(excluindo.id)
      setProdutos((lista) => lista.filter((x) => x.id !== excluindo.id))
      setExcluindo(null)
    } catch {
      setErro("Não foi possível excluir o anúncio.")
    }
    setOcupado(null)
  }

  /* Voltar vai para a página principal */
  const Topo = (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2.5 md:px-6">
        <BackButton href="/" />
        <h1 className="font-heading text-lg font-bold">Central do vendedor</h1>
        <Logo compact className="ml-auto" />
      </div>
    </header>
  )

  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {Topo}
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <div className="mb-5 grid size-16 place-items-center rounded-full bg-primary/10">
            <Store className="size-7 text-primary" />
          </div>
          <p className="font-heading text-xl font-bold">Venda para quem vive esporte</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Entre na sua conta para publicar e gerenciar seus anúncios.
          </p>
          <Button asChild size="lg" className="mt-6"><Link href="/sign-in">
              Entrar
            </Link></Button>
        </div>
        <BottomNav />
      </div>
    )
  }


  const filtros: { id: Filtro; label: string }[] = [
    { id: "TODOS", label: "Todos" },
    { id: "ATIVO", label: "No ar" },
    { id: "PAUSADO", label: "Pausados" },
    { id: "VENDIDO", label: "Vendidos" },
  ]

  // Painel sempre escuro (fundo de chuva), então as cores aqui são fixas
  const indicadores: { id: Status; label: string; cor: string; icon: LucideIcon }[] = [
    { id: "ATIVO", label: "No ar", cor: "oklch(0.8 0.16 155)", icon: Radio },
    { id: "PAUSADO", label: "Pausados", cor: "oklch(0.84 0.14 80)", icon: CirclePause },
    { id: "VENDIDO", label: "Vendidos", cor: "oklch(0.8 0.12 235)", icon: BadgeCheck },
  ]

  const atalhos = [
    { href: "/pedidos?aba=vendas", label: "Minhas vendas", icon: Receipt },
    { href: "/carteira", label: "Carteira", icon: Wallet },
    ...(ETIQUETA_AUTOMATICA ? [{ href: "/configuracoes/endereco-envio", label: "Endereço de envio", icon: MapPin }] : []),
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {Topo}

      <main className="mx-auto max-w-5xl px-4 pb-44 pt-4 md:px-6 md:pt-6">
        {/* ---------- RESUMO ---------- */}
        <section className="relative isolate overflow-hidden rounded-3xl p-5 text-white md:p-7">
          <div className="seller-rain" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 -z-[1] bg-gradient-to-r from-black/70 via-black/35 to-transparent"
            aria-hidden="true"
          />

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-heading text-2xl font-bold leading-tight md:text-3xl">Sua loja</p>
              <p className="mt-1 text-sm text-white/75">
                {contagem.TODOS === 0
                  ? "Publique o primeiro anúncio e comece a vender."
                  : `${contagem.ATIVO} ${contagem.ATIVO === 1 ? "anúncio no ar" : "anúncios no ar"} agora`}
              </p>
            </div>
            <Button asChild size="lg" className="rounded-full bg-white text-black shadow-lg hover:bg-white/90">
              <a href="#publicar">
                <Plus className="size-5" />
                Novo anúncio
              </a>
            </Button>
          </div>

          {/* Indicadores: tocar filtra a lista */}
          <div className="mt-6 grid grid-cols-3 gap-2 md:gap-3">
            {indicadores.map(({ id, label, cor, icon: Icon }) => {
              const ativo = filtro === id
              return (
                <button
                  key={id}
                  onClick={() => setFiltro(ativo ? "TODOS" : id)}
                  aria-pressed={ativo}
                  aria-label={`${label}: ${contagem[id]}`}
                  className={`rounded-2xl border p-3 text-left backdrop-blur-sm transition-colors md:p-4 ${
                    ativo ? "border-white/70 bg-white/20" : "border-white/15 bg-white/10 hover:bg-white/15"
                  }`}
                >
                  <Icon className="size-4" style={{ color: cor }} aria-hidden="true" />
                  <span className="mt-2 block font-heading text-2xl font-bold leading-none tabular-nums md:text-3xl">{contagem[id]}</span>
                  <span className="mt-1 block text-xs font-medium text-white/80">{label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ---------- ATALHOS ---------- */}
        <nav aria-label="Atalhos do vendedor" className="-mx-4 mt-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
          <ul className="flex gap-2">
            {atalhos.map(({ href, label, icon: Icon }) => (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-full border border-border bg-surface py-2 pl-3 pr-4 text-sm font-medium transition-colors hover:border-primary/60"
                >
                  <Icon className="size-4 text-primary" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---------- CONTINUAR (rascunhos pela metade) ---------- */}
        {rascunhos.length > 0 && (
          <section aria-labelledby="titulo-rascunhos" className="mt-8">
            <h2 id="titulo-rascunhos" className="type-h3">Continue de onde parou</h2>
            <ul className="mt-3 space-y-2">
              {rascunhos.map((r) => {
                const tipo = tiposDeAnuncio.find((t) => t.slug === r.slug)!
                const Icon = tipo.icon
                const proxima = ETAPAS[r.etapa]
                return (
                  <li key={r.slug} className="flex items-center gap-3 rounded-2xl border border-dashed border-foreground/40 bg-surface p-3 pr-2">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{r.titulo || `Rascunho de ${tipo.label.toLowerCase()}`}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex gap-0.5" aria-hidden="true">
                          {ETAPAS.map((e, i) => (
                            <span key={e.id} className={`h-1 w-4 rounded-full ${i < r.etapa ? "bg-primary" : "bg-surface-muted"}`} />
                          ))}
                        </div>
                        <span className="truncate text-xs text-muted-foreground">Falta: {proxima.label.toLowerCase()}</span>
                      </div>
                    </div>
                    <Link href={`/publicar/${r.slug}/${proxima.id}`} className="line-btn line-btn--sm shrink-0">
                      Continuar
                      <ArrowRight aria-hidden="true" />
                    </Link>
                    <Button
                      onClick={() => descartarRascunho(r.slug)}
                      aria-label="Descartar rascunho"
                      variant="ghost" size="icon" className="shrink-0 text-muted-foreground"
                    >
                      <X className="size-4" />
                    </Button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* ---------- PUBLICAR ---------- */}
        <section id="publicar" aria-labelledby="titulo-publicar" className="mt-8 scroll-mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="titulo-publicar" className="type-h3">O que você vai vender?</h2>
            <p className="text-xs text-muted-foreground">Escolha a categoria. Em {ETAPAS.length} passos o anúncio fica no ar.</p>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3">
            {tiposDeAnuncio.map(({ slug, label, desc, icon: Icon }) => (
              <li key={slug}>
                <Link
                  href={`/publicar/${slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-3.5 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md active:translate-y-0 md:flex-row md:items-center md:gap-3 md:p-4"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="mt-3 min-w-0 flex-1 md:mt-0">
                    <span className="block text-sm font-semibold leading-snug">{label}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{desc}</span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="absolute right-3 top-3.5 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 md:static"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- MEUS ANÚNCIOS ---------- */}
        <h2 id="anuncios" className="type-h3 mt-10 scroll-mt-20">Meus anúncios</h2>

        {/* ---------- FILTROS + BUSCA ---------- */}
        {produtos.length > 0 && (
          <div className="mt-3 space-y-3 md:flex md:items-center md:justify-between md:space-y-0 md:gap-4">
            <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0">
              <div className="flex gap-2">
                {filtros.map((f) => {
                  const ativo = filtro === f.id
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFiltro(f.id)}
                      aria-pressed={ativo}
                      className={`flex shrink-0 items-center gap-2 rounded-full border py-1.5 pl-4 pr-1.5 text-sm font-medium transition-colors ${
                        ativo
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-surface text-foreground hover:border-primary/60"
                      }`}
                    >
                      {f.label}
                      <span
                        className={`grid h-6 min-w-6 place-items-center rounded-full border-2 px-1 text-xs font-semibold tabular-nums ${
                          ativo ? "border-primary-foreground/70" : "border-primary/50 text-muted-foreground"
                        }`}
                      >
                        {contagem[f.id]}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 focus-within:border-primary md:w-72">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nos seus anúncios"
                data-plain
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
              />
            </label>
          </div>
        )}

        {erro && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-primary/10 px-4 py-3 text-sm text-destructive">
            <span>{erro}</span>
            <button onClick={carregar} className="shrink-0 font-semibold underline underline-offset-2">
              Tentar de novo
            </button>
          </div>
        )}

        {/* ---------- LISTA ---------- */}
        <div className="mt-5">
          {loading ? (
            <ul className="grid gap-3 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="h-[112px] animate-pulse rounded-2xl border border-border bg-surface" />
              ))}
            </ul>
          ) : produtos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10">
                <Package className="size-6 text-primary" />
              </span>
              <p className="mt-3 font-heading text-base font-bold">Nenhum anúncio publicado</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                Escolha uma categoria acima para criar o primeiro.
              </p>
              <a href="#publicar" className="line-btn line-btn--sm mt-5 inline-flex">
                Publicar primeiro anúncio
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          ) : visiveis.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Nada encontrado com esse filtro.</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {visiveis.map((p) => {
                const capa = capaDoProduto(p)
                const st = statusDe(p)
                const vendido = st === "VENDIDO"
                const noAr = st === "ATIVO"
                return (
                  <li key={p.id} className="flex gap-3 rounded-2xl border border-border bg-surface p-3">
                    <Link
                      href={`/produtos/${p.id}`}
                      className="size-[88px] shrink-0 overflow-hidden rounded-xl bg-surface-muted"
                    >
                      {capa ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={capa} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center">
                          <Package className="size-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-1">
                        <Link href={`/produtos/${p.id}`} className="line-clamp-2 text-sm font-semibold leading-snug">
                          {p.title}
                        </Link>
                        <Button
                          onClick={() => setAcoes(p)}
                          aria-label={`Mais ações de ${p.title}`}
                          variant="ghost" size="icon" className="-mr-1 -mt-1 shrink-0"
                        >
                          <MoreVertical className="size-5" />
                        </Button>
                      </div>

                      <p className="text-base font-bold text-primary">{p.precoAPartirDe && <span className="mr-1 text-xs font-medium text-muted-foreground">a partir de</span>}{formatarPreco(p.price)}</p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        {vendido ? (
                          <span className="rounded-full bg-info/10 px-2.5 py-1 text-xs font-semibold text-info">
                            Vendido
                          </span>
                        ) : st === "EM_ANALISE" ? (
                          <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
                            Em análise
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              {ocupado === p.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <span className={`size-2 rounded-full ${noAr ? "bg-success" : "bg-muted-foreground/50"}`} aria-hidden="true" />
                              )}
                              {noAr ? "No ar" : "Pausado"}
                            </span>
                            <button
                              role="switch"
                              aria-checked={noAr}
                              aria-label={noAr ? "Pausar anúncio" : "Reativar anúncio"}
                              disabled={ocupado === p.id}
                              onClick={() => alternarStatus(p)}
                              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                                noAr ? "bg-primary" : "bg-surface-muted"
                              }`}
                            >
                              <span
                                className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                                  noAr ? "translate-x-5" : ""
                                }`}
                              />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>

      {/* Botão flutuante (só no celular; no PC o botão fica no resumo) */}
      {produtos.length > 0 && (
        <Button asChild size="lg" className="fixed bottom-24 right-4 z-30 md:hidden rounded-full shadow-lg">
          <a href="#publicar">
            <Plus className="size-5" />
            Novo anúncio
          </a>
        </Button>
      )}

      {/* ---------- AÇÕES ---------- */}
      {acoes && (
        <Sheet titulo={acoes.title} onClose={() => setAcoes(null)}>
          <div className="space-y-1">
            <LinhaAcao href={`/produtos/${acoes.id}`} icon={Eye} texto="Ver como o comprador vê" />
            <LinhaAcao
              icon={Pencil}
              texto="Editar informações"
              onClick={() => {
                setEditando(acoes)
                setAcoes(null)
              }}
            />
            <LinhaAcao
              icon={Trash2}
              texto="Excluir anúncio"
              perigo
              onClick={() => {
                setExcluindo(acoes)
                setAcoes(null)
              }}
            />
          </div>
        </Sheet>
      )}

      {editando && (
        <EditarModal
          produto={editando}
          onClose={() => setEditando(null)}
          onSaved={(atualizado) => {
            setProdutos((l) => l.map((x) => (x.id === atualizado.id ? { ...x, ...atualizado } : x)))
            setEditando(null)
          }}
        />
      )}

      {excluindo && (
        <Sheet titulo="Excluir anúncio?" onClose={() => setExcluindo(null)}>
          <p className="text-sm text-muted-foreground">
            “{excluindo.title}” sai do marketplace e não dá para desfazer. Se só quer dar uma pausa, use o
            interruptor na lista.
          </p>
          <div className="mt-6 flex gap-2">
            <Button
              onClick={() => setExcluindo(null)}
              variant="outline" size="lg" className="flex-1"
            >
              Manter
            </Button>
            <Button
              onClick={confirmarExclusao}
              disabled={ocupado === excluindo.id}
              variant="destructive" size="lg" className="flex-1"
            >
              {ocupado === excluindo.id && <Loader2 className="size-3.5 animate-spin" />}
              Excluir
            </Button>
          </div>
        </Sheet>
      )}

      <BottomNav />
    </div>
  )
}

/* ---------- componentes auxiliares ---------- */

function Sheet({
                 titulo,
                 onClose,
                 children,
               }: {
  titulo: string
  onClose: () => void
  children: React.ReactNode
}) {
  const fechar = useRef<HTMLButtonElement>(null)
  // onClose muda a cada render do pai; a ref evita reexecutar o efeito (e roubar o foco) ao digitar
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  // Teclado: Esc fecha, o foco entra na janela e volta para onde estava ao fechar
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    fechar.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current()
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      anterior?.focus?.()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="sheet-titulo" className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-background px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:max-w-md sm:rounded-3xl sm:pb-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="sheet-titulo" className="line-clamp-1 font-heading text-base font-bold">{titulo}</h2>
          <Button
            ref={fechar}
            onClick={onClose}
            aria-label="Fechar"
            variant="ghost" size="icon" className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

function LinhaAcao({
                     icon: Icon,
                     texto,
                     onClick,
                     href,
                     perigo,
                   }: {
  icon: React.ComponentType<{ className?: string }>
  texto: string
  onClick?: () => void
  href?: string
  perigo?: boolean
}) {
  const cls = `flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-medium hover:bg-surface-muted active:bg-border ${
    perigo ? "text-destructive" : "text-foreground"
  }`
  const conteudo = (
    <>
      <Icon className="size-5" />
      {texto}
    </>
  )
  return href ? (
    <Link href={href} className={cls}>
      {conteudo}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {conteudo}
    </button>
  )
}

function EditarModal({
                       produto,
                       onClose,
                       onSaved,
                     }: {
  produto: ProdutoItem
  onClose: () => void
  onSaved: (p: ProdutoItem) => void
}) {
  const [title, setTitle] = useState(produto.title ?? "")
  const [price, setPrice] = useState(String(produto.price ?? ""))
  const [brand, setBrand] = useState(produto.brand ?? "")
  const [year, setYear] = useState(String(produto.year ?? ""))
  const [description, setDescription] = useState(produto.description ?? "")
  const [estoque, setEstoque] = useState(String(produto.stock ?? 1))
  const [cep, setCep] = useState(produto.originPostalCode ?? "")
  const [limiteFrete, setLimiteFrete] = useState(produto.freeShippingLimit ? String(produto.freeShippingLimit).replace(".", ",") : "")
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar() {
    const valor = Number(price.replace(",", "."))
    const quantidade = Number(estoque)
    const cepNumerico = cep.replace(/\D/g, "")
    const limite = limiteFrete.trim() ? Number(limiteFrete.replace(/\./g, "").replace(",", ".")) : 0
    if (title.trim().length < 10) return setErro("O título precisa ter pelo menos 10 caracteres.")
    if (!Number.isFinite(valor) || valor <= 0) return setErro("Informe um preço válido.")
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 999999) return setErro("Informe uma quantidade de 1 a 999.999.")
    if (cepNumerico.length !== 8) return setErro("Informe o CEP de origem com 8 dígitos.")
    if (!Number.isFinite(limite) || limite < 0) return setErro("Informe um valor de frete válido.")
    if (limite > valor) return setErro("O frete que você paga não pode passar do preço do produto.")

    setSaving(true)
    setErro(null)
    try {
      // CEP novo: atualiza cidade e estado de onde sai o envio
      let local: { city?: string; state?: string } = {}
      if (cepNumerico !== (produto.originPostalCode ?? "")) {
        const res = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`).catch(() => null)
        const data = res?.ok ? ((await res.json()) as { erro?: boolean; localidade?: string; uf?: string }) : null
        if (!data || data.erro) {
          setSaving(false)
          return setErro("CEP não encontrado.")
        }
        local = { city: data.localidade, state: data.uf }
      }
      const dados = {
        title: title.trim(),
        price: valor,
        brand: brand.trim(),
        year: year ? Number(year) : undefined,
        description: description.trim(),
        stock: quantidade,
        originPostalCode: cepNumerico,
        freeShippingLimit: limite > 0 ? Math.round(limite * 100) / 100 : null,
        ...local,
      }
      const resp = await sellerProductService.update(produto.id, dados)
      onSaved({ ...produto, ...dados, ...(resp ?? {}) })
    } catch (e) {
      const motivo = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErro(motivo ?? "Não foi possível salvar as alterações.")
      setSaving(false)
    }
  }

  const campo =
    "mt-1.5 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
  const rotulo = "text-xs font-medium text-muted-foreground"

  return (
    <Sheet titulo="Editar anúncio" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className={rotulo}>Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={campo} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={rotulo}>Preço (R$)</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={campo} />
          </div>
          <div>
            <label className={rotulo}>Ano (opcional)</label>
            <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" className={campo} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={rotulo}>Marca</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className={campo} />
          </div>
          <div>
            <label className={rotulo}>Quantidade</label>
            <input
              value={estoque}
              onChange={(e) => setEstoque(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              className={campo}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={rotulo}>CEP de origem</label>
            <input
              value={cep}
              onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              inputMode="numeric"
              autoComplete="postal-code"
              className={campo}
            />
          </div>
          <div>
            <label className={rotulo}>Pago o frete até (R$)</label>
            <input
              value={limiteFrete}
              onChange={(e) => setLimiteFrete(e.target.value.replace(/[^\d.,]/g, ""))}
              inputMode="decimal"
              placeholder="Vazio: comprador paga"
              className={campo}
            />
          </div>
        </div>
        <div>
          <label className={rotulo}>Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${campo} resize-none`}
          />
        </div>
        {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={onClose} variant="outline" size="lg" className="flex-1">
          Cancelar
        </Button>
        <Button
          onClick={salvar}
          disabled={saving}
          size="lg" className="flex-[1.4]"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </Sheet>
  )
}