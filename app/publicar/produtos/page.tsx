"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Shield,
  Shirt,
  Footprints,
  Glasses,
  Watch,
  Lightbulb,
  Lock,
  Droplets,
  Backpack,
  Wrench,
  Heart,
  Utensils,
  Bike,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* DADOS                                                               */
/* ------------------------------------------------------------------ */

const PRODUTO_CATEGORIES = [
  { id: "capacetes", label: "Capacetes", description: "Capacetes abertos, coquinho e full-face", icon: Shield, image: "/images/categories/produtos/capacetes.jpg" },
  { id: "vestuario", label: "Vestuário", description: "Camisas, bermudas, bretelles, jaquetas", icon: Shirt, image: "/images/categories/produtos/vestuario.jpg" },
  { id: "calcados", label: "Calçados", description: "Sapatilhas e tênis de ciclismo", icon: Footprints, image: "/images/categories/produtos/calcados.jpg" },
  { id: "oculos", label: "Óculos", description: "Óculos de sol e de proteção", icon: Glasses, image: "/images/categories/produtos/oculos.jpg" },
  { id: "eletronicos", label: "Eletrônicos", description: "GPS, ciclocomputadores, sensores", icon: Watch, image: "/images/categories/produtos/eletronicos.jpg" },
  { id: "iluminacao", label: "Iluminação", description: "Faróis, lanternas e sinalizadores", icon: Lightbulb, image: "/images/categories/produtos/iluminacao.jpg" },
  { id: "seguranca", label: "Segurança", description: "Cadeados, travas e alarmes", icon: Lock, image: "/images/categories/produtos/seguranca.jpg" },
  { id: "hidratacao", label: "Hidratação", description: "Caramanholas, mochilas e suportes", icon: Droplets, image: "/images/categories/produtos/hidratacao.jpg" },
  { id: "bolsas", label: "Bolsas e Mochilas", description: "Bolsas de selim, quadro e guidão", icon: Backpack, image: "/images/categories/produtos/bolsas.jpg" },
  { id: "ferramentas", label: "Ferramentas", description: "Multi-ferramentas e kits", icon: Wrench, image: "/images/categories/produtos/ferramentas.jpg" },
  { id: "protecao", label: "Proteção Corporal", description: "Joelheiras, cotoveleiras e coletes", icon: Heart, image: "/images/categories/produtos/protecao.jpg" },
] as const

type ProdutoCategoryId = (typeof PRODUTO_CATEGORIES)[number]["id"]

const TIPOS_BY_CATEGORY: Record<ProdutoCategoryId, readonly string[]> = {
  capacetes: ["Capacete Aberto", "Capacete Coquinho", "Capacete Full-Face", "Capacete Infantil"],
  vestuario: ["Camisa de Ciclismo", "Bermuda/Bretelle", "Jaqueta Corta-Vento", "Meia", "Manguito/Pernito", "Luva"],
  calcados: ["Sapatilha de Encaixe", "Sapatilha Speed", "Sapatilha MTB", "Tênis de Ciclismo", "Capa de Sapatilha"],
  oculos: ["Óculos de Sol", "Óculos de Proteção", "Óculos Fotocromático", "Óculos com Lente Reserva"],
  eletronicos: ["Ciclocomputador", "GPS", "Sensor de Cadência", "Sensor Cardíaco", "Câmera de Ação", "Suporte de Celular"],
  iluminacao: ["Farol Dianteiro", "Lanterna Traseira", "Sinalizador", "Kit de Iluminação"],
  seguranca: ["Cadeado U-Lock", "Cadeado de Cabo", "Cadeado Dobrável", "Alarme", "Rastreador GPS"],
  hidratacao: ["Caramanhola", "Suporte de Caramanhola", "Mochila de Hidratação", "Reservatório de Água"],
  bolsas: ["Bolsa de Selim", "Bolsa de Quadro", "Bolsa de Guidão", "Alforge", "Bagageiro"],
  ferramentas: ["Multi-ferramenta", "Chave de Corrente", "Chave de Raio", "Bomba de Chão", "Bomba de Mão", "Kit de Reparo"],
  protecao: ["Joelheira", "Cotoveleira", "Colete de Proteção", "Protetor de Coluna", "Coxim"],
}

const CONDICAO_OPTIONS = [
  { id: "novo", label: "Novo", description: "Nunca usado" },
  { id: "usado", label: "Usado", description: "Já foi utilizado" },
] as const

const TAMANHO_OPTIONS = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "Único",
] as const

/* ------------------------------------------------------------------ */
/* MODELO DE RESPOSTAS                                                 */
/* ------------------------------------------------------------------ */

type Answers = {
  subcategoryId: ProdutoCategoryId | ""
  tipo: string
  condicao: string
  tamanho: string
}

const EMPTY_ANSWERS: Answers = {
  subcategoryId: "",
  tipo: "",
  condicao: "",
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
  optional?: boolean
}

/* ------------------------------------------------------------------ */
/* PÁGINA                                                              */
/* ------------------------------------------------------------------ */

export default function PublicarProdutosPage() {
  const router = useRouter()

  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [expandedKey, setExpandedKey] = useState<keyof Answers | null>("subcategoryId")

  const selectedCategory = useMemo(
    () => PRODUTO_CATEGORIES.find((item) => item.id === answers.subcategoryId),
    [answers.subcategoryId]
  )

  const steps: Step[] = useMemo(() => {
    const subId = answers.subcategoryId

    return [
      {
        key: "subcategoryId",
        title: "Categoria do produto",
        subtitle: "Qual o tipo de produto?",
        options: PRODUTO_CATEGORIES.map((s) => ({
          id: s.id,
          label: s.label,
          description: s.description,
        })),
      },
      {
        key: "tipo",
        title: "Tipo específico",
        subtitle: subId ? `Produto da categoria ${selectedCategory?.label.toLowerCase()}` : "Escolha a categoria primeiro",
        options: subId
          ? TIPOS_BY_CATEGORY[subId].map((t) => ({ id: t, label: t }))
          : [],
      },
      {
        key: "condicao",
        title: "Estado",
        subtitle: "Condição do produto",
        options: CONDICAO_OPTIONS.map((c) => ({ id: c.id, label: c.label, description: c.description })),
      },
      {
        key: "tamanho",
        title: "Tamanho",
        subtitle: "Tamanho do produto (opcional)",
        options: TAMANHO_OPTIONS.map((t) => ({ id: t, label: t })),
        optional: true,
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
      categoryId: "produtos",
      ...answers,
    }

    sessionStorage.setItem("imperium_bikes_publish", JSON.stringify(updatedData))
    router.push("/publicar/produtos/informacoes")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes produtoIconPop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .produto-icon-pop { animation: produtoIconPop 0.35s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .produto-icon-pop { animation: none; }
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/publicar" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">Produtos</span>
          <div className="w-[52px]" />
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Caracterize seu produto
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Toque em cada campo para preencher, na ordem.
          </p>
        </section>

        {selectedCategory && (
          <div key={selectedCategory.id} className="produto-icon-pop mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
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
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">Produtos</span>
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