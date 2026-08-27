"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { getCategoriaConfig } from "@/lib/publicar/categorias"
import { saveDraft } from "@/lib/publicar/storage"

const MIN_FOTOS = 3
const MAX_FOTOS = 8

// TODO: ao integrar com o backend, trocar o preview local (createObjectURL)
// por upload real (ex.: para um bucket) e salvar as URLs definitivas no rascunho.
export default function FotosPage() {
  const params = useParams<{ categoria: string }>()
  const categoria = params.categoria
  const config = getCategoriaConfig(categoria)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [arquivos, setArquivos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const canContinue = arquivos.length >= MIN_FOTOS

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const novos = Array.from(fileList).slice(0, MAX_FOTOS - arquivos.length)
    if (novos.length === 0) return
    setArquivos((prev) => [...prev, ...novos])
    setPreviews((prev) => [...prev, ...novos.map((f) => URL.createObjectURL(f))])
  }

  function handleRemove(index: number) {
    URL.revokeObjectURL(previews[index])
    setArquivos((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function handleContinue() {
    if (!canContinue) return
    // Salva apenas os nomes por enquanto — as URLs reais entram após o upload no backend.
    saveDraft(categoria, { fotos: arquivos.map((f) => f.name) })
    router.push(`/publicar/${categoria}/frete`)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href={`/publicar/${categoria}/informacoes`}
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
          <h1 className="text-2xl font-bold tracking-tight">Fotos do produto</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Adicione no mínimo {MIN_FOTOS} fotos. Anúncios com fotos nítidas de vários ângulos vendem mais rápido.
          </p>
        </section>

        <section>
          <div className="grid grid-cols-3 gap-3">
            {previews.map((url, index) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-xl border border-border">
                <img src={url} alt={`Foto ${index + 1} do produto`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  aria-label="Remover foto"
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm"
                >
                  <X className="size-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Capa
                  </span>
                )}
              </div>
            ))}

            {arquivos.length < MAX_FOTOS && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <ImagePlus className="size-5" />
                <span className="text-xs font-medium">Adicionar</span>
              </button>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <p className="mt-3 text-xs text-muted-foreground">
            {arquivos.length}/{MAX_FOTOS} fotos · a primeira foto será a capa do anúncio
          </p>
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
