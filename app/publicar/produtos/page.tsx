"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* DADOS                                                               */
/* ------------------------------------------------------------------ */

const PRODUTO_CATEGORIES = [
  {
    id: "capacetes",
    label: "Capacetes",
    description:
      "Capacetes abertos, coquinho e full-face",
  },
  {
    id: "vestuario",
    label: "Vestuário",
    description:
      "Camisas, bermudas, bretelles, jaquetas",
  },
  {
    id: "calcados",
    label: "Calçados",
    description:
      "Sapatilhas e tênis de ciclismo",
  },
  {
    id: "oculos",
    label: "Óculos",
    description:
      "Óculos de sol e de proteção",
  },
  {
    id: "eletronicos",
    label: "Eletrônicos",
    description:
      "GPS, ciclocomputadores, sensores",
  },
  {
    id: "iluminacao",
    label: "Iluminação",
    description:
      "Faróis, lanternas e sinalizadores",
  },
  {
    id: "seguranca",
    label: "Segurança",
    description:
      "Cadeados, travas e alarmes",
  },
  {
    id: "hidratacao",
    label: "Hidratação",
    description:
      "Caramanholas, mochilas e suportes",
  },
  {
    id: "bolsas",
    label: "Bolsas e Mochilas",
    description:
      "Bolsas de selim, quadro e guidão",
  },
  {
    id: "ferramentas",
    label: "Ferramentas",
    description:
      "Multi-ferramentas e kits",
  },
  {
    id: "protecao",
    label: "Proteção Corporal",
    description:
      "Joelheiras, cotoveleiras e coletes",
  },
] as const

type ProdutoCategoryId =
  (typeof PRODUTO_CATEGORIES)[number]["id"]

const TIPOS_BY_CATEGORY: Record<
  ProdutoCategoryId,
  readonly string[]
> = {
  capacetes: [
    "Capacete Aberto",
    "Capacete Coquinho",
    "Capacete Full-Face",
    "Capacete Infantil",
  ],

  vestuario: [
    "Camisa de Ciclismo",
    "Bermuda/Bretelle",
    "Jaqueta Corta-Vento",
    "Meia",
    "Manguito/Pernito",
    "Luva",
  ],

  calcados: [
    "Sapatilha de Encaixe",
    "Sapatilha Speed",
    "Sapatilha MTB",
    "Tênis de Ciclismo",
    "Capa de Sapatilha",
  ],

  oculos: [
    "Óculos de Sol",
    "Óculos de Proteção",
    "Óculos Fotocromático",
    "Óculos com Lente Reserva",
  ],

  eletronicos: [
    "Ciclocomputador",
    "GPS",
    "Sensor de Cadência",
    "Sensor Cardíaco",
    "Câmera de Ação",
    "Suporte de Celular",
  ],

  iluminacao: [
    "Farol Dianteiro",
    "Lanterna Traseira",
    "Sinalizador",
    "Kit de Iluminação",
  ],

  seguranca: [
    "Cadeado U-Lock",
    "Cadeado de Cabo",
    "Cadeado Dobrável",
    "Alarme",
    "Rastreador GPS",
  ],

  hidratacao: [
    "Caramanhola",
    "Suporte de Caramanhola",
    "Mochila de Hidratação",
    "Reservatório de Água",
  ],

  bolsas: [
    "Bolsa de Selim",
    "Bolsa de Quadro",
    "Bolsa de Guidão",
    "Alforge",
    "Bagageiro",
  ],

  ferramentas: [
    "Multi-ferramenta",
    "Chave de Corrente",
    "Chave de Raio",
    "Bomba de Chão",
    "Bomba de Mão",
    "Kit de Reparo",
  ],

  protecao: [
    "Joelheira",
    "Cotoveleira",
    "Colete de Proteção",
    "Protetor de Coluna",
    "Coxim",
  ],
}

const TAMANHO_OPTIONS = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "Único",
] as const

/* ------------------------------------------------------------------ */
/* MODELO                                                              */
/* ------------------------------------------------------------------ */

type Answers = {
  subcategoryId: ProdutoCategoryId | ""
  tipo: string
  tamanho: string
}

const EMPTY_ANSWERS: Answers = {
  subcategoryId: "",
  tipo: "",
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

export default function PublicarProdutosPage() {
  const router = useRouter()

  const [answers, setAnswers] =
    useState<Answers>(EMPTY_ANSWERS)

  const [activeStep, setActiveStep] =
    useState(1)

  const selectedCategory =
    useMemo(
      () =>
        PRODUTO_CATEGORIES.find(
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
        title: "Categoria do produto",
        subtitle:
          "Qual o tipo de produto?",
        options:
          PRODUTO_CATEGORIES.map(
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
        title: "Tipo específico",
        subtitle: answers.subcategoryId
          ? `Produto da categoria ${
            selectedCategory?.label.toLowerCase() ??
            "produto"
          }`
          : "Escolha a categoria primeiro",
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
        key: "tamanho",
        title: "Tamanho",
        subtitle:
          "Tamanho do produto",
        options:
          TAMANHO_OPTIONS.map(
            (item) => ({
              id: item,
              label: item,
            })
          ),
        optional: true,
      },
    ],
    [
      answers.subcategoryId,
      selectedCategory,
    ]
  )

  const firstUnansweredIndex =
    steps.findIndex((step) => {
      if (step.optional) {
        return false
      }

      return !answers[step.key]
    })

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
      categoryId: "produtos",
      ...answers,
    }

    sessionStorage.setItem(
      "imperium_bikes_publish",
      JSON.stringify(updatedData)
    )

    router.push(
      "/publicar/produtos/informacoes"
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
          Produtos
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
            Caracterize seu produto
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
          aria-label="Classificação do produto"
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
                      {step.optional ? (
                        <em>
                          {" "}
                          — opcional
                        </em>
                      ) : null}
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
                  "Produtos",
                  selectedCategory?.label,
                  answers.tipo,
                  answers.tamanho,
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