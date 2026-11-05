// services/publish/seller-products.service.ts
import api from "@/lib/api"
import { formatarPreco as formatarReais } from "@/lib/format"

export interface ProdutoItem {
  id: string | number
  title: string
  price?: number
  brand?: string
  year?: number | string
  description?: string
  status?: string // ex.: "ATIVO" | "PAUSADO" | "VENDIDO"
  stock?: number
  originPostalCode?: string | null
  /** "Eu pago o frete até R$ X"; null quando o comprador paga tudo. */
  freeShippingLimit?: number | null
  /** Retirada no local: sem envio pelo site. */
  somenteRetirada?: boolean
  /** Na retirada, aceita também pagamento direto (sem proteção). */
  aceitaPagamentoDireto?: boolean
  /** Serviço "a partir de": combinado direto com o prestador. */
  precoAPartirDe?: boolean
  city?: string
  state?: string
  photos?: string[]
  images?: { url: string }[]
  imageUrl?: string
}

export function capaDoProduto(p: ProdutoItem): string | null {
  return p.photos?.[0] ?? p.images?.[0]?.url ?? p.imageUrl ?? null
}

export function formatarPreco(v?: number) {
  return typeof v === "number"
    ? formatarReais(v)
    : "Sob consulta"
}

// O backend fala ACTIVE / DISABLED / SOLD / EM_ANALISE; o front usa ATIVO / PAUSADO / VENDIDO / EM_ANALISE.
const STATUS_DO_BACKEND: Record<string, string> = {
  ACTIVE: "ATIVO",
  DISABLED: "PAUSADO",
  SOLD: "VENDIDO",
}

function normalizar(p: ProdutoItem): ProdutoItem {
  const status = typeof p?.status === "string" ? p.status.toUpperCase() : undefined
  return status ? { ...p, status: STATUS_DO_BACKEND[status] ?? status } : p
}

// A API pode devolver um array ou uma página do Spring ({ content: [] })
function listar(data: unknown): ProdutoItem[] {
  const page = data as { content?: unknown } | null
  const itens: ProdutoItem[] = Array.isArray(data) ? data : Array.isArray(page?.content) ? page.content : []
  return itens.map(normalizar)
}

export const sellerProductService = {
  // Produtos do usuário logado (exige token)
  async listMine(): Promise<ProdutoItem[]> {
    const r = await api.get("/api/products/me")
    return listar(r.data)
  },

  // Anúncios ativos de qualquer vendedor (perfil público)
  // ponytail: só a 1ª página (60); paginar quando algum vendedor passar disso
  async listBySeller(userId: string): Promise<ProdutoItem[]> {
    const r = await api.get("/api/products", { params: { sellerId: userId, size: 60 } })
    return listar(r.data)
  },

  // O PUT do backend exige o anúncio inteiro (condição, CEP, peso, medidas...),
  // então busca o atual e envia junto com o que foi editado.
  async update(id: string | number, data: Partial<ProdutoItem>) {
    const { data: atual } = await api.get(`/api/products/${id}`, { params: { contarVisita: false } })
    const r = await api.put(`/api/products/${id}`, {
      title: atual.title,
      description: atual.description,
      price: atual.price,
      condition: atual.condition,
      brand: atual.brand,
      model: atual.model,
      sport: atual.sport,
      modality: atual.modality,
      productType: atual.productType,
      year: atual.year,
      stock: atual.stock,
      hasSecurePayment: atual.hasSecurePayment,
      negotiable: atual.negotiable,
      precoAPartirDe: atual.precoAPartirDe,
      bairro: atual.bairro,
      enderecoAtendimento: atual.enderecoAtendimento,
      city: atual.city,
      state: atual.state,
      originPostalCode: atual.originPostalCode,
      // Sem ele o backend entenderia "comprador paga" e apagaria o frete grátis
      freeShippingLimit: atual.freeShippingLimit,
      // Sem ele o backend entenderia "tem envio" e voltaria a cobrar frete
      somenteRetirada: atual.somenteRetirada,
      // Sem ele o backend desligaria o pagamento direto na retirada
      aceitaPagamentoDireto: atual.aceitaPagamentoDireto,
      weightKg: atual.weightKg,
      heightCm: atual.heightCm,
      widthCm: atual.widthCm,
      lengthCm: atual.lengthCm,
      ...data,
    })
    return normalizar(r.data)
  },

  // status: "ATIVO" reativa, "PAUSADO" pausa
  async setStatus(id: string | number, status: string) {
    await api.post(`/api/products/${id}/${status === "PAUSADO" ? "disable" : "reactivate"}`)
  },

  async remove(id: string | number) {
    await api.delete(`/api/products/${id}`)
  },
}