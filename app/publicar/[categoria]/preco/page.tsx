'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  X,
} from 'lucide-react'
import {
  clearDraft,
  getDraft,
  saveDraft,
} from '@/lib/publicar/storage'

function parseMoney(value: string): number {
  const cleaned = value
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')

  if (!cleaned) {
    return 0
  }

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

    const draft = getDraft(categoria)

    if (draft.preco) {
      const valorCentavos =
        draft.preco.valor_centavos

      if (
        typeof valorCentavos === 'number' &&
        valorCentavos > 0
      ) {
        setPreco(
          (valorCentavos / 100)
            .toFixed(2)
            .replace('.', ','),
        )
      }

      if (draft.preco.custos?.length) {
        const custosTexto =
          draft.preco.custos
            .map(
              (item) =>
                `${item.label}: ${money(
                  item.valor_centavos,
                )}`,
            )
            .join('\n')

        setCustos(custosTexto)
      }
    }
  }, [categoria])

  const valor = parseMoney(preco)

  function voltar() {
    router.push(
      `/publicar/${categoria}/frete`,
    )
  }

  function cancelar() {
    clearDraft(categoria)
    router.push('/publicar')
  }

  function continuar() {
    if (valor <= 0) {
      return
    }

    saveDraft(categoria, {
      preco: {
        valor_centavos: valor,
      },
    })

    router.push(
      `/publicar/${categoria}/destacar`,
    )
  }

  const nomeCategoria =
    categoria === 'bikes'
      ? 'Bicicleta'
      : categoria === 'pecas'
        ? 'Peças'
        : categoria === 'consumiveis'
          ? 'Consumíveis'
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
          Etapa 5 de 6
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
