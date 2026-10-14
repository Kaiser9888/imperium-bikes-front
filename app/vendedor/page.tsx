// app/vendedor/page.tsx  →  Central do Vendedor
"use client"
import { Button } from "@/components/ui/button"

import { useEffect, useMemo, useState, useCallback, useSyncExternalStore } from "react"
import Link from "next/link"
import { Logo } from "@/components/layout/logo"
import { useUser } from "@clerk/nextjs"
import {
  ArrowRight,
  Cog,
  Dumbbell,
  Eye,
  MoreVertical,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Trophy,
  Wrench,
  X,
  Zap,
  Loader2,
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
  { slug: "bikes", label: "Equipamentos", desc: "O item principal do seu esporte", icon: Trophy },
  { slug: "pecas", label: "Peças e acessórios", desc: "Componentes, proteções, complementos", icon: Cog },
  { slug: "servicos", label: "Serviços", desc: "Aulas, manutenção, personal, aluguel", icon: Wrench },
  { slug: "produtos", label: "Produtos", desc: "Roupas, calçados e itens gerais", icon: ShoppingBag },
  { slug: "consumiveis", label: "Consumíveis", desc: "Suplementos, géis, hidratação", icon: Zap },
  { slug: "esportes", label: "Artigos esportivos", desc: "Corrida, natação, futebol, musculação, lutas", icon: Dumbbell },
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

type Status = "ATIVO" | "PAUSADO" | "VENDIDO"
type Filtro = "TODOS" | Status

const statusDe = (p: ProdutoItem): Status => (p.status as Status) ?? "ATIVO"

export default function CentralVendedorPage() {
  const { isSignedIn, isLoaded, user } = useUser()

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
    if (isSignedIn) carregar()
  }, [isSignedIn, carregar])

  const contagem = useMemo(
    () => ({
      TODOS: produtos.length,
      ATIVO: produtos.filter((p) => statusDe(p) === "ATIVO").length,
      PAUSADO: produtos.filter((p) => statusDe(p) === "PAUSADO").length,
      VENDIDO: produtos.filter((p) => statusDe(p) === "VENDIDO").length,
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
            <Trophy className="size-7 text-primary" />
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

  const nome = user?.firstName ?? "vendedor"
  const total = contagem.TODOS || 1

  const filtros: { id: Filtro; label: string }[] = [
    { id: "TODOS", label: "Todos" },
    { id: "ATIVO", label: "No ar" },
    { id: "PAUSADO", label: "Pausados" },
    { id: "VENDIDO", label: "Vendidos" },
  ]

  // Painel sempre escuro (fundo de chuva), então as cores aqui são fixas
  const argolas: { id: Status; label: string; cor: string }[] = [
    { id: "ATIVO", label: "No ar", cor: "oklch(0.78 0.16 155)" },
    { id: "PAUSADO", label: "Pausados", cor: "oklch(0.82 0.14 80)" },
    { id: "VENDIDO", label: "Vendidos", cor: "oklch(0.76 0.12 235)" },
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

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-white/80">Olá, {nome}</p>
              <p className="mt-2 font-heading text-6xl font-bold leading-none">{contagem.ATIVO}</p>
              <p className="mt-1.5 text-sm text-white/90">
                {contagem.ATIVO === 1 ? "anúncio no ar" : "anúncios no ar"}
              </p>
            </div>
            <a href="#publicar" className="underline-btn hidden md:block">
              <span className="flex items-center gap-2 py-1.5">
                <Plus className="size-5" />
                Publicar novo anúncio
              </span>
            </a>
          </div>

          <div className="mt-6 flex gap-5 md:gap-8">
            {argolas.map((a) => (
              <Argola
                key={a.id}
                label={a.label}
                cor={a.cor}
                n={contagem[a.id]}
                total={total}
                ativo={filtro === a.id}
                onClick={() => setFiltro(filtro === a.id ? "TODOS" : a.id)}
              />
            ))}
          </div>
        </section>

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
            <p className="text-xs text-muted-foreground">Escolha a categoria. O resto vai por etapas.</p>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3">
            {tiposDeAnuncio.map(({ slug, label, desc, icon: Icon }) => (
              <li key={slug}>
                <Link
                  href={`/publicar/${slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-3.5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-foreground active:translate-y-0 md:flex-row md:items-center md:gap-3"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <span className="mt-3 min-w-0 md:mt-0">
                    <span className="block text-sm font-semibold leading-snug">{label}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{desc}</span>
                  </span>
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
              <Package className="mx-auto size-7 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-semibold">Nenhum anúncio ainda</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                Escolha uma categoria em “O que você vai vender?” e publique o primeiro.
              </p>
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

                      <p className="text-base font-bold text-primary">{formatarPreco(p.price)}</p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        {vendido ? (
                          <span className="rounded-full bg-info/10 px-2.5 py-1 text-xs font-semibold text-info">
                            Vendido
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              {ocupado === p.id && <Loader2 className="size-3 animate-spin" />}
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

/* Contador em argola: o arco mostra a fatia do total; clicar filtra a lista */
function Argola({
  label,
  cor,
  n,
  total,
  ativo,
  onClick,
}: {
  label: string
  cor: string
  n: number
  total: number
  ativo: boolean
  onClick: () => void
}) {
  const raio = 26
  const volta = 2 * Math.PI * raio
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      aria-label={`${label}: ${n}`}
      className="group flex flex-col items-center gap-1.5 rounded-2xl"
    >
      <span className="relative grid size-16 place-items-center">
        <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="32" cy="32" r={raio} fill="none" stroke="rgb(255 255 255 / 0.18)" strokeWidth="5" />
          <circle
            cx="32"
            cy="32"
            r={raio}
            fill="none"
            stroke={cor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${(n / total) * volta} ${volta}`}
            className="transition-[stroke-dasharray] duration-500"
            opacity={n > 0 ? 1 : 0}
          />
        </svg>
        <span className="text-lg font-bold tabular-nums">{n}</span>
      </span>
      <span
        className={`text-xs font-medium underline-offset-4 group-hover:underline ${
          ativo ? "text-white underline" : "text-white/80"
        }`}
      >
        {label}
      </span>
    </button>
  )
}

function Sheet({
                 titulo,
                 onClose,
                 children,
               }: {
  titulo: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-background px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:max-w-md sm:rounded-3xl sm:pb-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="line-clamp-1 font-heading text-base font-bold">{titulo}</h2>
          <Button
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
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function salvar() {
    const valor = Number(price.replace(",", "."))
    if (title.trim().length < 10) return setErro("O título precisa ter pelo menos 10 caracteres.")
    if (!Number.isFinite(valor) || valor <= 0) return setErro("Informe um preço válido.")

    setSaving(true)
    setErro(null)
    try {
      const dados = {
        title: title.trim(),
        price: valor,
        brand: brand.trim(),
        year: year ? Number(year) : undefined,
        description: description.trim(),
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
        <div>
          <label className={rotulo}>Marca</label>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className={campo} />
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