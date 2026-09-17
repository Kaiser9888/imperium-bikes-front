'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type BikeType =
  | 'urbana'
  | 'mountain-bike'
  | 'estrada'
  | 'eletrica'
  | 'fixa'
  | ''

type Material =
  | 'aluminio'
  | 'carbono'
  | 'aco'
  | 'titanio'

type SaleFormat =
  | 'completa'
  | 'quadro'
  | ''

type WheelSize =
  | '20'
  | '24'
  | '26'
  | '27-5'
  | '29'
  | '700c'

type FrameSize =
  | 'pp'
  | 'p'
  | 'm'
  | 'g'
  | 'gg'

type SubModality =
  | 'passe'
  | 'cargo'
  | 'cross-country'
  | 'trail'
  | 'downhill'
  | 'enduro'
  | 'speed-race'
  | 'endurance'
  | 'gravel'
  | 'bmx'
  | 'dirt-jump'
  | 'pumptrack'
  | 'nao-se-aplica'
  | ''

type RearSuspensionType =
  | 'rigida'
  | 'hardtail'
  | 'full-suspension'
  | ''

type ShockStatus =
  | 'acompanha-shock'
  | 'sem-shock'
  | 'nao-se-aplica'
  | ''

type FormData = {
  bikeType: BikeType
  subModality: SubModality
  saleFormat: SaleFormat
  material: Material | ''
  wheelSize: WheelSize | ''
  frameSize: FrameSize | ''
  rearSuspensionType: RearSuspensionType
  shockStatus: ShockStatus
  shockMeasurementMM: string
}

const initialForm: FormData = {
  bikeType: '',
  subModality: '',
  saleFormat: '',
  material: '',
  wheelSize: '',
  frameSize: '',
  rearSuspensionType: '',
  shockStatus: '',
  shockMeasurementMM: '',
}

const bikeTypes: {
  id: Exclude<BikeType, ''>
  label: string
  description: string
}[] = [
  {
    id: 'urbana',
    label: 'Urbana',
    description: 'Para deslocamentos e cidade',
  },
  {
    id: 'mountain-bike',
    label: 'Mountain bike',
    description: 'Trilhas e terrenos irregulares',
  },
  {
    id: 'estrada',
    label: 'Estrada',
    description: 'Asfalto e longas distâncias',
  },
  {
    id: 'eletrica',
    label: 'Elétrica',
    description: 'Com assistência de motor',
  },
  {
    id: 'fixa',
    label: 'Fixa ou single speed',
    description: 'Transmissão simples',
  },
]

const subModalitiesByBikeType: Record<
  Exclude<BikeType, ''>,
  {
    id: Exclude<SubModality, ''>
    label: string
    description?: string
    isHighRisk?: boolean
  }[]
> = {
  urbana: [
    {
      id: 'passe',
      label: 'Passeio / Lazer',
      description: 'Uso recreativo e deslocamentos',
    },
    {
      id: 'cargo',
      label: 'Carga / Utilitária',
      description: 'Transporte de cargas e objetos',
    },
    {
      id: 'bmx',
      label: 'BMX',
      description: 'BMX, street e pistas',
    },
    {
      id: 'dirt-jump',
      label: 'Dirt Jump / Street',
      description: 'Saltos e uso urbano',
    },
    {
      id: 'pumptrack',
      label: 'Pump Track',
      description: 'Pistas de pump track',
    },
  ],

  'mountain-bike': [
    {
      id: 'cross-country',
      label: 'Cross Country (XC)',
      description: 'Trilhas e provas de XC',
    },
    {
      id: 'trail',
      label: 'Trail / All Mountain',
      description: 'Uso misto em trilhas',
    },
    {
      id: 'enduro',
      label: 'Enduro',
      description: 'Descidas técnicas e trilhas agressivas',
      isHighRisk: true,
    },
    {
      id: 'downhill',
      label: 'Downhill (DH)',
      description: 'Descidas e terrenos técnicos',
      isHighRisk: true,
    },
  ],

  estrada: [
    {
      id: 'speed-race',
      label: 'Speed / Performance',
      description: 'Competição e velocidade',
    },
    {
      id: 'endurance',
      label: 'Endurance',
      description: 'Longas distâncias e conforto',
    },
    {
      id: 'gravel',
      label: 'Gravel',
      description: 'Asfalto, terra e estradas mistas',
    },
  ],

  eletrica: [
    {
      id: 'passe',
      label: 'Urbana Elétrica',
      description: 'Mobilidade urbana com assistência',
    },
    {
      id: 'trail',
      label: 'E-MTB',
      description: 'Mountain bike elétrica',
    },
  ],

  fixa: [
    {
      id: 'nao-se-aplica',
      label: 'Fixa / Pista',
      description: 'Single speed e bicicletas de pista',
    },
  ],
}

const materials: {
  id: Material
  label: string
}[] = [
  {
    id: 'aluminio',
    label: 'Alumínio',
  },
  {
    id: 'carbono',
    label: 'Carbono',
  },
  {
    id: 'aco',
    label: 'Aço',
  },
  {
    id: 'titanio',
    label: 'Titânio',
  },
]

const wheelSizes: {
  id: WheelSize
  label: string
  hint: string
}[] = [
  {
    id: '20',
    label: '20”',
    hint: 'BMX / Infantil',
  },
  {
    id: '24',
    label: '24”',
    hint: 'Dirt / Juvenil',
  },
  {
    id: '26',
    label: '26”',
    hint: 'Compacto / Clássico',
  },
  {
    id: '27-5',
    label: '27,5”',
    hint: 'Versátil / Trail',
  },
  {
    id: '29',
    label: '29”',
    hint: 'Maior alcance / XC',
  },
  {
    id: '700c',
    label: '700c',
    hint: 'Estrada e urbana',
  },
]

const frameSizes: {
  id: FrameSize
  label: string
  hint: string
}[] = [
  {
    id: 'pp',
    label: 'PP',
    hint: 'Extra pequeno',
  },
  {
    id: 'p',
    label: 'P',
    hint: 'Pequeno',
  },
  {
    id: 'm',
    label: 'M',
    hint: 'Médio',
  },
  {
    id: 'g',
    label: 'G',
    hint: 'Grande',
  },
  {
    id: 'gg',
    label: 'GG',
    hint: 'Extra grande',
  },
]

const rearSuspensionTypes: {
  id: Exclude<RearSuspensionType, ''>
  label: string
  hint: string
}[] = [
  {
    id: 'rigida',
    label: 'Rígida',
    hint: 'Sem suspensão traseira',
  },
  {
    id: 'hardtail',
    label: 'Hardtail',
    hint: 'Suspensão dianteira',
  },
  {
    id: 'full-suspension',
    label: 'Full Suspension',
    hint: 'Suspensão dianteira e traseira',
  },
]

const shockStatuses: {
  id: Exclude<ShockStatus, ''>
  label: string
  hint: string
}[] = [
  {
    id: 'acompanha-shock',
    label: 'Acompanha o shock',
    hint: 'O amortecedor traseiro está incluso',
  },
  {
    id: 'sem-shock',
    label: 'Sem shock',
    hint: 'O comprador deverá adquirir o shock',
  },
]

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
  selected ? 'choice-card-selected' : ''
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

export default function BikesClassificationPage() {
  const router = useRouter()

  const [form, setForm] = useState<FormData>(
    initialForm
  )

  const [activeStep, setActiveStep] =
    useState(1)

  const stepTwoReady = Boolean(
    form.bikeType &&
    form.subModality
  )

  const stepThreeReady = Boolean(
    form.bikeType &&
    form.subModality &&
    form.saleFormat &&
    form.material
  )

  const complete = Boolean(
    stepThreeReady &&
    form.wheelSize &&
    form.frameSize
  )

  const selectedSubModality = useMemo(() => {
    if (
      !form.bikeType ||
      !form.subModality
    ) {
      return null
    }

    return subModalitiesByBikeType[
      form.bikeType
    ].find(
      (item) =>
        item.id === form.subModality
    )
  }, [
    form.bikeType,
    form.subModality,
  ])

  const summary = useMemo(() => {
    const type = bikeTypes.find(
      (item) =>
        item.id === form.bikeType
    )?.label

    const subModality =
      selectedSubModality?.label

    const material = materials.find(
      (item) =>
        item.id === form.material
    )?.label

    return [
      type,
      subModality,
      form.saleFormat === 'quadro'
        ? 'Somente quadro'
        : form.saleFormat === 'completa'
          ? 'Bike completa'
          : null,
      material,
      form.wheelSize
        ? `Aro ${form.wheelSize}`
        : null,
      form.frameSize
        ? `Tamanho ${form.frameSize.toUpperCase()}`
        : null,
    ]
      .filter(Boolean)
      .join(' · ')
  }, [
    form,
    selectedSubModality,
  ])

  function chooseType(
    bikeType: Exclude<BikeType, ''>
  ) {
    setForm((current) => ({
      ...current,
      bikeType,
      subModality: '',
      wheelSize: '',
      frameSize: '',
      rearSuspensionType: '',
      shockStatus: '',
      shockMeasurementMM: '',
    }))

    setActiveStep(1)
  }

  function chooseSubModality(
    subModality: Exclude<SubModality, ''>
  ) {
    setForm((current) => ({
      ...current,
      subModality,
      wheelSize: '',
      frameSize: '',
      rearSuspensionType: '',
      shockStatus: '',
      shockMeasurementMM: '',
    }))
  }

  function continueTo(step: number) {
    setActiveStep(step)
  }

  function handleSubmit() {
    if (!complete) {
      return
    }

    sessionStorage.setItem(
      'imperium_bikes_publish',
      JSON.stringify({
        categoryId: 'bikes',
        ...form,
      })
    )

    router.push(
      '/publicar/bikes/informacoes'
    )
  }

  function handleCancel() {
    router.push('/publicar')
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
          Bikes
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
            Classifique sua bike
          </h1>

          <p>
            Escolha as características principais
            para que seu anúncio seja encontrado
            com facilidade.
          </p>

          <div
            className="progress-line"
            aria-label="Etapa 1 de 5 concluída parcialmente"
          >
            <span className="progress-active" />
            <span />
          </div>
        </section>

        <section
          className="steps-panel"
          aria-label="Classificação do produto"
        >
          {/* ETAPA 01 */}

          <div
            className={`step-block ${
  activeStep === 1
    ? 'step-block-active'
    : ''
}`}
          >
            <button
              type="button"
              className="step-heading"
              onClick={() =>
                setActiveStep(1)
              }
              aria-expanded={
                activeStep === 1
              }
            >
              <span className="step-number">
                01
              </span>

              <span className="step-heading-copy">
                <strong>
                  Categoria da bike
                </strong>

                <small>
                  {form.bikeType
                    ? bikeTypes.find(
                        (item) =>
                          item.id ===
                          form.bikeType
                      )?.label
                    : 'Selecione uma modalidade'}

                  {selectedSubModality
                    ? ` · ${selectedSubModality.label}`
                    : ''}
                </small>
              </span>

              {form.bikeType &&
              form.subModality ? (
                <span className="step-status">
                  Concluído
                </span>
              ) : null}
            </button>

            {activeStep === 1 ? (
              <div className="step-content">
                <p className="field-label">
                  Modalidade
                </p>

                <div className="choice-grid choice-grid-types">
                  {bikeTypes.map(
                    (item) => (
                      <ChoiceCard
                        key={item.id}
                        selected={
                          form.bikeType ===
                          item.id
                        }
                        label={item.label}
                        description={
                          item.description
                        }
                        onClick={() =>
                          chooseType(
                            item.id
                          )
                        }
                      />
                    )
                  )}
                </div>

                {form.bikeType ? (
                  <>
                    <p className="field-label field-label-spaced">
                      Modalidade específica
                    </p>

                    <div className="choice-grid choice-grid-types">
                      {subModalitiesByBikeType[
                        form.bikeType
                      ].map(
                        (item) => (
                          <ChoiceCard
                            key={item.id}
                            selected={
                              form.subModality ===
                              item.id
                            }
                            label={
                              item.label
                            }
                            description={
                              item.description
                            }
                            onClick={() =>
                              chooseSubModality(
                                item.id
                              )
                            }
                          />
                        )
                      )}
                    </div>

                    {selectedSubModality?.isHighRisk ? (
                      <p className="field-note">
                        Esta modalidade exige
                        atenção especial às
                        características de
                        suspensão e componentes
                        nas próximas etapas.
                      </p>
                    ) : null}
                  </>
                ) : null}

                {stepTwoReady ? (
                  <button
                    type="button"
                    className="text-action"
                    onClick={() =>
                      continueTo(2)
                    }
                  >
                    Continuar para anúncio{' '}
                    <span aria-hidden="true">
                      →
                    </span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* ETAPA 02 */}

          <div
            className={`step-block ${
  activeStep === 2
    ? 'step-block-active'
    : ''
} ${
  !stepTwoReady
    ? 'step-block-locked'
    : ''
}`}
          >
            <button
              type="button"
              className="step-heading"
              onClick={() =>
                stepTwoReady &&
                setActiveStep(2)
              }
              aria-expanded={
                activeStep === 2
              }
              disabled={
                !stepTwoReady
              }
            >
              <span className="step-number">
                02
              </span>

              <span className="step-heading-copy">
                <strong>
                  O que está sendo vendido?
                </strong>

                <small>
                  {form.saleFormat
                    ? `${
  form.saleFormat ===
  'completa'
    ? 'Bike completa'
    : 'Somente quadro'
}${
  form.material
    ? ` · ${
      materials.find(
        (item) =>
          item.id ===
          form.material
      )?.label
    }`
    : ''
}`
                    : 'Defina o formato e o material'}
                </small>
              </span>

              {stepThreeReady ? (
                <span className="step-status">
                  Concluído
                </span>
              ) : null}
            </button>

            {activeStep === 2 &&
            stepTwoReady ? (
              <div className="step-content">
                <p className="field-label">
                  Anúncio
                </p>

                <div className="choice-grid choice-grid-format">
                  <ChoiceCard
                    selected={
                      form.saleFormat ===
                      'completa'
                    }
                    label="Bike completa"
                    description="Conjunto pronto para pedalar"
                    onClick={() =>
                      setForm(
                        (current) => ({
                          ...current,
                          saleFormat:
                            'completa',
                        })
                      )
                    }
                  />

                  <ChoiceCard
                    selected={
                      form.saleFormat ===
                      'quadro'
                    }
                    label="Somente quadro"
                    description="Sem componentes montados"
                    onClick={() =>
                      setForm(
                        (current) => ({
                          ...current,
                          saleFormat:
                            'quadro',
                        })
                      )
                    }
                  />
                </div>

                <p className="field-label field-label-spaced">
                  Material do quadro
                </p>

                <div className="choice-grid choice-grid-materials">
                  {materials.map(
                    (item) => (
                      <ChoiceCard
                        key={item.id}
                        selected={
                          form.material ===
                          item.id
                        }
                        label={item.label}
                        onClick={() =>
                          setForm(
                            (current) => ({
                              ...current,
                              material:
                                item.id,
                            })
                          )
                        }
                      />
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="text-action"
                  disabled={
                    !form.saleFormat ||
                    !form.material
                  }
                  onClick={() =>
                    continueTo(3)
                  }
                >
                  Continuar para medidas{' '}
                  <span aria-hidden="true">
                    →
                  </span>
                </button>
              </div>
            ) : null}
          </div>

          {/* ETAPA 03 */}

          <div
            className={`step-block ${
  activeStep === 3
    ? 'step-block-active'
    : ''
} ${
  !stepThreeReady
    ? 'step-block-locked'
    : ''
}`}
          >
            <button
              type="button"
              className="step-heading"
              onClick={() =>
                stepThreeReady &&
                setActiveStep(3)
              }
              aria-expanded={
                activeStep === 3
              }
              disabled={
                !stepThreeReady
              }
            >
              <span className="step-number">
                03
              </span>

              <span className="step-heading-copy">
                <strong>
                  Medidas
                </strong>

                <small>
                  {form.wheelSize &&
                  form.frameSize
                    ? `Aro ${form.wheelSize} · Tamanho ${form.frameSize.toUpperCase()}`
                    : 'Aro e tamanho do quadro'}
                </small>
              </span>
            </button>

            {activeStep === 3 &&
            stepThreeReady ? (
              <div className="step-content">
                <p className="field-label">
                  Aro
                </p>

                <div className="choice-grid choice-grid-sizes">
                  {wheelSizes.map(
                    (item) => (
                      <ChoiceCard
                        key={item.id}
                        selected={
                          form.wheelSize ===
                          item.id
                        }
                        label={item.label}
                        description={
                          item.hint
                        }
                        onClick={() =>
                          setForm(
                            (current) => ({
                              ...current,
                              wheelSize:
                                item.id,
                            })
                          )
                        }
                      />
                    )
                  )}
                </div>

                <p className="field-label field-label-spaced">
                  Tamanho do quadro
                </p>

                <div className="choice-grid choice-grid-sizes">
                  {frameSizes.map(
                    (item) => (
                      <ChoiceCard
                        key={item.id}
                        selected={
                          form.frameSize ===
                          item.id
                        }
                        label={item.label}
                        description={
                          item.hint
                        }
                        onClick={() =>
                          setForm(
                            (current) => ({
                              ...current,
                              frameSize:
                                item.id,
                            })
                          )
                        }
                      />
                    )
                  )}
                </div>

                {selectedSubModality?.isHighRisk ? (
                  <>
                    <p className="field-label field-label-spaced">
                      Suspensão traseira
                    </p>

                    <div className="choice-grid choice-grid-types">
                      {rearSuspensionTypes.map(
                        (item) => (
                          <ChoiceCard
                            key={item.id}
                            selected={
                              form.rearSuspensionType ===
                              item.id
                            }
                            label={
                              item.label
                            }
                            description={
                              item.hint
                            }
                            onClick={() =>
                              setForm(
                                (current) => ({
                                  ...current,
                                  rearSuspensionType:
                                    item.id,
                                  shockStatus:
                                    item.id ===
                                    'full-suspension'
                                      ? current.shockStatus
                                      : 'nao-se-aplica',
                                })
                              )
                            }
                          />
                        )
                      )}
                    </div>

                    {form.rearSuspensionType ===
                    'full-suspension' ? (
                      <>
                        <p className="field-label field-label-spaced">
                          Shock traseiro
                        </p>

                        <div className="choice-grid choice-grid-format">
                          {shockStatuses.map(
                            (item) => (
                              <ChoiceCard
                                key={item.id}
                                selected={
                                  form.shockStatus ===
                                  item.id
                                }
                                label={
                                  item.label
                                }
                                description={
                                  item.hint
                                }
                                onClick={() =>
                                  setForm(
                                    (current) => ({
                                      ...current,
                                      shockStatus:
                                        item.id,
                                    })
                                  )
                                }
                              />
                            )
                          )}
                        </div>

                        {form.shockStatus ===
                        'acompanha-shock' ? (
                          <div className="field-group">
                            <label
                              className="field-label"
                              htmlFor="shockMeasurementMM"
                            >
                              Medida do shock
                              (mm)
                            </label>

                            <input
                              id="shockMeasurementMM"
                              type="number"
                              min="1"
                              inputMode="numeric"
                              placeholder="Ex.: 210"
                              value={
                                form.shockMeasurementMM
                              }
                              onChange={(event) =>
                                setForm(
                                  (current) => ({
                                    ...current,
                                    shockMeasurementMM:
                                      event.target
                                        .value,
                                  })
                                )
                              }
                            />
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
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
  summary
    ? ''
    : 'summary-placeholder'
}`}
            >
              {summary ||
                'As escolhas aparecerão aqui'}
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
              disabled={!complete}
              onClick={handleSubmit}
            >
              Continuar
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
