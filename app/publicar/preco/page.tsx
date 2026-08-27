"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { getCategoriaConfig } from "@/lib/publicar/categorias"
import { CustoItem, getDraft, saveDraft } from "@/lib/publicar/storage"

function centavosParaReais(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function reaisParaCentavos(valor: string) {
  const numero = Number(valor.replace(",", "."))
  return Number.isFinite(numero) ? Math.round(numero * 100) : 0
}

export default function PrecoPage() {
  const params = useParams<{ categoria: string }>()
  const categoria = params.categoria
  const config = getCategoriaConfig(categoria)
  const router = useRouter()

  const [preco, setPreco] = useState("")
  const [custos, setCustos] = useState<CustoItem[]>([])
  const [mostrarCustos, setMostrarCustos] = useState(false)

  useEffect(() => {
    const draft = getDraft(categoria).preco
    if (!draft) return
    setPreco(draft.valor_centavos ? String(draft.valor_centavos / 100) : "")
    if (draft.custos?.length) {
      setCustos(draft.custos)
      setMostrarCustos(true)
    }
  }, [categoria])

  const custoTotalCentavos = custos.reduce((soma, item) => soma + item.valor_centavos, 0)
  const precoCentavos = reaisParaCentavos(preco)
  const margemCentavos = precoCentavos - custoTotalCentavos

  const canContinue = precoCentavos > 0

  function addCusto() {
    setCustos((prev) => [...prev, { label: "", valor_centavos: 0 }])
  }

  function updateCusto(index: number, patch: Partial<CustoItem>) {
    setCustos((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeCusto(index: number) {
    setCustos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleContinue() {
    if (!canContinue) return
    saveDraft(categoria, {
      preco: { valor_centavos: precoCentavos, custos: custos.filter((c) => c.label.trim()) },
    })
    router.push(`/publicar/${categoria}/destacar`)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href={`/publicar/${categoria}/frete`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">{config?.label ?? "Anúncio"}</span>
          <div className="w-[52px]" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Preço</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Defina o valor de venda. Você pode listar seus custos para ajudar a decidir o preço.
          </p>
        </section>

        <section className="mb-6">
          <label className="block">
            <span className="text-sm font-semibold">Preço de venda</span>
            <div className="mt-2 flex items-center rounded-xl border border-input bg-background px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <span className="text-sm text-muted-foreground">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0,00"
                className="w-full bg-transparent px-2 py-3 text-sm outline-none"
              />
            </div>
          </label>
        </section>

        <section>
          {!mostrarCustos ? (
            <button
              type="button"
              onClick={() => setMostrarCustos(true)}
              className="text-sm font-semibold text-primary"
            >
              + Adicionar meus custos para me ajudar a decidir o preço
            </button>
          ) : (
            <div className="rounded-xl border border-border p-4">
              <span className="text-sm font-semibold">Custos do produto</span>
              <p className="mt-1 text-xs text-muted-foreground">
                Isso é só uma referência para você — não aparece para o comprador.
              </p>

              <div className="mt-3 space-y-2">
                {custos.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={item.label}
                      onChange={(e) => updateCusto(index, { label: e.target.value })}
                      placeholder="Ex.: Peça, frete de compra…"
                      className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex w-28 items-center rounded-lg border border-input bg-background px-2">
                      <span className="text-xs text-muted-foreground">R$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.valor_centavos ? String(item.valor_centavos / 100) : ""}
                        onChange={(e) => updateCusto(index, { valor_centavos: reaisParaCentavos(e.target.value) })}
                        placeholder="0,00"
                        className="w-full bg-transparent px-1 py-2 text-sm outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCusto(index)}
                      aria-label="Remover custo"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addCusto}
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <Plus className="size-3.5" />
                Adicionar custo
              </button>

              {custos.length > 0 && (
                <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Custo total</span>
                    <span>{centavosParaReais(custoTotalCentavos)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Margem estimada</span>
                    <span className={margemCentavos < 0 ? "text-destructive" : ""}>
                      {centavosParaReais(margemCentavos)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  )
}