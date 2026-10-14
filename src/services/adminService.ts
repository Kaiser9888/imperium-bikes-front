import api from "@/lib/api"

/* ---------- Banners da Home ---------- */

export type Banner = {
    id: string
    imageUrl: string
    alt: string
    linkUrl: string
    displayOrder: number
    active: boolean
}

export type BannerInput = Omit<Banner, "id">

export const bannerService = {
    /** Público: só os ativos, na ordem de exibição. */
    async ativos(): Promise<Banner[]> {
        return (await api.get<Banner[]>("/api/banners")).data
    },
    async todos(): Promise<Banner[]> {
        return (await api.get<Banner[]>("/api/banners/all")).data
    },
    async criar(dados: BannerInput): Promise<Banner> {
        return (await api.post<Banner>("/api/banners", dados)).data
    },
    async atualizar(id: string, dados: BannerInput): Promise<Banner> {
        return (await api.put<Banner>(`/api/banners/${id}`, dados)).data
    },
    async excluir(id: string): Promise<void> {
        await api.delete(`/api/banners/${id}`)
    },
}

/* ---------- Denúncias ---------- */

export type StatusDenuncia = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED"
export type TipoDenunciado = "PRODUCT" | "USER" | "POST" | "COMMENT" | "VIDEO"

export type Denuncia = {
    id: string
    reporterName: string | null
    reportedType: TipoDenunciado
    reportedId: string
    reason: "SPAM" | "ABUSE" | "SCAM" | "INAPPROPRIATE" | "FAKE" | "OTHER"
    details: string | null
    status: StatusDenuncia
    priority: number
    resolutionNotes: string | null
    createdAt: string
}

type Pagina<T> = { content: T[]; totalElements: number; totalPages: number; number: number }

export const denunciaService = {
    async listar(status: StatusDenuncia, page = 0): Promise<Pagina<Denuncia>> {
        const url = status === "PENDING" ? "/api/reports/pending" : `/api/reports/status/${status}`
        return (await api.get<Pagina<Denuncia>>(url, { params: { page, size: 20, sort: "createdAt,desc" } })).data
    },
    async resolver(id: string, notes: string): Promise<Denuncia> {
        return (await api.post<Denuncia>(`/api/reports/${id}/resolve`, { notes })).data
    },
    async descartar(id: string, notes: string): Promise<Denuncia> {
        return (await api.post<Denuncia>(`/api/reports/${id}/dismiss`, { notes })).data
    },
}

/* ---------- Usuários ---------- */

export type StatusUsuario = "ACTIVE" | "SUSPENDED" | "BANNED" | "INACTIVE"

export type UsuarioAdmin = {
    userId: string
    fullName: string | null
    email: string | null
    avatarUrl: string | null
    status: StatusUsuario
    admin: boolean | null
    createdAt: string
}

export const usuarioAdminService = {
    async listar(page = 0, status?: StatusUsuario): Promise<Pagina<UsuarioAdmin>> {
        const url = status ? `/api/users/status/${status}` : "/api/users"
        return (await api.get<Pagina<UsuarioAdmin>>(url, { params: { page, size: 20, sort: "createdAt,desc" } })).data
    },
    async suspender(id: string, reason: string, days: number): Promise<void> {
        await api.post(`/api/users/${id}/suspend`, { reason, days })
    },
    async banir(id: string, reason: string): Promise<void> {
        await api.post(`/api/users/${id}/ban`, { reason })
    },
    async desbanir(id: string): Promise<void> {
        await api.post(`/api/users/${id}/unban`)
    },
}
