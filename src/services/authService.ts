import api from '@/lib/api'

const ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
}

export const authService = {
    async login(data: { email: string; password: string }) {
        const response = await api.post(ENDPOINTS.LOGIN, data)

        // ✅ CORRIGIDO: backend retorna "accessToken", não "token"
        const token = response.data.accessToken || response.data.token

        if (token) {
            localStorage.setItem('@imperium:token', token)

            // ✅ CORRIGIDO: mapeia resposta do backend
            const userData = {
                id: response.data.userId || response.data.user?.id,
                email: response.data.email || response.data.user?.email,
                fullName: response.data.fullName || response.data.user?.fullName,
                avatarUrl: response.data.avatarUrl || response.data.user?.avatarUrl
            }
            localStorage.setItem('@imperium:user', JSON.stringify(userData))
        }
        return response.data
    },

    async register(data: { fullName: string; email: string; phone: string; password: string }) {
        const response = await api.post(ENDPOINTS.REGISTER, data)

        // ✅ CORRIGIDO: backend retorna "accessToken"
        const token = response.data.accessToken || response.data.token

        if (token) {
            localStorage.setItem('@imperium:token', token)

            const userData = {
                id: response.data.userId,
                email: response.data.email,
                fullName: response.data.fullName
            }
            localStorage.setItem('@imperium:user', JSON.stringify(userData))
        }
        return response.data
    },

    async me() {
        const response = await api.get(ENDPOINTS.ME)
        return response.data
    },

    async forgotPassword(email: string) {
        return api.post(ENDPOINTS.FORGOT_PASSWORD, { email })
    },

    async resetPassword(token: string, newPassword: string) {
        return api.post(ENDPOINTS.RESET_PASSWORD, { token, newPassword })
    },

    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('@imperium:token')
        }
        return null
    },

    getUsuario() {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem('@imperium:user')
            return data ? JSON.parse(data) : null
        }
        return null
    },

    isAuthenticated() {
        return !!this.getToken()
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('@imperium:token')
            localStorage.removeItem('@imperium:user')
            document.cookie = '@imperium:token=; path=/; max-age=0'
            window.location.href = '/login'
        }
    },
}