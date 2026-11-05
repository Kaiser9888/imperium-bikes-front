'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

import { getCategoriaConfig } from '@/lib/publicar/categorias'
import { identificar } from '@/lib/publicar/taxonomia'
import {
  clearDraft,
  getDraft,
  saveDraft,
} from '@/lib/publicar/storage'
import { apiFetch, API_URL } from '@/lib/apiClient'
import { useUserSync } from '@/lib/UserSyncContext'

import { BackButton } from "@/components/ui/back-button"

interface BoostTier {
  id: string
  label: string
  description: string
  percentual: number
  backendId: 'GRATUITO' | 'BASICO' | 'AVANCADO' | 'TOPO'
}

// Destaque pago desligado: todo anúncio tem o mesmo alcance e vender não tem taxa
const TIERS: BoostTier[] = [
  {
    id: 'free',
    label: 'Gratuito',
    description: 'Alcance padrão no feed e na busca',
    percentual: 0,
    backendId: 'GRATUITO',
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

  // Na retirada, também aceita receber direto (sem proteção); serviço já tem o seu próprio modo
  const [aceitaPagamentoDireto, setAceitaPagamentoDireto] =
    useState(false)

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

// Hydrate values saved by the previous publishing steps.
// eslint-disable-next-line react-hooks/set-state-in-effect
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

  const publicUrl =
    data?.data?.publicUrl ?? data?.data?.url ?? data?.publicUrl ?? data?.url

  if (typeof publicUrl !== 'string' || !publicUrl.trim()) {
    throw new Error(
      `Resposta inesperada ao enviar foto ${indice + 1}`,
    )
  }

  if (/^https?:\/\//i.test(publicUrl)) return publicUrl
  return `${API_URL}${publicUrl.startsWith('/') ? '' : '/'}${publicUrl}`
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

    const originPostalCode =
      draftFinal.frete?.localizacao?.cep
        ?.replace(/\D/g, '')

    if (!originPostalCode || originPostalCode.length !== 8) {
      throw new Error(
        'Informe um CEP de origem válido na etapa de frete antes de publicar.',
      )
    }

    // Esporte, modalidade e tipo: é o que coloca o anúncio na página certa.
    const identificacao = identificar(
      categoria,
      draftFinal as Record<string, unknown>,
    )

    if (!identificacao) {
      throw new Error(
        'Escolha a modalidade ou o esporte na etapa de informações antes de publicar.',
      )
    }

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

          sport:
          identificacao.sport,

          modality:
          identificacao.modality,

          productType:
          identificacao.productType,

          brand:
            draftFinal.marca || undefined,

          model:
            draftFinal.modelo || undefined,

          numeroSerie:
            draftFinal.numeroSerie || undefined,

          stock:
          draftFinal.quantidade,

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

          originPostalCode,

          // Serviço: "a partir de" (combinado direto) e local que aparece no anúncio
          precoAPartirDe: Boolean(draftFinal.preco?.a_partir_de),
          bairro: draftFinal.frete?.localizacao?.bairro || undefined,
          enderecoAtendimento: draftFinal.frete?.localizacao?.endereco_publico || undefined,

          // Retirada no local: sem envio pelo site (o checkout só oferece retirada com código)
          somenteRetirada: draftFinal.frete?.pagador === 'retirada_local',

          // "Eu arco com o frete": quanto o vendedor cobre (o comprador paga o que passar)
          freeShippingLimit:
            draftFinal.frete?.pagador === 'vendedor' && draftFinal.frete.limite_frete_centavos
              ? draftFinal.frete.limite_frete_centavos / 100
              : undefined,

          highlightTier:
          tier.backendId,

          aceitaPagamentoDireto: categoria !== 'servicos' && aceitaPagamentoDireto,

          images,
        }),
      },
    )

    clearDraft(categoria)

    router.push('/vendedor')
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
      <BackButton onClick={voltar} />

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
        Revisar e publicar
      </h1>

      <p className="publish-lead">
        Todo anúncio aparece com o mesmo alcance no feed e na busca.
      </p>

      <div className="publish-progress">
          <span
            style={{
              width: '100%',
            }}
          />
      </div>

      <section className="publish-card publish-form">
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

        <div className="price-summary">
          <span>
            Você recebe por venda
          </span>

          <b>
            {formatarMoeda(precoCentavos)}
          </b>
        </div>

        <small>
          Vender no Imperium não tem taxa. O comprador paga a Proteção Imperium.
        </small>

        {categoria !== 'servicos' && (
          <label className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              checked={aceitaPagamentoDireto}
              onChange={(evento) => setAceitaPagamentoDireto(evento.target.checked)}
              className="mt-1 size-4 shrink-0"
            />
            <span>
              <b>Na retirada em mãos, também aceito receber direto</b>
              <small className="block">
                Sem a proteção do Imperium: vocês combinam e o pagamento é entre vocês. Encontre em lugar público e confira o Pix no app do banco antes de entregar.
              </small>
            </span>
          </label>
        )}
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

