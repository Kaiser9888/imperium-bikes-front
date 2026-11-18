// src/lib/publicar/categorias.ts

// Rascunho e navegação do fluxo de publicação. As perguntas de cada
// categoria ficam em perguntas.ts; o nome, em lib/categorias-loja.ts.

import { nomeDaCategoria as nomeNaLoja } from "@/lib/categorias-loja"

/** Nome no topo de todas as etapas: o mesmo da Central e da loja (ex.: "Nutrição e hidratação"). */
export function nomeDaCategoria(categoria: string): string {
  return nomeNaLoja(categoria) ?? "Anúncio"
}

// ============================================================
// RASCUNHO (draft) — fonte única de verdade do fluxo de publicação
// ============================================================
//
// Tudo passa por aqui: características, informações, fotos, frete,
// preço e destaque. Uma chave por categoria no sessionStorage, então
// nenhuma etapa "esquece" o que a etapa anterior salvou.

export interface PublishDraft {
  [key: string]: unknown
}

function draftKey(categoria: string): string {
  return `imperium_publish_draft:${categoria}`
}

export function readDraft(categoria: string): PublishDraft {
  if (typeof window === "undefined") return {}

  const raw = sessionStorage.getItem(draftKey(categoria))
    ?? sessionStorage.getItem("imperium_bikes_publish")
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {}
    const draft = parsed as PublishDraft
    return !draft.categoryId || draft.categoryId === categoria ? draft : {}
  } catch {
    return {}
  }
}

export function writeDraft(categoria: string, patch: Partial<PublishDraft>): PublishDraft {
  const current = readDraft(categoria)
  const updated: PublishDraft = { ...current, ...patch }
  if (typeof window !== "undefined") {
    sessionStorage.setItem(draftKey(categoria), JSON.stringify(updated))
  }
  return updated
}

/**
 * Primeira etapa (características): grava as respostas direto no rascunho da
 * categoria. Antes elas iam para uma chave antiga, e um rascunho abandonado
 * da mesma categoria continuava valendo por cima das respostas novas.
 */
export function startDraft(categoria: string, respostas: Partial<PublishDraft>): PublishDraft {
  const atual = readDraft(categoria)
  // A modalidade das bikes é sugerida pelas respostas; se elas mudaram, sugere de novo.
  if ("subModality" in respostas) delete atual.modality
  const updated: PublishDraft = { ...atual, ...respostas, categoryId: categoria }
  if (typeof window !== "undefined") {
    sessionStorage.setItem(draftKey(categoria), JSON.stringify(updated))
    sessionStorage.removeItem("imperium_bikes_publish")
  }
  return updated
}

export function clearDraft(categoria: string): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(draftKey(categoria))
  const legacy = readDraft(categoria)
  if (legacy.categoryId === categoria) sessionStorage.removeItem("imperium_bikes_publish")
}

// ============================================================
// NAVEGAÇÃO ENTRE ETAPAS
// ============================================================
//
// Ordem fixa do fluxo, depois da página de características (que fica
// na raiz /publicar/[categoria]). Se um dia precisar pular uma etapa
// condicionalmente (ex: "retirada local" pula frete), dá pra evoluir
// essas duas funções pra receber o draft e decidir dinamicamente —
// por enquanto a ordem é sempre a mesma.

const STEP_ORDER = ["informacoes", "fotos", "frete", "preco", "destacar"] as const

export type PublishStep = (typeof STEP_ORDER)[number]

export function nextStep(categoria: string, atual: PublishStep): string {
  const idx = STEP_ORDER.indexOf(atual)
  const proximo = STEP_ORDER[idx + 1]
  return proximo ? `/publicar/${categoria}/${proximo}` : `/publicar/${categoria}/destacar`
}

export function previousStep(categoria: string, atual: PublishStep): string {
  const idx = STEP_ORDER.indexOf(atual)
  if (idx <= 0) return `/publicar/${categoria}`
  return `/publicar/${categoria}/${STEP_ORDER[idx - 1]}`
}
