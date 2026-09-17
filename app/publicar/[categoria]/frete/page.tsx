'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import {
  clearDraft,
  getDraft,
  saveDraft,
} from '@/lib/publicar/storage'

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
    id: 'retirada_local',
    label: 'Retirada no local',
    description:
      'Combine a retirada diretamente com o comprador.',
  },
]

function parseDimensoes(value: string) {
  const numeros = value
    .replace(/,/g, '.')
    .split(/[xX×]/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item))

  return {
    altura_cm: numeros[0] ?? 0,
    largura_cm: numeros[1] ?? 0,
    comprimento_cm: numeros[2] ?? 0,
  }
}

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

    const draft = getDraft(categoria)
    const frete = draft.frete

    if (!frete) {
      return
    }

    setCep(
      frete.localizacao?.cep ?? '',
    )

    setPeso(
      frete.peso_g
        ? String(frete.peso_g)
        : '',
    )

    const dimensoesSalvas = [
      frete.altura_cm,
      frete.largura_cm,
      frete.comprimento_cm,
    ]

    if (
      dimensoesSalvas.every(
        (valor) =>
          typeof valor === 'number' &&
          valor > 0,
      )
    ) {
      setDimensoes(
        dimensoesSalvas.join(' x '),
      )
    }

    setPagador(
      frete.pagador ?? '',
    )
  }, [categoria])

  const dimensoesParsed =
    parseDimensoes(dimensoes)

  const pronto =
    cep.replace(/\D/g, '').length === 8 &&
    Number(peso) > 0 &&
    dimensoesParsed.altura_cm > 0 &&
    dimensoesParsed.largura_cm > 0 &&
    dimensoesParsed.comprimento_cm > 0 &&
    Boolean(pagador)

  function voltar() {
    router.push(
      `/publicar/${categoria}/fotos`,
    )
  }

  function cancelar() {
    clearDraft(categoria)
    router.push('/publicar')
  }

  function continuar() {
    if (!pronto) {
      return
    }

    const dimensoes = parseDimensoes(
      dimensoesInput(),
    )

    saveDraft(categoria, {
      frete: {
        localizacao: {
          endereco: '',
          cidade: '',
          estado: '',
          cep: cep.replace(/\D/g, ''),
        },
        peso_g: Number(peso),
        altura_cm: dimensoes.altura_cm,
        largura_cm: dimensoes.largura_cm,
        comprimento_cm: dimensoes.comprimento_cm,
        pagador:
          pagador === 'retirada_local'
            ? 'retirada_local'
            : pagador === 'vendedor'
              ? 'vendedor'
              : 'comprador',
      },
    })

    router.push(
      `/publicar/${categoria}/preco`,
    )
  }

  function dimensoesInput() {
    return dimensoes.trim()
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
          Etapa 3 de 5
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