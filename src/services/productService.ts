import api from '@/lib/api'

const ENDPOINTS = {
    LIST: '/api/products',
    DETAIL: (id: number) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: number) => `/api/products/${id}`,
    DELETE: (id: number) => `/api/products/${id}`,
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
        sort?: string
    }) {
        const response = await api.get(ENDPOINTS.LIST, { params })
        return response.data
    },

    async buscarPorId(id: number) {
        const response = await api.get(ENDPOINTS.DETAIL(id))
        return response.data
    },

    // ✅ CORRIGIDO: usa listar() com sort em vez de endpoint inexistente
    async destaques() {
        const response = await api.get(ENDPOINTS.LIST, {
            params: {
                page: 0,
                size: 10,
                sort: 'createdAt,desc'
            }
        })
        // Retorna só o array de produtos
        return response.data.content || response.data || []
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