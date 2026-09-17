'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { getCategoriaConfig } from '@/lib/publicar/categorias'
import {
  clearDraft,
  getDraft,
  saveDraft,
} from '@/lib/publicar/storage'

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
  const { categoria } = useParams<{
    categoria: string
  }>()

  const router = useRouter()

  const config = getCategoriaConfig(categoria)

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [condicao, setCondicao] = useState('')

  useEffect(() => {
    if (!categoria) {
      return
    }

    const draft = getDraft(categoria)

    setTitulo(draft.title ?? '')
    setDescricao(draft.description ?? '')
    setCondicao(draft.condition ?? '')
  }, [categoria])

  const pronto =
    titulo.trim().length >= 3 &&
    descricao.trim().length >= 10 &&
    Boolean(condicao)

  function voltar() {
    router.push(`/publicar/${categoria}`)
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
      title: titulo.trim(),
      description: descricao.trim(),
      condition: condicao,
    })

    router.push(`/publicar/${categoria}/fotos`)
  }

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
          {config?.label ?? 'Anúncio'}
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
          Etapa 1 de 5
        </p>

        <h1>
          Informações do anúncio
        </h1>

        <p className="publish-lead">
          Apresente o produto com clareza para
          ajudar o comprador a decidir.
        </p>

        <div className="publish-progress">
          <span
            style={{
              width: '20%',
            }}
          />
        </div>

        <section className="publish-card publish-form">
          <label>
            Título do produto

            <input
              value={titulo}
              onChange={(event) =>
                setTitulo(event.target.value)
              }
              maxLength={80}
              placeholder="Ex.: Mountain Bike Caloi Elite"
            />

            <small>
              {titulo.length}/80
            </small>
          </label>

          <label>
            Descrição

            <textarea
              value={descricao}
              onChange={(event) =>
                setDescricao(event.target.value)
              }
              maxLength={1000}
              rows={6}
              placeholder="Informe detalhes, componentes, tempo de uso e condições."
            />

            <small>
              {descricao.length}/1000
            </small>
          </label>

          <fieldset>
            <legend>
              Condição do produto
            </legend>

            <div className="publish-options">
              {condicoes.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={
                    condicao === item.id
                      ? 'is-selected'
                      : ''
                  }
                  onClick={() =>
                    setCondicao(item.id)
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

                  {condicao === item.id && (
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