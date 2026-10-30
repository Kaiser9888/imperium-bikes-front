'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Check, Loader2, Lock, Truck, X } from 'lucide-react'
import {
  clearDraft,
  getDraft,
  saveDraft,
} from '@/lib/publicar/storage'

import { BackButton } from "@/components/ui/back-button"
import api from '@/lib/api'
import { formatarPreco } from '@/lib/format'
import { ETIQUETA_AUTOMATICA } from '@/lib/etiqueta'

type Estimativa = { destino: string; menorValor: number | null; prazoDias: number | null; motivo: string | null }

/** Endereço de envio como o servidor devolve: CPF/CNPJ e celular só mascarados. */
type Remetente = {
  completo: boolean
  documentoMascarado: string | null
  telefoneMascarado: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
}

// Correios levam até 30 kg; acima disso poucas transportadoras atendem
const PESO_CORREIOS_KG = 30

const pagadores = [
  {
    id: 'comprador',
    label: 'Comprador paga o frete (recomendado)',
    description:
      'Você recebe o preço do produto. O frete exato é calculado na compra, com o CEP de quem comprou, e somado ao total.',
  },
  {
    id: 'vendedor',
    label: 'Frete grátis: eu ajudo com até um valor',
    description:
      'Você diz até quanto paga do frete. Se custar menos, o comprador não paga nada; se custar mais, ele paga só a diferença.',
  },
  {
    id: 'retirada_local',
    label: 'Retirada no local',
    description:
      'O comprador paga pelo app e combina a retirada com você. O pagamento é liberado quando você digitar o código que ele te passa na entrega. Não aceite pagamento por fora.',
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
  // Serviço: o que aparece no anúncio para o cliente achar o local
  const [bairro, setBairro] = useState('')
  const [enderecoPublico, setEnderecoPublico] = useState('')

  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [largura, setLargura] = useState('')
  const [comprimento, setComprimento] = useState('')

  const [pagador, setPagador] = useState('comprador')
  const [limite, setLimite] = useState('')
  const [estimativas, setEstimativas] = useState<Estimativa[] | null>(null)
  const [estimando, setEstimando] = useState(false)
  const [erroEstimativa, setErroEstimativa] = useState('')

  // Endereço de envio (remetente da etiqueta): pedido uma vez, aqui mesmo; depois aparece só "Enviando de"
  const [remetente, setRemetente] = useState<Remetente | null>(null)
  const [trocandoRemetente, setTrocandoRemetente] = useState(false)
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [documento, setDocumento] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erroRemetente, setErroRemetente] = useState('')
  const [salvandoRemetente, setSalvandoRemetente] = useState(false)
  useEffect(() => {
    if (!ETIQUETA_AUTOMATICA) return
    api.get<Remetente>('/api/users/me/remetente')
      .then(({ data }) => {
        setRemetente(data)
        setNumero(data.numero ?? '')
        setComplemento(data.complemento ?? '')
      })
      .catch(() => setRemetente(null))
  }, [])

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
    setBairro(frete.localizacao?.bairro ?? '')
    setEnderecoPublico(frete.localizacao?.endereco_publico ?? '')

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

    setPagador(frete.pagador ?? 'comprador')
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
setBairro(data.bairro ?? '')
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

// Serviço não é enviado: esta etapa vira só o local de atendimento
const servico = categoria === 'servicos'

// Com etiqueta automática, quem envia precisa do endereço de envio (o Melhor Envio exige remetente)
const precisaRemetente = ETIQUETA_AUTOMATICA && !servico && pagador !== 'retirada_local'
const enviandoDe = precisaRemetente && remetente?.completo && !trocandoRemetente ? remetente : null

// Com o endereço salvo, cidade e UF vêm dele: não depende do ViaCEP responder
const localPronto = enviandoDe
  ? Boolean(enviandoDe.cep && enviandoDe.cidade && enviandoDe.uf)
  : cepNumerico.length === 8 && Boolean(cidade) && Boolean(estado)
const documentoDigitos = documento.replace(/\D/g, '')
const telefoneDigitos = telefone.replace(/\D/g, '')
const remetentePronto =
  !precisaRemetente ||
  Boolean(enviandoDe) ||
  Boolean(
    numero.trim() && endereco.trim() && bairro.trim() && cidade && estado &&
    (documentoDigitos.length === 11 || documentoDigitos.length === 14 || (!documentoDigitos && remetente?.documentoMascarado)) &&
    ((telefoneDigitos.length >= 10 && telefoneDigitos.length <= 11) || (!telefoneDigitos && remetente?.telefoneMascarado)),
  )

// Com endereço salvo, a origem (e a estimativa) segue o CEP dele
const cepDoRemetente = enviandoDe?.cep ?? null
useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect -- o CEP do cartão vem do servidor
  if (cepDoRemetente) setCep(cepDoRemetente)
}, [cepDoRemetente])

const pronto =
  remetentePronto &&
  localPronto &&
  (servico || (
    pesoValido &&
    alturaValida &&
    larguraValida &&
    comprimentoValido &&
    Boolean(pagador) &&
    // "Eu arco com o frete" precisa dizer até quanto
    (pagador !== 'vendedor' || limiteCentavos > 0)
  ))

const valoresEstimados = (estimativas ?? []).map((e) => e.menorValor).filter((v): v is number => v != null)
const faixa = valoresEstimados.length > 0 ? { min: Math.min(...valoresEstimados), max: Math.max(...valoresEstimados) } : null

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
    if (pagador === 'vendedor' && !limite && valores.length > 0) {
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

async function continuar() {
  if (!pronto || salvandoRemetente) {
    return
  }

  // Primeira vez (ou trocando): grava o endereço de envio na conta antes de seguir
  if (precisaRemetente && !enviandoDe) {
    setSalvandoRemetente(true)
    setErroRemetente('')
    try {
      const { data } = await api.put<Remetente>('/api/users/me/remetente', {
        documento: documentoDigitos,
        telefone: telefoneDigitos,
        cep: cepNumerico,
        logradouro: endereco.trim(),
        numero: numero.trim(),
        complemento: complemento.trim(),
        bairro: bairro.trim(),
        cidade,
        uf: estado,
      })
      setRemetente(data)
      setTrocandoRemetente(false)
      setDocumento('')
      setTelefone('')
    } catch (cause) {
      const msg = (cause as { response?: { data?: { message?: string } } })?.response?.data?.message
      setErroRemetente(msg ?? 'Não foi possível salvar o endereço de envio. Confira os campos.')
      setSalvandoRemetente(false)
      return
    }
    setSalvandoRemetente(false)
  }

  // Com o endereço salvo, a origem do anúncio é a dele
  const cepOrigem = enviandoDe?.cep ?? cepNumerico

  const pesoEmGramas = Math.round(
    pesoNumerico * 1000,
  )

  const localizacao = {
    endereco: enviandoDe?.logradouro ?? endereco,
    cidade: enviandoDe?.cidade ?? cidade,
    estado: enviandoDe?.uf ?? estado,
    cep: cepOrigem,
    ...(servico ? { bairro: bairro.trim(), endereco_publico: enderecoPublico.trim() } : {}),
  }

  saveDraft(categoria, {
    frete: servico ? { localizacao } : {
      localizacao,
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
        {servico ? 'Local de atendimento' : 'Frete e entrega'}
      </h1>

      <p className="publish-lead">
        {servico
          ? 'Informe onde você atende. O cliente combina data e local com você pelo chat depois do pagamento.'
          : 'Informe o local de envio e os dados básicos da embalagem.'}
      </p>

      <div className="publish-progress">
          <span
            style={{
              width: '67%',
            }}
          />
      </div>

      <section className="publish-card publish-form">
        {enviandoDe ? (
          <div className="remetente-card">
            <div>
              <small>Enviando de</small>
              <b>
                {enviandoDe.logradouro}, {enviandoDe.numero}
                {enviandoDe.complemento ? ` - ${enviandoDe.complemento}` : ''}
              </b>
              <small>
                {enviandoDe.bairro} · {enviandoDe.cidade}/{enviandoDe.uf} · CEP {enviandoDe.cep?.replace(/(\d{5})(\d{3})/, '$1-$2')}
              </small>
            </div>
            <button
              type="button"
              onClick={() => {
                setTrocandoRemetente(true)
                setCep(enviandoDe.cep ?? '')
              }}
            >
              Trocar
            </button>
          </div>
        ) : (
        <label>
          {servico ? 'CEP do local de atendimento' : 'CEP de origem'}

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
            {servico
              ? 'A cidade aparece no anúncio para o cliente saber onde você atende.'
              : 'Informe o CEP de onde o produto será enviado.'}
          </small>
        </label>
        )}

        {!enviandoDe && consultandoCep && (
          <small>
            Consultando endereço...
          </small>
        )}

        {!enviandoDe && erroCep && (
          <small>
            {erroCep}
          </small>
        )}

        {!enviandoDe && (cidade || estado) && !erroCep && (
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

        {precisaRemetente && !enviandoDe && cep.replace(/\D/g, '').length === 8 && !erroCep && (
          <div className="remetente-form">
            <p className="remetente-form__titulo">
              <b>Seu endereço de envio</b>
              <small>Pedido só uma vez. Quando vender, o site gera a etiqueta com ele e você só imprime e posta.</small>
            </p>

            <label>
              Rua
              <input value={endereco} onChange={(event) => setEndereco(event.target.value)} maxLength={200} autoComplete="address-line1" />
            </label>

            <div className="form-row">
              <label>
                Número
                <input value={numero} onChange={(event) => setNumero(event.target.value)} maxLength={20} inputMode="numeric" />
              </label>
              <label>
                Complemento
                <span className="optional">Opcional</span>
                <input value={complemento} onChange={(event) => setComplemento(event.target.value)} maxLength={100} />
              </label>
            </div>

            <label>
              Bairro
              <input value={bairro} onChange={(event) => setBairro(event.target.value)} maxLength={100} />
            </label>

            <div className="form-row">
              <label>
                CPF ou CNPJ
                <input
                  value={documento}
                  onChange={(event) => setDocumento(event.target.value.replace(/[^\d.\-/]/g, '').slice(0, 18))}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={remetente?.documentoMascarado ? `Salvo: ${remetente.documentoMascarado}` : '000.000.000-00'}
                />
              </label>
              <label>
                Celular com DDD
                <input
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value.replace(/[^\d() -]/g, '').slice(0, 15))}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder={remetente?.telefoneMascarado ? `Salvo: ${remetente.telefoneMascarado}` : '(11) 99999-9999'}
                />
              </label>
            </div>

            <small className="remetente-form__seguro">
              <Lock aria-hidden="true" />
              CPF e celular vão só na etiqueta, como a transportadora exige. Ficam guardados cifrados e não aparecem no anúncio nem para o comprador.
              {remetente?.documentoMascarado && ' Deixe em branco para manter os salvos.'}
            </small>

            {erroRemetente && <small role="alert" className="remetente-form__erro">{erroRemetente}</small>}

            {trocandoRemetente && (
              <button type="button" className="remetente-form__cancelar" onClick={() => setTrocandoRemetente(false)}>
                Manter o endereço salvo
              </button>
            )}
          </div>
        )}

        {servico && (cidade || estado) && !erroCep && (
          <>
            <label>
              Bairro

              <input
                value={bairro}
                onChange={(event) => setBairro(event.target.value)}
                maxLength={100}
                placeholder="Ex.: Centro"
              />
            </label>

            <label>
              Endereço da oficina

              <span className="optional">
                Opcional
              </span>

              <input
                value={enderecoPublico}
                onChange={(event) => setEnderecoPublico(event.target.value)}
                maxLength={200}
                placeholder="Ex.: Rua das Flores, 120"
              />

              <small>
                Aparece no anúncio. Deixe vazio se atende em domicílio ou prefere passar pelo chat.
              </small>
            </label>
          </>
        )}

        {!servico && (
        <>
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
                Acima de 30 kg: poucas transportadoras levam.
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
          Vai enviar uma bike?{' '}
          <Link href="/ajuda/envio-de-bike" target="_blank" className="font-semibold text-primary underline underline-offset-2">
            Veja como embalar e medir a caixa
          </Link>
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

        {(pagador === 'vendedor' || pagador === 'comprador') && (
          <div className="frete-gratis">
            <div className="frete-gratis__topo">
              <Truck aria-hidden="true" />
              <div>
                <b>Quanto custa enviar (referência)</b>
                <small>
                  Ninguém comprou ainda, então não existe valor exato: aqui vai o mais barato do seu CEP até 4 capitais, com o peso e as medidas
                  acima. O valor certo sai na hora da compra, com o CEP de quem comprou.
                </small>
              </div>
            </div>

            <button type="button" className="frete-gratis__botao" onClick={estimarFrete} disabled={!medidasProntas || estimando}>
              {estimando ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              {estimando ? 'Calculando...' : estimativas ? 'Calcular de novo' : 'Ver quanto custa'}
            </button>
            {!medidasProntas && <small>Preencha o CEP, o peso e as medidas para estimar.</small>}
            {erroEstimativa && <small role="alert">{erroEstimativa}</small>}

            {faixa && (
              <p className="frete-gratis__faixa">
                {faixa.min === faixa.max
                  ? <>Em torno de <b>{formatarPreco(faixa.min)}</b></>
                  : <>Entre <b>{formatarPreco(faixa.min)}</b> e <b>{formatarPreco(faixa.max)}</b>, dependendo de onde o comprador mora</>}
              </p>
            )}
            {estimativas && estimativas.every((e) => e.menorValor == null) && (
              <small role="alert">
                {estimativas.find((e) => e.motivo)?.motivo ?? 'Nenhuma transportadora atende essas medidas.'} Confira o peso e as medidas da caixa, ou escolha retirada no local.
              </small>
            )}

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

            {pagador === 'vendedor' && (
            <label>
              Ajudo com o frete até (R$)
              <input
                inputMode="decimal"
                value={limite}
                onChange={(event) => setLimite(event.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="Ex.: 40,00"
              />
              <small>
                Sai do que você recebe só quando houver venda. Passou disso, o comprador paga a diferença.
              </small>
            </label>
            )}
          </div>
        )}
        </>
        )}
      </section>
    </div>

    <footer className="publish-footer">
      <button
        type="button"
        disabled={!pronto || salvandoRemetente}
        onClick={continuar}
      >
        Continuar
        <ArrowRight />
      </button>
    </footer>
  </main>
)
}

