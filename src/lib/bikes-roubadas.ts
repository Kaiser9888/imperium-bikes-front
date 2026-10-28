import api from "@/lib/api"
import { API_BASE_URL } from "@/lib/api-config"

export type StatusAlerta = "PENDENTE" | "CONFIRMADO" | "RECUSADO" | "RECUPERADO"

export type AlertaRoubo = {
    id: string
    numeroSerie: string
    marca: string | null
    modelo: string | null
    boletim: string
    cidade: string | null
    descricao: string | null
    status: StatusAlerta
    motivoRecusa: string | null
    createdAt: string
}

export type NovoAlerta = { numeroSerie: string; marca: string; modelo: string; boletim: string; cidade: string; descricao: string }

export const STATUS_ALERTA: Record<StatusAlerta, { label: string; tone: "success" | "warning" | "info" | "destructive" | "neutral" }> = {
    PENDENTE: { label: "Em conferência", tone: "info" },
    CONFIRMADO: { label: "Alerta ativo", tone: "destructive" },
    RECUSADO: { label: "Não confirmado", tone: "neutral" },
    RECUPERADO: { label: "Recuperada", tone: "success" },
}

export const bikesRoubadasService = {
    /** Pública: só diz se há alerta confirmado para o número. */
    async consultar(numeroSerie: string): Promise<boolean> {
        const res = await fetch(`${API_BASE_URL}/api/bikes-roubadas/consulta?numeroSerie=${encodeURIComponent(numeroSerie)}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        })
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error(typeof data?.message === "string" ? data.message : "Não foi possível consultar agora.")
        return Boolean(data?.alerta)
    },
    async registrar(alerta: NovoAlerta): Promise<AlertaRoubo> {
        return (await api.post("/api/bikes-roubadas", alerta)).data
    },
    async meus(): Promise<AlertaRoubo[]> {
        return (await api.get("/api/bikes-roubadas/meus")).data
    },
    async recuperada(id: string): Promise<AlertaRoubo> {
        return (await api.post(`/api/bikes-roubadas/${id}/recuperada`)).data
    },

    // Admin
    async porStatus(status: StatusAlerta, page = 0): Promise<{ content: AlertaRoubo[]; totalPages: number; number: number }> {
        return (await api.get("/api/bikes-roubadas", { params: { status, page, size: 20 } })).data
    },
    async anuncios(id: string): Promise<{ id: string; title: string; sellerId: string; sellerName: string }[]> {
        return (await api.get(`/api/bikes-roubadas/${id}/anuncios`)).data
    },
    async confirmar(id: string): Promise<AlertaRoubo> {
        return (await api.post(`/api/bikes-roubadas/${id}/confirmar`)).data
    },
    async recusar(id: string, motivo: string): Promise<AlertaRoubo> {
        return (await api.post(`/api/bikes-roubadas/${id}/recusar`, { motivo })).data
    },
}
