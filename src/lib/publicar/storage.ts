
// src/lib/publicar/storage.ts

export interface CustoItem {
  label: string
  valor_centavos: number
}

export interface LocalizacaoFrete {
  endereco: string
  cidade: string
  estado: string
  cep: string
}

export interface FreteDraft {
  localizacao: LocalizacaoFrete
  peso_g: number
  altura_cm: number
  largura_cm: number
  comprimento_cm: number
  pagador?: "vendedor" | "comprador" | "retirada_local"
}

export interface PrecoDraft {
  valor_centavos: number
  custos?: CustoItem[]
}

export interface DestacarDraft {
  tier_id: string
}

export interface PublishDraft {
  titulo?: string
  descricao?: string
  condicao?: string

  categoryId?: string

  // Etapa: características
  subcategoryId?: string
  bikeType?: string
  peca?: string
  material?: string
  aro?: string
  tamanho?: string

  // Etapa: informações
  title?: string
  description?: string
  condition?: string

  // Etapa: fotos
  photos?: string[]

  // Etapa: frete
  frete?: FreteDraft

  // Etapa: preço
  preco?: PrecoDraft

  // Etapa: destaque
  destacar?: DestacarDraft
}

function storageKey(categoria: string) {
  return `imperium_publish_draft:${categoria}`
}

export function getDraft(categoria: string): PublishDraft {
  if (typeof window === "undefined") {
    return {}
  }

  const raw = sessionStorage.getItem(storageKey(categoria))

  if (!raw) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw)

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as PublishDraft
    }

    return {}
  } catch {
    return {}
  }
}

export function saveDraft(
  categoria: string,
  patch: Partial<PublishDraft>
): PublishDraft {
  const current = getDraft(categoria)

  const updated: PublishDraft = {
    ...current,
    ...patch,
    categoryId: categoria,
  }

  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      storageKey(categoria),
      JSON.stringify(updated)
    )
  }

  return updated
}

export function clearDraft(categoria: string) {
  if (typeof window === "undefined") {
    return
  }

  sessionStorage.removeItem(storageKey(categoria))
}