'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import {
  getCategoriaConfig,
  nextStep,
  previousStep,
  readDraft,
  writeDraft,
} from '@/lib/publicar/categorias'
import {
  CATEGORIA_ESPORTES,
  OPCOES_ESPORTE,
  OPCOES_MODALIDADE,
  modalidadeSugerida,
} from '@/lib/publicar/taxonomia'

const condicoes = [
  {
    id: 'novo',
    label: 'Novo',
    description: 'Nunca usado',
  },
  {
    id: 'usado',
    label: 'Usado',
    description: 'Já teve uso',
  },
]

export default function InformacoesPage() {
  const { categoria } = useParams<{ categoria: string }>()
  const router = useRouter()
  const config = getCategoriaConfig(categoria)

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [condicao, setCondicao] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')

  // Onde o anúncio aparece: esporte (em /publicar/esportes) ou modalidade de ciclismo
  const porEsporte = categoria === CATEGORIA_ESPORTES
  const opcoesDestino = porEsporte ? OPCOES_ESPORTE : OPCOES_MODALIDADE
  const [destino, setDestino] = useState('')

  useEffect(() => {
    const d = readDraft(categoria)

    setMarca(String(d.marca || ''))
    setModelo(String(d.modelo || ''))
    setDestino(
      categoria === CATEGORIA_ESPORTES
        ? String(d.sport || '')
        : String(d.modality || '') || modalidadeSugerida(d),
    )

    setTitulo(String(d.titulo || ''))
    setDescricao(String(d.descricao || ''))
    setCondicao(String(d.condicao || ''))

    const quantidadeSalva = Number(d.quantidade)

    if (Number.isInteger(quantidadeSalva) && quantidadeSalva >= 1) {
      setQuantidade(String(quantidadeSalva))
    } else {
      setQuantidade('1')
    }
  }, [categoria])

  const quantidadeNumerica = Number(quantidade)

  const pronto =
    titulo.trim().length >= 10 &&
    descricao.trim().length >= 10 &&
    Boolean(condicao) &&
    opcoesDestino.some(item => item.value === destino) &&
    Number.isInteger(quantidadeNumerica) &&
    quantidadeNumerica >= 1 &&
    quantidadeNumerica <= 999999

  function continuar() {
    if (!pronto) return

    writeDraft(categoria, {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      condicao,
      quantidade: quantidadeNumerica,
      marca: marca.trim(),
      modelo: modelo.trim(),
      ...(porEsporte ? { sport: destino } : { modality: destino }),
    })

    router.push(nextStep(categoria, 'informacoes'))
  }

  const label = config?.label ?? 'Anúncio'

  return (
    <main className="publish-page">
      <header className="publish-header">
        <Link
          href={previousStep(categoria, 'informacoes')}
          className="publish-back"
        >
          <ArrowLeft />
          Voltar
        </Link>

        <strong>{label}</strong>

        <Link
          href="/publicar"
          className="publish-cancel"
        >
          <X />
          Cancelar
        </Link>
      </header>

      <div className="publish-shell">
        <p className="publish-kicker">Etapa 1 de 5</p>

        <h1>Informações do anúncio</h1>

        <p className="publish-lead">
          Apresente o produto com clareza para ajudar o comprador a decidir.
        </p>

        <div className="publish-progress">
          <span style={{ width: '20%' }} />
        </div>

        <section className="publish-card publish-form">
          <label>
            Título do produto

            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              maxLength={80}
              placeholder="Ex.: Mountain Bike Caloi Elite"
            />

            <small>{titulo.length}/80</small>
          </label>

          <label>
            Descrição

            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              maxLength={1000}
              rows={6}
              placeholder="Informe detalhes, componentes, tempo de uso e condições."
            />

            <small>{descricao.length}/1000</small>
          </label>

          <fieldset>
            <legend>
              {porEsporte ? 'Esporte' : 'Modalidade'}

              <small>
                {porEsporte
                  ? 'O anúncio aparece na página deste esporte.'
                  : 'O anúncio aparece na página desta modalidade.'}
              </small>
            </legend>

            <div className="publish-options publish-options-grid">
              {opcoesDestino.map(item => (
                <button
                  type="button"
                  key={item.value}
                  className={destino === item.value ? 'is-selected' : ''}
                  aria-pressed={destino === item.value}
                  onClick={() => setDestino(item.value)}
                >
                  <span>
                    <b>{item.label}</b>
                  </span>

                  {destino === item.value && <Check />}
                </button>
              ))}
            </div>
          </fieldset>

          <label>
            Marca (opcional)

            <input
              value={marca}
              onChange={e => setMarca(e.target.value)}
              maxLength={100}
              placeholder="Ex.: Shimano, Nike, Specialized"
            />
          </label>

          <label>
            Modelo (opcional)

            <input
              value={modelo}
              onChange={e => setModelo(e.target.value)}
              maxLength={100}
              placeholder="Ex.: Deore M6100"
            />
          </label>

          <fieldset>
            <legend>Condição do produto</legend>

            <div className="publish-options">
              {condicoes.map(item => (
                <button
                  type="button"
                  key={item.id}
                  className={condicao === item.id ? 'is-selected' : ''}
                  onClick={() => setCondicao(item.id)}
                >
                  <span>
                    <b>{item.label}</b>
                    <small>{item.description}</small>
                  </span>

                  {condicao === item.id && <Check />}
                </button>
              ))}
            </div>
          </fieldset>

          <label>
            Quantidade disponível

            <input
              type="number"
              min={1}
              max={999999}
              step={1}
              value={quantidade}
              onChange={e => {
                const valor = e.target.value

                if (valor === '') {
                  setQuantidade('')
                  return
                }

                const numero = Number(valor)

                if (Number.isInteger(numero) && numero >= 1 && numero <= 999999) {
                  setQuantidade(String(numero))
                }
              }}
              placeholder="Ex.: 1"
            />

            <small>
              Informe quantas unidades deste produto estão disponíveis.
            </small>
          </label>
        </section>
      </div>

      <footer className="publish-footer">
        <button
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