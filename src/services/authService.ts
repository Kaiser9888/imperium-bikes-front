import api from '@/lib/api'

// Endpoints baseados no Swagger: tag "Auth"
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
        if (response.data.token) {
            localStorage.setItem('@imperium:token', response.data.token)
            if (response.data.user) {
                localStorage.setItem('@imperium:user', JSON.stringify(response.data.user))
            }
        }
        return response.data
    },

    async register(data: { name: string; email: string; phone: string; cpf: string; password: string }) {
        const response = await api.post(ENDPOINTS.REGISTER, data)
        if (response.data.token) {
            localStorage.setItem('@imperium:token', response.data.token)
            if (response.data.user) {
                localStorage.setItem('@imperium:user', JSON.stringify(response.data.user))
            }
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