'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'

const pagadores = [
  {
    id: 'vendedor',
    label: 'Eu arco com o frete',
    description:
      'O custo é descontado de mim após a venda.',
  },
  {
    id: 'comprador',
    label: 'Comprador paga o frete',
    description:
      'O frete é somado ao valor da compra.',
  },
  {
    id: 'retirada',
    label: 'Retirada no local',
    description:
      'Combine a retirada diretamente com o comprador.',
  },
]

type PublishDraft = {
  categoryId?: string

  bikeType?: string
  subModality?: string
  saleFormat?: string
  material?: string
  wheelSize?: string
  frameSize?: string
  rearSuspensionType?: string
  shockStatus?: string
  shockMeasurementMM?: string

  titulo?: string
  descricao?: string
  condicao?: string

  title?: string
  description?: string
  condition?: string

  fotos?: string[]

  cep?: string
  peso?: string
  dimensoes?: string
  pagador?: string

  preco?: number
  precoTexto?: string
  custosTexto?: string

  nivel?: string
}

const STORAGE_KEY = 'imperium_bikes_publish'

export default function FretePage() {
  const { categoria } = useParams<{
    categoria: string
  }>()

  const router = useRouter()

  const [cep, setCep] = useState('')
  const [peso, setPeso] = useState('')
  const [dimensoes, setDimensoes] = useState('')
  const [pagador, setPagador] = useState('')

  useEffect(() => {
    if (!categoria) {
      return
    }

    try {
      const saved = sessionStorage.getItem(
        STORAGE_KEY,
      )

      if (!saved) {
        return
      }

      const draft = JSON.parse(saved) as PublishDraft

      setCep(
        typeof draft.cep === 'string'
          ? draft.cep
          : '',
      )

      setPeso(
        typeof draft.peso === 'string'
          ? draft.peso
          : '',
      )

      setDimensoes(
        typeof draft.dimensoes === 'string'
          ? draft.dimensoes
          : '',
      )

      setPagador(
        typeof draft.pagador === 'string'
          ? draft.pagador
          : '',
      )
    } catch {
      setCep('')
      setPeso('')
      setDimensoes('')
      setPagador('')
    }
  }, [categoria])

  const pronto =
    cep.replace(/\D/g, '').length === 8 &&
    Number(peso) > 0 &&
    dimensoes.trim().length > 0 &&
    Boolean(pagador)

  function voltar() {
    router.push(
      `/publicar/${categoria}/fotos`,
    )
  }

  function cancelar() {
    sessionStorage.removeItem(STORAGE_KEY)
    router.push('/publicar')
  }

  function continuar() {
    if (!pronto) {
      return
    }

    try {
      const saved = sessionStorage.getItem(
        STORAGE_KEY,
      )

      const current: PublishDraft = saved
        ? (JSON.parse(saved) as PublishDraft)
        : {}

      const updated: PublishDraft = {
        ...current,

        categoryId:
          current.categoryId ?? categoria,

        cep,
        peso,
        dimensoes,
        pagador,
      }

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated),
      )

      router.push(
        `/publicar/${categoria}/preco`,
      )
    } catch {
      return
    }
  }

  const nomeCategoria =
    categoria === 'bikes'
      ? 'Bicicleta'
      : categoria === 'pecas'
        ? 'Peças'
        : categoria === 'servicos'
          ? 'Serviços'
          : categoria === 'produtos'
            ? 'Produtos'
            : categoria ?? 'Anúncio'

  return (
    <main className="publish-page">
      <header className="publish-header">
        <button
          type="button"
          onClick={voltar}
          className="publish-back"
        >
          <ArrowLeft />
          Voltar
        </button>

        <strong>
          {nomeCategoria}
        </strong>

        <button
          type="button"
          onClick={cancelar}
          className="publish-cancel"
        >
          <X />
          Cancelar
        </button>
      </header>

      <div className="publish-shell">
        <p className="publish-kicker">
          Etapa 4 de 5
        </p>

        <h1>
          Frete e entrega
        </h1>

        <p className="publish-lead">
          Informe o local de envio e os dados
          básicos da embalagem.
        </p>

        <div className="publish-progress">
          <span
            style={{
              width: '60%',
            }}
          />
        </div>

        <section className="publish-card publish-form">
          <label>
            CEP de origem

            <input
              inputMode="numeric"
              value={cep}
              onChange={(event) =>
                setCep(
                  event.target.value
                    .replace(/[^0-9]/g, '')
                    .slice(0, 8),
                )
              }
              placeholder="00000-000"
            />

            <small>
              Usaremos este local para calcular o
              envio.
            </small>
          </label>

          <div className="form-row">
            <label>
              Peso (g)

              <input
                inputMode="numeric"
                value={peso}
                onChange={(event) =>
                  setPeso(
                    event.target.value.replace(
                      /[^0-9]/g,
                      '',
                    ),
                  )
                }
                placeholder="Ex.: 12000"
              />
            </label>

            <label>
              Dimensões (cm)

              <input
                value={dimensoes}
                onChange={(event) =>
                  setDimensoes(
                    event.target.value,
                  )
                }
                placeholder="A x L x C"
              />
            </label>
          </div>

          <fieldset>
            <legend>
              Quem paga o frete?
            </legend>

            <div className="publish-options">
              {pagadores.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    pagador === item.id
                      ? 'is-selected'
                      : ''
                  }
                  onClick={() =>
                    setPagador(item.id)
                  }
                >
                  <span>
                    <b>
                      {item.label}
                    </b>

                    <small>
                      {item.description}
                    </small>
                  </span>

                  {pagador === item.id && (
                    <Check />
                  )}
                </button>
              ))}
            </div>
          </fieldset>
        </section>
      </div>

      <footer className="publish-footer">
        <button
          type="button"
          disabled={!pronto}
          onClick={continuar}
        >
          Continuar
          <ArrowRight />
        </button>
      </footer>
    </main>
  )
}