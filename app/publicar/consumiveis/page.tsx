"use client"

import { useState } from "react"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"

const TIPOS_PECAS = [
  "Quadro", "Garfo Rígido", "Suspensão Dianteira", "Amortecedor Traseiro",
  "Cassete", "Corrente", "Coroa", "Pedivela", "Câmbio Dianteiro", "Câmbio Traseiro",
  "Passador", "Movimento Central", "Manete de Freio", "Pinça de Freio",
  "Pastilhas", "Disco de Freio", "Guidão", "Mesa", "Caixa de Direção",
  "Manopla", "Selim", "Canote", "Pedal", "Pneu", "Câmara de Ar",
  "Roda Completa", "Aro", "Cubo", "Raio",
]
const CONDICOES = ["Novo", "Usado"]

export default function PublicarPecasPage() {
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [tipo, setTipo] = useState("")
  const [condition, setCondition] = useState("")
  const [images, setImages] = useState<{ preview: string }[]>([])

  const addImages = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(f => {
      setImages(prev => [...prev, { preview: URL.createObjectURL(f) }])
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/publicar" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
          <h1 className="font-bold text-sm">Publicar Peça</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6 pb-24 space-y-5">
        {/* Fotos */}
        <div>
          <label className="block text-sm font-medium mb-2">Fotos</label>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden border">
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer">
              <Upload className="size-5 text-muted-foreground" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Pneu Maxxis Assegai 29x2.5" className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tipo de Peça *</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {TIPOS_PECAS.map(t => (
              <button key={t} onClick={() => setTipo(t)} className={`rounded-full px-3 py-1.5 text-xs ${tipo === t ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <div className="grid grid-cols-2 gap-2">
            {CONDICOES.map(c => (
              <button key={c} onClick={() => setCondition(c)} className={`rounded-xl border px-4 py-3 text-sm ${condition === c ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Descreva a peça..." className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none resize-none" />
        </div>

        <button className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white">Publicar Anúncio</button>
      </main>
    </div>
  )
}
