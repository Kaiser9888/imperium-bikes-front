// app/vendedor/page.tsx  →  Central do Vendedor
"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useUser, SignInButton } from "@clerk/nextjs"
import { ArrowLeft, Eye, Loader2, Package, Pause, Pencil, Play, Plus, Trash2, X } from "lucide-react"
import { BottomNav } from "@/components/layout/bottom-nav"
import {
  sellerProductService,
  capaDoProduto,
  formatarPreco,
  type ProdutoItem,
} from "@/services/publish/seller-products.service"

const categoriasPublicar = [
  { label: "Bicicletas", href: "/publicar/bikes" },
  { label: "Peças", href: "/publicar/pecas" },
  { label: "Serviços", href: "/publicar/servicos" },
  { label: "Produtos", href: "/publicar/produtos" },
  { label: "Consumíveis", href: "/publicar/consumiveis" },
]

export default function CentralVendedorPage() {
  const { isSignedIn, isLoaded } = useUser()

  const [produtos, setProdutos] = useState<ProdutoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | number | null>(null)

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

  const ativos = produtos.filter((p) => (p.status ?? "ATIVO") === "ATIVO").length
  const pausados = produtos.filter((p) => p.status === "PAUSADO").length
  const vendidos = produtos.filter((p) => p.status === "VENDIDO").length

  async function alternarStatus(p: ProdutoItem) {
    const novo = p.status === "PAUSADO" ? "ATIVO" : "PAUSADO"
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

  const Header = (
    <header
      className="sticky top-0 z-40 border-b border-border/60 bg-marble bg-cover bg-center shadow-sm"
      style={{ backgroundImage: "url(/images/marble-light.png)" }}
    >
      <div className="bg-marble/15 backdrop-blur-[2px]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/perfil"><ArrowLeft className="size-5" /></Link>
            <span className="font-heading text-lg font-bold text-foreground">Central do vendedor</span>
          </div>
          <Link
            href="/publicar"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            Publicar anúncio
          </Link>
        </div>
      </div>
    </header>
  )

  if (!isLoaded) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        {Header}
        <div className="flex flex-col items-center px-4 py-20 text-center">
          <p className="mb-6 text-muted-foreground">Entre para gerenciar seus anúncios</p>
          <SignInButton mode="modal">
            <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Entrar</button>
          </SignInButton>
        </div>
        <BottomNav onMenuClick={() => {}} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {Header}

      <main className="mx-auto max-w-3xl px-4 py-6 pb-28">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Anúncios", valor: produtos.length },
            { label: "Ativos", valor: ativos },
            { label: "Pausados", valor: pausados },
            { label: "Vendidos", valor: vendidos },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
              <p className="font-heading text-xl font-bold">{s.valor}</p>
              <p className="mt-0.5 text-[0.65rem] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Publicar anúncio</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Escolha o que você vai vender.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categoriasPublicar.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium hover:border-primary/40 hover:bg-secondary"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>

        {erro && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{erro}</p>
        )}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : produtos.length === 0 ? (
            <div className="py-16 text-center">
              <Package className="mx-auto mb-4 size-14 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Você ainda não tem anúncios.</p>
              <Link href="/publicar" className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="size-4" />
                Publicar anúncio
              </Link>
            </div>
          ) : (
            produtos.map((p) => {
              const capa = capaDoProduto(p)
              const pausado = p.status === "PAUSADO"
              const vendido = p.status === "VENDIDO"
              return (
                <div key={p.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {capa ? (
                      <img src={capa} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center">
                        <Package className="size-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{p.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          vendido
                            ? "bg-blue-500/10 text-blue-600"
                            : pausado
                              ? "bg-amber-500/10 text-amber-600"
                              : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {vendido ? "Vendido" : pausado ? "Pausado" : "Ativo"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-primary">{formatarPreco(p.price)}</p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Link
                        href={`/produtos/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-secondary"
                      >
                        <Eye className="size-3" /> Ver
                      </Link>
                      <button
                        onClick={() => setEditando(p)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-secondary"
                      >
                        <Pencil className="size-3" /> Editar
                      </button>
                      {!vendido && (
                        <button
                          onClick={() => alternarStatus(p)}
                          disabled={ocupado === p.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
                        >
                          {pausado ? <Play className="size-3" /> : <Pause className="size-3" />}
                          {pausado ? "Reativar" : "Pausar"}
                        </button>
                      )}
                      <button
                        onClick={() => setExcluindo(p)}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3" /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

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
        <Modal onClose={() => setExcluindo(null)} titulo="Excluir anúncio">
          <p className="text-sm text-muted-foreground">
            “{excluindo.title}” será removido do marketplace. Essa ação não pode ser desfeita.
          </p>
          <div className="mt-6 flex gap-2">
            <button onClick={() => setExcluindo(null)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-secondary">
              Cancelar
            </button>
            <button
              onClick={confirmarExclusao}
              disabled={ocupado === excluindo.id}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {ocupado === excluindo.id && <Loader2 className="size-3 animate-spin" />}
              Excluir
            </button>
          </div>
        </Modal>
      )}

      <BottomNav onMenuClick={() => {}} />
    </div>
  )
}

/* ---------- componentes auxiliares ---------- */

function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-background p-6 shadow-2xl sm:max-w-md sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-heading text-base font-bold">{titulo}</h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-md hover:bg-secondary">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
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

  const campo = "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30"
  const rotulo = "text-[10px] uppercase text-muted-foreground"

  return (
    <Modal titulo="Editar anúncio" onClose={onClose}>
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
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={`${campo} resize-none`} />
        </div>
        {erro && <p className="text-xs font-semibold text-destructive">{erro}</p>}
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium hover:bg-secondary">
          Cancelar
        </button>
        <button
          onClick={salvar}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving && <Loader2 className="size-3 animate-spin" />}
          Salvar alterações
        </button>
      </div>
    </Modal>
  )
}