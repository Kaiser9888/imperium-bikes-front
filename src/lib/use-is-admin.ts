"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

import api from "@/lib/api"
import { useUserSync } from "@/lib/UserSyncContext"

// Uma consulta por sessão de login, compartilhada entre os componentes
let consulta: { userId: string; promessa: Promise<boolean> } | null = null

function consultarAdmin(userId: string): Promise<boolean> {
    if (consulta?.userId !== userId) {
        consulta = {
            userId,
            promessa: api
                .get<{ admin?: boolean | null }>("/api/users/me")
                .then((r) => r.data.admin === true)
                .catch(() => false),
        }
    }
    return consulta.promessa
}

/**
 * true quando o usuário logado tem ROLE_ADMIN no backend (campo `admin` do /api/users/me).
 * Serve só para mostrar ou esconder a interface; quem barra de verdade é o backend.
 */
export function useIsAdmin(): { isAdmin: boolean; carregando: boolean } {
    const { user, isSignedIn } = useUser()
    const { isSynced } = useUserSync()
    const [resultado, setResultado] = useState<{ userId: string; admin: boolean } | null>(null)

    const userId = isSignedIn ? user?.id : undefined
    useEffect(() => {
        if (!userId || !isSynced) return
        let ativo = true
        consultarAdmin(userId).then((admin) => ativo && setResultado({ userId, admin }))
        return () => {
            ativo = false
        }
    }, [userId, isSynced])

    if (!userId) return { isAdmin: false, carregando: isSignedIn === undefined }
    if (resultado?.userId !== userId) return { isAdmin: false, carregando: true }
    return { isAdmin: resultado.admin, carregando: false }
}
