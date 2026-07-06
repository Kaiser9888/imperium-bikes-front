// services/publish/product.service.ts
import api from '@/lib/api'
import { ProductRequest, ProductResponse } from '@/types/publish/product'

const BASE = '/api/products'

export const productService = {
    create: async (data: ProductRequest): Promise<ProductResponse> => {
        const res = await api.post(BASE, data)
        return res.data
    },

    update: async (id: string, data: Partial<ProductRequest>): Promise<ProductResponse> => {
        const res = await api.put(BASE + '/' + id, data)
        return res.data
    },

    getById: async (id: string): Promise<ProductResponse> => {
        const res = await api.get(BASE + '/' + id)
        return res.data
    },

    getMyProducts: async (page = 0, size = 10): Promise<{ content: ProductResponse[]; totalElements: number }> => {
        const res = await api.get(BASE + '/my', { params: { page, size } })
        return res.data
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(BASE + '/' + id)
    },

    publish: async (id: string): Promise<ProductResponse> => {
        const res = await api.put(BASE + '/' + id + '/publish')
        return res.data
    },
}