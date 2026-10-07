// app/vendedor/page.tsx  →  Central do Vendedor
"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useUser, SignInButton } from "@clerk/nextjs"
import {
  ArrowLeft,
  Bike,
  ChevronRight,
  Droplets,
  Eye,
  Loader2,
  MoreVertical,
  Package,
  Pause,
  Pencil,
  Play,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
  Wrench,
  X,
} from "lucide-react"
import { BottomNav } from "@/components/layout/bottom-nav"
import {
  sellerProductService,
  capaDoProduto,
  formatarPreco,
  type ProdutoItem,
} from "@/services/publish/seller-products.service"

/*
  Paleta (creme como cor principal)
  fundo   #F5EEDC   superfície #FBF7EC   linha #E4D9BF
  texto   #2B2A22   apagado    #7A7260
  ação    #A33C36 (vermelho da marca, igual ao logo)   ação suave #F3DDD3
*/

const categoriasPublicar = [
  { label: "Bicicletas", href: "/publicar/bikes", icon: Bike },
  { label: "Peças", href: "/publicar/pecas", icon: Settings },
  { label: "Serviços", href: "/publicar/servicos", icon: Wrench },
  { label: "Produtos", href: "/publicar/produtos", icon: ShoppingBag },
  { label: "Consumíveis", href: "/publicar/consumiveis", icon: Droplets },
]

type Status = "ATIVO" | "PAUSADO" | "VENDIDO"
type Filtro = "TODOS" | Status

const statusDe = (p: ProdutoItem): Status => (p.status as Status) ?? "ATIVO"

const statusVisual: Record<Status, { texto: string; ponto: string }> = {
  ATIVO: { texto: "Ativo", ponto: "bg-[#4F7A3A]" },
  PAUSADO: { texto: "Pausado", ponto: "bg-[#B7791F]" },
  VENDIDO: { texto: "Vendido", ponto: "bg-[#4A6A8A]" },
}

export default function CentralVendedorPage() {
  const { isSignedIn, isLoaded } = useUser()

  const [produtos, setProdutos] = useState<ProdutoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | number | null>(null)
  const [filtro, setFiltro] = useState<Filtro>("TODOS")

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
      setErro("Não foi possível carregar seus anúncios. Puxe para tentar de novo.")
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

  const visiveis = useMemo(
    () => (filtro === "TODOS" ? produtos : produtos.filter((p) => statusDe(p) === filtro)),
    [produtos, filtro]
  )

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

  /* ---------- cabeçalho: voltar vai para a HOME ("/"), não para /perfil ---------- */
  const Topo = (
    <header className="sticky top-0 z-40 border-b border-[#E4D9BF] bg-[#F5EEDC]/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2.5">
        <Link
          href="/"
          aria-label="Voltar para o início"
          className="flex size-10 items-center justify-center rounded-full text-[#2B2A22] active:bg-[#E4D9BF]/60"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-heading text-lg font-bold text-[#2B2A22]">Central do vendedor</h1>
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
      <div className="min-h-screen bg-[#F5EEDC]">
        {Topo}
        <div className="flex flex-col items-center px-6 py-24 text-center">
          <div className="mb-5 grid size-16 place-items-center rounded-full bg-[#F3DDD3]">
            <Package className="size-7 text-[#A33C36]" />
          </div>
          <p className="font-heading text-lg font-bold text-[#2B2A22]">Entre para vender</p>
          <p className="mt-1 max-w-xs text-sm text-[#7A7260]">
            Acesse sua conta para publicar e gerenciar seus anúncios.
          </p>
          <SignInButton mode="modal">
            <button className="mt-6 rounded-full bg-[#A33C36] px-8 py-3 text-sm font-semibold text-[#F5EEDC] active:scale-[0.98]">
              Entrar
            </button>
          </SignInButton>
        </div>
        <BottomNav onMenuClick={() => {}} />
      </div>
    )
  }

  const filtros: { id: Filtro; label: string }[] = [
    { id: "TODOS", label: "Todos" },
    { id: "ATIVO", label: "Ativos" },
    { id: "PAUSADO", label: "Pausados" },
    { id: "VENDIDO", label: "Vendidos" },
  ]

  return (
    <div className="min-h-screen bg-[#F5EEDC] text-[#2B2A22]">
      {Topo}

      <main className="mx-auto max-w-3xl px-4 pb-44 pt-4">
        {/* Filtros = resumo + navegação, tudo em uma linha */}
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
          <div className="flex gap-2">
            {filtros.map((f) => {
              const ativo = filtro === f.id
              return (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    ativo
                      ? "bg-[#A33C36] text-[#F5EEDC]"
                      : "border border-[#E4D9BF] bg-[#FBF7EC] text-[#2B2A22]"
                  }`}
                >
                  {f.label}
                  <span className={ativo ? "text-[#F5EEDC]/70" : "text-[#7A7260]"}>
                    {contagem[f.id]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {erro && (
          <p className="mt-4 rounded-xl bg-[#B4442F]/10 px-4 py-3 text-sm text-[#8F2F1D]">{erro}</p>
        )}

        <div className="mt-4">
          {loading ? (
            <div className="grid place-items-center py-24">
              <Loader2 className="size-6 animate-spin text-[#7A7260]" />
            </div>
          ) : produtos.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <div className="mb-5 grid size-20 place-items-center rounded-full bg-[#F3DDD3]">
                <Bike className="size-9 text-[#A33C36]" />
              </div>
              <p className="font-heading text-lg font-bold">Sua vitrine está vazia</p>
              <p className="mt-1 max-w-xs text-sm text-[#7A7260]">
                Publique sua primeira bike, peça ou serviço em poucos minutos.
              </p>
              <button
                onClick={() => setPublicando(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#A33C36] px-6 py-3 text-sm font-semibold text-[#F5EEDC] active:scale-[0.98]"
              >
                <Plus className="size-4" />
                Publicar anúncio
              </button>
            </div>
          ) : visiveis.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#7A7260]">Nenhum anúncio nesta aba.</p>
          ) : (
            <ul className="divide-y divide-[#E4D9BF] overflow-hidden rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC]">
              {visiveis.map((p) => {
                const capa = capaDoProduto(p)
                const st = statusVisual[statusDe(p)]
                return (
                  <li key={p.id} className="flex items-center gap-3 p-3">
                    <Link href={`/produtos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="size-[72px] shrink-0 overflow-hidden rounded-xl bg-[#EFE6CE]">
                        {capa ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={capa} alt={p.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center">
                            <Package className="size-6 text-[#7A7260]/50" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug">{p.title}</p>
                        <p className="mt-0.5 text-base font-bold text-[#A33C36]">{formatarPreco(p.price)}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#7A7260]">
                          {ocupado === p.id ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <span className={`size-1.5 rounded-full ${st.ponto}`} />
                          )}
                          {st.texto}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => setAcoes(p)}
                      aria-label={`Ações de ${p.title}`}
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#7A7260] active:bg-[#E4D9BF]/60"
                    >
                      <MoreVertical className="size-5" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>

      {/* Botão principal na zona do polegar, acima da barra inferior */}
      {produtos.length > 0 && (
        <button
          onClick={() => setPublicando(true)}
          className="fixed bottom-24 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-[#A33C36] px-5 py-3.5 text-sm font-semibold text-[#F5EEDC] shadow-[0_8px_24px_-6px_rgba(163,60,54,0.45)] active:scale-[0.97]"
        >
          <Plus className="size-5" />
          Publicar
        </button>
      )}

      {/* O que você vai vender? */}
      {publicando && (
        <Sheet titulo="O que você vai vender?" onClose={() => setPublicando(false)}>
          <ul className="space-y-2">
            {categoriasPublicar.map(({ label, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-2xl border border-[#E4D9BF] bg-[#FBF7EC] px-4 py-3.5 active:bg-[#F3DDD3]"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-[#F3DDD3] text-[#A33C36]">
                    <Icon className="size-5" />
                  </span>
                  <span className="flex-1 text-sm font-semibold">{label}</span>
                  <ChevronRight className="size-4 text-[#7A7260]" />
                </Link>
              </li>
            ))}
          </ul>
        </Sheet>
      )}

      {/* Ações do anúncio */}
      {acoes && (
        <Sheet titulo={acoes.title} onClose={() => setAcoes(null)}>
          <div className="space-y-1">
            <LinhaAcao href={`/produtos/${acoes.id}`} icon={Eye} texto="Ver anúncio" />
            <LinhaAcao
              icon={Pencil}
              texto="Editar"
              onClick={() => {
                setEditando(acoes)
                setAcoes(null)
              }}
            />
            {statusDe(acoes) !== "VENDIDO" && (
              <LinhaAcao
                icon={acoes.status === "PAUSADO" ? Play : Pause}
                texto={acoes.status === "PAUSADO" ? "Reativar anúncio" : "Pausar anúncio"}
                onClick={() => alternarStatus(acoes)}
              />
            )}
            <LinhaAcao
              icon={Trash2}
              texto="Excluir"
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
            “{excluindo.title}” sai do marketplace e não dá para desfazer.
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
            className="flex size-9 shrink-0 items-center justify-center rounded-full active:bg-[#E4D9BF]/60"
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
  const cls = `flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-medium active:bg-[#E4D9BF]/60 ${
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
            <label className={rotulo}>Ano</label>
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
          className="flex flex-[1.4] items-center justify-center gap-2 rounded-full bg-[#A33C36] py-3 text-sm font-semibold text-[#F5EEDC] disabled:opacity-50"
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          Salvar alterações
        </button>
      </div>
    </Sheet>
  )
}