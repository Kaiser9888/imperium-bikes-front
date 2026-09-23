'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Loader2, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

import { getCategoriaConfig } from '@/lib/publicar/categorias'
import {
  clearDraft,
  getDraft,
  saveDraft,
} from '@/lib/publicar/storage'
import { apiFetch, API_URL } from '@/lib/apiClient'
import { useUserSync } from '@/lib/UserSyncContext'

interface BoostTier {
  id: string
  label: string
  description: string
  percentual: number
  backendId: 'GRATUITO' | 'BASICO' | 'AVANCADO' | 'TOPO'
}

const TIERS: BoostTier[] = [
  {
    id: 'free',
    label: 'Gratuito',
    description: 'Alcance padrão no feed e na busca',
    percentual: 0,
    backendId: 'GRATUITO',
  },
  {
    id: 'basico',
    label: 'Básico',
    description: 'Um pouco mais de alcance no feed e na busca',
    percentual: 2,
    backendId: 'BASICO',
  },
  {
    id: 'avancado',
    label: 'Avançado',
    description: 'Boa parte de alcance no feed e na busca',
    percentual: 5,
    backendId: 'AVANCADO',
  },
  {
    id: 'topo',
    label: 'Topo',
    description: 'Prioridade máxima no feed e na busca',
    percentual: 7,
    backendId: 'TOPO',
  },
]

interface CategoryResponse {
  id: string
  slug: string
}

async function dataUrlParaArquivo(
  dataUrl: string,
  nome: string,
): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()

  return new File(
    [blob],
    nome,
    {
      type: blob.type,
    },
  )
}

export default function DestacarPage() {
  const params = useParams<{
    categoria: string
  }>()

  const categoria = params.categoria

  const config = getCategoriaConfig(categoria)
  const router = useRouter()

  const {
    getToken,
    isLoaded,
    isSignedIn,
  } = useAuth()

  const { isSynced } = useUserSync()

  const [precoCentavos, setPrecoCentavos] =
    useState<number | null>(null)

  const [tierSelecionado, setTierSelecionado] =
    useState<string>('free')

  const [publicando, setPublicando] =
    useState(false)

  const [etapaPublicacao, setEtapaPublicacao] =
    useState('')

  useEffect(() => {
    if (!categoria) {
      return
    }

    const draft = getDraft(categoria)

    if (
      !draft.preco ||
      typeof draft.preco.valor_centavos !== 'number' ||
      draft.preco.valor_centavos <= 0
    ) {
      router.replace(
        `/publicar/${categoria}/preco`,
)

return
}

setPrecoCentavos(
  draft.preco.valor_centavos,
)

if (draft.destacar?.tier_id) {
  setTierSelecionado(
    draft.destacar.tier_id,
  )
}
}, [categoria, router])

function voltar() {
  router.push(
    `/publicar/${categoria}/preco`,
  )
}

function cancelar() {
  clearDraft(categoria)
  router.push('/publicar')
}

function taxaCentavos(
  percentual: number,
) {
  if (
    precoCentavos === null ||
    precoCentavos <= 0
  ) {
    return 0
  }

  return Math.round(
    (precoCentavos * percentual) / 100,
  )
}

function formatarMoeda(
  valorCentavos: number,
) {
  return (
    valorCentavos / 100
  ).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  )
}

async function uploadFoto(
  dataUrl: string,
  indice: number,
): Promise<string> {
  const token = await getToken()

  const arquivo =
    await dataUrlParaArquivo(
      dataUrl,
      `foto-${indice}.jpg`,
    )

  const formData = new FormData()

  formData.append(
    'file',
    arquivo,
  )

  formData.append(
    'subdirectory',
    'products',
  )

  const res = await fetch(
    `${API_URL}/api/files/upload/image`,
    {
      method: 'POST',
      headers: token
        ? {
          Authorization:
            `Bearer ${token}`,
        }
        : {},
      body: formData,
    },
  )

  if (!res.ok) {
    throw new Error(
      `Falha ao enviar foto ${indice + 1}`,
    )
  }

  const data = await res.json()

  const publicUrlRelativa: string =
    data?.data?.publicUrl

  if (!publicUrlRelativa) {
    throw new Error(
      `Resposta inesperada ao enviar foto ${indice + 1}`,
    )
  }

  return `${API_URL}${publicUrlRelativa}`
}

async function handlePublicar() {
  if (
    !isLoaded ||
    !isSignedIn ||
    !isSynced
  ) {
    return
  }

  setPublicando(true)
  setEtapaPublicacao(
    'Salvando destaque...',
  )

  try {
    saveDraft(categoria, {
      destacar: {
        tier_id: tierSelecionado,
      },
    })

    const draftFinal =
      getDraft(categoria)

    const tier =
      TIERS.find(
        (item) =>
          item.id === tierSelecionado,
      ) ?? TIERS[0]

    setEtapaPublicacao(
      'Preparando categoria...',
    )

    const categoryResponse =
      await apiFetch<CategoryResponse>(
        `/api/categories/slug/${categoria}`,
        getToken,
      )

    const fotos =
      draftFinal.photos ?? []

    if (fotos.length === 0) {
      throw new Error(
        'Adicione pelo menos uma foto antes de publicar.',
      )
    }

    setEtapaPublicacao(
      `Enviando ${fotos.length} foto${
        fotos.length > 1 ? 's' : ''
      }...`,
    )

    const urlsFotos =
      await Promise.all(
        fotos.map(
          (
            foto: string,
            indice: number,
          ) =>
            uploadFoto(
              foto,
              indice,
            ),
        ),
      )

    const images =
      urlsFotos.map(
        (
          url,
          indice,
        ) => ({
          url,
          isMain:
            indice === 0,
          displayOrder:
          indice,
        }),
      )

    setEtapaPublicacao(
      'Publicando anúncio...',
    )

    const condicaoBackend =
      draftFinal.condicao ===
      'novo'
        ? 'NEW'
        : draftFinal.condicao ===
        'usado'
          ? 'USED'
          : null

    if (!condicaoBackend) {
      throw new Error(
        'Condição do produto não informada. Volte à etapa de informações.',
      )
    }

    await apiFetch(
      '/api/products',
      getToken,
      {
        method: 'POST',

        body: JSON.stringify({
          title:
          draftFinal.titulo,

          description:
          draftFinal.descricao,

          price:
            (draftFinal.preco
                ?.valor_centavos ??
              0) / 100,

          condition:
          condicaoBackend,

          categoryId:
          categoryResponse.id,

          weightKg:
            draftFinal.frete
              ?.peso_g
              ? draftFinal.frete
              .peso_g / 1000
              : undefined,

          heightCm:
          draftFinal.frete
            ?.altura_cm,

          widthCm:
          draftFinal.frete
            ?.largura_cm,

          lengthCm:
          draftFinal.frete
            ?.comprimento_cm,

          city:
          draftFinal.frete
            ?.localizacao
            ?.cidade,

          state:
          draftFinal.frete
            ?.localizacao
            ?.estado,

          highlightTier:
          tier.backendId,

          images,
        }),
      },
    )

    clearDraft(categoria)

    router.push('/')
  } catch (erro) {
    console.error(
      'Erro ao publicar anúncio:',
      erro,
    )

    const mensagem =
      erro instanceof Error
        ? erro.message
        : 'Não foi possível publicar o anúncio.'

    window.alert(mensagem)
  } finally {
    setPublicando(false)
    setEtapaPublicacao('')
  }
}

if (precoCentavos === null) {
  return null
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
        Etapa 6 de 6
      </p>

      <h1>
        Destacar anúncio
      </h1>

      <p className="publish-lead">
        Escolha o nível de destaque
        para aumentar a visibilidade
        do seu anúncio no feed e na
        busca.
      </p>

      <div className="publish-progress">
          <span
            style={{
              width: '100%',
            }}
          />
      </div>

      <section className="publish-card publish-form">
        <fieldset>
          <legend>
            Nível de destaque
          </legend>

          <div className="publish-options">
            {TIERS.map((tier) => {
              const valorTaxa =
                taxaCentavos(
                  tier.percentual,
                )

              const selecionado =
                tierSelecionado ===
                tier.id

              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() =>
                    setTierSelecionado(
                      tier.id,
                    )
                  }
                  className={
                    selecionado
                      ? 'is-selected'
                      : ''
                  }
                >
                    <span>
                      <b>
                        {tier.label}
                      </b>

                      <small>
                        {tier.description}
                      </small>

                      {tier.percentual >
                        0 && (
                          <small>
                            {tier.percentual}% sobre a venda
                          </small>
                        )}
                    </span>

                  <span>
                      {tier.percentual ===
                      0 ? (
                        <small>
                          Sem custo
                        </small>
                      ) : (
                        <b>
                          {formatarMoeda(
                            valorTaxa,
                          )}
                        </b>
                      )}

                    {selecionado && (
                      <Check />
                    )}
                    </span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="price-summary">
            <span>
              Valor do anúncio
            </span>

          <b>
            {formatarMoeda(
              precoCentavos,
            )}
          </b>
        </div>
      </section>
    </div>

    <footer className="publish-footer">
      <button
        type="button"
        onClick={handlePublicar}
        disabled={
          publicando ||
          !isLoaded ||
          !isSignedIn ||
          !isSynced
        }
      >
        {publicando ? (
          <>
            <Loader2 className="spin" />
            {etapaPublicacao ||
              'Publicando...'}
          </>
        ) : (
          <>
            Publicar anúncio
            <Check />
          </>
        )}
      </button>
    </footer>
  </main>
)
}

