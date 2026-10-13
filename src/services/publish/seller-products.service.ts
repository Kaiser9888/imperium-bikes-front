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

// O backend fala ACTIVE / DISABLED / SOLD; o front usa ATIVO / PAUSADO / VENDIDO.
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
function listar(data: any): ProdutoItem[] {
  const itens = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []
  return itens.map(normalizar)
}

/**
 * ⚠️ AJUSTE AQUI os endpoints conforme o seu backend.
 * Todos os lugares do front usam este arquivo, então basta mudar as URLs abaixo.
 */
export const sellerProductService = {
  // ID do usuário logado no seu backend (o mesmo que o perfil usa)
  async getMeuId(): Promise<string> {
    const r = await api.post("/api/users/sync")
    return String(r.data.id)
  },

  // Produtos do usuário logado (exige token)
  async listMine(): Promise<ProdutoItem[]> {
    try {
      const r = await api.get("/api/products/me")
      return listar(r.data)
    } catch (e: any) {
      // Backend ainda sem /api/products/me (ele trata "me" como um {id} e responde 400/404).
      // Solução temporária: busca a lista pública e filtra pelo dono.
      const status = e?.response?.status
      if (status !== 400 && status !== 404) throw e
      const meuId = await this.getMeuId()
      const r = await api.get("/api/products")
      return listar(r.data).filter((p: any) =>
        [p.sellerId, p.userId, p.ownerId, p.seller?.id, p.seller?.userId, p.user?.id]
          .filter((v) => v != null)
          .map(String)
          .includes(meuId),
      )
    }
  },

  // Produtos de qualquer vendedor (perfil público)
  async listBySeller(userId: string): Promise<ProdutoItem[]> {
    const r = await api.get(`/api/users/${userId}/products`)
    return listar(r.data)
  },

  // O PUT do backend exige o anúncio inteiro (condição, CEP, peso, medidas...),
  // então busca o atual e envia junto com o que foi editado.
  async update(id: string | number, data: Partial<ProdutoItem>) {
    const { data: atual } = await api.get(`/api/products/${id}`)
    const r = await api.put(`/api/products/${id}`, {
      title: atual.title,
      description: atual.description,
      price: atual.price,
      condition: atual.condition,
      brand: atual.brand,
      model: atual.model,
      year: atual.year,
      stock: atual.stock,
      hasSecurePayment: atual.hasSecurePayment,
      negotiable: atual.negotiable,
      city: atual.city,
      state: atual.state,
      originPostalCode: atual.originPostalCode,
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