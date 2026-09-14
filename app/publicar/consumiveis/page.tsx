
"use client"

import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Check,
  Droplets,
  Utensils,
  BatteryCharging,
  HeartPulse,
  Apple,
  FlaskConical,
  Package,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* DADOS                                                               */
/* ------------------------------------------------------------------ */

const CONSUMIVEIS_CATEGORIES = [
  {
    id: "energia",
    label: "Energia",
    description: "Produtos para energia durante o exercício",
    icon: BatteryCharging,
    image: "/images/categories/consumiveis/energia.jpg",
  },
  {
    id: "hidratacao",
    label: "Hidratação",
    description: "Bebidas e produtos para reposição de líquidos",
    icon: Droplets,
    image: "/images/categories/consumiveis/hidratacao.jpg",
  },
  {
    id: "nutricao",
    label: "Nutrição Esportiva",
    description: "Produtos para alimentação e desempenho esportivo",
    icon: Utensils,
    image: "/images/categories/consumiveis/nutricao.jpg",
  },
  {
    id: "recuperacao",
    label: "Recuperação",
    description: "Produtos voltados à recuperação após o exercício",
    icon: HeartPulse,
    image: "/images/categories/consumiveis/recuperacao.jpg",
  },
  {
    id: "suplementos",
    label: "Suplementos",
    description: "Produtos nutricionais para diferentes objetivos",
    icon: FlaskConical,
    image: "/images/categories/consumiveis/suplementos.jpg",
  },
  {
    id: "alimentos",
    label: "Alimentos Esportivos",
    description: "Alimentos desenvolvidos para prática esportiva",
    icon: Apple,
    image: "/images/categories/consumiveis/alimentos.jpg",
  },
  {
    id: "vitaminas",
    label: "Vitaminas e Minerais",
    description: "Produtos nutricionais com vitaminas e minerais",
    icon: FlaskConical,
    image: "/images/categories/consumiveis/vitaminas.jpg",
  },
  {
    id: "outros",
    label: "Outros Consumíveis",
    description: "Outros produtos consumíveis relacionados ao esporte",
    icon: Package,
    image: "/images/categories/consumiveis/outros.jpg",
  },
] as const

type ConsumivelCategoryId =
  (typeof CONSUMIVEIS_CATEGORIES)[number]["id"]

/* ------------------------------------------------------------------ */
/* PRODUTOS POR CATEGORIA                                              */
/* ------------------------------------------------------------------ */

const TIPOS_BY_CATEGORY: Record<
  ConsumivelCategoryId,
  readonly string[]
> = {
  energia: [
    "Gel de carboidrato",
    "Goma energética",
    "Bebida energética",
    "Carboidrato em pó",
    "Cafeína esportiva",
  ],

  hidratacao: [
    "Isotônico",
    "Bebida eletrolítica",
    "Repositor de eletrólitos",
    "Sachê para hidratação",
    "Tablete de eletrólitos",
  ],

  nutricao: [
    "Bebida nutricional",
    "Carboidrato",
    "Proteína",
    "Maltodextrina",
    "Produto para pré-treino",
  ],

  recuperacao: [
    "Bebida de recuperação",
    "Proteína para recuperação",
    "Carboidrato para recuperação",
    "Eletrólitos",
    "Produto pós-treino",
  ],

  suplementos: [
    "Proteína",
    "Creatina",
    "Beta-alanina",
    "Pré-treino",
    "Aminoácidos",
  ],

  alimentos: [
    "Barrinha energética",
    "Barrinha proteica",
    "Biscoito esportivo",
    "Doce esportivo",
    "Alimento desidratado",
  ],

  vitaminas: [
    "Multivitamínico",
    "Vitamina",
    "Minerais",
    "Magnésio",
    "Eletrólitos",
  ],

  outros: [
    "Outro alimento esportivo",
    "Outro produto nutricional",
    "Outro consumível",
  ],
}

/* ------------------------------------------------------------------ */
/* FORMATO DE VENDA                                                    */
/* ------------------------------------------------------------------ */

const VOLUME_OPTIONS = [
  {
    id: "unidade",
    label: "Unidade",
    description: "Venda por unidade",
  },
  {
    id: "caixa",
    label: "Caixa",
    description: "Venda por caixa",
  },
  {
    id: "pacote",
    label: "Pacote",
    description: "Venda por pacote",
  },
  {
    id: "kit",
    label: "Kit",
    description: "Conjunto de produtos",
  },
  {
    id: "pote",
    label: "Pote",
    description: "Produto vendido em pote",
  },
  {
    id: "sache",
    label: "Sachê",
    description: "Produto vendido em sachê",
  },
] as const

/* ------------------------------------------------------------------ */
/* MODELO                                                              */
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

  const [answers, setAnswers] =
    useState<Answers>(EMPTY_ANSWERS)

  const [expandedKey, setExpandedKey] =
    useState<keyof Answers | null>("subcategoryId")

  const selectedCategory = useMemo(
    () =>
      CONSUMIVEIS_CATEGORIES.find(
        (item) => item.id === answers.subcategoryId
      ),
    [answers.subcategoryId]
  )

  /* ---------------------------------------------------------------- */
  /* ETAPAS                                                            */
  /* ---------------------------------------------------------------- */

  const steps: Step[] = useMemo(() => {
    const subId = answers.subcategoryId

    return [
      {
        key: "subcategoryId",
        title: "Finalidade do produto",
        subtitle: "Para que tipo de consumo esportivo ele é indicado?",
        options: CONSUMIVEIS_CATEGORIES.map((item) => ({
          id: item.id,
          label: item.label,
          description: item.description,
        })),
      },

      {
        key: "tipo",
        title: "Produto específico",
        subtitle: subId
          ? `Escolha o produto de ${selectedCategory?.label.toLowerCase()}`
          : "Escolha a finalidade primeiro",
        options: subId
          ? TIPOS_BY_CATEGORY[subId].map((item) => ({
              id: item,
              label: item,
            }))
          : [],
      },

      {
        key: "volume",
        title: "Formato de venda",
        subtitle: "Como o produto será vendido?",
        options: VOLUME_OPTIONS.map((item) => ({
          id: item.id,
          label: item.label,
          description: item.description,
        })),
      },
    ]
  }, [answers.subcategoryId, selectedCategory])

  /* ---------------------------------------------------------------- */
  /* CONTROLE DAS ETAPAS                                               */
  /* ---------------------------------------------------------------- */

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

  const isStepUnlocked = (index: number) =>
    index <=
    (firstUnansweredIndex === -1
      ? steps.length - 1
      : firstUnansweredIndex)

  /* ---------------------------------------------------------------- */
  /* SELEÇÃO                                                           */
  /* ---------------------------------------------------------------- */

  const handleSelect = (
    step: Step,
    optionId: string
  ) => {
    setAnswers((prev) => {
      const next = {
        ...prev,
        [step.key]: optionId,
      }

      /*
       * Se a categoria mudar, o produto específico
       * anterior deixa de ser válido.
       */
      if (step.key === "subcategoryId") {
        next.tipo = ""
      }

      return next
    })

    const currentIndex =
      stepIndexByKey[step.key] ?? 0

    const nextStep = steps[currentIndex + 1]

    setExpandedKey(
      nextStep ? nextStep.key : null
    )
  }

  /* ---------------------------------------------------------------- */
  /* ABRIR / FECHAR ETAPA                                             */
  /* ---------------------------------------------------------------- */

  const toggleStep = (
    step: Step,
    index: number
  ) => {
    if (!isStepUnlocked(index)) return

    setExpandedKey((prev) =>
      prev === step.key
        ? null
        : step.key
    )
  }

  /* ---------------------------------------------------------------- */
  /* CONTINUAR                                                         */
  /* ---------------------------------------------------------------- */

  const handleContinue = () => {
    if (!allAnswered) return

    const currentData =
      sessionStorage.getItem(
        "imperium_bikes_publish"
      )

    let publishData: Record<
      string,
      unknown
    > = {}

    if (currentData) {
      try {
        const parsed =
          JSON.parse(currentData)

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
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

    sessionStorage.setItem(
      "imperium_bikes_publish",
      JSON.stringify(updatedData)
    )

    router.push(
      "/publicar/consumiveis/informacoes"
    )
  }

  /* ---------------------------------------------------------------- */
  /* RENDER                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-background text-foreground">

      <style>{`
@keyframes consumivelIconPop {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }

  60% {
    transform: scale(1.08);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.consumivel-icon-pop {
  animation: consumivelIconPop 0.35s ease-out;
}

@media (prefers-reduced-motion: reduce) {
.consumivel-icon-pop {
    animation: none;
  }
}
`}</style>

      {/* ------------------------------------------------------------ */}
      {/* HEADER                                                        */}
      {/* ------------------------------------------------------------ */}

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">

          <Link
            href="/publicar"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />

            Voltar
          </Link>

          <span className="text-sm font-semibold">
            Consumíveis
          </span>

          <div className="w-[52px]" />

        </div>
      </header>

      {/* ------------------------------------------------------------ */}
      {/* CONTEÚDO                                                      */}
      {/* ------------------------------------------------------------ */}

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">

        <section className="mb-6">

          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Caracterize seu consumível
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Escolha primeiro a finalidade do produto e depois
            especifique o item.
          </p>

        </section>

        {/* ---------------------------------------------------------- */}
        {/* CATEGORIA SELECIONADA                                      */}
        {/* ---------------------------------------------------------- */}

        {selectedCategory && (
          <div
            key={selectedCategory.id}
            className="consumivel-icon-pop mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
          >

            <img
              src={selectedCategory.image}
              alt={selectedCategory.label}
              className="size-12 shrink-0 rounded-full border border-primary/20 object-cover"
            />

            <div>

              <p className="text-sm font-semibold">
                {selectedCategory.label}
              </p>

              <p className="text-xs text-muted-foreground">
                {selectedCategory.description}
              </p>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------------- */}
        {/* ETAPAS                                                      */}
        {/* ---------------------------------------------------------- */}

        <section className="space-y-2">

          {steps.map((step, index) => {

            const isExpanded =
              expandedKey === step.key

            const isUnlocked =
              isStepUnlocked(index)

            const isAnswered =
              Boolean(answers[step.key])

            const selectedOption =
              step.options.find(
                (option) =>
                  option.id ===
                  answers[step.key]
              )

            return (
              <div
                key={step.key}
                className={`overflow-hidden rounded-xl border transition-colors ${
  isAnswered
    ? "border-primary/40"
    : "border-border"
} ${
  !isUnlocked
    ? "opacity-40"
    : ""
}`}
              >

                {/* CABEÇALHO DA ETAPA */}

                <button
                  type="button"
                  onClick={() =>
                    toggleStep(step, index)
                  }
                  disabled={!isUnlocked}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left disabled:cursor-not-allowed"
                >

                  <div className="min-w-0">

                    <p className="text-sm font-semibold">
                      {step.title}
                    </p>

                    <p
                      className={`mt-0.5 truncate text-xs ${
  isAnswered
    ? "font-medium text-primary"
    : "text-muted-foreground"
}`}
                    >
                      {selectedOption
                        ? selectedOption.label
                        : step.subtitle}
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
  isExpanded
    ? "rotate-180"
    : ""
}`}
                    />

                  </span>

                </button>

                {/* OPÇÕES */}

                {isExpanded && isUnlocked && (
                  <div className="border-t border-border px-2 pb-2 pt-1">

                    {step.options.length === 0 ? (

                      <p className="px-2 py-3 text-xs text-muted-foreground">
                        Nenhuma opção disponível ainda.
                      </p>

                    ) : (

                      step.options.map(
                        (option) => {

                          const isSelected =
                            answers[
                              step.key
                            ] === option.id

                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() =>
                                handleSelect(
                                  step,
                                  option.id
                                )
                              }
                              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
  isSelected
    ? "bg-primary/10 font-semibold text-primary"
    : "hover:bg-muted/60"
}`}
                            >

                              <span>

                                {option.label}

                                {option.description && (
                                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                                    {option.description}
                                  </span>
                                )}

                              </span>

                              {isSelected && (
                                <Check className="size-3.5 shrink-0" />
                              )}

                            </button>
                          )
                        }
                      )

                    )}

                  </div>
                )}

              </div>
            )
          })}

        </section>

        {/* ---------------------------------------------------------- */}
        {/* CLASSIFICAÇÃO                                               */}
        {/* ---------------------------------------------------------- */}

        {answers.subcategoryId && (
          <section className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">

            <p className="text-xs text-muted-foreground">
              Seu anúncio será classificado como
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                Consumíveis
              </span>

              {steps
                .filter(
                  (step) =>
                    answers[step.key]
                )
                .map((step) => (

                  <span
                    key={step.key}
                    className="flex items-center gap-2"
                  >

                    <span className="text-muted-foreground">
                      →
                    </span>

                    <span className="rounded-full bg-background px-3 py-1 text-xs font-medium ring-1 ring-border">
                      {
                        step.options.find(
                          (option) =>
                            option.id ===
                            answers[step.key]
                        )?.label
                      }
                    </span>

                  </span>

                ))}

            </div>

          </section>
        )}

      </div>

      {/* ------------------------------------------------------------ */}
      {/* BOTÃO CONTINUAR                                               */}
      {/* ------------------------------------------------------------ */}

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

