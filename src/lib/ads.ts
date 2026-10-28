import api from "@/lib/api"
import { API_BASE_URL } from "@/lib/api-config"
import { putFileWithRetry } from "@/lib/videos/upload"

/** Anúncio sorteado para mostrar antes de um vídeo. */
export type AdSlot = {
    campaignId: string
    title: string
    /** Só campanhas antigas (arte); as novas são vídeo. */
    imageUrl: string | null
    videoPlaybackId: string | null
    clickUrl: string
    /** Prova assinada de que o anúncio foi entregue a esta pessoa. */
    token: string
    /** Segundos na tela antes de a exibição contar e o "Pular" aparecer. */
    minSeconds: number
}

export type CampaignStatus = "PENDING_PAYMENT" | "PENDING_REVIEW" | "ACTIVE" | "PAUSED" | "REJECTED" | "FINISHED"

export type Campaign = {
    id: string
    title: string
    imageUrl: string | null
    videoPlaybackId: string | null
    videoDurationSeconds: number | null
    clickUrl: string
    cpm: number
    budget: number
    spent: number
    impressions: number
    status: CampaignStatus
    rejectionReason: string | null
    advertiserName: string | null
    createdAt: string
}

export type Pricing = { cpm: number; minBudget: number; minSeconds: number; maxVideoSeconds: number }

export const STATUS_CAMPANHA: Record<CampaignStatus, { label: string; tone: "success" | "warning" | "info" | "destructive" | "neutral" }> = {
    PENDING_PAYMENT: { label: "Aguardando pagamento", tone: "warning" },
    PENDING_REVIEW: { label: "Em análise", tone: "info" },
    ACTIVE: { label: "No ar", tone: "success" },
    PAUSED: { label: "Pausada", tone: "neutral" },
    REJECTED: { label: "Recusada", tone: "destructive" },
    FINISHED: { label: "Orçamento esgotado", tone: "neutral" },
}

/** Imagens enviadas ao backend voltam como caminho relativo (/api/files/...). */
export function urlDaArte(imageUrl: string): string {
    return imageUrl.startsWith("/api/files/") ? `${API_BASE_URL}${imageUrl}` : imageUrl
}

/** Miniatura para listas: quadro do vídeo no Mux ou a arte das campanhas antigas. */
export function capaDoAnuncio(c: { imageUrl: string | null; videoPlaybackId: string | null }): string | null {
    if (c.videoPlaybackId) return `https://image.mux.com/${c.videoPlaybackId}/thumbnail.webp?width=640&time=1`
    return c.imageUrl ? urlDaArte(c.imageUrl) : null
}

function authHeaders(token?: string | null): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {}
}

/** null quando não há anúncio para este vídeo (204) ou se a busca falhar: o vídeo nunca deixa de tocar. */
export async function buscarAnuncio(videoId: string, token?: string | null): Promise<AdSlot | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/ads/video/${encodeURIComponent(videoId)}`, {
            headers: { Accept: "application/json", ...authHeaders(token) },
            signal: AbortSignal.timeout(3000),
            cache: "no-store",
        })
        if (res.status !== 200) return null
        return (await res.json()) as AdSlot
    } catch {
        return null
    }
}

/** Registra a exibição depois do tempo mínimo. Falha em silêncio: não atrapalha o vídeo. */
export async function registrarExibicao(adToken: string, token?: string | null): Promise<void> {
    try {
        await fetch(`${API_BASE_URL}/api/ads/impressions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders(token) },
            body: JSON.stringify({ token: adToken }),
            keepalive: true,
        })
    } catch {
        // sem rede: a exibição só não é cobrada
    }
}

export const adsService = {
    async precos(): Promise<Pricing> {
        return (await api.get("/api/ads/pricing")).data
    },
    async minhas(): Promise<Campaign[]> {
        return (await api.get("/api/ads/campaigns/mine", { params: { size: 50 } })).data.content
    },
    /** Manda o arquivo direto ao Mux e devolve o id do upload (vai na criação da campanha). */
    async enviarVideo(arquivo: File, onProgress?: (pct: number) => void): Promise<string> {
        const { data } = await api.post("/api/ads/video-uploads")
        await putFileWithRetry(data.url, arquivo, onProgress)
        return data.uploadId
    },
    async statusVideo(uploadId: string): Promise<{ ready: boolean; playbackId?: string; durationSeconds?: number }> {
        return (await api.get(`/api/ads/video-uploads/${encodeURIComponent(uploadId)}`)).data
    },
    async criar(dados: { title: string; videoUploadId: string; clickUrl: string; budget: number }): Promise<Campaign> {
        return (await api.post("/api/ads/campaigns", dados)).data
    },
    async pausar(id: string, pausar: boolean): Promise<Campaign> {
        return (await api.post(`/api/ads/campaigns/${id}/${pausar ? "pause" : "resume"}`)).data
    },
    /** Abre o checkout do Stripe para o orçamento e devolve o endereço. */
    async pagar(campanha: Campaign): Promise<string> {
        const { data } = await api.post("/api/payments", {
            type: "AD_CAMPAIGN",
            referenceType: "AD_CAMPAIGN",
            referenceId: campanha.id,
            description: `Campanha: ${campanha.title}`.slice(0, 500),
        })
        if (!data.checkoutUrl) throw new Error("O pagamento não retornou o endereço do checkout.")
        return data.checkoutUrl
    },
    // ---- admin
    async porStatus(status: CampaignStatus): Promise<Campaign[]> {
        return (await api.get("/api/ads/campaigns", { params: { status, size: 50 } })).data.content
    },
    async revisar(id: string, approve: boolean, reason?: string): Promise<Campaign> {
        return (await api.post(`/api/ads/campaigns/${id}/review`, { approve, reason })).data
    },
}

// ============ Monetização do criador ============

export type MonetizacaoStatus = {
    isEligible: boolean
    currentTier: string
    currentTierLabel: string
    revenueShare: number
    stats: { followers: number; totalViews: number; totalVideos: number }
    /** pending = ganhos ainda na carência de 30 dias. */
    earnings: { total: number; available: number; pending: number; thisMonth: number; lastMonth: number }
    isEnabled: boolean
    hasPendingWithdrawal: boolean
    /** Conta de recebimentos (Stripe) pronta na Carteira: é para onde vão os saques. */
    stripeReady: boolean
}

/** Saque mínimo da monetização (igual ao backend). */
export const SAQUE_MINIMO = 50

export const monetizacaoService = {
    async status(): Promise<MonetizacaoStatus> {
        return (await api.get("/api/monetization/status")).data
    },
    async ativar(): Promise<void> {
        await api.post("/api/monetization/enable", { paymentMethod: "STRIPE" })
    },
    async sacar(amount: number): Promise<void> {
        await api.post("/api/monetization/withdraw", { amount })
    },
}
