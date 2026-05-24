'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/authService'

interface UserData {
    id: number
    name: string
    email: string
    avatar: string
    role: string
    city: string
    state: string
    reputation: number
}

export function useAuth(required: boolean = false) {
    const [usuario, setUsuario] = useState<UserData | null>(null)
    const [carregando, setCarregando] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const user = authService.getUsuario()

        if (!user && required) {
            router.push('/login')
            return
        }

        setUsuario(user)
        setCarregando(false)
    }, [required, router])

    const isAuthenticated = !!usuario
    const isAdmin = usuario?.role === 'ADMIN'

    return {
        usuario,
        isAuthenticated,
        isAdmin,
        carregando,
        logout: () => {
            authService.logout()
            document.cookie = '@imperium:token=; path=/; max-age=0'
            router.push('/login')
        },
    }
}