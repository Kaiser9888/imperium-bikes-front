'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

import { nomeDaCategoria } from '@/lib/publicar/categorias'
import { identificar, OPCOES_MODALIDADE } from '@/lib/publicar/taxonomia'
import {
  clearDraft,
  getDraft,
  marcarPublicado,
  saveDraft,
  type PublishDraft,
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

/** O que a revisão mostra, montado do rascunho das etapas anteriores. */
type Resumo = {
  foto: string | null
  totalFotos: number
  titulo: string
  descricao: string
  detalhes: string
  entrega: string
  aPartirDe: boolean
}

function montarResumo(categoria: string, draft: PublishDraft): Resumo {
  const fotos = draft.photos ?? []
  const local = [draft.frete?.localizacao?.cidade, draft.frete?.localizacao?.estado].filter(Boolean).join('/')
  const servico = categoria === 'servicos'

  const modalidade = OPCOES_MODALIDADE.find((item) => item.value === draft.modality)?.label
  const condicao = servico || categoria === 'consumiveis'
    ? null
    : draft.condicao === 'novo' ? 'Novo' : draft.condicao === 'usado' ? 'Usado' : null
  const detalhes = [condicao, modalidade, draft.marca, draft.modelo].filter(Boolean).join(' · ')

  const pagador = draft.frete?.pagador
  const limite = draft.frete?.limite_frete_centavos
  const entrega = servico
    ? [draft.frete?.localizacao?.bairro, local].filter(Boolean).join(', ') || 'Combinado pelo chat'
    : pagador === 'retirada_local'
      ? `Só retirada em mãos${local ? ` em ${local}` : ''}`
      : pagador === 'vendedor' && limite
        ? `Envio com frete grátis até ${(limite / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}${local ? `, saindo de ${local}` : ''}`
        : `Envio pago pelo comprador${local ? `, saindo de ${local}` : ''}`

  return {
    foto: fotos[0] ?? null,
    totalFotos: fotos.length,
    titulo: String(draft.titulo ?? ''),
    descricao: String(draft.descricao ?? ''),
    detalhes,
    entrega,
    aPartirDe: Boolean(draft.preco?.a_partir_de),
  }
}

export default function DestacarPage() {
  const params = useParams<{
    categoria: string
  }>()

  const categoria = params.categoria

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

  const [resumo, setResumo] =
    useState<Resumo | null>(null)

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
setResumo(montarResumo(categoria, draft))

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
    marcarPublicado(categoria)

    // replace: a revisão sai do histórico; as etapas anteriores mandam à Central (VoltaDepoisDePublicar)
    router.replace('/vendedor')
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
        {nomeDaCategoria(categoria)}
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
        Confira como o anúncio vai aparecer. Todo anúncio tem o mesmo alcance no feed e na busca.
      </p>

      <div className="publish-progress">
          <span
            style={{
              width: '100%',
            }}
          />
      </div>

      {/* Prévia: o que o comprador vai ver, com atalho para corrigir cada parte */}
      {resumo && (
        <section className="publish-card revisao">
          {resumo.foto && (
            <div className="revisao-foto">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto ainda local (data URL), antes do envio */}
              <img src={resumo.foto} alt="" />
              {resumo.totalFotos > 1 && <span>{resumo.totalFotos} fotos</span>}
            </div>
          )}

          <div className="revisao-corpo">
            <p className="revisao-titulo">{resumo.titulo}</p>
            <p className="revisao-preco">
              {resumo.aPartirDe && <small>a partir de </small>}
              {formatarMoeda(precoCentavos)}
            </p>
            {resumo.detalhes && <p className="revisao-detalhes">{resumo.detalhes}</p>}
            {resumo.descricao && <p className="revisao-descricao">{resumo.descricao}</p>}
          </div>

          <dl className="revisao-lista">
            <div>
              <dt>{categoria === 'servicos' ? 'Atendimento' : 'Entrega'}</dt>
              <dd>{resumo.entrega}</dd>
              <Link href={`/publicar/${categoria}/frete`}>Editar</Link>
            </div>
            <div>
              <dt>Fotos</dt>
              <dd>{resumo.totalFotos === 1 ? '1 foto' : `${resumo.totalFotos} fotos`}</dd>
              <Link href={`/publicar/${categoria}/fotos`}>Editar</Link>
            </div>
            <div>
              <dt>Título e descrição</dt>
              <dd>{resumo.detalhes || 'Informações do anúncio'}</dd>
              <Link href={`/publicar/${categoria}/informacoes`}>Editar</Link>
            </div>
          </dl>
        </section>
      )}

      <section className="publish-card publish-form">
        <div className="price-summary">
          <span>
            {resumo?.aPartirDe ? 'Valor a partir de' : 'Você recebe por venda'}
          </span>

          <b>
            {formatarMoeda(precoCentavos)}
          </b>

          <Link href={`/publicar/${categoria}/preco`} className="revisao-editar">Editar</Link>
        </div>

        <small>
          {resumo?.aPartirDe
            ? 'Sem taxa: o valor final e o pagamento são combinados direto com o cliente pelo chat.'
            : categoria === 'servicos'
              ? 'Anunciar no Imperium não tem taxa. O cliente paga a Proteção Imperium.'
              : 'Vender no Imperium não tem taxa. O comprador paga a Proteção Imperium.'}
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
              <b>Se o comprador vier retirar em mãos, também aceito receber direto</b>
              <small className="block">
                Opcional. Sem a proteção do Imperium: vocês combinam e o pagamento é entre vocês. Encontre em lugar público e confira o Pix no app do banco antes de entregar.
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

