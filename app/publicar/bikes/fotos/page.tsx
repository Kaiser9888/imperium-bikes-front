"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FotosPage() {
  const router = useRouter()
  const galleryRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])

  useEffect(() => {
    const saved = sessionStorage.getItem("imperium_bikes_publish")
    if (!saved) return
    try {
      const data = JSON.parse(saved);
      if (Array.isArray(data.photos)) setPhotos(data.photos.filter((photo: unknown) => typeof photo === "string"))
    } catch {}
  }, [])

  function addPhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPhotos((current) => [...current, String(reader.result)]);
      reader.readAsDataURL(file)
    })
    event.target.value = ""
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))
  }

  function continueToShipping() {
    sessionStorage.setItem("imperium_bikes_publish", JSON.stringify({ ...JSON.parse(sessionStorage.getItem("imperium_bikes_publish") || "{}"), photos }));
    router.push("/publicar/bikes/frete")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/publicar/bikes/informacoes" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />Voltar
          </Link>
          <span className="text-sm font-semibold">Bicicleta</span>
          <div className="w-[52px]" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Fotos do produto</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Adicione fotos nítidas para mostrar todos os detalhes da sua bicicleta.</p>
        </section>

        <input ref={galleryRef} type="file" accept="image/*" multiple onChange={addPhotos} className="hidden" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <div key={`${photo.slice(0, 20)}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              <img src={photo} alt={`Foto do produto ${index + 1}`} className="size-full object-cover" />
              <button type="button" onClick={() => removePhoto(index)} aria-label={`Remover foto ${index + 1}`} className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}

          <button type="button" onClick={() => galleryRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/50 bg-primary/5 text-primary hover:bg-primary/10">
            <ImagePlus className="size-7" />
            <span className="text-xs font-semibold">Galeria</span>
          </button>
        </div>

        {photos.length === 0 && <p className="mt-4 text-center text-xs text-muted-foreground">Adicione pelo menos uma foto para continuar.</p>}
        {photos.length > 0 && <p className="mt-4 text-xs text-muted-foreground">{photos.length} {photos.length === 1 ? "foto adicionada" : "fotos adicionadas"}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button type="button" onClick={continueToShipping} disabled={photos.length === 0} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
            Continuar<ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  )
}
