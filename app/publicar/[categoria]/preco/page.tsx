'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  X,
} from 'lucide-react'

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

function parseMoney(value: string): number {
  const cleaned = value
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')

  if (!cleaned) {
    return 0
  }

  /*
   * Aceita formatos como:
   * 1000
   * 1000,50
   * 1.000,50
   * 1000.50
   */
  let normalized = cleaned

  if (
    normalized.includes(',') &&
    normalized.includes('.')
  ) {
    normalized = normalized
      .replace(/\./g, '')
      .replace(',', '.')
  } else if (
    normalized.includes(',')
  ) {
    normalized = normalized.replace(
      ',',
      '.',
    )
  }

  const number = Number(
    normalized.replace(/[^0-9.]/g, ''),
  )

  if (!Number.isFinite(number)) {
    return 0
  }

  return Math.round(number * 100)
}

function money(valueInCents: number): string {
  return new Intl.NumberFormat(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  ).format(valueInCents / 100)
}

export default function PrecoPage() {
  const { categoria } = useParams<{
    categoria: string
  }>()

  const router = useRouter()

  const [preco, setPreco] = useState('')
  const [custos, setCustos] = useState('')

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

      if (
        typeof draft.precoTexto ===
        'string'
      ) {
        setPreco(draft.precoTexto)
      } else if (
        typeof draft.preco === 'number'
      ) {
        setPreco(
          (draft.preco / 100)
            .toFixed(2)
            .replace('.', ','),
        )
      }

      if (
        typeof draft.custosTexto ===
        'string'
      ) {
        setCustos(
          draft.custosTexto,
        )
      }
    } catch {
      setPreco('')
      setCustos('')
    }
  }, [categoria])

  const valor = parseMoney(preco)

  function voltar() {
    router.push(
      `/publicar/${categoria}/frete`,
    )
  }

  function cancelar() {
    sessionStorage.removeItem(STORAGE_KEY)
    router.push('/publicar')
  }

  function continuar() {
    if (valor <= 0) {
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

        preco: valor,
        precoTexto: preco,
        custosTexto: custos,
      }

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated),
      )

      router.push(
        `/publicar/${categoria}/destacar`,
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
          Etapa 5 de 5
        </p>

        <h1>
          Preço do anúncio
        </h1>

        <p className="publish-lead">
          Defina um valor claro para o comprador.
        </p>

        <div className="publish-progress">
          <span
            style={{
              width: '80%',
            }}
          />
        </div>

        <section className="publish-card publish-form">
          <label>
            Preço de venda

            <div className="money-input">
              <span>
                R$
              </span>

              <input
                inputMode="decimal"
                value={preco}
                onChange={(event) =>
                  setPreco(
                    event.target.value,
                  )
                }
                placeholder="0,00"
              />
            </div>
          </label>

          <label>
            Observação de custos

            <span className="optional">
              Opcional
            </span>

            <textarea
              value={custos}
              onChange={(event) =>
                setCustos(
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Use este espaço apenas para sua referência. Não será exibido ao comprador."
            />
          </label>

          {valor > 0 && (
            <div className="price-summary">
              <span>
                Valor do anúncio
              </span>

              <b>
                {money(valor)}
              </b>
            </div>
          )}
        </section>
      </div>

      <footer className="publish-footer">
        <button
          type="button"
          disabled={valor <= 0}
          onClick={continuar}
        >
          Continuar
          <ArrowRight />
        </button>
      </footer>
    </main>
  )
}