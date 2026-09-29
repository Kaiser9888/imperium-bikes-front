"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* CATEGORIAS PRINCIPAIS                                               */
/* ------------------------------------------------------------------ */

const PECA_CATEGORIES = [
  {
    id: "transmissao",
    label: "Transmissão",
    description:
      "Câmbios, relação, pedivelas e movimentos centrais",
    categoryIds: [
      "transmissao-cambios",
      "transmissao-desgaste",
      "transmissao-pedivela-central",
    ],
  },
  {
    id: "freios",
    label: "Freios",
    description:
      "Freios dianteiros, traseiros, discos e pastilhas",
    categoryIds: [
      "freio-dianteiro",
      "freio-traseiro",
      "discos-rotores",
    ],
  },
  {
    id: "suspensao",
    label: "Suspensão",
    description:
      "Suspensões dianteiras e amortecedores traseiros",
    categoryIds: [
      "suspensao-single-crown",
      "suspensao-double-crown",
      "shock-traseiro",
    ],
  },
  {
    id: "rodas",
    label: "Rodas",
    description:
      "Pares, rodas avulsas, cubos, aros e raios",
    categoryIds: [
      "rodas-par",
      "rodas-avulsas",
      "cubos-avulsos",
      "aros-raios",
    ],
  },
  {
    id: "cockpit-direcao",
    label: "Cockpit e Direção",
    description:
      "Guidões, mesas, caixas de direção e espaçadores",
    categoryIds: ["cockpit"],
  },
  {
    id: "selim-canote",
    label: "Selim e Canote",
    description:
      "Selins, canotes e abraçadeiras",
    categoryIds: ["selim-canote"],
  },
  {
    id: "pedais",
    label: "Pedais",
    description:
      "Pedais de encaixe, plataforma e tacos",
    categoryIds: ["pedais"],
  },
  {
    id: "cabos-conduites",
    label: "Cabos e Conduítes",
    description:
      "Cabos, conduítes, capas e terminais",
    categoryIds: ["cabos-conduites"],
  },
] as const

/* ------------------------------------------------------------------ */
/* SUBCATEGORIAS                                                       */
/* ------------------------------------------------------------------ */

const PECA_SUBCATEGORIES = [
  {
    id: "transmissao-cambios",
    parentId: "transmissao",
    label: "Câmbios e Passadores",
    description:
      "Câmbios dianteiros, traseiros e passadores",
  },
  {
    id: "transmissao-desgaste",
    parentId: "transmissao",
    label: "Cassetes, Correntes e Coroas",
    description:
      "Cassetes, correntes e coroas",
  },
  {
    id: "transmissao-pedivela-central",
    parentId: "transmissao",
    label: "Pedivelas e Movimentos Centrais",
    description:
      "Pedivelas e movimentos centrais",
  },

  {
    id: "freio-dianteiro",
    parentId: "freios",
    label: "Freio Dianteiro",
    description:
      "Componentes e kits do freio dianteiro",
  },
  {
    id: "freio-traseiro",
    parentId: "freios",
    label: "Freio Traseiro",
    description:
      "Componentes e kits do freio traseiro",
  },
  {
    id: "discos-rotores",
    parentId: "freios",
    label: "Discos, Rotores e Pastilhas",
    description:
      "Discos, pastilhas e adaptadores",
  },

  {
    id: "suspensao-single-crown",
    parentId: "suspensao",
    label: "Single Crown",
    description:
      "Suspensões dianteiras de uma coroa",
  },
  {
    id: "suspensao-double-crown",
    parentId: "suspensao",
    label: "Double Crown",
    description:
      "Suspensões de duas coroas para Downhill",
  },
  {
    id: "shock-traseiro",
    parentId: "suspensao",
    label: "Shock Traseiro",
    description:
      "Amortecedores para Full Suspension",
  },

  {
    id: "rodas-par",
    parentId: "rodas",
    label: "Pares de Rodas",
    description:
      "Jogos de rodas completos",
  },
  {
    id: "rodas-avulsas",
    parentId: "rodas",
    label: "Rodas Avulsas",
    description:
      "Roda dianteira ou traseira",
  },
  {
    id: "cubos-avulsos",
    parentId: "rodas",
    label: "Cubos",
    description:
      "Cubos dianteiros e traseiros",
  },
  {
    id: "aros-raios",
    parentId: "rodas",
    label: "Aros e Raios",
    description:
      "Aros e kits de raios",
  },

  {
    id: "cockpit",
    parentId: "cockpit-direcao",
    label: "Cockpit",
    description:
      "Guidões, mesas, caixas de direção e espaçadores",
  },

  {
    id: "selim-canote",
    parentId: "selim-canote",
    label: "Selim e Canote",
    description:
      "Selins, canotes e abraçadeiras",
  },

  {
    id: "pedais",
    parentId: "pedais",
    label: "Pedais",
    description:
      "Pedais de encaixe, plataforma e tacos",
  },

  {
    id: "cabos-conduites",
    parentId: "cabos-conduites",
    label: "Cabos, Conduítes e Guias",
    description:
      "Cabos, conduítes, capas e terminais",
  },
] as const

type PecaSubcategoryId =
  (typeof PECA_SUBCATEGORIES)[number]["id"]

/* ------------------------------------------------------------------ */
/* TIPOS                                                               */
/* ------------------------------------------------------------------ */

const TIPOS_BY_CATEGORY: Record<
  PecaSubcategoryId,
  readonly string[]
> = {
  "transmissao-cambios": [
    "Câmbio Dianteiro",
    "Câmbio Traseiro",
    "Passador Dianteiro",
    "Passador Traseiro",
    "Kit Completo",
  ],

  "transmissao-desgaste": [
    "Cassete",
    "Corrente",
    "Coroa",
    "Kit Relação Completa",
  ],

  "transmissao-pedivela-central": [
    "Pedivela",
    "Movimento Central",
    "Kit Pedivela + Central",
  ],

  "freio-dianteiro": [
    "Kit Freio Dianteiro Completo",
    "Pinça Dianteira",
    "Manete Esquerda",
  ],

  "freio-traseiro": [
    "Kit Freio Traseiro Completo",
    "Pinça Traseira",
    "Manete Direita",
  ],

  "discos-rotores": [
    "Disco de Freio",
    "Pastilhas",
    "Adaptador de Pinça",
    "Kit Discos + Pastilhas",
  ],

  "suspensao-single-crown": [
    "Suspensão 100mm",
    "Suspensão 120mm",
    "Suspensão 140mm",
    "Suspensão 150mm+",
    "Suspensão 160mm+",
  ],

  "suspensao-double-crown": [
    "Suspensão Double Crown 200mm",
    "Suspensão Double Crown 180mm",
  ],

  "shock-traseiro": [
    "Shock a Ar",
    "Shock a Mola",
    "Shock Eletrônico",
  ],

  "rodas-par": [
    'Par de Rodas MTB 29"',
    'Par de Rodas MTB 27.5"',
    "Par de Rodas Speed 700c",
    "Par de Rodas Gravel 650b",
  ],

  "rodas-avulsas": [
    "Roda Dianteira",
    "Roda Traseira",
  ],

  "cubos-avulsos": [
    "Cubo Dianteiro",
    "Cubo Traseiro",
  ],

  "aros-raios": [
    'Aro MTB 29"',
    'Aro MTB 27.5"',
    "Aro Speed 700c",
    "Aro Gravel 650b",
    "Kit Raios e Niples",
  ],

  cockpit: [
    "Guidão MTB",
    "Guidão Speed",
    "Guidão Gravel",
    "Mesa/Avanço",
    "Caixa de Direção",
    "Espaçadores",
  ],

  "selim-canote": [
    "Selim",
    "Canote Rígido",
    "Canote Retrátil (Dropper)",
    "Abraçadeira de Quadro",
  ],

  pedais: [
    "Pedal de Encaixe (Clip)",
    "Pedal Plataforma",
    "Tacos de Sapatilha",
  ],

  "cabos-conduites": [
    "Cabo de Freio",
    "Cabo de Marcha",
    "Conduíte",
    "Capa de Cabo",
    "Terminal Protetor",
  ],
}

/* ------------------------------------------------------------------ */
/* OPÇÕES                                                              */
/* ------------------------------------------------------------------ */

const CONDICAO_OPTIONS = [
  {
    id: "novo",
    label: "Novo",
    description: "Nunca usado",
  },
  {
    id: "usado",
    label: "Usado",
    description: "Já foi utilizado",
  },
] as const

const COMPATIBILIDADE_OPTIONS = [
  "Shimano",
  "SRAM",
  "Campagnolo",
  "MicroSHIFT",
  "Universal",
  "Não se aplica",
] as const

/* ------------------------------------------------------------------ */
/* MODELO                                                              */
/* ------------------------------------------------------------------ */

type Answers = {
  subcategoryId: PecaSubcategoryId | ""
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

export default function PublicarPecasPage() {
  const router = useRouter()

  const [answers, setAnswers] =
    useState<Answers>(EMPTY_ANSWERS)

  const [activeStep, setActiveStep] =
    useState(1)

  const selectedSubcategory =
    useMemo(
      () =>
        PECA_SUBCATEGORIES.find(
          (item) =>
            item.id ===
            answers.subcategoryId
        ),
      [answers.subcategoryId]
    )

  const selectedParentCategory =
    useMemo(
      () =>
        PECA_CATEGORIES.find(
          (category) =>
            category.categoryIds.includes(
              answers.subcategoryId as never
            )
        ),
      [answers.subcategoryId]
    )

  const steps: Step[] = useMemo(
    () => [
      {
        key: "subcategoryId",
        title: "Categoria da peça",
        subtitle:
          "Escolha onde sua peça se encaixa",
        options:
          PECA_CATEGORIES.flatMap(
            (parent) =>
              PECA_SUBCATEGORIES.filter(
                (sub) =>
                  sub.parentId ===
                  parent.id
              ).map((sub) => ({
                id: sub.id,
                label: `${parent.label} · ${sub.label}`,
                description:
                sub.description,
              }))
          ),
      },

      {
        key: "tipo",
        title: "Tipo específico",
        subtitle: answers.subcategoryId
          ? `Escolha o tipo de ${
            selectedSubcategory?.label.toLowerCase() ??
            "peça"
          }`
          : "Escolha a categoria primeiro",
        options: answers.subcategoryId
          ? TIPOS_BY_CATEGORY[
            answers.subcategoryId
            ].map((tipo) => ({
            id: tipo,
            label: tipo,
          }))
          : [],
      },

      {
        key: "condicao",
        title: "Estado",
        subtitle:
          "Condição da peça",
        options:
          CONDICAO_OPTIONS.map(
            (item) => ({
              id: item.id,
              label: item.label,
              description:
              item.description,
            })
          ),
      },

      {
        key: "compatibilidade",
        title: "Compatibilidade",
        subtitle:
          "Fabricante ou padrão compatível",
        options:
          COMPATIBILIDADE_OPTIONS.map(
            (item) => ({
              id: item,
              label: item,
            })
          ),
      },
    ],
    [
      answers.subcategoryId,
      selectedSubcategory,
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

    if (stepNumber === 4) {
      return Boolean(
        answers.subcategoryId &&
        answers.tipo &&
        answers.condicao
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
      categoryId: "pecas",
      ...answers,
    }

    sessionStorage.setItem(
      "imperium_bikes_publish",
      JSON.stringify(updatedData)
    )

    router.push(
      "/publicar/pecas/informacoes"
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
          Peças
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
            Classifique sua peça
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

          {selectedSubcategory ? (
            <div className="classification-selection">
              <p className="summary-label">
                Categoria selecionada
              </p>

              <p className="summary-value">
                {selectedParentCategory?.label}
                {" · "}
                {selectedSubcategory.label}
              </p>

              <p className="field-note">
                {selectedSubcategory.description}
              </p>
            </div>
          ) : null}
        </section>

        <section
          className="steps-panel"
          aria-label="Classificação da peça"
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
                  "Peças",
                  selectedParentCategory?.label,
                  selectedSubcategory?.label,
                  answers.tipo,
                  CONDICAO_OPTIONS.find(
                    (item) =>
                      item.id ===
                      answers.condicao
                  )?.label,
                  answers.compatibilidade,
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