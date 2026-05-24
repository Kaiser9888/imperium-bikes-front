import api from '@/lib/api'

// Endpoints baseados no Swagger: tag "Forum"
export const forumService = {
    async listarPosts(params?: { page?: number; category?: string }) {
        const response = await api.get('/api/forum/posts', { params })
        return response.data
    },

    async buscarPost(id: number) {
        const response = await api.get(`/api/forum/posts/${id}`)
        return response.data
    },

    async criarPost(data: { title: string; content: string; categoryId: number }) {
        const response = await api.post('/api/forum/posts', data)
        return response.data
    },

    async comentar(postId: number, content: string) {
        const response = await api.post(`/api/forum/posts/${postId}/comments`, { content })
        return response.data
    },

    async votar(postId: number, vote: 'UP' | 'DOWN') {
        const response = await api.post(`/api/forum/posts/${postId}/karma`, { vote })
        return response.data
    },
}