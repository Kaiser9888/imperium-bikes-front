"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Clock, PackageSearch, Search, SlidersHorizontal, X } from "lucide-react"

import { Logo } from "@/components/layout/logo"
import { ProductCard } from "@/components/marketplace/ProductCard"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Loader } from "@/components/ui/loader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { CategoriasLista } from "@/components/home/categorias-lista"
import { categoriasLoja, nomeDaCategoria } from "@/lib/categorias-loja"
import { esportesVisiveis, modalidades } from "@/lib/esportes"
import {
  FILTROS,
  ORDENS,
  buscarProdutos,
  rotuloDoValor,
  type BuscaParams,
  type BuscaResultado,
  type Filtro,
} from "@/lib/busca"
import { cn } from "@/lib/utils"

const HISTORICO_KEY = "imperium-product-search-history"

const ROTULOS: Record<Filtro, string> = {
  category: "Categoria",
  modality: "Modalidade",
  sport: "Esporte",
  productType: "Tipo de produto",
  brand: "Marca",
  condition: "Condição",
  state: "Estado",
}

/** Sem Meilisearch o backend não manda contagens; estes filtros continuam funcionando com a lista fixa. */
const OPCOES_FIXAS: Partial<Record<Filtro, string[]>> = {
  category: categoriasLoja.map((c) => c.slug),
  modality: modalidades.map((m) => m.slug),
  sport: esportesVisiveis.map((e) => e.slug),
  condition: ["NEW", "USED"],
}

/** Faixas de preço em um toque (pílulas do topo e do painel). */
const FAIXAS_PRECO: { label: string; min?: string; max?: string }[] = [
  { label: "Até R$ 500", max: "500" },
  { label: "R$ 500 a 2 mil", min: "500", max: "2000" },
  { label: "Acima de R$ 2 mil", min: "2000" },
]

/** Campos que já têm pílula no topo; os demais aparecem como etiqueta removível. */
const NAS_PILULAS: Filtro[] = ["category", "modality", "condition"]

/** Pílula de filtro: escura quando escolhida (mesmo padrão do botão principal). */
function Pilula({ ativo, onClick, children, contagem }: { ativo: boolean; onClick: () => void; children: React.ReactNode; contagem?: number }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cn(
        "type-label inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 transition-colors [&_svg]:size-4",
        ativo ? "border-foreground bg-foreground text-background" : "border-border bg-surface text-foreground hover:border-foreground/40",
      )}
    >
      {children}
      {contagem !== undefined && <span className={cn("tabular-nums", ativo ? "opacity-70" : "text-muted-foreground")}>{contagem}</span>}
    </button>
  )
}

type Estado =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; mensagem: string }
  | { status: "ok"; resultado: BuscaResultado; page: number; carregandoMais: boolean }

function lerHistorico(): string[] {
  try {
    const salvo = JSON.parse(localStorage.getItem(HISTORICO_KEY) ?? "[]")
    return Array.isArray(salvo) ? salvo.filter((t): t is string => typeof t === "string").slice(0, 8) : []
  } catch {
    return []
  }
}

function salvarHistorico(lista: string[]) {
  try {
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(lista))
  } catch {
    // navegação privada ou armazenamento bloqueado: segue sem histórico
  }
}

function BuscarPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chave = searchParams.toString()

  // A URL é a fonte da verdade: dá para compartilhar e voltar para a mesma busca
  const params: BuscaParams = useMemo(() => {
    const sp = new URLSearchParams(chave)
    const filtros: BuscaParams["filtros"] = {}
    for (const campo of FILTROS) {
      const valor = sp.get(campo)
      if (valor) filtros[campo] = valor
    }
    return {
      q: sp.get("q") ?? "",
      filtros,
      minPrice: sp.get("minPrice") ?? undefined,
      maxPrice: sp.get("maxPrice") ?? undefined,
      sort: sp.get("sort") ?? "relevance",
      page: 0,
    }
  }, [chave])

  const temFiltro = Object.keys(params.filtros).length > 0 || Boolean(params.minPrice || params.maxPrice)
  const buscando = params.q.trim().length >= 2 || temFiltro

  const [texto, setTexto] = useState(params.q)
  const [historico, setHistorico] = useState<string[]>([])
  const [estado, setEstado] = useState<Estado>({ status: "idle" })
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const atualizar = useCallback(
    (mudancas: Record<string, string | null | undefined>) => {
      const sp = new URLSearchParams(chave)
      for (const [campo, valor] of Object.entries(mudancas)) {
        if (valor) sp.set(campo, valor)
        else sp.delete(campo)
      }
      const qs = sp.toString()
      router.replace(qs ? `/buscar?${qs}` : "/buscar", { scroll: false })
    },
    [chave, router],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- histórico só existe no navegador
    setHistorico(lerHistorico())
    if (!new URLSearchParams(window.location.search).get("q")) inputRef.current?.focus()
  }, [])

  // Digitação vira ?q= depois de uma pausa
  useEffect(() => {
    const termo = texto.trim()
    if (termo === params.q.trim()) return
    if (termo.length === 1) return
    const timer = window.setTimeout(() => atualizar({ q: termo || null }), 350)
    return () => window.clearTimeout(timer)
  }, [texto, params.q, atualizar])

  const carregar = useCallback(
    async (page: number, signal?: AbortSignal) => {
      if (page === 0) setEstado({ status: "loading" })
      else setEstado((atual) => (atual.status === "ok" ? { ...atual, carregandoMais: true } : atual))
      try {
        const resultado = await buscarProdutos({ ...params, page }, signal)
        if (signal?.aborted) return
        setEstado((atual) =>
          page > 0 && atual.status === "ok"
            ? { status: "ok", page, carregandoMais: false, resultado: { ...resultado, hits: [...atual.resultado.hits, ...resultado.hits] } }
            : { status: "ok", page, carregandoMais: false, resultado },
        )
      } catch (cause) {
        if (signal?.aborted) return
        setEstado({ status: "error", mensagem: cause instanceof Error ? cause.message : "Não foi possível buscar agora." })
      }
    },
    [params],
  )

  useEffect(() => {
    if (!buscando) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sem termo nem filtro, volta para a tela inicial da busca
      setEstado({ status: "idle" })
      return
    }
    const controller = new AbortController()
    void carregar(0, controller.signal)
    return () => controller.abort()
  }, [buscando, carregar])

  function registrarBusca(termo: string) {
    const valor = termo.trim()
    if (valor.length < 2) return
    const proximo = [valor, ...historico.filter((t) => t.toLowerCase() !== valor.toLowerCase())].slice(0, 8)
    setHistorico(proximo)
    salvarHistorico(proximo)
  }

  function enviar(event: React.FormEvent) {
    event.preventDefault()
    const termo = texto.trim()
    registrarBusca(termo)
    atualizar({ q: termo || null })
    inputRef.current?.blur()
  }

  function usarTermo(termo: string) {
    setTexto(termo)
    registrarBusca(termo)
    atualizar({ q: termo })
  }

  function limparTexto() {
    setTexto("")
    atualizar({ q: null })
    inputRef.current?.focus()
  }

  function limparFiltros() {
    atualizar({ ...Object.fromEntries(FILTROS.map((f) => [f, null])), minPrice: null, maxPrice: null })
  }

  const resultado = estado.status === "ok" ? estado.resultado : null
  const painel = (
    <PainelFiltros
      params={params}
      facets={resultado?.facets ?? {}}
      onFiltro={(campo, valor) => atualizar({ [campo]: valor })}
      onPreco={(min, max) => atualizar({ minPrice: min, maxPrice: max })}
    />
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <BackButton
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
            // Celular: só a seta, para o campo de busca ter espaço
            className="shrink-0 max-sm:min-w-11 max-sm:px-0 max-sm:[&>span]:sr-only"
          />

          <form role="search" onSubmit={enviar} className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder="Buscar bikes, peças..."
              aria-label="Buscar produtos"
              className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-11 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {texto && (
              <button
                type="button"
                onClick={limparTexto}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </form>

          <Logo className="hidden md:flex" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {!buscando ? (
          <Inicio
            historico={historico}
            onTermo={usarTermo}
            onLimparHistorico={() => {
              setHistorico([])
              salvarHistorico([])
            }}
            digitando={texto.trim().length === 1}
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="hidden lg:block" aria-label="Filtros">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">{painel}</div>
            </aside>

            <section aria-live="polite" aria-busy={estado.status === "loading"} className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="type-h2 truncate text-foreground">
                    {params.q.trim() ? (
                      <>Resultados para “{params.q.trim()}”</>
                    ) : (
                      (params.filtros.category && nomeDaCategoria(params.filtros.category)) || "Explorar produtos"
                    )}
                  </h1>
                  <p className="type-body-small mt-1 text-muted-foreground">
                    {resultado
                      ? `${resultado.total.toLocaleString("pt-BR")} ${resultado.total === 1 ? "produto encontrado" : "produtos encontrados"}`
                      : estado.status === "loading"
                        ? "Buscando..."
                        : " "}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Sheet open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal aria-hidden="true" />
                        Filtros
                        {temFiltro && (
                          <span className="type-caption grid size-5 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">
                            {Object.keys(params.filtros).length + (params.minPrice || params.maxPrice ? 1 : 0)}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
                      <SheetHeader>
                        <SheetTitle>Filtros</SheetTitle>
                      </SheetHeader>
                      <div className="px-4 pb-24">{painel}</div>
                      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background p-4 sm:max-w-sm">
                        <Button className="w-full" onClick={() => setFiltrosAbertos(false)}>
                          Ver {resultado ? resultado.total.toLocaleString("pt-BR") : ""} resultados
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={params.sort} onValueChange={(valor) => atualizar({ sort: valor === "relevance" ? null : valor })}>
                    <SelectTrigger className="w-44" aria-label="Ordenar resultados">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDENS.map((ordem) => (
                        <SelectItem key={ordem.value} value={ordem.value}>
                          {ordem.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <FiltrosRapidos params={params} atualizar={atualizar} />

              {temFiltro && (
                <ul className="mt-3 flex flex-wrap items-center gap-2" aria-label="Filtros ativos">
                  {FILTROS.filter((campo) => params.filtros[campo] && !NAS_PILULAS.includes(campo)).map((campo) => (
                    <li key={campo}>
                      <Chip onRemover={() => atualizar({ [campo]: null })}>
                        <span className="text-muted-foreground">{ROTULOS[campo]}:</span> {rotuloDoValor(campo, params.filtros[campo]!)}
                      </Chip>
                    </li>
                  ))}
                  {(params.minPrice || params.maxPrice) && !faixaEscolhida(params) && (
                    <li>
                      <Chip onRemover={() => atualizar({ minPrice: null, maxPrice: null })}>
                        <span className="text-muted-foreground">Preço:</span>{" "}
                        {params.minPrice ? `R$ ${params.minPrice}` : "R$ 0"} – {params.maxPrice ? `R$ ${params.maxPrice}` : "sem limite"}
                      </Chip>
                    </li>
                  )}
                  <li>
                    <button type="button" onClick={limparFiltros} className="type-label cursor-pointer px-2 text-primary hover:underline">
                      Limpar filtros
                    </button>
                  </li>
                </ul>
              )}

              <div className="mt-6">
                {estado.status === "loading" && <GradeCarregando />}

                {estado.status === "error" && <ErrorState title="Busca indisponível" description={estado.mensagem} onRetry={() => carregar(0)} />}

                {resultado && resultado.hits.length === 0 && (
                  <EmptyState
                    icon={PackageSearch}
                    title="Nenhum produto encontrado"
                    description={temFiltro ? "Tente remover alguns filtros ou buscar outro termo." : "Confira a grafia ou tente um termo mais geral."}
                    action={
                      temFiltro ? (
                        <Button variant="outline" onClick={limparFiltros}>
                          Limpar filtros
                        </Button>
                      ) : undefined
                    }
                  />
                )}

                {resultado && resultado.hits.length > 0 && (
                  <>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
                      {resultado.hits.map((p) => (
                        <li key={p.id}>
                          <ProductCard
                            id={p.id}
                            title={p.title}
                            price={p.price}
                            oldPrice={p.originalPrice}
                            aPartirDe={p.precoAPartirDe}
                            category={p.brand || undefined}
                            image={p.image}
                            condicao={p.condition}
                            local={[p.city, p.state].filter(Boolean).join(", ")}
                          />
                        </li>
                      ))}
                    </ul>

                    {estado.status === "ok" && estado.page + 1 < resultado.totalPages && (
                      <div className="mt-10 flex flex-col items-center gap-2">
                        <Button variant="outline" size="lg" loading={estado.carregandoMais} onClick={() => carregar(estado.page + 1)}>
                          Carregar mais produtos
                        </Button>
                        <p className="type-caption text-muted-foreground">
                          Mostrando {resultado.hits.length} de {resultado.total.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

/** Tela antes de buscar: buscas recentes e atalhos por modalidade e esporte. */
function Inicio({
  historico,
  onTermo,
  onLimparHistorico,
  digitando,
}: {
  historico: string[]
  onTermo: (termo: string) => void
  onLimparHistorico: () => void
  digitando: boolean
}) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10">
      {digitando && <p className="type-body-small text-center text-muted-foreground">Continue digitando para buscar…</p>}

      {historico.length > 0 && (
        <section aria-labelledby="recentes-title">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 id="recentes-title" className="type-h2 text-foreground">
              Buscas recentes
            </h2>
            <button type="button" onClick={onLimparHistorico} className="type-label cursor-pointer text-primary hover:underline">
              Limpar
            </button>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {historico.map((termo) => (
              <li key={termo}>
                <button
                  type="button"
                  onClick={() => onTermo(termo)}
                  className="type-body-small flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-foreground transition-colors hover:border-primary/40"
                >
                  <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                  {termo}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Os mesmos cartões da página Categorias */}
      <section aria-labelledby="categorias-title" className="flex flex-col gap-5">
        <h2 id="categorias-title" className="type-h2 text-foreground">
          O que você procura?
        </h2>
        <CategoriasLista />
      </section>
    </div>
  )
}

function PainelFiltros({
  params,
  facets,
  onFiltro,
  onPreco,
}: {
  params: BuscaParams
  facets: BuscaResultado["facets"]
  onFiltro: (campo: Filtro, valor: string | null) => void
  onPreco: (min: string | null, max: string | null) => void
}) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {FILTROS.map((campo) => {
        const contagens = facets[campo] ?? {}
        let valores = Object.keys(contagens).sort((a, b) => contagens[b] - contagens[a])
        if (valores.length === 0) valores = OPCOES_FIXAS[campo] ?? []
        const escolhido = params.filtros[campo]
        if (escolhido && !valores.includes(escolhido)) valores = [escolhido, ...valores]
        if (valores.length === 0) return null
        return (
          <GrupoFiltro
            key={campo}
            titulo={ROTULOS[campo]}
            valores={valores}
            contagens={contagens}
            escolhido={escolhido}
            rotulo={(v) => rotuloDoValor(campo, v)}
            onEscolher={(v) => onFiltro(campo, v === escolhido ? null : v)}
          />
        )
      })}
      <FiltroPreco key={`${params.minPrice}-${params.maxPrice}`} min={params.minPrice} max={params.maxPrice} onAplicar={onPreco} />
    </div>
  )
}

const VISIVEIS = 6

function GrupoFiltro({
  titulo,
  valores,
  contagens,
  escolhido,
  rotulo,
  onEscolher,
}: {
  titulo: string
  valores: string[]
  contagens: Record<string, number>
  escolhido?: string
  rotulo: (valor: string) => string
  onEscolher: (valor: string) => void
}) {
  const [todos, setTodos] = useState(false)
  const lista = todos ? valores : valores.slice(0, VISIVEIS)
  return (
    <fieldset className="py-5 first:pt-0">
      <legend className="type-label text-foreground">{titulo}</legend>
      {/* Pílulas em vez de lista com bolinhas */}
      <ul className="mt-3 flex flex-wrap gap-2">
        {lista.map((valor) => (
          <li key={valor}>
            <Pilula ativo={valor === escolhido} onClick={() => onEscolher(valor)} contagem={contagens[valor]}>
              {rotulo(valor)}
            </Pilula>
          </li>
        ))}
      </ul>
      {valores.length > VISIVEIS && (
        <button type="button" onClick={() => setTodos(!todos)} className="type-label mt-2 cursor-pointer px-2 text-primary hover:underline">
          {todos ? "Ver menos" : `Ver mais (${valores.length - VISIVEIS})`}
        </button>
      )}
    </fieldset>
  )
}

function FiltroPreco({ min, max, onAplicar }: { min?: string; max?: string; onAplicar: (min: string | null, max: string | null) => void }) {
  const [minimo, setMinimo] = useState(min ?? "")
  const [maximo, setMaximo] = useState(max ?? "")
  const limpar = (v: string) => v.replace(/\D/g, "")
  return (
    <form
      className="py-5"
      onSubmit={(event) => {
        event.preventDefault()
        onAplicar(limpar(minimo) || null, limpar(maximo) || null)
      }}
    >
      <fieldset>
        <legend className="type-label text-foreground">Preço (R$)</legend>
        <ul className="mt-3 flex flex-wrap gap-2">
          {FAIXAS_PRECO.map((faixa) => {
            const ativo = (min ?? "") === (faixa.min ?? "") && (max ?? "") === (faixa.max ?? "")
            return (
              <li key={faixa.label}>
                <Pilula ativo={ativo} onClick={() => (ativo ? onAplicar(null, null) : onAplicar(faixa.min ?? null, faixa.max ?? null))}>
                  {faixa.label}
                </Pilula>
              </li>
            )
          })}
        </ul>
        <p className="type-caption mt-4 text-muted-foreground">Ou escolha os valores</p>
        <div className="mt-2 flex items-center gap-2">
          <Input inputMode="numeric" placeholder="Mínimo" aria-label="Preço mínimo" value={minimo} onChange={(e) => setMinimo(limpar(e.target.value))} />
          <span className="text-muted-foreground" aria-hidden="true">
            –
          </span>
          <Input inputMode="numeric" placeholder="Máximo" aria-label="Preço máximo" value={maximo} onChange={(e) => setMaximo(limpar(e.target.value))} />
        </div>
        <Button type="submit" variant="outline" size="sm" className="mt-3 w-full">
          Aplicar preço
        </Button>
      </fieldset>
    </form>
  )
}

function faixaEscolhida(params: BuscaParams) {
  return FAIXAS_PRECO.find((f) => (params.minPrice ?? "") === (f.min ?? "") && (params.maxPrice ?? "") === (f.max ?? ""))
}

/**
 * Filtros em um toque, logo abaixo do título: categoria (ou modalidade, dentro de Bikes),
 * condição e faixa de preço. Rola de lado no celular. O botão Filtros abre o resto.
 */
function FiltrosRapidos({
  params,
  atualizar,
}: {
  params: BuscaParams
  atualizar: (mudancas: Record<string, string | null | undefined>) => void
}) {
  const { category, modality, condition } = params.filtros
  const faixa = faixaEscolhida(params)
  const alternar = (campo: Filtro, valor: string, atual?: string) => atualizar({ [campo]: atual === valor ? null : valor })

  return (
    <ul className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0" aria-label="Filtros rápidos">
      {!category &&
        categoriasLoja.map(({ slug, curto, icone: Icone }) => (
          <li key={slug}>
            <Pilula ativo={false} onClick={() => atualizar({ category: slug })}>
              <Icone aria-hidden="true" />
              {curto}
            </Pilula>
          </li>
        ))}
      {category && (
        <li>
          <Pilula ativo onClick={() => atualizar({ category: null, modality: null })}>
            {nomeDaCategoria(category) ?? category}
            <X aria-hidden="true" />
            <span className="sr-only">(remover)</span>
          </Pilula>
        </li>
      )}
      {category === "bikes" &&
        modalidades.map(({ slug, label }) => (
          <li key={slug}>
            <Pilula ativo={modality === slug} onClick={() => alternar("modality", slug, modality)}>
              {label}
            </Pilula>
          </li>
        ))}
      {category !== "servicos" &&
        (["USED", "NEW"] as const).map((valor) => (
          <li key={valor}>
            <Pilula ativo={condition === valor} onClick={() => alternar("condition", valor, condition)}>
              {valor === "NEW" ? "Novo" : "Usado"}
            </Pilula>
          </li>
        ))}
      {FAIXAS_PRECO.map((f) => (
        <li key={f.label}>
          <Pilula
            ativo={faixa === f}
            onClick={() => atualizar(faixa === f ? { minPrice: null, maxPrice: null } : { minPrice: f.min ?? null, maxPrice: f.max ?? null })}
          >
            {f.label}
          </Pilula>
        </li>
      ))}
    </ul>
  )
}

function Chip({ children, onRemover }: { children: React.ReactNode; onRemover: () => void }) {
  return (
    <span className="type-body-small inline-flex items-center gap-1 rounded-full border border-border bg-surface py-1 pl-3 pr-1 text-foreground">
      {children}
      <button
        type="button"
        onClick={onRemover}
        aria-label="Remover filtro"
        className="grid size-6 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </span>
  )
}

function GradeCarregando() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </li>
      ))}
    </ul>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <BuscarPageContent />
    </Suspense>
  )
}
