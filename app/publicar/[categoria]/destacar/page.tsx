"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { getCategoriaConfig } from "@/lib/publicar/categorias"
import { clearDraft, getDraft, saveDraft } from "@/lib/publicar/storage"
import { apiFetch, API_URL } from "@/lib/apiClient"
import { useUserSync } from "@/lib/UserSyncContext"

interface BoostTier {
  id: string
  label: string
  description: string
  percentual: number
  // Precisa bater exatamente com o nome do enum HighlightTier no backend.
  backendId: "GRATUITO" | "BASICO" | "AVANCADO" | "TOPO"
}

// A cobrança é descontada do vendedor somente após a venda.
// A taxa não é cobrada no momento da publicação.
const TIERS: BoostTier[] = [
  { id: "free", label: "Gratuito", description: "Alcance padrão no feed e na busca", percentual: 0, backendId: "GRATUITO" },
  { id: "basico", label: "Básico", description: "Um pouco mais de alcance no feed e na busca", percentual: 2, backendId: "BASICO" },
  { id: "avancado", label: "Avançado", description: "Boa parte de alcance no feed e na busca", percentual: 5, backendId: "AVANCADO" },
  { id: "topo", label: "Topo", description: "Prioridade máxima no feed e na busca", percentual: 7, backendId: "TOPO" },
]

interface CategoryResponse {
  id: string
  slug: string
}

async function dataUrlParaArquivo(dataUrl: string, nome: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], nome, { type: blob.type })
}

export default function DestacarPage() {
  const params = useParams<{ categoria: string }>()
  const categoria = params.categoria

  const config = getCategoriaConfig(categoria)
  const router = useRouter()
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { isSynced } = useUserSync()

  const [precoCentavos, setPrecoCentavos] = useState<number | null>(null)
  const [tierSelecionado, setTierSelecionado] = useState<string>("free")
  const [publicando, setPublicando] = useState(false)
  const [etapaPublicacao, setEtapaPublicacao] = useState<string>("")

  useEffect(() => {
    const draft = getDraft(categoria)

    if (
      !draft.preco ||
      typeof draft.preco.valor_centavos !== "number" ||
      draft.preco.valor_centavos <= 0
    ) {
      router.replace(`/publicar/${categoria}/preco`)
      return
    }

    setPrecoCentavos(draft.preco.valor_centavos)

    if (draft.destacar?.tier_id) {
      setTierSelecionado(draft.destacar.tier_id)
    }
  }, [categoria, router])

  function taxaCentavos(percentual: number) {
    if (precoCentavos === null || precoCentavos <= 0) return 0
    return Math.round((precoCentavos * percentual) / 100)
  }

  function formatarMoeda(valorCentavos: number) {
    return (valorCentavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  /** Faz upload de uma foto (data URL) pro backend e devolve a URL absoluta já hospedada. */
  async function uploadFoto(dataUrl: string, indice: number): Promise<string> {
    const token = await getToken()
    const arquivo = await dataUrlParaArquivo(dataUrl, `foto-${indice}.jpg`)

    const formData = new FormData()
    formData.append("file", arquivo)
    formData.append("subdirectory", "products")

    const res = await fetch(`${API_URL}/api/files/upload/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      // NÃO define Content-Type manualmente — o browser define o boundary
      // certo do multipart sozinho quando o body é um FormData.
    })

    if (!res.ok) {
      throw new Error(`Falha ao enviar foto ${indice + 1}`)
    }

    const data = await res.json()
    const publicUrlRelativa: string = data?.data?.publicUrl

    if (!publicUrlRelativa) {
      throw new Error(`Resposta inesperada ao enviar foto ${indice + 1}`)
    }

    // publicUrl vem relativa ("/api/files/...") — precisa virar absoluta,
    // senão o navegador tenta buscar a imagem no domínio do FRONTEND (o
    // mesmo bug que corrigimos no POST /api/products).
    return `${API_URL}${publicUrlRelativa}`
  }

  async function handlePublicar() {
    if (!isLoaded || !isSignedIn || !isSynced) return

    setPublicando(true)
    setEtapaPublicacao("Salvando destaque...")

    try {
      saveDraft(categoria, { destacar: { tier_id: tierSelecionado } })
      const draftFinal = getDraft(categoria)

      const tier = TIERS.find((t) => t.id === tierSelecionado) ?? TIERS[0]

      // 1) Resolve a categoria (slug -> UUID real no backend)
      setEtapaPublicacao("Preparando categoria...")
      const categoryResponse = await apiFetch<CategoryResponse>(
        `/api/categories/slug/${categoria}`,
        getToken
      )

      // 2) Upload de cada foto, em paralelo
      const fotos = draftFinal.photos ?? []
      if (fotos.length === 0) {
        throw new Error("Adicione pelo menos uma foto antes de publicar.")
      }

      setEtapaPublicacao(`Enviando ${fotos.length} foto${fotos.length > 1 ? "s" : ""}...`)
      const urlsFotos = await Promise.all(
        fotos.map((foto: string, indice: number) => uploadFoto(foto, indice))
      )

      const images = urlsFotos.map((url, indice) => ({
        url,
        isMain: indice === 0,
        displayOrder: indice,
      }))

      // 3) Monta o payload EXATAMENTE no formato do ProductRequest do backend
      setEtapaPublicacao("Publicando anúncio...")

      const condicaoBackend =
        draftFinal.condicao === "novo" ? "NEW" : draftFinal.condicao === "usado" ? "USED" : null

      if (!condicaoBackend) {
        throw new Error("Condição do produto não informada. Volte à etapa de informações.")
      }

      await apiFetch("/api/products", getToken, {
        method: "POST",
        body: JSON.stringify({
          title: draftFinal.titulo,
          description: draftFinal.descricao,
          price: (draftFinal.preco?.valor_centavos ?? 0) / 100,
          condition: condicaoBackend,
          categoryId: categoryResponse.id,
          weightKg: draftFinal.frete?.peso_g ? draftFinal.frete.peso_g / 1000 : undefined,
          heightCm: draftFinal.frete?.altura_cm,
          widthCm: draftFinal.frete?.largura_cm,
          lengthCm: draftFinal.frete?.comprimento_cm,
          city: draftFinal.frete?.localizacao?.cidade,
          state: draftFinal.frete?.localizacao?.estado,
          highlightTier: tier.backendId,
          images,
        }),
      })

      clearDraft(categoria)
      router.push("/")
    } catch (erro) {
      console.error("Erro ao publicar anúncio:", erro)
      const mensagem = erro instanceof Error ? erro.message : "Não foi possível publicar o anúncio."
      window.alert(mensagem)
    } finally {
      setPublicando(false)
      setEtapaPublicacao("")
    }
  }

  if (precoCentavos === null) {
    return null
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href={`/publicar/${categoria}/preco`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Link>

          <span className="text-sm font-semibold">
            {config?.label ?? "Anúncio"}
          </span>

          <div className="w-[52px]" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <section className="mb-6">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Etapa 6 de 6
          </p>

          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full rounded-full bg-primary" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Destacar anúncio
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Quanto maior o destaque, mais visibilidade seu anúncio recebe
            no feed e na busca. A taxa só é cobrada se o produto vender.
          </p>
        </section>

        <section className="space-y-2">
          {TIERS.map((tier) => {
            const valorTaxa = taxaCentavos(tier.percentual)
            const selecionado = tierSelecionado === tier.id

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setTierSelecionado(tier.id)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  selecionado
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <span>
                  <span className="block text-sm font-medium">
                    {tier.label}
                  </span>

                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {tier.description}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-right text-sm">
                    {tier.percentual === 0 ? (
                      <span className="text-muted-foreground">
                        Sem custo
                      </span>
                    ) : (
                      <>
                        <span className="block font-semibold">
                          {formatarMoeda(valorTaxa)}
                        </span>

                        <span className="block text-xs text-muted-foreground">
                          {tier.percentual}% se vender
                        </span>
                      </>
                    )}
                  </span>

                  {selecionado && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <button
            type="button"
            onClick={handlePublicar}
            disabled={publicando || !isLoaded || !isSignedIn || !isSynced}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {publicando ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {etapaPublicacao || "Publicando..."}
              </>
            ) : (
              "Publicar anúncio"
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
