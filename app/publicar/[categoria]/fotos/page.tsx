'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Trash2,
  X,
} from 'lucide-react'
import {
  clearDraft,
  getDraft,
  saveDraft,
} from '@/lib/publicar/storage'

export default function FotosPage() {
  const { categoria } = useParams<{
    categoria: string
  }>()

  const router = useRouter()

  const input = useRef<HTMLInputElement>(null)

  const [fotos, setFotos] = useState<string[]>([])

  useEffect(() => {
    if (!categoria) {
      return
    }

    const draft = getDraft(categoria)

    setFotos(
      Array.isArray(draft.photos)
        ? draft.photos
        : [],
    )
  }, [categoria])

  function adicionar(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    )

    if (!files.length) {
      return
    }

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        const resultado = String(
          reader.result ?? '',
        )

        if (!resultado) {
          return
        }

        setFotos((atual) => [
          ...atual,
          resultado,
        ])
      }

      reader.readAsDataURL(file)
    })

    event.target.value = ''
  }

  function remover(indexRemover: number) {
    setFotos((atual) =>
      atual.filter(
        (_, index) => index !== indexRemover,
      ),
    )
  }

  function voltar() {
    router.push(
      `/publicar/${categoria}/informacoes`,
    )
  }

  function cancelar() {
    clearDraft(categoria)
    router.push('/publicar')
  }

  function continuar() {
    if (!fotos.length) {
      return
    }

    saveDraft(categoria, {
      photos: fotos,
    })

    router.push(
      `/publicar/${categoria}/frete`,
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
          Etapa 2 de 5
        </p>

        <h1>
          Fotos do produto
        </h1>

        <p className="publish-lead">
          Mostre o produto com imagens nítidas e de
          vários ângulos.
        </p>

        <div className="publish-progress">
          <span
            style={{
              width: '40%',
            }}
          />
        </div>

        <input
          ref={input}
          hidden
          type="file"
          accept="image/*"
          multiple
          onChange={adicionar}
        />

        {!fotos.length ? (
          <button
            type="button"
            className="upload-box"
            onClick={() =>
              input.current?.click()
            }
          >
            <ImagePlus />

            <b>
              Selecionar fotos
            </b>

            <span>
              Adicione pelo menos uma foto
            </span>
          </button>
        ) : (
          <div className="photo-grid">
            {fotos.map((foto, index) => (
              <div
                className="photo-item"
                key={`${foto.slice(
                  0,
                  12,
                )}-${index}`}
              >
                <img
                  src={foto}
                  alt={`Foto do produto ${
                    index + 1
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    remover(index)
                  }
                  aria-label={`Remover foto ${
                    index + 1
                  }`}
                >
                  <Trash2 />
                </button>
              </div>
            ))}

            <button
              type="button"
              className="upload-more"
              onClick={() =>
                input.current?.click()
              }
            >
              <ImagePlus />
              Adicionar
            </button>
          </div>
        )}
      </div>

      <footer className="publish-footer">
        <button
          type="button"
          disabled={!fotos.length}
          onClick={continuar}
        >
          Continuar
          <ArrowRight />
        </button>
      </footer>
    </main>
  )
}