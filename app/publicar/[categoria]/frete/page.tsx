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
] as const

interface CepResponse {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

export default function FretePage() {
  const { categoria } = useParams<{
    categoria: string
  }>()

  const router = useRouter()

  const [cep, setCep] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [endereco, setEndereco] = useState('')

  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [largura, setLargura] = useState('')
  const [comprimento, setComprimento] = useState('')

  const [pagador, setPagador] = useState('')

  const [consultandoCep, setConsultandoCep] = useState(false)
  const [erroCep, setErroCep] = useState('')

  useEffect(() => {
    if (!categoria) {
      return
    }

    const draft = getDraft(categoria)
    const frete = draft.frete

    if (!frete) {
      return
    }

    setCep(frete.localizacao?.cep ?? '')
    setCidade(frete.localizacao?.cidade ?? '')
    setEstado(frete.localizacao?.estado ?? '')
    setEndereco(frete.localizacao?.endereco ?? '')

    setPeso(
      frete.peso_g
        ? String(frete.peso_g)
        : '',
    )

    setAltura(
      frete.altura_cm
        ? String(frete.altura_cm)
        : '',
    )

    setLargura(
      frete.largura_cm
        ? String(frete.largura_cm)
        : '',
    )

    setComprimento(
      frete.comprimento_cm
        ? String(frete.comprimento_cm)
        : '',
    )

    setPagador(frete.pagador ?? '')
  }, [categoria])

  useEffect(() => {
    const cepNumerico = cep.replace(/\D/g, '')

    if (cepNumerico.length !== 8) {
      setCidade('')
      setEstado('')
      setEndereco('')
      setErroCep('')
      return
    }

    let cancelado = false

    async function consultarCep() {
      setConsultandoCep(true)
      setErroCep('')

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepNumerico}/json/`,
        )

        if (!response.ok) {
          throw new Error(
            'Não foi possível consultar o CEP.',
          )
        }

        const data =
          (await response.json()) as CepResponse

        if (cancelado) {
          return
        }

        if (data.erro) {
          setCidade('')
          setEstado('')
          setEndereco('')
          setErroCep('CEP não encontrado.')
          return
        }

        setEndereco(data.logradouro ?? '')
        setCidade(data.localidade ?? '')
        setEstado(data.uf ?? '')
      } catch {
        if (!cancelado) {
          setCidade('')
          setEstado('')
          setEndereco('')
          setErroCep(
            'Não foi possível consultar o CEP agora.',
          )
        }
      } finally {
        if (!cancelado) {
          setConsultandoCep(false)
        }
      }
    }

    consultarCep()

    return () => {
      cancelado = true
    }
  }, [cep])

  const cepNumerico =
    cep.replace(/\D/g, '')

  const pesoNumerico = Number(peso)
  const alturaNumerica = Number(altura)
  const larguraNumerica = Number(largura)
  const comprimentoNumerico = Number(comprimento)

  const pronto =
    cepNumerico.length === 8 &&
    Boolean(cidade) &&
    Boolean(estado) &&
    pesoNumerico > 0 &&
    alturaNumerica > 0 &&
    larguraNumerica > 0 &&
    comprimentoNumerico > 0 &&
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

    saveDraft(categoria, {
      frete: {
        localizacao: {
          endereco,
          cidade,
          estado,
          cep: cepNumerico,
        },
        peso_g: pesoNumerico,
        altura_cm: alturaNumerica,
        largura_cm: larguraNumerica,
        comprimento_cm: comprimentoNumerico,
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
          Etapa 4 de 6
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
              onChange={(event) => {
                setCep(
                  event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 8),
                )
              }}
              placeholder="00000-000"
              maxLength={8}
            />

            <small>
              Informe o CEP de onde o produto será
              enviado.
            </small>
          </label>

          {consultandoCep && (
            <small>
              Consultando endereço...
            </small>
          )}

          {erroCep && (
            <small>
              {erroCep}
            </small>
          )}

          {(cidade || estado) && !erroCep && (
            <div className="form-row">
              <label>
                Cidade

                <input
                  value={cidade}
                  readOnly
                />
              </label>

              <label>
                Estado

                <input
                  value={estado}
                  readOnly
                />
              </label>
            </div>
          )}

          <div className="frete-dimensoes-grid">
            <label>
              Peso (g)

              <input
                inputMode="decimal"
                value={peso}
                onChange={(event) =>
                  setPeso(
                    event.target.value.replace(
                      /[^0-9.,]/g,
                      '',
                    ),
                  )
                }
                placeholder="Ex.: 12000"
              />

              <small>
                Peso da embalagem em gramas.
              </small>
            </label>

            <label>
              Altura (cm)

              <input
                inputMode="decimal"
                value={altura}
                onChange={(event) =>
                  setAltura(
                    event.target.value.replace(
                      /[^0-9.,]/g,
                      '',
                    ),
                  )
                }
                placeholder="Ex.: 80"
              />
            </label>

            <label>
              Largura (cm)

              <input
                inputMode="decimal"
                value={largura}
                onChange={(event) =>
                  setLargura(
                    event.target.value.replace(
                      /[^0-9.,]/g,
                      '',
                    ),
                  )
                }
                placeholder="Ex.: 30"
              />
            </label>

            <label>
              Comprimento (cm)

              <input
                inputMode="decimal"
                value={comprimento}
                onChange={(event) =>
                  setComprimento(
                    event.target.value.replace(
                      /[^0-9.,]/g,
                      '',
                    ),
                  )
                }
                placeholder="Ex.: 20"
              />
            </label>
          </div>

          <small>
            Essas medidas serão utilizadas futuramente
            no cálculo do frete.
          </small>

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