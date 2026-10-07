// app/vendedor/page.tsx  →  Central do Vendedor
"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useUser, SignInButton } from "@clerk/nextjs"
import {
  ArrowLeft,
  ChevronRight,
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
  { label: "Equipamentos", desc: "O item principal do seu esporte", href: "/publicar/bikes", icon: Trophy },
  { label: "Peças e acessórios", desc: "Componentes, proteções, complementos", href: "/publicar/pecas", icon: Cog },
  { label: "Serviços", desc: "Aulas, manutenção, personal, aluguel", href: "/publicar/servicos", icon: Wrench },
  { label: "Produtos", desc: "Roupas, calçados e itens gerais", href: "/publicar/produtos", icon: ShoppingBag },
  { label: "Consumíveis", desc: "Suplementos, géis, hidratação", href: "/publicar/consumiveis", icon: Zap },
]

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

  const [publicando, setPublicando] = useState(false)
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
    <header className="sticky top-0 z-40 border-b border-[#E4D9BF] bg-[#F5EEDC]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 py-2.5 md:px-6">
        <Link
          href="/"
          aria-label="Voltar para o início"
          className="flex size-10 items-center justify-center rounded-full hover:bg-[#E4D9BF]/60 active:bg-[#E4D9BF]"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-heading text-lg font-bold">Central do vendedor</h1>
      </div>
    </header>
  )

  if (!isLoaded) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F5EEDC]">
        <Loader2 className="size-6 animate-spin text-[#7A7260]" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F5EEDC] text-[#2B2A22]">
        {Topo}
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <div className="mb-5 grid size-16 place-items-center rounded-full bg-[#F3DDD3]">
            <Trophy className="size-7 text-[#A33C36]" />
          </div>
          <p className="font-heading text-xl font-bold">Venda para quem vive esporte</p>
          <p className="mt-1 max-w-xs text-sm text-[#7A7260]">
            Entre na sua conta para publicar e gerenciar seus anúncios.
          </p>
          <SignInButton mode="modal">
            <button className="mt-6 rounded-full bg-[#A33C36] px-8 py-3 text-sm font-semibold text-[#F5EEDC] hover:bg-[#8C312C] active:scale-[0.98]">
              Entrar
            </button>
          </SignInButton>
        </div>
        <BottomNav onMenuClick={() => {}} />
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

  const botaoNovo =
    "items-center gap-2 rounded-full bg-[#F5EEDC] px-5 py-3 text-sm font-semibold text-[#A33C36] active:scale-[0.97]"

  return (
    <div className="min-h-screen bg-[#F5EEDC] text-[#2B2A22]">
      {Topo}

      <main className="mx-auto max-w-5xl px-4 pb-44 pt-4 md:px-6 md:pt-6">
        {/* ---------- RESUMO ---------- */}
        <section className="relative overflow-hidden rounded-3xl bg-[#A33C36] p-5 text-[#F5EEDC] md:p-7">
          <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-[#F5EEDC]/10" />
          <div className="pointer-events-none absolute -bottom-16 right-16 size-40 rounded-full bg-[#F5EEDC]/5" />

          <div className="relative flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-[#F5EEDC]/80">Olá, {nome}</p>
              <p className="mt-2 font-heading text-6xl font-bold leading-none">{contagem.ATIVO}</p>
              <p className="mt-1.5 text-sm text-[#F5EEDC]/90">
                {contagem.ATIVO === 1 ? "anúncio no ar" : "anúncios no ar"}
              </p>
            </div>
            <button onClick={() => setPublicando(true)} className={`hidden md:inline-flex ${botaoNovo}`}>
              <Plus className="size-4" />
              Novo anúncio
            </button>
          </div>

          <div className="relative mt-6">
            <div className="flex h-2 overflow-hidden rounded-full bg-[#F5EEDC]/20">
              {contagem.TODOS > 0 && (
                <>
                  <span className="bg-[#F5EEDC]" style={{ width: `${(contagem.ATIVO / total) * 100}%` }} />
                  <span className="bg-[#F2B866]" style={{ width: `${(contagem.PAUSADO / total) * 100}%` }} />
                  <span className="bg-[#9CC3E0]" style={{ width: `${(contagem.VENDIDO / total) * 100}%` }} />
                </>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#F5EEDC]/90">
              <Legenda cor="bg-[#F5EEDC]" texto="No ar" n={contagem.ATIVO} />
              <Legenda cor="bg-[#F2B866]" texto="Pausados" n={contagem.PAUSADO} />
              <Legenda cor="bg-[#9CC3E0]" texto="Vendidos" n={contagem.VENDIDO} />
            </div>
          </div>
        </section>

        {/* ---------- FILTROS + BUSCA ---------- */}
        {produtos.length > 0 && (
          <div className="mt-5 space-y-3 md:flex md:items-center md:justify-between md:space-y-0 md:gap-4">
            <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0">
              <div className="flex gap-2">
                {filtros.map((f) => {
                  const ativo = filtro === f.id
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFiltro(f.id)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        ativo
                          ? "bg-[#2B2A22] text-[#F5EEDC]"
                          : "border border-[#E4D9BF] bg-[#FBF7EC] hover:border-[#2B2A22]/40"
                      }`}
                    >
                      {f.label}
                      <span className={ativo ? "text-[#F5EEDC]/60" : "text-[#7A7260]"}>{contagem[f.id]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 rounded-full border border-[#E4D9BF] bg-[#FBF7EC] px-4 py-2.5 focus-within:border-[#A33C36] md:w-72">
              <Search className="size-4 shrink-0 text-[#7A7260]" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nos seus anúncios"
                className="w-full bg-transparent text-base outline-none placeholder:text-[#7A7260] md:text-sm"
              />
            </label>
          </div>
        )}

        {erro && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#A33C36]/10 px-4 py-3 text-sm text-[#7A2A25]">
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
                <li key={i} className="h-[112px] animate-pulse rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC]" />
              ))}
            </ul>
          ) : produtos.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <div className="mb-6 flex items-center">
                {[Dumbbell, Trophy, Zap].map((Icon, i) => (
                  <span
                    key={i}
                    className={`grid size-16 place-items-center rounded-full border-4 border-[#F5EEDC] ${
                      i === 1 ? "z-10 -mx-3 size-[72px] bg-[#A33C36] text-[#F5EEDC]" : "bg-[#F3DDD3] text-[#A33C36]"
                    }`}
                  >
                    <Icon className="size-7" />
                  </span>
                ))}
              </div>
              <p className="font-heading text-xl font-bold">Sua vitrine está pronta</p>
              <p className="mt-1 max-w-xs text-sm text-[#7A7260]">
                Publique o primeiro anúncio e comece a vender para a comunidade esportiva.
              </p>
              <button
                onClick={() => setPublicando(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#A33C36] px-6 py-3 text-sm font-semibold text-[#F5EEDC] hover:bg-[#8C312C] active:scale-[0.98]"
              >
                <Plus className="size-4" />
                Criar anúncio
              </button>
            </div>
          ) : visiveis.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#7A7260]">Nada encontrado com esse filtro.</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {visiveis.map((p) => {
                const capa = capaDoProduto(p)
                const st = statusDe(p)
                const vendido = st === "VENDIDO"
                const noAr = st === "ATIVO"
                return (
                  <li key={p.id} className="flex gap-3 rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC] p-3">
                    <Link
                      href={`/produtos/${p.id}`}
                      className="size-[88px] shrink-0 overflow-hidden rounded-xl bg-[#EFE6CE]"
                    >
                      {capa ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={capa} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center">
                          <Package className="size-6 text-[#7A7260]/50" />
                        </div>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-1">
                        <Link href={`/produtos/${p.id}`} className="line-clamp-2 text-sm font-semibold leading-snug">
                          {p.title}
                        </Link>
                        <button
                          onClick={() => setAcoes(p)}
                          aria-label={`Mais ações de ${p.title}`}
                          className="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-[#7A7260] hover:bg-[#E4D9BF]/60 active:bg-[#E4D9BF]"
                        >
                          <MoreVertical className="size-5" />
                        </button>
                      </div>

                      <p className="text-base font-bold text-[#A33C36]">{formatarPreco(p.price)}</p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        {vendido ? (
                          <span className="rounded-full bg-[#4A6A8A]/10 px-2.5 py-1 text-xs font-semibold text-[#3E5A76]">
                            Vendido
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center gap-1.5 text-xs text-[#7A7260]">
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
                                noAr ? "bg-[#A33C36]" : "bg-[#D9CDB0]"
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
        <button
          onClick={() => setPublicando(true)}
          className="fixed bottom-24 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-[#A33C36] px-5 py-3.5 text-sm font-semibold text-[#F5EEDC] shadow-[0_8px_24px_-6px_rgba(163,60,54,0.5)] active:scale-[0.97] md:hidden"
        >
          <Plus className="size-5" />
          Novo anúncio
        </button>
      )}

      {/* ---------- O QUE VAI VENDER ---------- */}
      {publicando && (
        <Sheet titulo="O que você vai vender?" onClose={() => setPublicando(false)}>
          <ul className="space-y-2">
            {tiposDeAnuncio.map(({ label, desc, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC] px-4 py-3.5 hover:border-[#A33C36]/40 active:bg-[#F3DDD3]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F3DDD3] text-[#A33C36]">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block truncate text-xs text-[#7A7260]">{desc}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-[#7A7260]" />
                </Link>
              </li>
            ))}
          </ul>
        </Sheet>
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
          <p className="text-sm text-[#7A7260]">
            “{excluindo.title}” sai do marketplace e não dá para desfazer. Se só quer dar uma pausa, use o
            interruptor na lista.
          </p>
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setExcluindo(null)}
              className="flex-1 rounded-full border border-[#E4D9BF] py-3 text-sm font-semibold"
            >
              Manter
            </button>
            <button
              onClick={confirmarExclusao}
              disabled={ocupado === excluindo.id}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5C1A14] py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {ocupado === excluindo.id && <Loader2 className="size-3.5 animate-spin" />}
              Excluir
            </button>
          </div>
        </Sheet>
      )}

      <BottomNav onMenuClick={() => {}} />
    </div>
  )
}

/* ---------- componentes auxiliares ---------- */

function Legenda({ cor, texto, n }: { cor: string; texto: string; n: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${cor}`} />
      {texto} <b className="font-semibold">{n}</b>
    </span>
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
      <div className="absolute inset-0 bg-[#2B2A22]/45" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-[#F5EEDC] px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:max-w-md sm:rounded-3xl sm:pb-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#E4D9BF] sm:hidden" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="line-clamp-1 font-heading text-base font-bold">{titulo}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-[#E4D9BF]/60 active:bg-[#E4D9BF]"
          >
            <X className="size-4" />
          </button>
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
  const cls = `flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-medium hover:bg-[#E4D9BF]/50 active:bg-[#E4D9BF] ${
    perigo ? "text-[#8F2F1D]" : "text-[#2B2A22]"
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
    if (!title.trim()) return setErro("Informe o título.")
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
    } catch {
      setErro("Não foi possível salvar as alterações.")
      setSaving(false)
    }
  }

  const campo =
    "mt-1.5 w-full rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC] px-4 py-3 text-base outline-none focus:border-[#A33C36]"
  const rotulo = "text-xs font-medium text-[#7A7260]"

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
        {erro && <p className="text-sm font-medium text-[#8F2F1D]">{erro}</p>}
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-full border border-[#E4D9BF] py-3 text-sm font-semibold">
          Cancelar
        </button>
        <button
          onClick={salvar}
          disabled={saving}
          className="flex flex-[1.4] items-center justify-center gap-2 rounded-full bg-[#A33C36] py-3 text-sm font-semibold text-[#F5EEDC] hover:bg-[#8C312C] disabled:opacity-50"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          Salvar alterações
        </button>
      </div>
    </Sheet>
  )
}