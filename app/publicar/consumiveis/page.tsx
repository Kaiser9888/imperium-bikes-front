"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Droplets,
  Utensils,
  Sparkles,
  BatteryCharging,
  FlaskConical,
  ShieldCheck,
  Wrench,
  Package,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* DADOS                                                               */
/* ------------------------------------------------------------------ */

const CONSUMIVEIS_CATEGORIES = [
  { id: "lubrificantes", label: "Lubrificantes", description: "Óleos e ceras para corrente", icon: Droplets, image: "/images/categories/consumiveis/lubrificantes.jpg" },
  { id: "limpeza", label: "Limpeza", description: "Desengraxantes e shampoos", icon: Sparkles, image: "/images/categories/consumiveis/limpeza.jpg" },
  { id: "nutricao", label: "Nutrição Esportiva", description: "Géis, isotônicos e suplementos", icon: Utensils, image: "/images/categories/consumiveis/nutricao.jpg" },
  { id: "tubeless", label: "Tubeless", description: "Selantes, válvulas e fitas", icon: FlaskConical, image: "/images/categories/consumiveis/tubeless.jpg" },
  { id: "reparo", label: "Kit de Reparo", description: "Remendos e macarrão antifuro", icon: Wrench, image: "/images/categories/consumiveis/reparo.jpg" },
  { id: "baterias", label: "Baterias e Pilhas", description: "Baterias para acessórios", icon: BatteryCharging, image: "/images/categories/consumiveis/baterias.jpg" },
  { id: "protecao", label: "Proteção Corporal", description: "Cremes e protetores", icon: ShieldCheck, image: "/images/categories/consumiveis/protecao.jpg" },
  { id: "embalagem", label: "Embalagens", description: "Sacos, fitas e acessórios", icon: Package, image: "/images/categories/consumiveis/embalagem.jpg" },
] as const

type ConsumivelCategoryId = (typeof CONSUMIVEIS_CATEGORIES)[number]["id"]

const TIPOS_BY_CATEGORY: Record<ConsumivelCategoryId, readonly string[]> = {
  "lubrificantes": ["Óleo Seco", "Óleo Úmido", "Cera", "Graxa", "Spray Lubrificante"],
  "limpeza": ["Desengraxante", "Shampoo para Bike", "Limpa Corrente", "Kit Limpeza Completo"],
  "nutricao": ["Gel de Carboidrato", "Isotônico", "Barrinha Energética", "Suplemento", "Sal de Reposição"],
  "tubeless": ["Selante Tubeless", "Válvula Tubeless", "Fita Tubeless", "Kit Conversão Tubeless"],
  "reparo": ["Kit Remendo", "Macarrão Antifuro", "Cola para Remendo", "Kit Reparo Completo"],
  "baterias": ["Pilha CR2032", "Bateria Recarregável", "Power Bank", "Carregador"],
  "protecao": ["Creme Antiatrito", "Protetor Solar Esportivo", "Protetor Labial", "Creme de Recuperação"],
  "embalagem": ["Saco Plástico", "Fita Adesiva", "Etiqueta", "Caixa de Papelão"],
}

const VOLUME_OPTIONS = [
  { id: "unidade", label: "Unidade", description: "Venda por unidade" },
  { id: "kit", label: "Kit", description: "Conjunto de itens" },
  { id: "pacote", label: "Pacote", description: "Múltiplas unidades" },
] as const

/* ------------------------------------------------------------------ */
/* MODELO DE RESPOSTAS                                                 */
/* ------------------------------------------------------------------ */

type Answers = {
  subcategoryId: ConsumivelCategoryId | ""
  tipo: string
  volume: string
}

const EMPTY_ANSWERS: Answers = {
  subcategoryId: "",
  tipo: "",
  volume: "",
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
  optional?: boolean
}

/* ------------------------------------------------------------------ */
/* PÁGINA                                                              */
/* ------------------------------------------------------------------ */

export default function PublicarConsumiveisPage() {
  const router = useRouter()

  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [expandedKey, setExpandedKey] = useState<keyof Answers | null>("subcategoryId")

  const selectedCategory = useMemo(
    () => CONSUMIVEIS_CATEGORIES.find((item) => item.id === answers.subcategoryId),
    [answers.subcategoryId]
  )

  const steps: Step[] = useMemo(() => {
    const subId = answers.subcategoryId

    return [
      {
        key: "subcategoryId",
        title: "Categoria do consumível",
        subtitle: "Qual o tipo de consumível?",
        options: CONSUMIVEIS_CATEGORIES.map((s) => ({
          id: s.id,
          label: s.label,
          description: s.description,
        })),
      },
      {
        key: "tipo",
        title: "Produto específico",
        subtitle: subId ? `Item da categoria ${selectedCategory?.label.toLowerCase()}` : "Escolha a categoria primeiro",
        options: subId
          ? TIPOS_BY_CATEGORY[subId].map((t) => ({ id: t, label: t }))
          : [],
      },
      {
        key: "volume",
        title: "Formato de venda",
        subtitle: "Como você vende?",
        options: VOLUME_OPTIONS.map((v) => ({ id: v.id, label: v.label, description: v.description })),
      },
    ]
  }, [answers.subcategoryId, selectedCategory])

  const stepIndexByKey = useMemo(() => {
    const map: Partial<Record<keyof Answers, number>> = {}
    steps.forEach((step, index) => {
      map[step.key] = index
    })
    return map
  }, [steps])

  const allAnswered = steps.every((step) => {
    if (step.optional) return true
    return Boolean(answers[step.key])
  })

  const firstUnansweredIndex = steps.findIndex((step) => {
    if (step.optional) return false
    return !answers[step.key]
  })

  const isStepUnlocked = (index: number) => index <= (firstUnansweredIndex === -1 ? steps.length - 1 : firstUnansweredIndex)

  const handleSelect = (step: Step, optionId: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [step.key]: optionId }

      if (step.key === "subcategoryId") {
        next.tipo = ""
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
      categoryId: "consumiveis",
      ...answers,
    }

    sessionStorage.setItem("imperium_bikes_publish", JSON.stringify(updatedData))
    router.push("/publicar/consumiveis/informacoes")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes consumivelIconPop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .consumivel-icon-pop { animation: consumivelIconPop 0.35s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .consumivel-icon-pop { animation: none; }
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/publicar" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">Consumíveis</span>
          <div className="w-[52px]" />
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Caracterize seu consumível
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Toque em cada campo para preencher, na ordem.
          </p>
        </section>

        {selectedCategory && (
          <div key={selectedCategory.id} className="consumivel-icon-pop mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <img src={selectedCategory.image} alt={selectedCategory.label} className="size-12 shrink-0 rounded-full object-cover border border-primary/20" />
            <div>
              <p className="text-sm font-semibold">{selectedCategory.label}</p>
              <p className="text-xs text-muted-foreground">{selectedCategory.description}</p>
            </div>
          </div>
        )}

        <section className="space-y-2">
          {steps.map((step, index) => {
            const isExpanded = expandedKey === step.key
            const isUnlocked = isStepUnlocked(index)
            const isAnswered = Boolean(answers[step.key])
            const selectedOption = step.options.find((o) => o.id === answers[step.key])

            return (
              <div key={step.key} className={`overflow-hidden rounded-xl border transition-colors ${
                isAnswered ? "border-primary/40" : "border-border"
              } ${!isUnlocked ? "opacity-40" : ""}`}>
                <button type="button" onClick={() => toggleStep(step, index)} disabled={!isUnlocked} aria-expanded={isExpanded}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left disabled:cursor-not-allowed">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {step.title}
                      {step.optional && <span className="ml-1 text-xs font-normal text-muted-foreground">(opcional)</span>}
                    </p>
                    <p className={`mt-0.5 truncate text-xs ${isAnswered ? "font-medium text-primary" : "text-muted-foreground"}`}>
                      {selectedOption ? selectedOption.label : step.subtitle}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    {isAnswered && (
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                    <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </span>
                </button>

                {isExpanded && isUnlocked && (
                  <div className="border-t border-border px-2 pb-2 pt-1">
                    {step.options.length === 0 ? (
                      <p className="px-2 py-3 text-xs text-muted-foreground">Nenhuma opção disponível ainda.</p>
                    ) : (
                      step.options.map((option) => {
                        const isSelected = answers[step.key] === option.id
                        return (
                          <button key={option.id} type="button" onClick={() => handleSelect(step, option.id)}
                                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                                    isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/60"
                                  }`}>
                            <span>
                              {option.label}
                              {option.description && (
                                <span className="ml-2 text-xs font-normal text-muted-foreground">{option.description}</span>
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

        {answers.subcategoryId && (
          <section className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Seu anúncio será classificado como</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">Consumíveis</span>
              {steps.filter((step) => answers[step.key]).map((step) => (
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
          <button type="button" onClick={handleContinue} disabled={!allAnswered}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
            Continuar
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </main>
  )
}
