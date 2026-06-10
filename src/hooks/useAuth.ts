'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'
import api from '@/lib/api'

interface UserData {
    id: string
    fullName: string
    email: string
    avatarUrl: string | null
    role: string
    city: string
    state: string
    reputation: number
}

export function useAuth(required: boolean = false) {
    const [usuario, setUsuario] = useState<UserData | null>(null)
    const [carregando, setCarregando] = useState(true)
    const router = useRouter()

    const buscarDadosUsuario = useCallback(async () => {
        try {
            const token = authService.getToken()
            if (!token) {
                if (required) {
                    router.push('/login')
                }
                setCarregando(false)
                return
            }

            // Busca dados atualizados do backend
            const response = await api.get('/users/me')
            const userData = response.data

            const userMapeado: UserData = {
                id: userData.id,
                fullName: userData.fullName,
                email: userData.email,
                avatarUrl: userData.avatarUrl || null,
                role: userData.roles?.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER',
                city: userData.city || '',
                state: userData.state || '',
                reputation: userData.reputationScore || 0
            }

            setUsuario(userMapeado)

            // Atualiza localStorage
            localStorage.setItem('@imperium:user', JSON.stringify(userMapeado))

        } catch (error: any) {
            console.error('Erro ao buscar dados do usuário:', error)
            if (error?.response?.status === 401) {
                authService.logout()
                if (required) {
                    router.push('/login')
                }
            }
        } finally {
            setCarregando(false)
        }
    }, [required, router])

    useEffect(() => {
        // Primeiro tenta pegar do localStorage (rápido)
        const cachedUser = authService.getUsuario()
        if (cachedUser) {
            setUsuario(cachedUser)
            setCarregando(false)
        }

        // Depois busca dados atualizados da API
        buscarDadosUsuario()
    }, [buscarDadosUsuario])

    const isAuthenticated = !!usuario && !!authService.getToken()
    const isAdmin = usuario?.role === 'ADMIN'

    const logout = useCallback(() => {
        authService.logout()
        document.cookie = '@imperium:token=; path=/; max-age=0'
        setUsuario(null)
        router.push('/login')
    }, [router])

    return {
        usuario,
        isAuthenticated,
        isAdmin,
        carregando,
        logout,
        recarregar: buscarDadosUsuario
    }
}