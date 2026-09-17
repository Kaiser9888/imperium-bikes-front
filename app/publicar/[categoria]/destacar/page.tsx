'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, X } from 'lucide-react'

const niveis = [
  {
    id: 'gratuito',
    nome: 'Publicação padrão',
    descricao: 'Alcance normal no feed e na busca',
    taxa: 'Sem custo',
  },
  {
    id: 'destaque',
    nome: 'Destacar anúncio',
    descricao: 'Mais visibilidade para o seu produto',
    taxa: 'Taxa após a venda',
  },
]

type PublishDraft = {
  categoryId?: string
  nivel?: string

  bikeType?: string
  subModality?: string
  saleFormat?: string
  material?: string
  wheelSize?: string
  frameSize?: string
  rearSuspensionType?: string
  shockStatus?: string
  shockMeasurementMM?: string

  titulo?: string
  descricao?: string
  condicao?: string

  title?: string
  description?: string
  condition?: string
}

const STORAGE_KEY = 'imperium_bikes_publish'

export default function DestacarPage() {
  const { categoria } = useParams<{
    categoria: string
  }>()

  const router = useRouter()

  const [nivel, setNivel] = useState('gratuito')
  const [publicando, setPublicando] = useState(false)

  useEffect(() => {
    if (!categoria) {
      return
    }

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)

      if (!saved) {
        return
      }

      const draft = JSON.parse(saved) as PublishDraft

      if (typeof draft.nivel === 'string') {
        setNivel(draft.nivel)
      }
    } catch {
      setNivel('gratuito')
    }
  }, [categoria])

  function voltar() {
    router.push(`/publicar/${categoria}/preco`)
  }

  function cancelar() {
    sessionStorage.removeItem(STORAGE_KEY)
    router.push('/publicar')
  }

  async function publicar() {
    if (publicando) {
      return
    }

    setPublicando(true)

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)

      const current: PublishDraft = saved
        ? (JSON.parse(saved) as PublishDraft)
        : {}

      const updated: PublishDraft = {
        ...current,
        categoryId: current.categoryId ?? categoria,
        nivel,
      }

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated),
      )

      /*
       * Aqui futuramente entra a chamada real
       * para o backend que cria o anúncio.
       *
       * Por enquanto mantemos o fluxo funcionando
       * sem alterar o restante da publicação.
       */
      await new Promise((resolve) =>
        setTimeout(resolve, 500),
      )

      sessionStorage.removeItem(STORAGE_KEY)

      router.push('/')
    } catch {
      setPublicando(false)
    }
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
          {categoria === 'bikes'
            ? 'Bicicleta'
            : categoria ?? 'Anúncio'}
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
          Etapa 5 de 5
        </p>

        <h1>
          Visibilidade do anúncio
        </h1>

        <p className="publish-lead">
          Escolha como o anúncio aparecerá para os
          compradores.
        </p>

        <div className="publish-progress">
          <span
            style={{
              width: '100%',
            }}
          />
        </div>

        <div className="publish-options highlight-options">
          {niveis.map((item) => (
            <button
              type="button"
              key={item.id}
              className={
                nivel === item.id
                  ? 'is-selected'
                  : ''
              }
              onClick={() =>
                setNivel(item.id)
              }
            >
              <span>
                <b>{item.nome}</b>

                <small>
                  {item.descricao}
                </small>
              </span>

              <strong>
                {item.taxa}
              </strong>

              {nivel === item.id && (
                <Check />
              )}
            </button>
          ))}
        </div>
      </div>

      <footer className="publish-footer">
        <button
          type="button"
          onClick={publicar}
          disabled={publicando}
        >
          {publicando ? (
            <>
              <Loader2 className="spin" />
              Publicando...
            </>
          ) : (
            'Publicar anúncio'
          )}
        </button>
      </footer>
    </main>
  )
}