"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { getCategoriaConfig, isCategoriaValida } from "@/lib/publicar/categorias"
import { getDraft, saveDraft } from "@/lib/publicar/storage"

export default function CaracteristicasPage() {
  const params = useParams<{ categoria: string }>()
  const categoria = params.categoria
  const router = useRouter()
  const config = getCategoriaConfig(categoria)
  const [valores, setValores] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isCategoriaValida(categoria)) return
    const draft = getDraft(categoria)
    if (draft.caracteristicas) setValores(draft.caracteristicas)
  }, [categoria])

  if (!config) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <p className="text-sm font-semibold">Categoria não encontrada</p>
          <Link href="/publicar" className="mt-2 inline-block text-sm text-primary underline">
            Escolher categoria
          </Link>
        </div>
      </main>
    )
  }

  const camposObrigatorios = config.campos.filter((c) => c.obrigatorio)
  const canContinue = camposObrigatorios.every((c) => (valores[c.id] || "").trim().length > 0)

  function handleChange(id: string, value: string) {
    setValores((prev) => ({ ...prev, [id]: value }))
  }

  function handleContinue() {
    if (!canContinue) return
    saveDraft(categoria, { caracteristicas: valores })
    router.push(`/publicar/${categoria}/informacoes`)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/publicar" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">{config.label}</span>
          <div className="w-[52px]" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Características</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Detalhes específicos de {config.labelPlural.toLowerCase()} ajudam o comprador a encontrar seu anúncio.
          </p>
        </section>

        <section className="space-y-5">
          {config.campos.map((campo) => (
            <label key={campo.id} className="block">
              <span className="text-sm font-semibold">
                {campo.label}
                {campo.obrigatorio && <span className="text-destructive"> *</span>}
              </span>

              {campo.tipo === "select" && (
                <select
                  value={valores[campo.id] || ""}
                  onChange={(e) => handleChange(campo.id, e.target.value)}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {campo.opcoes?.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              )}

              {(campo.tipo === "text" || campo.tipo === "number") && (
                <input
                  type={campo.tipo === "number" ? "number" : "text"}
                  value={valores[campo.id] || ""}
                  onChange={(e) => handleChange(campo.id, e.target.value)}
                  placeholder={campo.placeholder}
                  className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              )}
            </label>
          ))}
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