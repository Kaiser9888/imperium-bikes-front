"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"

import api from "@/lib/api"
import { useUserSync } from "@/lib/UserSyncContext"

// Uma consulta por sessão de login, compartilhada entre os componentes
let consulta: { userId: string; promessa: Promise<boolean> } | null = null

const espera = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * O backend no Render dorme e leva até ~1 min para acordar: a primeira consulta pode
 * falhar. Tenta de novo algumas vezes e, se ainda falhar, NÃO guarda o "não é admin"
 * (antes guardava e o painel sumia até recarregar a página).
 */
async function buscarAdmin(): Promise<boolean> {
    for (let tentativa = 0; ; tentativa++) {
        try {
            const r = await api.get<{ admin?: boolean | null }>("/api/users/me")
            return r.data.admin === true
        } catch (cause) {
            const status = (cause as { response?: { status?: number } })?.response?.status
            // 401/403 é resposta de verdade (sem login ou sem permissão); o resto é falha de rede ou servidor acordando
            if (status === 401 || status === 403 || tentativa >= 3) throw cause
            await espera(4000 * (tentativa + 1))
        }
    }
}

function consultarAdmin(userId: string): Promise<boolean> {
    if (consulta?.userId !== userId) {
        const promessa = buscarAdmin().catch(() => {
            // Esquece a falha: a próxima tela que perguntar tenta de novo
            if (consulta?.promessa === promessa) consulta = null
            return false
        })
        consulta = { userId, promessa }
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
