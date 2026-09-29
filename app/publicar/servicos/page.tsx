"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* DADOS                                                               */
/* ------------------------------------------------------------------ */

const SERVICO_CATEGORIES = [
  {
    id: "lavagem",
    label: "Lavagem e Estética",
    description:
      "Limpeza e cuidado com a bike",
  },
  {
    id: "revisao-basica",
    label: "Revisão Básica",
    description:
      "Regulagem de freios e marchas",
  },
  {
    id: "revisao-completa",
    label: "Revisão Geral",
    description:
      "Desmontagem e lubrificação completa",
  },
  {
    id: "sangria-freio",
    label: "Sangria de Freio",
    description:
      "Freio hidráulico",
  },
  {
    id: "suspensao",
    label: "Revisão de Suspensão",
    description:
      "Suspensão dianteira e amortecedor",
  },
  {
    id: "montagem",
    label: "Montagem de Bike",
    description:
      "Bike na caixa",
  },
  {
    id: "rodas",
    label: "Montagem de Rodas",
    description:
      "Raiamento e alinhamento",
  },
  {
    id: "tubeless",
    label: "Conversão Tubeless",
    description:
      "Instalação de sistema tubeless",
  },
  {
    id: "bike-fit",
    label: "Bike Fit",
    description:
      "Ajuste ergonômico profissional",
  },
  {
    id: "leva-traz",
    label: "Leva e Traz",
    description:
      "Logística de oficina",
  },
] as const

type ServicoCategoryId =
  (typeof SERVICO_CATEGORIES)[number]["id"]

const TIPOS_BY_CATEGORY: Record<
  ServicoCategoryId,
  readonly string[]
> = {
  lavagem: [
    "Lavagem Simples",
    "Lavagem Detalhada",
    "Vitrificação",
    "Polimento",
  ],

  "revisao-basica": [
    "Regulagem de Freio",
    "Regulagem de Marcha",
    "Regulagem Geral",
    "Ajuste de Cabos",
  ],

  "revisao-completa": [
    "Revisão Completa",
    "Revisão Completa + Suspensão",
    "Revisão Completa + Freios",
  ],

  "sangria-freio": [
    "Sangria Freio Dianteiro",
    "Sangria Freio Traseiro",
    "Sangria Completa",
  ],

  suspensao: [
    "Revisão Suspensão Dianteira",
    "Revisão Amortecedor Traseiro",
    "Revisão Completa Suspensão",
  ],

  montagem: [
    "Montagem de Bike na Caixa",
    "Montagem + Revisão Básica",
    "Montagem + Revisão Completa",
  ],

  rodas: [
    "Montagem de Roda",
    "Alinhamento de Roda",
    "Raiamento Completo",
  ],

  tubeless: [
    "Conversão Tubeless",
    "Instalação Pneu Tubeless",
    "Reparo Tubeless",
  ],

  "bike-fit": [
    "Bike Fit Completo",
    "Bike Fit Básico",
    "Ajuste de Posição",
  ],

  "leva-traz": [
    "Leva e Traz Ida",
    "Leva e Traz Ida e Volta",
  ],
}

const TEMPO_ESTIMADO_OPTIONS = [
  {
    id: "menos-1h",
    label: "Menos de 1 hora",
    description: "Serviço rápido",
  },
  {
    id: "1-3h",
    label: "1 a 3 horas",
    description: "Serviço padrão",
  },
  {
    id: "1-dia",
    label: "1 dia",
    description: "Serviço completo",
  },
  {
    id: "2-3-dias",
    label: "2 a 3 dias",
    description: "Serviço detalhado",
  },
  {
    id: "1-semana",
    label: "1 semana",
    description:
      "Serviço especializado",
  },
] as const

/* ------------------------------------------------------------------ */
/* MODELO                                                              */
/* ------------------------------------------------------------------ */

type Answers = {
  subcategoryId: ServicoCategoryId | ""
  tipo: string
  tempoEstimado: string
}

const EMPTY_ANSWERS: Answers = {
  subcategoryId: "",
  tipo: "",
  tempoEstimado: "",
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
/* CARD                                                                */
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
        selected
          ? "choice-card-selected"
          : ""
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

export default function PublicarServicosPage() {
  const router = useRouter()

  const [answers, setAnswers] =
    useState<Answers>(EMPTY_ANSWERS)

  const [activeStep, setActiveStep] =
    useState(1)

  const selectedCategory =
    useMemo(
      () =>
        SERVICO_CATEGORIES.find(
          (item) =>
            item.id ===
            answers.subcategoryId
        ),
      [answers.subcategoryId]
    )

  const steps: Step[] = useMemo(
    () => [
      {
        key: "subcategoryId",
        title: "Tipo de serviço",
        subtitle:
          "Qual serviço você oferece?",
        options:
          SERVICO_CATEGORIES.map(
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
        title: "Serviço específico",
        subtitle: answers.subcategoryId
          ? `Especialidade de ${
            selectedCategory?.label.toLowerCase() ??
            "serviço"
          }`
          : "Escolha o serviço primeiro",
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
        key: "tempoEstimado",
        title: "Tempo estimado",
        subtitle:
          "Quanto tempo leva o serviço?",
        options:
          TEMPO_ESTIMADO_OPTIONS.map(
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

  const isStepReady = (
    stepNumber: number
  ) => {
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
      categoryId: "servicos",
      ...answers,
    }

    sessionStorage.setItem(
      "imperium_bikes_publish",
      JSON.stringify(updatedData)
    )

    router.push(
      "/publicar/servicos/informacoes"
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
          Serviços
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
            Descreva seu serviço
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
                Serviço selecionado
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
          aria-label="Classificação do serviço"
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
                answers.subcategoryId
                  ? ""
                  : "summary-placeholder"
              }`}
            >
              {[
                  "Serviços",
                  selectedCategory?.label,
                  answers.tipo,
                  TEMPO_ESTIMADO_OPTIONS.find(
                    (item) =>
                      item.id ===
                      answers.tempoEstimado
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