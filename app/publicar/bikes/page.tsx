'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type BikeType = 'urbana' | 'mountain-bike' | 'estrada' | 'eletrica' | 'fixa' | ''
type Material = 'aluminio' | 'carbono' | 'aco' | 'titanio'
type SaleFormat = 'completa' | 'quadro'
type WheelSize = '26' | '27-5' | '29' | '700c'
type FrameSize = 'pp' | 'p' | 'm' | 'g' | 'gg'

type FormData = {
  bikeType: BikeType | ''
  saleFormat: SaleFormat | ''
  material: Material | ''
  wheelSize: WheelSize | ''
  frameSize: FrameSize | ''
}

const initialForm: FormData = {
  bikeType: '',
  saleFormat: '',
  material: '',
  wheelSize: '',
  frameSize: '',
}

const bikeTypes: { id: BikeType; label: string; description: string }[] = [
  { id: 'urbana', label: 'Urbana', description: 'Para deslocamentos e cidade' },
  { id: 'mountain-bike', label: 'Mountain bike', description: 'Trilhas e terrenos irregulares' },
  { id: 'estrada', label: 'Estrada', description: 'Asfalto e longas distâncias' },
  { id: 'eletrica', label: 'Elétrica', description: 'Com assistência de motor' },
  { id: 'fixa', label: 'Fixa ou single speed', description: 'Transmissão simples' },
]

const materials: { id: Material; label: string }[] = [
  { id: 'aluminio', label: 'Alumínio' },
  { id: 'carbono', label: 'Carbono' },
  { id: 'aco', label: 'Aço' },
  { id: 'titanio', label: 'Titânio' },
]

const wheelSizes: { id: WheelSize; label: string; hint: string }[] = [
  { id: '26', label: '26”', hint: 'Compacto' },
  { id: '27-5', label: '27,5”', hint: 'Versátil' },
  { id: '29', label: '29”', hint: 'Maior alcance' },
  { id: '700c', label: '700c', hint: 'Estrada e urbana' },
]

const frameSizes: { id: FrameSize; label: string; hint: string }[] = [
  { id: 'pp', label: 'PP', hint: 'Extra pequeno' },
  { id: 'p', label: 'P', hint: 'Pequeno' },
  { id: 'm', label: 'M', hint: 'Médio' },
  { id: 'g', label: 'G', hint: 'Grande' },
  { id: 'gg', label: 'GG', hint: 'Extra grande' },
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
      className={`choice-card ${selected ? 'choice-card-selected' : ''}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="choice-card-label">{label}</span>
      {description ? <span className="choice-card-description">{description}</span> : null}
    </button>
  )
}

export default function BikesClassificationPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initialForm)
  const [activeStep, setActiveStep] = useState(1)

  const stepTwoReady = Boolean(form.bikeType)
  const stepThreeReady = Boolean(form.bikeType && form.saleFormat && form.material)
  const complete = Boolean(stepThreeReady && form.wheelSize && form.frameSize)

  const summary = useMemo(() => {
    const type = bikeTypes.find((item) => item.id === form.bikeType)?.label
    const material = materials.find((item) => item.id === form.material)?.label
    return [type, form.saleFormat === 'quadro' ? 'Quadro' : form.saleFormat === 'completa' ? 'Bike completa' : null, material, form.wheelSize ? `${form.wheelSize}”` : null, form.frameSize?.toUpperCase()].filter(Boolean).join(' · ')
  }, [form])

  function chooseType(bikeType: BikeType) {
    setForm((current) => ({ ...current, bikeType, wheelSize: '', frameSize: '' }))
    setActiveStep(2)
  }

  function continueTo(step: number) {
    setActiveStep(step)
  }

  function handleSubmit() {
    if (!complete) return
    sessionStorage.setItem('imperium_bikes_publish', JSON.stringify({ categoryId: 'bikes', ...form }))
    router.push('/publicar/bikes/informacoes')
  }

  return (
    <main className="imperium-page">
      <header className="imperium-header">
        <div className="brand-mark" aria-label="Imperium Bikes">IB</div>
        <div>
          <p className="eyebrow">Imperium Bikes</p>
          <p className="header-context">Publicar anúncio</p>
        </div>
        <span className="header-divider" aria-hidden="true" />
        <p className="header-category">Bikes</p>
      </header>

      <div className="classification-layout">
        <section className="classification-intro" aria-labelledby="page-title">
          <p className="eyebrow">Etapa 1 de 5</p>
          <h1 id="page-title">Classifique sua bike</h1>
          <p>Escolha as características principais para que seu anúncio seja encontrado com facilidade.</p>
          <div className="progress-line" aria-label="Etapa 1 de 5 concluída parcialmente">
            <span className="progress-active" />
            <span />
          </div>
        </section>

        <section className="steps-panel" aria-label="Classificação do produto">
          <div className={`step-block ${activeStep === 1 ? 'step-block-active' : ''}`}>
            <button type="button" className="step-heading" onClick={() => setActiveStep(1)} aria-expanded={activeStep === 1}>
              <span className="step-number">01</span>
              <span className="step-heading-copy"><strong>Categoria da bike</strong><small>{form.bikeType ? bikeTypes.find((item) => item.id === form.bikeType)?.label : 'Selecione uma modalidade'}</small></span>
              {form.bikeType ? <span className="step-status">Concluído</span> : null}
            </button>
            {activeStep === 1 ? <div className="step-content">
              <p className="field-label">Modalidade</p>
              <div className="choice-grid choice-grid-types">
                {bikeTypes.map((item) => <ChoiceCard key={item.id} selected={form.bikeType === item.id} label={item.label} description={item.description} onClick={() => chooseType(item.id)} />)}
              </div>
            </div> : null}
          </div>

          <div className={`step-block ${activeStep === 2 ? 'step-block-active' : ''} ${!stepTwoReady ? 'step-block-locked' : ''}`}>
            <button type="button" className="step-heading" onClick={() => stepTwoReady && setActiveStep(2)} aria-expanded={activeStep === 2} disabled={!stepTwoReady}>
              <span className="step-number">02</span>
              <span className="step-heading-copy"><strong>O que está sendo vendido?</strong><small>{form.saleFormat ? `${form.saleFormat === 'completa' ? 'Bike completa' : 'Quadro'}${form.material ? ` · ${materials.find((item) => item.id === form.material)?.label}` : ''}` : 'Defina o formato e o material'}</small></span>
              {stepThreeReady ? <span className="step-status">Concluído</span> : null}
            </button>
            {activeStep === 2 && stepTwoReady ? <div className="step-content">
              <p className="field-label">Anúncio</p>
              <div className="choice-grid choice-grid-format">
                <ChoiceCard selected={form.saleFormat === 'completa'} label="Bike completa" description="Conjunto pronto para pedalar" onClick={() => setForm((current) => ({ ...current, saleFormat: 'completa' }))} />
                <ChoiceCard selected={form.saleFormat === 'quadro'} label="Somente quadro" description="Sem componentes montados" onClick={() => setForm((current) => ({ ...current, saleFormat: 'quadro' }))} />
              </div>
              <p className="field-label field-label-spaced">Material do quadro</p>
              <div className="choice-grid choice-grid-materials">
                {materials.map((item) => <ChoiceCard key={item.id} selected={form.material === item.id} label={item.label} onClick={() => setForm((current) => ({ ...current, material: item.id }))} />)}
              </div>
              <button type="button" className="text-action" disabled={!form.saleFormat || !form.material} onClick={() => continueTo(3)}>Continuar para medidas <span aria-hidden="true">→</span></button>
            </div> : null}
          </div>

          <div className={`step-block ${activeStep === 3 ? 'step-block-active' : ''} ${!stepThreeReady ? 'step-block-locked' : ''}`}>
            <button type="button" className="step-heading" onClick={() => stepThreeReady && setActiveStep(3)} aria-expanded={activeStep === 3} disabled={!stepThreeReady}>
              <span className="step-number">03</span>
              <span className="step-heading-copy"><strong>Medidas</strong><small>{form.wheelSize && form.frameSize ? `Aro ${form.wheelSize} · Tamanho ${form.frameSize.toUpperCase()}` : 'Aro e tamanho do quadro'}</small></span>
            </button>
            {activeStep === 3 && stepThreeReady ? <div className="step-content">
              <p className="field-label">Aro</p>
              <div className="choice-grid choice-grid-sizes">
                {wheelSizes.map((item) => <ChoiceCard key={item.id} selected={form.wheelSize === item.id} label={item.label} description={item.hint} onClick={() => setForm((current) => ({ ...current, wheelSize: item.id }))} />)}
              </div>
              <p className="field-label field-label-spaced">Tamanho do quadro</p>
              <div className="choice-grid choice-grid-sizes">
                {frameSizes.map((item) => <ChoiceCard key={item.id} selected={form.frameSize === item.id} label={item.label} description={item.hint} onClick={() => setForm((current) => ({ ...current, frameSize: item.id }))} />)}
              </div>
            </div> : null}
          </div>
        </section>

        <aside className="classification-summary" aria-live="polite">
          <div>
            <p className="summary-label">Sua classificação</p>
            <p className={`summary-value ${summary ? '' : 'summary-placeholder'}`}>{summary || 'As escolhas aparecerão aqui'}</p>
          </div>
          <button type="button" className="primary-action" disabled={!complete} onClick={handleSubmit}>Continuar</button>
        </aside>
      </div>
    </main>
  )
}
