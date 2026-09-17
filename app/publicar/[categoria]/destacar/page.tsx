"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { getCategoriaConfig } from "@/lib/publicar/categorias"
import { clearDraft, getDraft, saveDraft } from "@/lib/publicar/storage"

interface BoostTier {
  id: string
  label: string
  description: string
  percentual: number
}

// A cobrança é descontada do vendedor somente após a venda.
// A taxa não é cobrada no momento da publicação.
const TIERS: BoostTier[] = [
  {
    id: "free",
    label: "Gratuito",
    description: "Alcance padrão no feed e na busca",
    percentual: 0,
  },
  {
    id: "basico",
    label: "Básico",
    description: "Um pouco mais de alcance no feed e na busca",
    percentual: 2,
  },
  {
    id: "avancado",
    label: "Avançado",
    description: "Boa parte de alcance no feed e na busca",
    percentual: 5,
  },
  {
    id: "topo",
    label: "Topo",
    description: "Prioridade máxima no feed e na busca",
    percentual: 7,
  },
]

export default function DestacarPage() {
  const params = useParams<{ categoria: string }>()
  const categoria = params.categoria

  const config = getCategoriaConfig(categoria)
  const router = useRouter()

  const [precoCentavos, setPrecoCentavos] = useState<number | null>(null)
  const [tierSelecionado, setTierSelecionado] = useState<string>("free")
  const [publicando, setPublicando] = useState(false)

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
    if (precoCentavos === null || precoCentavos <= 0) {
      return 0
    }

    return Math.round(
      (precoCentavos * percentual) / 100
    )
  }

  function formatarMoeda(valorCentavos: number) {
    return (valorCentavos / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  async function handlePublicar() {
    setPublicando(true)

    try {
      saveDraft(categoria, {
        destacar: {
          tier_id: tierSelecionado,
        },
      })

      const draftFinal = getDraft(categoria)

      await new Promise((resolve) => {
        setTimeout(resolve, 900)
      })

      console.log("Publicando anúncio:", draftFinal)

      clearDraft(categoria)

      router.push("/")
    } finally {
      setPublicando(false)
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
            disabled={publicando}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {publicando ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Publicando...
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