// src/lib/publicar/taxonomia.ts
//
// Identificação do anúncio: em qual esporte e modalidade ele aparece e qual o
// tipo de produto. Os slugs são os mesmos das páginas /esportes/[slug] e
// /modalidades/[slug] e da lista fechada do backend (ProductTaxonomy).

import { esportes, modalidades } from "@/lib/esportes"

export const SPORT_CICLISMO = "ciclismo"

/** Categoria de publicação dos outros esportes (/publicar/esportes). */
export const CATEGORIA_ESPORTES = "esportes"

export const OPCOES_MODALIDADE = modalidades.map(({ slug, label }) => ({
  value: slug,
  label: slug === "outros" ? "Outra / várias modalidades" : label,
}))

export const OPCOES_ESPORTE = esportes.map(({ slug, nome }) => ({ value: slug, label: nome }))

/** Tipos de produto oferecidos em /publicar/esportes, por esporte. */
export const TIPOS_POR_ESPORTE: Record<string, string[]> = {
  corrida: ["Tênis", "Camiseta", "Shorts e bermudas", "Meias", "Relógio e GPS", "Cinto e mochila de hidratação", "Viseira e boné", "Óculos", "Acessórios"],
  natacao: ["Óculos de natação", "Touca", "Sunga, maiô e bermuda", "Nadadeira", "Palmar", "Prancha e pullbuoy", "Roupa de neoprene", "Acessórios"],
  futebol: ["Chuteira", "Bola", "Camisa", "Shorts", "Meião", "Caneleira", "Luva de goleiro", "Bolsa e mochila", "Acessórios"],
  musculacao: ["Halteres e anilhas", "Barra", "Banco", "Estação e aparelho", "Elástico e faixa", "Luva e strap", "Cinto", "Roupas", "Acessórios"],
  lutas: ["Luva", "Kimono", "Faixa", "Protetor bucal", "Caneleira", "Capacete", "Saco de pancada", "Aparador", "Roupas", "Acessórios"],
}

const MODALIDADE_POR_SUBMODALIDADE: Record<string, string> = {
  downhill: "downhill",
  bmx: "bmx",
  "dirt-jump": "bmx",
  pumptrack: "bmx",
  "cross-country": "mountain",
  trail: "mountain",
  enduro: "mountain",
  "speed-race": "speed",
  endurance: "speed",
  gravel: "speed",
  passe: "urbana",
  cargo: "urbana",
}

const MODALIDADE_POR_TIPO_DE_BIKE: Record<string, string> = {
  urbana: "urbana",
  "mountain-bike": "mountain",
  estrada: "speed",
  fixa: "urbana",
}

type Rascunho = Record<string, unknown>

const texto = (valor: unknown) => (typeof valor === "string" ? valor : "")

/** Modalidade que as respostas do formulário de bikes já indicam, se houver. */
export function modalidadeSugerida(rascunho: Rascunho): string {
  return (
    MODALIDADE_POR_SUBMODALIDADE[texto(rascunho.subModality)] ??
    MODALIDADE_POR_TIPO_DE_BIKE[texto(rascunho.bikeType)] ??
    ""
  )
}

// Mesmo conjunto aceito pelo backend: letras, números, espaço e . , / & ( ) + ' -
const FORA_DO_TIPO = /[^\p{L}\p{N} .,/&()+'-]/gu

/** Tipo de produto do anúncio (ex.: "Capacete"), a partir das escolhas da primeira etapa. */
export function tipoDoProduto(categoria: string, rascunho: Rascunho): string | undefined {
  const bruto =
    categoria === "bikes"
      ? rascunho.saleFormat === "quadro"
        ? "Quadro"
        : "Bike Completa"
      : texto(rascunho.tipo)

  const limpo = bruto.replace(FORA_DO_TIPO, " ").replace(/\s+/g, " ").trim().slice(0, 80).trim()
  return limpo || undefined
}

export type Identificacao = { sport: string; modality?: string; productType?: string }

/**
 * O que vai para o backend. Devolve null enquanto faltar a escolha obrigatória
 * (esporte em /publicar/esportes, modalidade nas categorias de ciclismo).
 */
export function identificar(categoria: string, rascunho: Rascunho): Identificacao | null {
  const productType = tipoDoProduto(categoria, rascunho)

  if (categoria === CATEGORIA_ESPORTES) {
    const sport = texto(rascunho.sport)
    return OPCOES_ESPORTE.some((item) => item.value === sport) ? { sport, productType } : null
  }

  const modality = texto(rascunho.modality)
  return OPCOES_MODALIDADE.some((item) => item.value === modality)
    ? { sport: SPORT_CICLISMO, modality, productType }
    : null
}
