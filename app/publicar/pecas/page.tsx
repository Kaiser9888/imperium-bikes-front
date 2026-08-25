"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Cog,
  Disc,
  Wrench,
  Zap,
  Shield,
  Activity,
  RotateCw,
  Cable,
  Bike,
  CircleDot,
  Gauge,
  Sun,
  Split,
  Move,
  Target,
  Footprints,
  ArrowUpFromLine,
  Circle,
  Box,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* DADOS                                                               */
/* ------------------------------------------------------------------ */

const PECA_CATEGORIES = [
  // --- TRANSMISSÃO ---
  { id: "transmissao-cambios", label: "Câmbios e Passadores", description: "Câmbios traseiros, dianteiros, trocadores", icon: Cog, image: "/images/categories/pecas/cambios.jpg" },
  { id: "transmissao-desgaste", label: "Cassetes, Correntes e Coroas", description: "Cassetes, correntes, coroas", icon: Activity, image: "/images/categories/pecas/relacao.jpg" },
  { id: "transmissao-pedivela-central", label: "Pedivelas e Movimentos Centrais", description: "Pedivelas e movimentos centrais", icon: RotateCw, image: "/images/categories/pecas/pedivela.jpg" },

  // --- FREIOS ---
  { id: "freio-dianteiro", label: "Freio Dianteiro (Completo)", description: "Manete esquerda, pinça e mangueira curta", icon: Disc, image: "/images/categories/pecas/freio-dianteiro.jpg" },
  { id: "freio-traseiro", label: "Freio Traseiro (Completo)", description: "Manete direita, pinça e mangueira comprida", icon: Disc, image: "/images/categories/pecas/freio-traseiro.jpg" },
  { id: "discos-rotores", label: "Discos, Rotores e Adaptadores", description: "Discos, pastilhas e adaptadores", icon: Target, image: "/images/categories/pecas/discos.jpg" },

  // --- SUSPENSÕES ---
  { id: "suspensao-single-crown", label: "Suspensão Single Crown", description: "Suspensões dianteiras de 1 andar", icon: Wrench, image: "/images/categories/pecas/suspensao-single.jpg" },
  { id: "suspensao-double-crown", label: "Suspensão Double Crown", description: "Suspensões de dois andares (Downhill)", icon: Wrench, image: "/images/categories/pecas/suspensao-double.jpg" },
  { id: "shock-traseiro", label: "Shock / Amortecedor Traseiro", description: "Amortecedores para Full Suspension", icon: Activity, image: "/images/categories/pecas/shock.jpg" },
  { id: "garfo-rigido", label: "Garfo Rígido", description: "Garfos sem amortecimento", icon: Split, image: "/images/categories/pecas/garfo-rigido.jpg" },

  // --- RODAS E CUBOS ---
  { id: "rodas-par", label: "Par de Rodas Montadas", description: "Jogos de rodas completos", icon: CircleDot, image: "/images/categories/pecas/par-rodas.jpg" },
  { id: "rodas-avulsas", label: "Roda Avulsa", description: "Roda dianteira ou traseira avulsa", icon: Circle, image: "/images/categories/pecas/roda-avulsa.jpg" },
  { id: "cubos-avulsos", label: "Cubos (Dianteiro / Traseiro)", description: "Cubos avulsos", icon: Box, image: "/images/categories/pecas/cubos.jpg" },
  { id: "aros-raios", label: "Aros e Raios", description: "Aros e kits de raios", icon: Sun, image: "/images/categories/pecas/aros.jpg" },

  // --- DIREÇÃO, ASSENTO E ESTRUTURA ---
  { id: "quadro", label: "Quadro e Componentes Estruturais", description: "Quadros avulsos e gancheiras", icon: Bike, image: "/images/categories/pecas/quadro.jpg" },
  { id: "cockpit", label: "Cockpit, Guidão e Avanço", description: "Guidões, mesas, caixas de direção", icon: Move, image: "/images/categories/pecas/cockpit.jpg" },
  { id: "selim-canote", label: "Selim e Canote", description: "Selins e canotes (rígido ou retrátil)", icon: ArrowUpFromLine, image: "/images/categories/pecas/selim.jpg" },
  { id: "pedais", label: "Pedais e Tacos", description: "Pedais de encaixe e plataforma", icon: Footprints, image: "/images/categories/pecas/pedais.jpg" },
  { id: "cabos-conduites", label: "Cabos, Conduítes e Guias", description: "Cabos e conduítes", icon: Cable, image: "/images/categories/pecas/cabos.jpg" },
] as const

type PecaCategoryId = (typeof PECA_CATEGORIES)[number]["id"]

const TIPOS_BY_CATEGORY: Record<PecaCategoryId, readonly string[]> = {
  "transmissao-cambios": ["Câmbio Dianteiro", "Câmbio Traseiro", "Passador Dianteiro", "Passador Traseiro", "Kit Completo"],
  "transmissao-desgaste": ["Cassete", "Corrente", "Coroa", "Kit Relação Completa"],
  "transmissao-pedivela-central": ["Pedivela", "Movimento Central", "Kit Pedivela + Central"],

  "freio-dianteiro": ["Kit Freio Dianteiro Completo", "Pinça Dianteira", "Manete Esquerda"],
  "freio-traseiro": ["Kit Freio Traseiro Completo", "Pinça Traseira", "Manete Direita"],
  "discos-rotores": ["Disco de Freio", "Pastilhas", "Adaptador de Pinça", "Kit Discos + Pastilhas"],

  "suspensao-single-crown": ["Suspensão 100mm", "Suspensão 120mm", "Suspensão 140mm", "Suspensão 150mm+", "Suspensão 160mm+"],
  "suspensao-double-crown": ["Suspensão Double Crown 200mm", "Suspensão Double Crown 180mm"],
  "shock-traseiro": ["Shock a Ar", "Shock a Mola", "Shock Eletrônico"],
  "garfo-rigido": ["Garfo Rígido Carbono", "Garfo Rígido Alumínio", "Garfo Rígido Cromoly", "Garfo Rígido Aço"],

  "rodas-par": ["Par de Rodas MTB 29\"", "Par de Rodas MTB 27.5\"", "Par de Rodas Speed 700c", "Par de Rodas Gravel 650b"],
  "rodas-avulsas": ["Roda Dianteira", "Roda Traseira"],
  "cubos-avulsos": ["Cubo Dianteiro", "Cubo Traseiro"],
  "aros-raios": ["Aro MTB 29\"", "Aro MTB 27.5\"", "Aro Speed 700c", "Aro Gravel 650b", "Kit Raios e Niples"],

  "quadro": ["Quadro MTB", "Quadro Speed", "Quadro Gravel", "Quadro BMX", "Gancheira de Câmbio", "Link de Suspensão"],
  "cockpit": ["Guidão MTB", "Guidão Speed", "Guidão Gravel", "Mesa/Avanço", "Caixa de Direção", "Espaçadores"],
  "selim-canote": ["Selim", "Canote Rígido", "Canote Retrátil (Dropper)", "Abraçadeira de Quadro"],
  "pedais": ["Pedal de Encaixe (Clip)", "Pedal Plataforma", "Tacos de Sapatilha"],
  "cabos-conduites": ["Cabo de Freio", "Cabo de Marcha", "Conduíte", "Capa de Cabo", "Terminal Protetor"],
}

const CONDICAO_OPTIONS = [
  { id: "novo", label: "Novo", description: "Nunca usado" },
  { id: "usado", label: "Usado", description: "Já foi utilizado" },
] as const

const COMPATIBILIDADE_OPTIONS = [
  "Shimano",
  "SRAM",
  "Campagnolo",
  "MicroSHIFT",
  "Universal",
] as const

/* ------------------------------------------------------------------ */
/* MODELO DE RESPOSTAS                                                 */
/* ------------------------------------------------------------------ */

type Answers = {
  subcategoryId: PecaCategoryId | ""
  tipo: string
  condicao: string
  compatibilidade: string
}

const EMPTY_ANSWERS: Answers = {
  subcategoryId: "",
  tipo: "",
  condicao: "",
  compatibilidade: "",
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
}

/* ------------------------------------------------------------------ */
/* PÁGINA                                                              */
/* ------------------------------------------------------------------ */

export default function PublicarPecasPage() {
  const router = useRouter()

  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS)
  const [expandedKey, setExpandedKey] = useState<keyof Answers | null>("subcategoryId")

  const selectedCategory = useMemo(
    () => PECA_CATEGORIES.find((item) => item.id === answers.subcategoryId),
    [answers.subcategoryId]
  )

  const steps: Step[] = useMemo(() => {
    const subId = answers.subcategoryId

    return [
      {
        key: "subcategoryId",
        title: "Categoria da peça",
        subtitle: "Qual o tipo de peça?",
        options: PECA_CATEGORIES.map((s) => ({
          id: s.id,
          label: s.label,
          description: s.description,
        })),
      },
      {
        key: "tipo",
        title: "Tipo específico",
        subtitle: subId ? `Peça da categoria ${selectedCategory?.label.toLowerCase()}` : "Escolha a categoria primeiro",
        options: subId
          ? TIPOS_BY_CATEGORY[subId].map((t) => ({ id: t, label: t }))
          : [],
      },
      {
        key: "condicao",
        title: "Estado",
        subtitle: "Condição da peça",
        options: CONDICAO_OPTIONS.map((c) => ({ id: c.id, label: c.label, description: c.description })),
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

  const firstUnansweredIndex = steps.findIndex((step) => !answers[step.key])
  const allAnswered = firstUnansweredIndex === -1

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
      categoryId: "pecas",
      ...answers,
    }

    sessionStorage.setItem("imperium_bikes_publish", JSON.stringify(updatedData))
    router.push("/publicar/pecas/informacoes")
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <style>{`
        @keyframes pecaIconPop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .peca-icon-pop { animation: pecaIconPop 0.35s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .peca-icon-pop { animation: none; }
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/publicar" className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            Voltar
          </Link>
          <span className="text-sm font-semibold">Peças</span>
          <div className="w-[52px]" />
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Caracterize sua peça
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Toque em cada campo para preencher, na ordem.
          </p>
        </section>

        {selectedCategory && (
          <div key={selectedCategory.id} className="peca-icon-pop mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
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
                    <p className="text-sm font-semibold">{step.title}</p>
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
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">Peças</span>
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