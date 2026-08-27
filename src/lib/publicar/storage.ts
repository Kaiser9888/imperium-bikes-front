// Persistência do rascunho de anúncio entre as etapas do fluxo de publicação.
// Cada categoria tem sua própria chave, então o usuário pode ter rascunhos
// em categorias diferentes sem um sobrescrever o outro.

export interface LocalizacaoFrete {
  endereco: string
  cidade: string
  estado: string
  cep: string
}

export interface CotacaoFrete {
  transportadora: string
  valor_centavos: number
  prazo_dias: number
}

export interface FreteDraft {
  localizacao?: LocalizacaoFrete
  peso_g?: number
  altura_cm?: number
  largura_cm?: number
  comprimento_cm?: number
  pagador?: "vendedor" | "comprador" | "retirada_local"
  cotacao?: CotacaoFrete | null
}

export interface CustoItem {
  label: string
  valor_centavos: number
}

export interface PrecoDraft {
  valor_centavos: number
  custos?: CustoItem[]
}

export interface DestacarDraft {
  tier_id: string
}

export interface PublishDraft {
  caracteristicas?: Record<string, string>
  title?: string
  description?: string
  condition?: string
  fotos?: string[]
  frete?: FreteDraft
  preco?: PrecoDraft
  destacar?: DestacarDraft
}

function storageKey(categoria: string) {
  return `imperium_publish_${categoria}`
}

export function getDraft(categoria: string): PublishDraft {
  if (typeof window === "undefined") return {}
  try {
    const raw = sessionStorage.getItem(storageKey(categoria))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveDraft(categoria: string, partial: Partial<PublishDraft>): PublishDraft {
  const current = getDraft(categoria)
  const next = { ...current, ...partial }
  sessionStorage.setItem(storageKey(categoria), JSON.stringify(next))
  return next
}

export function clearDraft(categoria: string) {
  sessionStorage.removeItem(storageKey(categoria))
}