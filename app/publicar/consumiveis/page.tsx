"use client"

import { useMemo, useState } from "react"
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
  },
  {
    id: "hidratacao",
    label: "Hidratação",
    description: "Bebidas e produtos para reposição de líquidos",
  },
  {
    id: "nutricao",
    label: "Nutrição Esportiva",
    description: "Produtos para alimentação e desempenho esportivo",
  },
  {
    id: "recuperacao",
    label: "Recuperação",
    description: "Produtos voltados à recuperação após o exercício",
  },
  {
    id: "suplementos",
    label: "Suplementos",
    description: "Produtos nutricionais para diferentes objetivos",
  },
  {
    id: "alimentos",
    label: "Alimentos Esportivos",
    description: "Alimentos desenvolvidos para prática esportiva",
  },
  {
    id: "vitaminas",
    label: "Vitaminas e Minerais",
    description: "Produtos nutricionais com vitaminas e minerais",
  },
  {
    id: "outros",
    label: "Outros Consumíveis",
    description: "Outros produtos consumíveis relacionados ao esporte",
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
}

/* ------------------------------------------------------------------ */
/* CARD DE ESCOLHA                                                     */
/* ------------------------------------------------------------------ */

function ChoiceCard({
                      selected,
                      label,
                      description,
                      onClick,
                    }: {
  selected: boolean
  label: string
  description?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`choice-card ${
        selected ? "choice-card-selected" : ""
      }`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="choice-card-label">
        {label}
      </span>

      {description ? (
        <span className="choice-card-description">
          {description}
        </span>
      ) : null}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* PÁGINA                                                              */
/* ------------------------------------------------------------------ */

export default function PublicarConsumiveisPage() {
  const router = useRouter()

  const [answers, setAnswers] =
    useState<Answers>(EMPTY_ANSWERS)

  const [activeStep, setActiveStep] =
    useState(1)

  const selectedCategory = useMemo(
    () =>
      CONSUMIVEIS_CATEGORIES.find(
        (item) =>
          item.id === answers.subcategoryId
      ),
    [answers.subcategoryId]
  )

  const steps: Step[] = useMemo(
    () => [
      {
        key: "subcategoryId",
        title: "Finalidade do produto",
        subtitle:
          "Para que tipo de consumo esportivo ele é indicado?",
        options:
          CONSUMIVEIS_CATEGORIES.map(
            (item) => ({
              id: item.id,
              label: item.label,
              description:
              item.description,
            })
          ),
      },
      {
        key: "tipo",
        title: "Produto específico",
        subtitle: answers.subcategoryId
          ? `Escolha o produto de ${
            selectedCategory?.label.toLowerCase() ??
            "consumo"
          }`
          : "Escolha a finalidade primeiro",
        options: answers.subcategoryId
          ? TIPOS_BY_CATEGORY[
            answers.subcategoryId
            ].map((item) => ({
            id: item,
            label: item,
          }))
          : [],
      },
      {
        key: "volume",
        title: "Formato de venda",
        subtitle:
          "Como o produto será vendido?",
        options:
          VOLUME_OPTIONS.map(
            (item) => ({
              id: item.id,
              label: item.label,
              description:
              item.description,
            })
          ),
      },
    ],
    [
      answers.subcategoryId,
      selectedCategory,
    ]
  )

  const firstUnansweredIndex =
    steps.findIndex(
      (step) => !answers[step.key]
    )

  const allAnswered =
    firstUnansweredIndex === -1

  const isStepReady = (stepNumber: number) => {
    if (stepNumber === 1) {
      return true
    }

    if (stepNumber === 2) {
      return Boolean(
        answers.subcategoryId
      )
    }

    if (stepNumber === 3) {
      return Boolean(
        answers.subcategoryId &&
        answers.tipo
      )
    }

    return false
  }

  const handleSelect = (
    step: Step,
    optionId: string
  ) => {
    setAnswers((current) => {
      const next = {
        ...current,
        [step.key]: optionId,
      }

      if (
        step.key ===
        "subcategoryId"
      ) {
        next.tipo = ""
      }

      return next
    })
  }

  const handleContinue = () => {
    if (!allAnswered) {
      return
    }

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

  const handleCancel = () => {
    router.push("/publicar")
  }

  return (
    <main className="imperium-page">
      <header className="imperium-header">
        <Link
          className="header-back"
          href="/publicar"
        >
          Voltar
        </Link>

        <div
          className="brand-mark"
          aria-label="Imperium Bikes"
        >
          IB
        </div>

        <div>
          <p className="eyebrow">
            Imperium Bikes
          </p>

          <p className="header-context">
            Publicar anúncio
          </p>
        </div>

        <span
          className="header-divider"
          aria-hidden="true"
        />

        <p className="header-category">
          Consumíveis
        </p>
      </header>

      <div className="classification-layout">
        <section
          className="classification-intro"
          aria-labelledby="page-title"
        >
          <p className="eyebrow">
            Etapa 1 de 6
          </p>

          <h1 id="page-title">
            Caracterize seu consumível
          </h1>

          <p>
            Escolha as características
            principais para que seu anúncio
            seja encontrado com facilidade.
          </p>

          <div
            className="progress-line"
            aria-label="Etapa 1 de 6"
          >
            <span className="progress-active" />
            <span />
          </div>

          {selectedCategory ? (
            <div className="classification-selection">
              <p className="summary-label">
                Categoria selecionada
              </p>

              <p className="summary-value">
                {selectedCategory.label}
              </p>

              <p className="field-note">
                {selectedCategory.description}
              </p>
            </div>
          ) : null}
        </section>

        <section
          className="steps-panel"
          aria-label="Classificação do consumível"
        >
          {steps.map((step, index) => {
            const stepNumber =
              index + 1

            const active =
              activeStep === stepNumber

            const ready =
              isStepReady(stepNumber)

            const answered =
              Boolean(
                answers[step.key]
              )

            const selectedOption =
              step.options.find(
                (option) =>
                  option.id ===
                  answers[step.key]
              )

            return (
              <div
                key={step.key}
                className={`step-block ${
                  active
                    ? "step-block-active"
                    : ""
                } ${
                  !ready
                    ? "step-block-locked"
                    : ""
                }`}
              >
                <button
                  type="button"
                  className="step-heading"
                  onClick={() =>
                    ready &&
                    setActiveStep(
                      stepNumber
                    )
                  }
                  disabled={!ready}
                  aria-expanded={active}
                >
                  <span className="step-number">
                    {String(
                      stepNumber
                    ).padStart(2, "0")}
                  </span>

                  <span className="step-heading-copy">
                    <strong>
                      {step.title}
                    </strong>

                    <small>
                      {selectedOption
                        ? selectedOption.label
                        : step.subtitle}
                    </small>
                  </span>

                  {answered ? (
                    <span className="step-status">
                      Concluído
                    </span>
                  ) : null}
                </button>

                {active && ready ? (
                  <div className="step-content">
                    <p className="field-label">
                      {step.title}
                    </p>

                    <div className="choice-grid choice-grid-types">
                      {step.options.map(
                        (option) => (
                          <ChoiceCard
                            key={
                              option.id
                            }
                            selected={
                              answers[
                                step.key
                                ] ===
                              option.id
                            }
                            label={
                              option.label
                            }
                            description={
                              option.description
                            }
                            onClick={() =>
                              handleSelect(
                                step,
                                option.id
                              )
                            }
                          />
                        )
                      )}
                    </div>

                    {stepNumber <
                    steps.length ? (
                      <button
                        type="button"
                        className="text-action"
                        disabled={
                          !answers[
                            step.key
                            ]
                        }
                        onClick={() =>
                          setActiveStep(
                            stepNumber +
                            1
                          )
                        }
                      >
                        Continuar para{" "}
                        {steps[
                          stepNumber
                          ].title.toLowerCase()}{" "}
                        <span aria-hidden="true">
                          →
                        </span>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </section>

        <aside
          className="classification-summary"
          aria-live="polite"
        >
          <div>
            <p className="summary-label">
              Sua classificação
            </p>

            <p
              className={`summary-value ${
                answers.subcategoryId ||
                answers.tipo ||
                answers.volume
                  ? ""
                  : "summary-placeholder"
              }`}
            >
              {[
                  "Consumíveis",
                  selectedCategory?.label,
                  answers.tipo,
                  VOLUME_OPTIONS.find(
                    (item) =>
                      item.id ===
                      answers.volume
                  )?.label,
                ]
                  .filter(Boolean)
                  .join(" · ") ||
                "As escolhas aparecerão aqui"}
            </p>
          </div>

          <div className="summary-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={handleCancel}
            >
              Cancelar anúncio
            </button>

            <button
              type="button"
              className="primary-action"
              disabled={!allAnswered}
              onClick={handleContinue}
            >
              Continuar
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}