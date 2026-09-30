import api from '@/lib/api'

// Endpoints baseados no Swagger: tag "Tournaments"
export const tournamentService = {
    async listar(params?: { page?: number; status?: string }) {
        const response = await api.get('/api/tournaments', { params })
        return response.data
    },

    async buscarPorId(id: number) {
        const response = await api.get(`/api/tournaments/${id}`)
        return response.data
    },

    async inscrever(tournamentId: number) {
        const response = await api.post(`/api/tournaments/${tournamentId}/participants`)
        return response.data
    },
    async criar(payload: {
        name: string; description: string; modality: string; location: string; city: string; state: string
        startDate: string; endDate: string; registrationDeadline: string; maxParticipants: number
        minParticipants: number; entryFee: number; prize: string; rules: string; bannerUrl: string
    }) {
        const response = await api.post('/api/tournaments', payload)
        return response.data
    },
}
