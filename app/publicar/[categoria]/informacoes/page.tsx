'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
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

import { BackButton } from "@/components/ui/back-button"

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

// Serviço pode ser vendido várias vezes: o estoque fica alto e não aparece para ninguém
const ESTOQUE_SERVICO = 999

const PLACEHOLDER_TITULO: Record<string, string> = {
  servicos: 'Ex.: Revisão completa com troca de cabos',
  consumiveis: 'Ex.: Gel de carboidrato 30 g, caixa com 10',
  pecas: 'Ex.: Cassete Shimano Deore 12v 10-51',
}

export default function InformacoesPage() {
  const { categoria } = useParams<{ categoria: string }>()
  const router = useRouter()
  const config = getCategoriaConfig(categoria)

  // Serviço: sem marca, modelo, condição nem quantidade. Consumível: sempre novo.
  const servico = categoria === 'servicos'
  const semCondicao = servico || categoria === 'consumiveis'

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [condicao, setCondicao] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [numeroSerie, setNumeroSerie] = useState('')
  // Bike completa e quadro (em peças) são o que se rouba e revende
  const pedeNumeroSerie = categoria === 'bikes' || categoria === 'pecas'

  // Onde o anúncio aparece: esporte (em /publicar/esportes) ou modalidade de ciclismo
  const porEsporte = categoria === CATEGORIA_ESPORTES
  const opcoesDestino = porEsporte ? OPCOES_ESPORTE : OPCOES_MODALIDADE
  const [destino, setDestino] = useState('')

  useEffect(() => {
    const d = readDraft(categoria)

    setMarca(String(d.marca || ''))
    setModelo(String(d.modelo || ''))
    setNumeroSerie(String(d.numeroSerie || ''))
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

  const quantidadeNumerica = servico ? ESTOQUE_SERVICO : Number(quantidade)

  const pronto =
    titulo.trim().length >= 10 &&
    descricao.trim().length >= 10 &&
    (semCondicao || Boolean(condicao)) &&
    opcoesDestino.some(item => item.value === destino) &&
    Number.isInteger(quantidadeNumerica) &&
    quantidadeNumerica >= 1 &&
    quantidadeNumerica <= 999999

  function continuar() {
    if (!pronto) return

    writeDraft(categoria, {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      condicao: semCondicao ? 'novo' : condicao,
      quantidade: quantidadeNumerica,
      marca: servico ? '' : marca.trim(),
      modelo: servico ? '' : modelo.trim(),
      numeroSerie: pedeNumeroSerie ? numeroSerie.trim() : '',
      ...(porEsporte ? { sport: destino } : { modality: destino }),
    })

    router.push(nextStep(categoria, 'informacoes'))
  }

  const label = config?.label ?? 'Anúncio'

  return (
    <main className="publish-page">
      <header className="publish-header">
        <BackButton href={previousStep(categoria, 'informacoes')} />

        <strong>{label}</strong>

        <Link
          href="/vendedor"
          className="publish-cancel"
        >
          <X />
          Cancelar
        </Link>
      </header>

      <div className="publish-shell">
        <p className="publish-kicker">Etapa 2 de 6</p>

        <h1>Informações do anúncio</h1>

        <p className="publish-lead">
          {servico
            ? 'Explique o que está incluso no serviço para ajudar o cliente a decidir.'
            : 'Apresente o produto com clareza para ajudar o comprador a decidir.'}
        </p>

        <div className="publish-progress">
          <span style={{ width: '33%' }} />
        </div>

        <section className="publish-card publish-form">
          <label>
            {servico ? 'Título do serviço' : 'Título do produto'}

            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              maxLength={80}
              placeholder={PLACEHOLDER_TITULO[categoria] ?? 'Ex.: Mountain Bike Caloi Elite'}
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
              placeholder={
                servico
                  ? 'O que está incluso, prazo, se atende na oficina ou busca a bike.'
                  : categoria === 'consumiveis'
                    ? 'Sabor, quantidade por embalagem, validade.'
                    : 'Informe detalhes, componentes, tempo de uso e condições.'
              }
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

          {!servico && (
          <>
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
          </>
          )}

          {pedeNumeroSerie && (
          <label>
            Número de série do quadro (opcional)

            <input
              value={numeroSerie}
              onChange={e => setNumeroSerie(e.target.value)}
              maxLength={60}
              autoCapitalize="characters"
              placeholder="Fica gravado embaixo do movimento central"
            />

            <small>
              Opcional. Ganha selo de confiança; só os 4 últimos dígitos aparecem.
            </small>
          </label>
          )}

          {!semCondicao && (
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
          )}

          {!servico && (
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

          </label>
          )}
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