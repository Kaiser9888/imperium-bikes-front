"use client"

import { useMemo, useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Check, Bike, Mountain, Zap, Baby } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const BIKE_SUBCATEGORIES = [
  { id: "mtb", label: "MTB", icon: Mountain },
  { id: "speed", label: "Speed", icon: Bike },
  { id: "gravel", label: "Gravel", icon: Bike },
  { id: "urbana", label: "Urbana", icon: Bike },
  { id: "bmx", label: "BMX", icon: Bike },
  { id: "downhill", label: "Downhill", icon: Mountain },
  { id: "enduro", label: "Enduro", icon: Mountain },
  { id: "eletrica", label: "Elétrica", icon: Zap },
  { id: "dobravel", label: "Dobrável", icon: Bike },
  { id: "infantil", label: "Infantil", icon: Baby },
] as const

const BIKE_TYPES: Record<string, readonly string[]> = {
  mtb: ["Bike completa", "Quadro"],
  speed: ["Bike completa", "Quadro"],
  gravel: ["Bike completa", "Quadro"],
  urbana: ["Bike completa", "Quadro"],
  bmx: ["Bike completa", "Quadro"],
  downhill: ["Bike completa", "Quadro"],
  enduro: ["Bike completa", "Quadro"],
  eletrica: ["Bike completa", "Quadro"],
  dobravel: ["Bike completa", "Quadro"],
  infantil: ["Bike completa", "Quadro"],
}

const MATERIALS = ["Alumínio", "Carbono", "Cromoly", "Aço", "Titânio"]
const WHEEL_SIZES = ["26\"", "27.5\"", "29\"", "700c", "Mullet"]
const FRAME_SIZES = ["S", "M", "L", "XL", "Único"]

export default function PublicarBikesPage() {
  const router = useRouter()

  const [subcategoryId, setSubcategoryId] = useState("")
  const [bikeType, setBikeType] = useState("")
  const [material, setMaterial] = useState("")
  const [wheelSize, setWheelSize] = useState("")
  const [frameSize, setFrameSize] = useState("")

  const selectedSubcategory = BIKE_SUBCATEGORIES.find((s) => s.id === subcategoryId)

  const handleContinue = () => {
    if (!subcategoryId || !material || !wheelSize || !frameSize) return

    sessionStorage.setItem("imperium_bikes_publish", JSON.stringify({
      categoryId: "bikes",
      subcategoryId,
      bikeType,
      material,
      wheelSize,
      frameSize,
    }))

    router.push("/publicar/bikes/informacoes")
  }

  const isComplete = subcategoryId && material && wheelSize && frameSize

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/publicar" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">Características</span>
          <div className="w-[52px]" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <h1 className="text-xl font-bold">Caracterize sua bicicleta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Toque nas opções abaixo</p>

        {/* MODALIDADE */}
        <section className="mt-6">
          <h2 className="text-sm font-semibold mb-2">Modalidade</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
            {BIKE_SUBCATEGORIES.map((sub) => {
              const isSelected = subcategoryId === sub.id
              const Icon = sub.icon
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubcategoryId(sub.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-2 min-w-[70px] transition-all ${
                    isSelected ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40"
                  }`}
                >
                  <Icon className={`size-5 ${isSelected ? "text-white" : "text-primary"}`} />
                  <span className="text-xs font-medium whitespace-nowrap">{sub.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* TIPO (bike completa ou quadro) */}
        {subcategoryId && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold mb-2">O que é?</h2>
            <div className="grid grid-cols-2 gap-2">
              {BIKE_TYPES[subcategoryId].map((type) => (
                <button
                  key={type}
                  onClick={() => setBikeType(type)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    bikeType === type ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* MATERIAL */}
        {bikeType && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold mb-2">Material</h2>
            <div className="flex flex-wrap gap-2">
              {MATERIALS.map((mat) => (
                <button
                  key={mat}
                  onClick={() => setMaterial(mat)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                    material === mat ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40"
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ARO */}
        {material && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold mb-2">Tamanho do Aro</h2>
            <div className="flex flex-wrap gap-2">
              {WHEEL_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setWheelSize(size)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                    wheelSize === size ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* TAMANHO DO QUADRO */}
        {wheelSize && (
          <section className="mt-5">
            <h2 className="text-sm font-semibold mb-2">Tamanho do Quadro</h2>
            <div className="flex flex-wrap gap-2">
              {FRAME_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setFrameSize(size)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                    frameSize === size ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* BOTÃO CONTINUAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isComplete}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
          >
            Continuar
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  )
}