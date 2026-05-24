import api from '@/lib/api'

// Endpoint baseado no Swagger: tag "Categories"
export const categoryService = {
    async listar() {
        const response = await api.get('/api/categories')
        return response.data
    },

    async buscarPorSlug(slug: string) {
        const response = await api.get(`/api/categories/${slug}`)
        return response.data
    },
}