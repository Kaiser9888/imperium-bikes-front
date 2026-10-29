'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatarPreco } from '@/lib/format'
import {
  PRECO_MINIMO_CENTAVOS,
  TAXA_PAGAMENTO_FIXA_CENTAVOS,
  TAXA_PAGAMENTO_PERCENTUAL,
  taxaPagamentoCentavos,
} from '@/lib/taxas'
import {
  ArrowRight,
  X,
} from 'lucide-react'
import {
  clearDraft,
  getDraft,
  saveDraft,
} from '@/lib/publicar/storage'

import { BackButton } from "@/components/ui/back-button"

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
  return formatarPreco(valueInCents / 100)
}

export default function PrecoPage() {
  const { categoria } = useParams<{
    categoria: string
  }>()

  const router = useRouter()

  const [preco, setPreco] = useState('')
  const [custos, setCustos] = useState('')
  // Serviço: null até escolher; true = depende de avaliação ("a partir de", combinado direto)
  const [aPartirDe, setAPartirDe] = useState<boolean | null>(null)
  const servico = categoria === 'servicos'
  // "Eu arco com o frete" (etapa anterior): até quanto o vendedor cobre, em centavos
  const [limiteFrete, setLimiteFrete] = useState(0)

  useEffect(() => {
    if (!categoria) {
      return
    }

    const draft = getDraft(categoria)

    if (draft.frete?.pagador === 'vendedor' && draft.frete.limite_frete_centavos) {
      setLimiteFrete(draft.frete.limite_frete_centavos)
    }

    if (draft.preco) {
      if (typeof draft.preco.a_partir_de === 'boolean') {
        setAPartirDe(draft.preco.a_partir_de)
      }

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
  const abaixoDoMinimo = valor > 0 && valor < PRECO_MINIMO_CENTAVOS
  const taxa = valor > 0 ? taxaPagamentoCentavos(valor) : 0
  const recebe = Math.max(valor - taxa, 0)
  // O frete coberto não pode passar do preço, senão a venda dá prejuízo
  const freteMaiorQuePreco = limiteFrete > 0 && valor > 0 && limiteFrete > recebe
  const combinadoDireto = servico && aPartirDe === true
  const bloqueado = valor <= 0 || abaixoDoMinimo || freteMaiorQuePreco || (servico && aPartirDe === null)

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
    if (bloqueado) {
      return
    }

    saveDraft(categoria, {
      preco: {
        valor_centavos: valor,
        a_partir_de: combinadoDireto,
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
              : categoria === 'esportes' ? 'Artigos esportivos' : categoria ?? 'Anúncio'

  return (
    <main className="publish-page">
      <header className="publish-header">
        <BackButton onClick={voltar} />

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
              width: '83%',
            }}
          />
        </div>

        <section className="publish-card publish-form">
          {servico && (
            <fieldset>
              <legend>O valor é fixo ou depende de avaliação?</legend>

              <div className="publish-options">
                {[
                  { id: false, label: 'Valor fixo', description: 'O cliente paga pelo site, com pagamento protegido.' },
                  { id: true, label: 'Depende de avaliação', description: 'Aparece "a partir de". Valor e pagamento combinados direto com o cliente.' },
                ].map(item => (
                  <button
                    type="button"
                    key={String(item.id)}
                    className={aPartirDe === item.id ? 'is-selected' : ''}
                    aria-pressed={aPartirDe === item.id}
                    onClick={() => setAPartirDe(item.id)}
                  >
                    <span>
                      <b>{item.label}</b>
                      <small>{item.description}</small>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <label>
            {combinadoDireto ? 'Valor a partir de' : servico ? 'Preço do serviço' : 'Preço de venda'}

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

          {abaixoDoMinimo && (
            <small role="alert">
              O preço mínimo é {money(PRECO_MINIMO_CENTAVOS)}.
            </small>
          )}

          {valor > 0 && !abaixoDoMinimo && combinadoDireto && (
            <small>
              Sem taxa: o cliente fala com você pelo chat e vocês combinam o valor final e o pagamento.
            </small>
          )}

          {valor > 0 && !abaixoDoMinimo && !combinadoDireto && (
            <>
              <div className="price-summary">
                <span>
                  Valor do anúncio
                </span>

                <b>
                  {money(valor)}
                </b>
              </div>

              <div className="price-summary">
                <span>
                  Taxa de pagamento ({String(TAXA_PAGAMENTO_PERCENTUAL).replace('.', ',')}% + {money(TAXA_PAGAMENTO_FIXA_CENTAVOS)})
                </span>

                <b>
                  − {money(taxa)}
                </b>
              </div>

              <div className="price-summary">
                <span>
                  Você recebe
                </span>

                <b>
                  {money(recebe)}
                </b>
              </div>

              <small>
                Descontado só quando vender.
              </small>
            </>
          )}

          {valor > 0 && !abaixoDoMinimo && limiteFrete > 0 && (
            <small role={freteMaiorQuePreco ? 'alert' : undefined}>
              {freteMaiorQuePreco
                ? `Você cobre até ${money(limiteFrete)} de frete, mais do que recebe pela venda. Aumente o preço ou volte e diminua o limite do frete.`
                : `Você cobre até ${money(limiteFrete)} de frete: no pior caso recebe ${money(recebe - limiteFrete)} (antes da comissão do destaque).`}
            </small>
          )}
        </section>
      </div>

      <footer className="publish-footer">
        <button
          type="button"
          disabled={bloqueado}
          onClick={continuar}
        >
          Continuar
          <ArrowRight />
        </button>
      </footer>
    </main>
  )
}
