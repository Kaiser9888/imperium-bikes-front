"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

const CONDITIONS = [
  { id: "novo", label: "Novo", description: "Nunca usado" },
  { id: "usado", label: "Usado", description: "Já teve uso, mas está em boas condições" },
]

export default function InformacoesPage() {
  const params = useParams<{ categoria: string }>()
  const categoria = params.categoria
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [condition, setCondition] = useState("")

  useEffect(() => {
    const saved = sessionStorage.getItem("imperium_bikes_publish")
    if (!saved) return
    try {
      const data = JSON.parse(saved)
      setTitle(typeof data.title === "string" ? data.title : "")
      setDescription(typeof data.description === "string" ? data.description : "")
      setCondition(typeof data.condition === "string" ? data.condition : "")
    } catch {}
  }, [])

  const canContinue = title.trim().length >= 3 && description.trim().length >= 10 && Boolean(condition)

  function handleContinue() {
    if (!canContinue) return
    const current = JSON.parse(sessionStorage.getItem("imperium_bikes_publish") || "{}")
    sessionStorage.setItem("imperium_bikes_publish", JSON.stringify({ ...current, title: title.trim(), description: description.trim(), condition }))
    let categoria = "bikes"
    router.push(`/publicar/${categoria}/fotos`)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/publicar/bikes" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Voltar</Link>
          <span className="text-sm font-semibold">Bicicleta</span><div className="w-[52px]" />
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6"><h1 className="text-2xl font-bold tracking-tight">Informações do anúncio</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Conte um pouco mais sobre a sua bicicleta.</p></section>
        <section className="space-y-5">
          <label className="block"><span className="text-sm font-semibold">Título do produto</span><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Ex.: Mountain Bike Caloi Elite" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /><span className="mt-1 block text-right text-xs text-muted-foreground">{title.length}/80</span></label>
          <label className="block"><span className="text-sm font-semibold">Descrição do produto</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={6} placeholder="Informe detalhes, componentes, tempo de uso e qualquer informação importante." className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" /><span className="mt-1 block text-right text-xs text-muted-foreground">{description.length}/1000</span></label>
          <fieldset><legend className="text-sm font-semibold">Condição do produto</legend><div className="mt-2 space-y-2">{CONDITIONS.map((item) => <button key={item.id} type="button" onClick={() => setCondition(item.id)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${condition === item.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"}`}><span><span className="block text-sm font-medium">{item.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span></span>{condition === item.id && <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="size-3" /></span>}</button>)}</div></fieldset>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg"><div className="mx-auto max-w-2xl px-4 py-3"><button type="button" onClick={handleContinue} disabled={!canContinue} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">Continuar<ArrowRight className="size-4" /></button></div></div>
    </main>
  )
}

