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
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!categoria) {
      return
    }

    const draft = getDraft(categoria)

    // The draft is browser storage and must hydrate after mounting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFotos(
      Array.isArray(draft.photos)
        ? draft.photos
        : [],
    )
  }, [categoria])

  async function compactarImagem(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) throw new Error('Selecione apenas arquivos de imagem.')
    if (file.size > 15 * 1024 * 1024) throw new Error('Cada imagem deve ter no máximo 15 MB.')

    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Não foi possível preparar esta imagem.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    let quality = 0.82
    let blob: Blob | null = null
    while (quality >= 0.5) {
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
      if (blob && blob.size <= 600 * 1024) break
      quality -= 0.08
    }
    if (!blob || blob.size > 600 * 1024) throw new Error('A imagem não pôde ser compactada para o tamanho permitido.')

    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Falha ao ler a imagem.'))
      reader.onerror = () => reject(new Error('Falha ao ler a imagem.'))
      reader.readAsDataURL(blob)
    })
  }

  async function adicionar(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    )

    if (!files.length) {
      return
    }

    event.target.value = ''
    setErro(null)
    const disponiveis = Math.max(0, 5 - fotos.length)
    if (disponiveis === 0) {
      setErro('O limite é de 5 fotos por anúncio.')
      return
    }
    try {
      const escolhidos = await Promise.all(files.slice(0, disponiveis).map(compactarImagem))
      setFotos((atual) => [...atual, ...escolhidos].slice(0, 5))
      if (files.length > disponiveis) setErro('O anúncio aceita até 5 fotos. As imagens excedentes não foram adicionadas.')
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível preparar as fotos.')
    }
  }

  function remover(indexRemover: number) {
    setFotos((atual) =>
      atual.filter(
        (_, index) => index !== indexRemover,
      ),
    )
    setErro(null)
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
          Etapa 3 de 6
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

        {erro && <p role="alert" className="mb-4 text-sm font-semibold text-red-700">{erro}</p>}

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
