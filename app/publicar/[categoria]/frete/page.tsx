'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Check, Loader2, Truck, X } from 'lucide-react'
import {
  clearDraft,
  getDraft,
  saveDraft,
} from '@/lib/publicar/storage'

import { BackButton } from "@/components/ui/back-button"
import api from '@/lib/api'
import { formatarPreco } from '@/lib/format'

type Estimativa = { destino: string; menorValor: number | null; prazoDias: number | null; motivo: string | null }

// Correios levam até 30 kg; acima disso poucas transportadoras atendem
const PESO_CORREIOS_KG = 30

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

const LIMITE_MEDIDA_CM = 300
const LIMITE_PESO_KG = 1000

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
  const [limite, setLimite] = useState('')
  const [estimativas, setEstimativas] = useState<Estimativa[] | null>(null)
  const [estimando, setEstimando] = useState(false)
  const [erroEstimativa, setErroEstimativa] = useState('')

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

    if (frete.peso_g) {
      setPeso(
        String(frete.peso_g / 1000),
      )
    } else {
      setPeso('')
    }

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
    if (frete.limite_frete_centavos) {
      setLimite(String(frete.limite_frete_centavos / 100).replace('.', ','))
    }
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

const pesoNumerico = Number(
  peso.replace(',', '.'),
)

const alturaNumerica = Number(
  altura.replace(',', '.'),
)

const larguraNumerica = Number(
  largura.replace(',', '.'),
)

const comprimentoNumerico = Number(
  comprimento.replace(',', '.'),
)

const pesoValido =
  pesoNumerico > 0 &&
  pesoNumerico <= LIMITE_PESO_KG

const alturaValida =
  alturaNumerica > 0 &&
  alturaNumerica <= LIMITE_MEDIDA_CM

const larguraValida =
  larguraNumerica > 0 &&
  larguraNumerica <= LIMITE_MEDIDA_CM

const comprimentoValido =
  comprimentoNumerico > 0 &&
  comprimentoNumerico <= LIMITE_MEDIDA_CM

const limiteCentavos = Math.round(
  Number(limite.replace(/\./g, '').replace(',', '.')) * 100,
) || 0

const pronto =
  cepNumerico.length === 8 &&
  Boolean(cidade) &&
  Boolean(estado) &&
  pesoValido &&
  alturaValida &&
  larguraValida &&
  comprimentoValido &&
  Boolean(pagador) &&
  // "Eu arco com o frete" precisa dizer até quanto
  (pagador !== 'vendedor' || limiteCentavos > 0)

const medidasProntas =
  cepNumerico.length === 8 && pesoValido && alturaValida && larguraValida && comprimentoValido

async function estimarFrete() {
  setEstimando(true)
  setErroEstimativa('')
  try {
    const { data } = await api.post<Estimativa[]>('/api/frete/estimar', {
      cepOrigem: cepNumerico,
      pesoKg: pesoNumerico,
      alturaCm: alturaNumerica,
      larguraCm: larguraNumerica,
      comprimentoCm: comprimentoNumerico,
    })
    setEstimativas(data)
    // Sugere cobrir o frete mais caro entre os destinos que têm opção
    const valores = data.map((e) => e.menorValor).filter((v): v is number => v != null)
    if (!limite && valores.length > 0) {
      setLimite(String(Math.ceil(Math.max(...valores))).replace('.', ','))
    }
  } catch (cause) {
    const msg = (cause as { response?: { data?: { message?: string } } })?.response?.data?.message
    setErroEstimativa(msg ?? 'Não foi possível estimar o frete agora.')
  } finally {
    setEstimando(false)
  }
}

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

  const pesoEmGramas = Math.round(
    pesoNumerico * 1000,
  )

  saveDraft(categoria, {
    frete: {
      localizacao: {
        endereco,
        cidade,
        estado,
        cep: cepNumerico,
      },
      peso_g: pesoEmGramas,
      altura_cm: alturaNumerica,
      largura_cm: larguraNumerica,
      comprimento_cm: comprimentoNumerico,
      limite_frete_centavos: pagador === 'vendedor' ? limiteCentavos : undefined,
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
              width: '67%',
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
            Peso (kg)

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
              placeholder="Ex.: 12,5"
            />

            <small>
              Peso da embalagem. Máximo: 1000 kg.
            </small>

            {pesoNumerico > LIMITE_PESO_KG && (
              <small>
                Digite um peso de até 1000 kg.
              </small>
            )}

            {pesoNumerico > PESO_CORREIOS_KG && pesoNumerico <= LIMITE_PESO_KG && (
              <small>
                Acima de 30 kg os Correios não levam e poucas transportadoras atendem. Se ninguém atender, o comprador
                poderá combinar a entrega com você.
              </small>
            )}
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

            <small>
              Máximo: 300 cm.
            </small>

            {alturaNumerica > LIMITE_MEDIDA_CM && (
              <small>
                Medida ultrapassa o limite de 300 cm.
              </small>
            )}
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

            <small>
              Máximo: 300 cm.
            </small>

            {larguraNumerica > LIMITE_MEDIDA_CM && (
              <small>
                Medida ultrapassa o limite de 300 cm.
              </small>
            )}
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
              placeholder="Ex.: 140"
            />

            <small>
              Máximo: 300 cm.
            </small>

            {comprimentoNumerico > LIMITE_MEDIDA_CM && (
              <small>
                Medida ultrapassa o limite de 300 cm.
              </small>
            )}
          </label>
        </div>

        <small>
          O frete é calculado pelo Melhor Envio com este CEP, o peso e as medidas da embalagem.
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

        {pagador === 'vendedor' && (
          <div className="frete-gratis">
            <div className="frete-gratis__topo">
              <Truck aria-hidden="true" />
              <div>
                <b>Quanto custa enviar</b>
                <small>Menor valor do seu CEP até algumas regiões, com o peso e as medidas acima.</small>
              </div>
            </div>

            <button type="button" className="frete-gratis__botao" onClick={estimarFrete} disabled={!medidasProntas || estimando}>
              {estimando ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {estimando ? 'Calculando...' : estimativas ? 'Calcular de novo' : 'Ver quanto custa'}
            </button>
            {!medidasProntas && <small>Preencha o CEP, o peso e as medidas para estimar.</small>}
            {erroEstimativa && <small role="alert">{erroEstimativa}</small>}

            {estimativas && (
              <ul className="frete-gratis__lista">
                {estimativas.map((e) => (
                  <li key={e.destino}>
                    <span>{e.destino}</span>
                    {e.menorValor != null ? (
                      <b>
                        {formatarPreco(e.menorValor)}
                        {e.prazoDias != null && <small> · {e.prazoDias} dias</small>}
                      </b>
                    ) : (
                      <small>Sem transportadora</small>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <label>
              Pago o frete até (R$)
              <input
                inputMode="decimal"
                value={limite}
                onChange={(event) => setLimite(event.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="Ex.: 40,00"
              />
              <small>
                Se o frete passar desse valor, o comprador paga só a diferença. O que você cobrir é descontado do valor
                da venda, então o frete nunca custa mais do que você aceitou.
              </small>
            </label>
          </div>
        )}
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

