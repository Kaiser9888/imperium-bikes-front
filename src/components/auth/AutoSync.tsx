"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"
import api from "@/lib/api"

export default function AutoSync() {
    const { isSignedIn, isLoaded } = useUser()

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            api.post("/api/users/sync")
                .then(res => console.log("[AutoSync] Usuário sincronizado:", res.data.id))
                .catch(err => console.error("[AutoSync] Erro:", err))
        }
    }, [isLoaded, isSignedIn])

    return null
}