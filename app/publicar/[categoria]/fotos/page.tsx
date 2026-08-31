"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { getCategoriaConfig } from "@/lib/publicar/categorias"

export default function FotosPage() {
  const params = useParams<{ categoria: string }>()
  const categoria = params.categoria
  const config = getCategoriaConfig(categoria)
  const router = useRouter()
  const galleryRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    const saved = sessionStorage.getItem("imperium_bikes_publish")
    if (!saved) return
    try {
      const data = JSON.parse(saved)
      if (Array.isArray(data.photos)) setPhotos(data.photos.filter((photo: unknown) => typeof photo === "string"))
    } catch {}
  }, [])

  function addPhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => setPhotos((current) => [...current, String(reader.result)])
      reader.readAsDataURL(file)
    })
    event.target.value = ""
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  function continueToShipping() {
    const current = JSON.parse(sessionStorage.getItem("imperium_bikes_publish") || "{}")
    sessionStorage.setItem("imperium_bikes_publish", JSON.stringify({ ...current, photos }))
    router.push(`/publicar/${categoria}/frete`)
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
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

      <div className="mx-auto max-w-2xl w-full px-4 pb-32 pt-6 flex-1 flex flex-col">
        <section className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Fotos do produto</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Adicione fotos nítidas para mostrar todos os detalhes do seu produto.
          </p>
        </section>

        <input ref={galleryRef} type="file" accept="image/*" multiple onChange={addPhotos} className="hidden" />

        {photos.length === 0 ? (
          <div className="flex flex-col items-center pt-4 w-full">
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex w-full max-w-sm h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-sm"
            >
              <ImagePlus className="size-10" />
              <span className="text-sm font-semibold">Selecionar da Galeria</span>
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">Adicione pelo menos uma foto para continuar.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <div key={`${photo.slice(0, 20)}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                  <img src={photo} alt={`Foto do produto ${index + 1}`} className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    aria-label={`Remover foto ${index + 1}`}
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 text-primary hover:bg-primary/10"
              >
                <ImagePlus className="size-7" />
                <span className="text-xs font-semibold">Galeria</span>
              </button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {photos.length} {photos.length === 1 ? "foto adicionada" : "fotos adicionadas"}
            </p>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button
            type="button"
            onClick={continueToShipping}
            disabled={photos.length === 0}
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
