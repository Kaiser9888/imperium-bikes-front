import api from "@/lib/api"

/** Os mesmos ids aceitos pelo backend (SupportController). */
export const CATEGORIAS_SUPORTE = [
    { id: "COMPRAS", label: "Compras e pedidos" },
    { id: "VENDAS", label: "Vendas e anúncios de produtos" },
    { id: "PAGAMENTOS", label: "Pagamentos, Carteira e saques" },
    { id: "EVENTOS", label: "Eventos" },
    { id: "VIDEOS", label: "Vídeos e monetização" },
    { id: "ANUNCIOS", label: "Anunciar nos vídeos" },
    { id: "CONTA", label: "Conta e login" },
    { id: "PRIVACIDADE", label: "Privacidade e meus dados (LGPD)" },
    { id: "DENUNCIA", label: "Denúncia ou uso indevido de conteúdo" },
    { id: "OUTRO", label: "Outro assunto" },
] as const

export type Chamado = {
    id: string
    category: string
    subject: string
    message: string
    status: "OPEN" | "ANSWERED"
    answer: string | null
    createdAt: string
    answeredAt: string | null
    userName: string | null
    userEmail: string | null
}

export const suporteService = {
    async abrir(dados: { category: string; subject: string; message: string }): Promise<Chamado> {
        return (await api.post("/api/support", dados)).data
    },
    async meus(): Promise<Chamado[]> {
        return (await api.get("/api/support/mine", { params: { size: 50 } })).data.content
    },
    // ---- admin
    async porStatus(status: Chamado["status"]): Promise<Chamado[]> {
        return (await api.get("/api/support", { params: { status, size: 50 } })).data.content
    },
    async responder(id: string, answer: string): Promise<Chamado> {
        return (await api.post(`/api/support/${id}/answer`, { answer })).data
    },
}
