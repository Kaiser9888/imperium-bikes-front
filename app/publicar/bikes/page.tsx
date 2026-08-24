// app/publicar/bikes/page.tsx
"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Mountain,
  Zap,
  Route,
  Building2,
  Flame,
  TrendingDown,
  Compass,
  BatteryCharging,
  Minimize2,
  Baby,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* DADOS                                                               */
/* ------------------------------------------------------------------ */

const BIKE_SUBCATEGORIES = [
  { id: "mtb", label: "MTB", description: "Mountain Bike", icon: Mountain },
  { id: "speed", label: "Speed / Road", description: "Bicicletas para estrada", icon: Zap },
  { id: "gravel", label: "Gravel", description: "Estrada e terrenos mistos", icon: Route },
  { id: "urbana", label: "Urbana", description: "Mobilidade e passeio", icon: Building2 },
  { id: "bmx", label: "BMX / Dirt", description: "BMX, street e dirt jump", icon: Flame },
  { id: "downhill", label: "Downhill", description: "Descidas e terrenos extremos", icon: Zap,  image: "/images/categories/modalidades/downhill.jpg" },
  { id: "enduro", label: "Enduro", description: "Trilhas e terrenos técnicos", icon: Compass },
  { id: "eletrica", label: "Elétrica", description: "E-Bikes", icon: BatteryCharging },
  { id: "dobravel", label: "Dobrável", description: "Bicicletas dobráveis", icon: Minimize2 },
  { id: "infantil", label: "Infantil", description: "Bicicletas infantis e juvenis", icon: Baby },
] as const

type BikeSubcategoryId = (typeof BIKE_SUBCATEGORIES)[number]["id"]

const BIKE_TYPES_BY_CATEGORY: Record<BikeSubcategoryId, readonly string[]> = {
  mtb: ["Rígida", "Full Suspension"],
  speed: ["Speed", "TT / Triathlon", "Ciclocross"],
  gravel: ["Gravel", "Adventure", "Bikepacking"],
  urbana: ["Urbana", "Passeio", "Híbrida"],
  bmx: ["BMX", "Dirt Jump", "Street"],
  downhill: ["Downhill"],
  enduro: ["Enduro", "Trail"],
  eletrica: ["MTB Elétrica", "Urbana Elétrica", "Speed Elétrica", "Cargo Elétrica"],
  dobravel: ["Dobrável Urbana", "Dobrável Esportiva"],
  infantil: ["Infantil", "Juvenil"],
}

const PECA_OPTIONS = [
  { id: "completa", label: "Bike completa", description: "Quadro, componentes e rodas" },
  { id: "quadro", label: "Somente quadro", description: "Vende apenas o quadro" },
] as const

const MATERIAL_OPTIONS = ["Alumínio", "Carbono", "Cromoly", "Aço", "Titânio"] as const

const ARO_OPTIONS_BY_CATEGORY: Record<BikeSubcategoryId, readonly string[]> = {
  mtb: ['26"', '27.5"', '29"'],
  speed: ["700c"],
  gravel: ["700c", "650b"],
  urbana: ['26"', "700c"],
  bmx: ['20"'],
  downhill: ['27.5"', '29"'],
  enduro: ['27.5"', '29"'],
  eletrica: ['26"', '27.5"', '29"', "700c"],
  dobravel: ['16"', '20"', '24"'],
  infantil: ['12"', '16"', '20"', '24"'],
}

const TAMANHO_OPTIONS = ["PP", "P", "M", "G", "GG"] as const

/* ------------------------------------------------------------------ */
/* MODELO DE RESPOSTAS                                                 */
/* ------------------------------------------------------------------ */

type Answers = {
  subcategoryId: BikeSubcategoryId | ""
  bikeType: string
  peca: string
  material: string
  aro: string
  tamanho: string
}

const EMPTY_ANSWERS: Answers = {
  subcategoryId: "",
  bikeType: "",
  peca: "",
  material: "",
  aro: "",
  tamanho: "",
}

type StepOption = {
  id: string
  label: string
  description?: string
}

type Step = {
  key: keyof Answers
  title: string
  subtitle: string
  options: StepOption[]
  skip?: boolean
}

/* ------------------------------------------------------------------ */
/* PÁGINA                                                              */
/* ------------------------------------------------------------------ */

export default function PublicarBikesPage() {
  const router = useRouter()

  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [expandedKey, setExpandedKey] = useState<keyof Answers | null>("subcategoryId")

  const selectedSubcategory = useMemo(
    () => BIKE_SUBCATEGORIES.find((item) => item.id === answers.subcategoryId),
    [answers.subcategoryId]
  )

  /*
   * Cada passo depende do anterior (ex: tipo específico e aro dependem
   * da modalidade escolhida). "Tamanho" não se aplica a infantil, que é
   * dimensionado pelo aro — por isso ele é pulado nesse caso.
   */
  const steps: Step[] = useMemo(() => {
    const subId = answers.subcategoryId

    const rawSteps: Step[] = [
      {
        key: "subcategoryId",
        title: "Modalidade",
        subtitle: "Qual o tipo de bicicleta?",
        options: BIKE_SUBCATEGORIES.map((s) => ({
          id: s.id,
          label: s.label,
          description: s.description,
        })),
      },
      {
        key: "bikeType",
        title: "Característica principal",
        subtitle: subId
          ? `Configuração da ${selectedSubcategory?.label.toLowerCase()}`
          : "Escolha a modalidade primeiro",
        options: subId
          ? BIKE_TYPES_BY_CATEGORY[subId].map((t) => ({ id: t, label: t }))
          : [],
      },
      {
        key: "peca",
        title: "Quadro ou bike completa",
        subtitle: "O que você está anunciando?",
        options: PECA_OPTIONS.map((p) => ({ id: p.id, label: p.label, description: p.description })),
      },
      {
        key: "material",
        title: "Material do quadro",
        subtitle: "Qual o material?",
        options: MATERIAL_OPTIONS.map((m) => ({ id: m, label: m })),
      },
      {
        key: "aro",
        title: "Aro",
        subtitle: "Tamanho do aro",
        options: subId
          ? ARO_OPTIONS_BY_CATEGORY[subId].map((a) => ({ id: a, label: a }))
          : [],
      },
      {
        key: "tamanho",
        title: "Tamanho",
        subtitle: "Tamanho do quadro",
        options: TAMANHO_OPTIONS.map((t) => ({ id: t, label: t })),
        skip: subId === "infantil",
      },
    ]

    return rawSteps.filter((step) => !step.skip)
  }, [answers.subcategoryId, selectedSubcategory])

  const stepIndexByKey = useMemo(() => {
    const map: Partial<Record<keyof Answers, number>> = {}
    steps.forEach((step, index) => {
      map[step.key] = index
    })
    return map
  }, [steps])

  const firstUnansweredIndex = steps.findIndex((step) => !answers[step.key])
  const allAnswered = firstUnansweredIndex === -1

  const isStepUnlocked = (index: number) => index <= (firstUnansweredIndex === -1 ? steps.length - 1 : firstUnansweredIndex)

  const handleSelect = (step: Step, optionId: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [step.key]: optionId }

      /*
       * Se a modalidade mudar, os passos seguintes que dependem dela
       * (tipo específico, aro) deixam de fazer sentido e são resetados.
       */
      if (step.key === "subcategoryId") {
        next.bikeType = ""
        next.aro = ""
      }

      return next
    })

    const currentIndex = stepIndexByKey[step.key] ?? 0
    const nextStep = steps[currentIndex + 1]

    setExpandedKey(nextStep ? nextStep.key : null)
  }

  const toggleStep = (step: Step, index: number) => {
    if (!isStepUnlocked(index)) return
    setExpandedKey((prev) => (prev === step.key ? null : step.key))
  }

  const handleContinue = () => {
    if (!allAnswered) return

    const currentData = sessionStorage.getItem("imperium_bikes_publish")
    let publishData: Record<string, unknown> = {}

    if (currentData) {
      try {
        const parsed = JSON.parse(currentData)
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          publishData = parsed
        }
      } catch {
        publishData = {}
      }
    }

    const updatedData = {
      ...publishData,
      categoryId: "bikes",
      ...answers,
    }

    sessionStorage.setItem("imperium_bikes_publish", JSON.stringify(updatedData))
    router.push("/publicar/bikes/informacoes")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes bikeIconPop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .bike-icon-pop { animation: bikeIconPop 0.35s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .bike-icon-pop { animation: none; }
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href="/publicar"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">Bicicleta</span>
          <div className="w-[52px]" />
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">


        {/* INTRODUÇÃO */}
        <section className="mb-6">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Caracterize sua bicicleta
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Toque em cada campo para preencher, na ordem.
          </p>
        </section>

        {/* MASCOTE DA MODALIDADE */}
        {selectedSubcategory && (
          <div
            key={selectedSubcategory.id}
            className="bike-icon-pop mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <selectedSubcategory.icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{selectedSubcategory.label}</p>
              <p className="text-xs text-muted-foreground">{selectedSubcategory.description}</p>
            </div>
          </div>
        )}

        {/* ACORDEÃO DE PASSOS */}
        <section className="space-y-2">
          {steps.map((step, index) => {
            const isExpanded = expandedKey === step.key
            const isUnlocked = isStepUnlocked(index)
            const isAnswered = Boolean(answers[step.key])
            const selectedOption = step.options.find((o) => o.id === answers[step.key])

            return (
              <div
                key={step.key}
                className={`
                  overflow-hidden rounded-xl border transition-colors
                  ${isAnswered ? "border-primary/40" : "border-border"}
                  ${!isUnlocked ? "opacity-40" : ""}
                `}
              >
                {/* CABEÇALHO DO PASSO (parte clicável) */}
                <button
                  type="button"
                  onClick={() => toggleStep(step, index)}
                  disabled={!isUnlocked}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left disabled:cursor-not-allowed"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        isAnswered ? "font-medium text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {selectedOption ? selectedOption.label : step.subtitle}
                    </p>
                  </div>

                  <span className="flex shrink-0 items-center gap-2">
                    {isAnswered && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                {/* OPÇÕES (texto simples, aparece embaixo) */}
                {isExpanded && isUnlocked && (
                  <div className="border-t border-border px-2 pb-2 pt-1">
                    {step.options.length === 0 ? (
                      <p className="px-2 py-3 text-xs text-muted-foreground">
                        Nenhuma opção disponível ainda.
                      </p>
                    ) : (
                      step.options.map((option) => {
                        const isSelected = answers[step.key] === option.id

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(step, option.id)}
                            className={`
                              flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors
                              ${isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/60"}
                            `}
                          >
                            <span>
                              {option.label}
                              {option.description && (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">
                                  {option.description}
                                </span>
                              )}
                            </span>
                            {isSelected && <Check className="size-3.5 shrink-0" />}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </section>

        {/* RESUMO */}
        {answers.subcategoryId && (
          <section className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Seu anúncio será classificado como</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                Bicicletas
              </span>
              {steps
                .filter((step) => answers[step.key])
                .map((step) => (
                  <span key={step.key} className="flex items-center gap-2">
                    <span className="text-muted-foreground">→</span>
                    <span className="rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border">
                      {step.options.find((o) => o.id === answers[step.key])?.label}
                    </span>
                  </span>
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
            disabled={!allAnswered}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  )
}
