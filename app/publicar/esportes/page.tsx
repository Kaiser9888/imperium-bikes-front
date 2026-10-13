"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { writeDraft } from "@/lib/publicar/categorias"
import { CATEGORIA_ESPORTES, OPCOES_ESPORTE, TIPOS_POR_ESPORTE } from "@/lib/publicar/taxonomia"

type Answers = { sport: string; tipo: string }

type Step = {
  key: keyof Answers
  title: string
  subtitle: string
  options: { id: string; label: string }[]
}

export default function PublicarEsportesPage() {
  const router = useRouter()

  const [answers, setAnswers] = useState<Answers>({ sport: "", tipo: "" })
  const [activeStep, setActiveStep] = useState(1)

  const esporte = OPCOES_ESPORTE.find((item) => item.value === answers.sport)

  const steps: Step[] = [
    {
      key: "sport",
      title: "Esporte",
      subtitle: "Para qual esporte é o produto?",
      options: OPCOES_ESPORTE.map((item) => ({ id: item.value, label: item.label })),
    },
    {
      key: "tipo",
      title: "Tipo de produto",
      subtitle: esporte ? `Produto de ${esporte.label.toLowerCase()}` : "Escolha o esporte primeiro",
      options: (TIPOS_POR_ESPORTE[answers.sport] ?? []).map((item) => ({ id: item, label: item })),
    },
  ]

  const allAnswered = Boolean(answers.sport && answers.tipo)

  // Cada etapa só abre depois da anterior respondida
  const isStepReady = (stepNumber: number) => stepNumber === 1 || Boolean(answers.sport)

  const handleSelect = (step: Step, optionId: string) => {
    setAnswers((current) =>
      step.key === "sport" ? { sport: optionId, tipo: "" } : { ...current, tipo: optionId },
    )
  }

  const handleContinue = () => {
    if (!allAnswered) return

    writeDraft(CATEGORIA_ESPORTES, { categoryId: CATEGORIA_ESPORTES, ...answers })
    router.push(`/publicar/${CATEGORIA_ESPORTES}/informacoes`)
  }

  return (
    <main className="imperium-page">
      <header className="imperium-header">
        <Link className="header-back" href="/publicar">
          Voltar
        </Link>

        <div className="brand-mark" aria-label="Imperium Bikes">
          IB
        </div>

        <div>
          <p className="eyebrow">Imperium Bikes</p>
          <p className="header-context">Publicar anúncio</p>
        </div>

        <span className="header-divider" aria-hidden="true" />

        <p className="header-category">Artigos esportivos</p>
      </header>

      <div className="classification-layout">
        <section className="classification-intro" aria-labelledby="page-title">
          <p className="eyebrow">Etapa 1 de 6</p>

          <h1 id="page-title">Caracterize seu produto</h1>

          <p>
            Escolha o esporte e o tipo de produto. É isso que coloca o anúncio na página certa para
            quem está procurando.
          </p>

          <div className="progress-line" aria-label="Etapa 1 de 6">
            <span className="progress-active" />
            <span />
          </div>

          {esporte ? (
            <div className="classification-selection">
              <p className="summary-label">Esporte selecionado</p>
              <p className="summary-value">{esporte.label}</p>
              <p className="field-note">O anúncio aparece na página de {esporte.label.toLowerCase()}.</p>
            </div>
          ) : null}
        </section>

        <section className="steps-panel" aria-label="Classificação do produto">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const active = activeStep === stepNumber
            const ready = isStepReady(stepNumber)
            const selected = step.options.find((option) => option.id === answers[step.key])

            return (
              <div
                key={step.key}
                className={`step-block ${active ? "step-block-active" : ""} ${ready ? "" : "step-block-locked"}`}
              >
                <button
                  type="button"
                  className="step-heading"
                  onClick={() => ready && setActiveStep(stepNumber)}
                  disabled={!ready}
                  aria-expanded={active}
                >
                  <span className="step-number">{String(stepNumber).padStart(2, "0")}</span>

                  <span className="step-heading-copy">
                    <strong>{step.title}</strong>
                    <small>{selected ? selected.label : step.subtitle}</small>
                  </span>

                  {selected ? <span className="step-status">Concluído</span> : null}
                </button>

                {active && ready ? (
                  <div className="step-content">
                    <p className="field-label">{step.title}</p>

                    <div className="choice-grid choice-grid-types">
                      {step.options.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          className={`choice-card ${answers[step.key] === option.id ? "choice-card-selected" : ""}`}
                          aria-pressed={answers[step.key] === option.id}
                          onClick={() => handleSelect(step, option.id)}
                        >
                          <span className="choice-card-label">{option.label}</span>
                        </button>
                      ))}
                    </div>

                    {stepNumber < steps.length ? (
                      <button
                        type="button"
                        className="text-action"
                        disabled={!answers[step.key]}
                        onClick={() => setActiveStep(stepNumber + 1)}
                      >
                        Continuar para {steps[stepNumber].title.toLowerCase()} <span aria-hidden="true">→</span>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </section>

        <aside className="classification-summary" aria-live="polite">
          <div>
            <p className="summary-label">Sua classificação</p>

            <p className={`summary-value ${answers.sport ? "" : "summary-placeholder"}`}>
              {[esporte?.label, answers.tipo].filter(Boolean).join(" · ") || "As escolhas aparecerão aqui"}
            </p>
          </div>

          <div className="summary-actions">
            <button type="button" className="secondary-action" onClick={() => router.push("/publicar")}>
              Cancelar anúncio
            </button>

            <button type="button" className="primary-action" disabled={!allAnswered} onClick={handleContinue}>
              Continuar
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
