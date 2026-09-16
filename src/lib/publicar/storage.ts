// lib/publicar/storage.ts

export interface CustoItem {
  label: string;
  valor_centavos: number;
}

export interface LocalizacaoFrete {
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface FreteDraft {
  localizacao: LocalizacaoFrete;
  peso_g: number;
  altura_cm: number;
  largura_cm: number;
  comprimento_cm: number;
  pagador?: "vendedor" | "comprador" | "retirada_local";
}

export interface PrecoDraft {
  valor_centavos: number;
  custos?: CustoItem[];
}

export interface DestacarDraft {
  tier_id: string;
}

/**
 * Formato único do rascunho de anúncio, cobrindo TODAS as etapas do
 * fluxo de publicação. Antes, cada etapa gravava numa chave diferente do
 * sessionStorage (algumas direto, outras via um "draft" por categoria) —
 * isso fazia o app "esquecer" os dados das etapas anteriores assim que o
 * usuário chegava no fim do fluxo. Agora é tudo a mesma estrutura, uma
 * chave por categoria.
 */
export interface PublishDraft {
  categoryId?: string;

  // Etapa: características (ex: modalidade da bike)
  subcategoryId?: string;
  bikeType?: string;
  peca?: string;
  material?: string;
  aro?: string;
  tamanho?: string;

  // Etapa: informações
  title?: string;
  description?: string;
  condition?: string;

  // Etapa: fotos (data URLs temporárias, até existir upload real)
  photos?: string[];

  // Etapa: frete
  frete?: FreteDraft;

  // Etapa: preço
  preco?: PrecoDraft;

  // Etapa: destacar
  destacar?: DestacarDraft;
}

function storageKey(categoria: string) {
  return `imperium_publish_draft:${categoria}`;
}

/** Lê o rascunho salvo dessa categoria. Nunca retorna null — sempre um objeto (vazio se não houver nada salvo). */
export function getDraft(categoria: string): PublishDraft {
  if (typeof window === "undefined") return {};

  const raw = sessionStorage.getItem(storageKey(categoria));
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as PublishDraft;
    }
    return {};
  } catch {
    return {};
  }
}

/** Faz merge (raso) do que for passado com o rascunho já existente, e salva. */
export function saveDraft(categoria: string, patch: Partial<PublishDraft>): PublishDraft {
  const current = getDraft(categoria);
  const updated: PublishDraft = { ...current, ...patch, categoryId: categoria };
  if (typeof window !== "undefined") {
    sessionStorage.setItem(storageKey(categoria), JSON.stringify(updated));
  }
  return updated;
}

/** Remove o rascunho dessa categoria (chamar depois de publicar com sucesso, ou ao cancelar). */
export function clearDraft(categoria: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(storageKey(categoria));
}