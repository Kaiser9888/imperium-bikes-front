// services/publish/seller-products.service.ts
import api from "@/lib/api"

export interface ProdutoItem {
  id: string | number
  title: string
  price?: number
  brand?: string
  year?: number | string
  description?: string
  status?: string // ex.: "ATIVO" | "PAUSADO" | "VENDIDO"
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
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "Sob consulta"
}

// A API pode devolver um array ou uma página do Spring ({ content: [] })
function listar(data: any): ProdutoItem[] {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  return []
}

/**
 * ⚠️ AJUSTE AQUI os endpoints conforme o seu backend.
 * Todos os lugares do front usam este arquivo, então basta mudar as URLs abaixo.
 */
export const sellerProductService = {
  // Produtos do usuário logado (exige token)
  async listMine(): Promise<ProdutoItem[]> {
    const r = await api.get("/api/products/me")
    return listar(r.data)
  },

  // Produtos de qualquer vendedor (perfil público)
  async listBySeller(userId: string): Promise<ProdutoItem[]> {
    const r = await api.get(`/api/users/${userId}/products`)
    return listar(r.data)
  },

  async update(id: string | number, data: Partial<ProdutoItem>) {
    const r = await api.put(`/api/products/${id}`, data)
    return r.data as ProdutoItem
  },

  async setStatus(id: string | number, status: string) {
    const r = await api.patch(`/api/products/${id}/status`, { status })
    return r.data
  },

  async remove(id: string | number) {
    await api.delete(`/api/products/${id}`)
  },
}