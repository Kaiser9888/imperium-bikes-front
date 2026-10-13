import api from "@/lib/api"

export type TournamentStatus = "aberto" | "andamento" | "encerrado"

export interface Tournament {
    id: string
    nome: string
    descricao: string
    regras: string
    /** ISO (AAAA-MM-DD), como vem do backend */
    dataInicio: string
    dataFim: string
    local: string
    participantes: number
    maxParticipantes: number
    valorInscricao: number
    premiacao: string
    status: TournamentStatus
    banner: string
    organizadorId: string
    organizadorNome: string
    /** Cancelado aparece como "encerrado" nas listas; aqui dá para diferenciar. */
    cancelado: boolean
}

type Raw = Record<string, unknown>

/** Converte o TournamentResponse do backend no formato que as telas usam. */
function normalize(item: Raw): Tournament {
    const organizer = (item.organizer ?? {}) as Raw
    const status = String(item.status ?? "")
    return {
        id: String(item.id),
        nome: String(item.name ?? ""),
        descricao: String(item.description ?? ""),
        regras: String(item.rules ?? ""),
        dataInicio: String(item.startDate ?? ""),
        dataFim: String(item.endDate ?? ""),
        local: [item.location, item.city, item.state].filter(Boolean).join(", "),
        participantes: Number(item.participantsCount ?? 0),
        maxParticipantes: Number(item.maxParticipants ?? 0),
        valorInscricao: Number(item.registrationFee ?? 0),
        premiacao: String(item.prizes ?? ""),
        status: status === "IN_PROGRESS" ? "andamento" : status === "OPEN" ? "aberto" : "encerrado",
        banner: String(item.coverImageUrl || "/placeholder.svg"),
        organizadorId: String(organizer.id ?? ""),
        organizadorNome: String(organizer.name ?? ""),
        cancelado: status === "CANCELLED",
    }
}

export interface CriarTorneio {
    name: string
    description: string
    rules: string
    location: string
    city: string
    state: string
    /** AAAA-MM-DD */
    startDate: string
    endDate: string
    registrationDeadline: string
    maxParticipants: number
    minParticipants: number
    registrationFee: number
    prizes: string
    coverImageUrl: string
}

export const tournamentService = {
    /** Abertos e em andamento primeiro, depois os encerrados. */
    async listar(): Promise<Tournament[]> {
        const [ativos, encerrados] = await Promise.all([
            api.get("/api/tournaments", { params: { status: "active", size: 50 } }),
            api.get("/api/tournaments", { params: { status: "finished", size: 50 } }),
        ])
        return [...ativos.data.content, ...encerrados.data.content].map(normalize)
    },

    async buscarPorId(id: string): Promise<Tournament> {
        return normalize((await api.get(`/api/tournaments/${id}`)).data)
    },

    /** Cria e já publica: o backend cria como rascunho, que não aparece na lista. */
    async criar(payload: CriarTorneio): Promise<Tournament> {
        const { data } = await api.post("/api/tournaments", {
            ...payload,
            // O prazo é LocalDateTime no backend; vale até o fim do dia escolhido
            registrationDeadline: `${payload.registrationDeadline || payload.startDate}T23:59:59`,
        })
        return normalize((await api.post(`/api/tournaments/${data.id}/publish`)).data)
    },

    /** Situação da inscrição do usuário logado: null se não está inscrito. */
    async minhaInscricao(tournamentId: string): Promise<"PAGA" | "PENDENTE" | null> {
        const { data } = await api.get("/api/tournaments/my-participations", { params: { size: 100 } })
        const inscricao = (data.content as Raw[]).find((p) => p.tournamentId === tournamentId)
        if (!inscricao) return null
        return inscricao.paymentStatus === "PAID" ? "PAGA" : "PENDENTE"
    },

    async inscrever(tournamentId: string): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/join`, { category: "Geral" })
    },

    /** Só o organizador, com o evento em andamento. É o que libera o repasse das inscrições. */
    async encerrar(tournamentId: string): Promise<Tournament> {
        return normalize((await api.post(`/api/tournaments/${tournamentId}/finish`)).data)
    },

    /** Só o organizador, antes de encerrar. As inscrições pagas são reembolsadas em alguns minutos. */
    async cancelar(tournamentId: string, reason: string): Promise<Tournament> {
        return normalize((await api.post(`/api/tournaments/${tournamentId}/cancel`, { reason })).data)
    },

    /** Abre o checkout do Stripe para a taxa de inscrição e devolve o endereço. */
    async pagarInscricao(tournamentId: string, nome: string): Promise<string> {
        const { data } = await api.post("/api/payments", {
            type: "TOURNAMENT_INSCRIPTION",
            referenceId: tournamentId,
            referenceType: "TOURNAMENT_INSCRIPTION",
            description: `Inscrição: ${nome}`.slice(0, 500),
        })
        if (!data.checkoutUrl) throw new Error("O pagamento não retornou o endereço do checkout.")
        return data.checkoutUrl
    },
}

/** Mensagem do backend quando houver; senão, um texto genérico. */
export function mensagemDaApi(cause: unknown, padrao: string): string {
    const data = (cause as { response?: { data?: { message?: unknown } } })?.response?.data
    return typeof data?.message === "string" ? data.message : padrao
}
