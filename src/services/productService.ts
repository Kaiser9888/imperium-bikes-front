import api from '@/lib/api'

// Endpoints baseados no Swagger: tag "Products"
const ENDPOINTS = {
    LIST: '/api/products',
    DETAIL: (id: number) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: number) => `/api/products/${id}`,
    DELETE: (id: number) => `/api/products/${id}`,
    DESTAQUES: '/api/products/destaques',
}

export const productService = {
    async listar(params?: {
        page?: number
        size?: number
        categoria?: string
        busca?: string
        minPreco?: number
        maxPreco?: number
        condicao?: string
    }) {
        const response = await api.get(ENDPOINTS.LIST, { params })
        return response.data
    },

    async buscarPorId(id: number) {
        const response = await api.get(ENDPOINTS.DETAIL(id))
        return response.data
    },

    async destaques() {
        const response = await api.get(ENDPOINTS.DESTAQUES)
        return response.data
    },

    async criar(data: FormData) {
        const response = await api.post(ENDPOINTS.CREATE, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    async atualizar(id: number, data: FormData) {
        const response = await api.put(ENDPOINTS.UPDATE(id), data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    async deletar(id: number) {
        await api.delete(ENDPOINTS.DELETE(id))
    },
}