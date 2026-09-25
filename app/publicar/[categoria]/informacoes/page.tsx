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

  useEffect(() => {
    const d = readDraft(categoria)

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
    Number.isInteger(quantidadeNumerica) &&
    quantidadeNumerica >= 1

  function continuar() {
    if (!pronto) return

    writeDraft(categoria, {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      condicao,
      quantidade: quantidadeNumerica,
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
              step={1}
              value={quantidade}
              onChange={e => {
                const valor = e.target.value

                if (valor === '') {
                  setQuantidade('')
                  return
                }

                const numero = Number(valor)

                if (Number.isInteger(numero) && numero >= 1) {
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