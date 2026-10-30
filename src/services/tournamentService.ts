import api from "@/lib/api"
import { modoDaApi, modoParaApi, tempoParaApi, type ModoPontuacao } from "@/lib/placar"

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
    /** Como a classificação é decidida. */
    modo: ModoPontuacao
    /** Inscrição solidária: o que levar no dia; null = comum. */
    solidaria: string | null
    doacoesEntregues: number
    /** Categorias de inscrição; vazio = todos em "Geral". */
    categorias: string[]
    /** Resumo do percurso; os pontos vêm de `rota()`. */
    rota: { distanciaM: number; subidaM: number | null } | null
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
        modo: modoDaApi(item.scoringMode),
        solidaria: typeof item.solidariaDescricao === "string" && item.solidariaDescricao ? item.solidariaDescricao : null,
        doacoesEntregues: Number(item.doacoesEntregues ?? 0),
        categorias: Array.isArray(item.categoriasInscricao) ? item.categoriasInscricao.map(String) : [],
        rota: item.temRota ? { distanciaM: Number(item.rotaDistanciaM ?? 0), subidaM: typeof item.rotaSubidaM === "number" ? item.rotaSubidaM : null } : null,
    }
}

/** Inscrição de um usuário num torneio, como aparece no perfil público. */
export interface Participacao {
    id: string
    torneioId: string
    torneioNome: string
    categoria: string
    /** Colocação final; null enquanto não há resultado. */
    posicao: number | null
    finalizado: boolean
    /** Data da inscrição (ISO). */
    data: string
}

/** Inscrito confirmado, como aparece na página pública do evento (sem dados de pagamento). */
export interface InscritoPublico {
    userId: string
    nome: string
    avatarUrl: string | null
    numero: number | null
    /** Colocação lançada pelo organizador; null enquanto não há resultado. */
    posicao: number | null
    /** Marca no placar (modo tempo ou pontos); null enquanto não lançada. */
    tempoMs: number | null
    pontos: number | null
    /** Categoria de inscrição ("Geral" quando o evento não separa). */
    categoria: string
}

/** [lat, lon, altitude ou null] */
export type PontoRota = [number, number, number | null]

export interface Rota {
    pontos: PontoRota[]
    distanciaM: number
    subidaM: number | null
}

/** Foto da galeria do evento (url relativa /api/files/...). */
export interface FotoEvento {
    id: string
    url: string
    legenda: string | null
}

/** Inscrição do usuário logado num evento. */
export interface MinhaInscricao {
    situacao: "PAGA" | "PENDENTE"
    categoria: string | null
    /** Número de peito, depois que o organizador numera. */
    numero: number | null
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
    scoringMode: ModoPontuacao
    solidariaDescricao: string
    categoriasInscricao: string[]
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

    /** Busca por nome, para marcar o evento num vídeo. */
    async buscarPorNome(query: string): Promise<Tournament[]> {
        const { data } = await api.get("/api/tournaments", { params: { query, size: 8 } })
        return (data.content as Raw[]).map(normalize)
    },

    /** Eventos que o usuário logado organiza (inclui rascunhos). */
    async meusEventos(): Promise<Tournament[]> {
        const { data } = await api.get("/api/tournaments/my", { params: { size: 50 } })
        return (data.content as Raw[]).map(normalize)
    },

    async buscarPorId(id: string): Promise<Tournament> {
        return normalize((await api.get(`/api/tournaments/${id}`)).data)
    },

    /** O backend cria como rascunho, que não aparece na lista; depois chame `publicar`. Devolve o id. */
    async criarRascunho(payload: CriarTorneio): Promise<string> {
        const { data } = await api.post("/api/tournaments", {
            ...payload,
            scoringMode: modoParaApi(payload.scoringMode),
            // O prazo é LocalDateTime no backend; vale até o fim do dia escolhido
            registrationDeadline: `${payload.registrationDeadline || payload.startDate}T23:59:59`,
        })
        return String(data.id)
    },

    async publicar(id: string): Promise<Tournament> {
        return normalize((await api.post(`/api/tournaments/${id}/publish`)).data)
    },

    /** Situação da inscrição do usuário logado: null se não está inscrito. */
    async minhaInscricao(tournamentId: string): Promise<MinhaInscricao | null> {
        const { data } = await api.get("/api/tournaments/my-participations", { params: { size: 100 } })
        const inscricao = (data.content as Raw[]).find((p) => p.tournamentId === tournamentId)
        if (!inscricao) return null
        return {
            situacao: inscricao.paymentStatus === "PAID" ? "PAGA" : "PENDENTE",
            numero: typeof inscricao.bibNumber === "number" ? inscricao.bibNumber : null,
            categoria: typeof inscricao.category === "string" ? inscricao.category : null,
        }
    },

    /** Histórico público de torneios de um usuário (perfil), mais recentes primeiro. */
    async participacoesDe(userId: string): Promise<Participacao[]> {
        const { data } = await api.get(`/api/tournaments/user/${userId}/participations`, { params: { size: 100 } })
        return (data.content as Raw[]).map((p) => ({
            id: String(p.id),
            torneioId: String(p.tournamentId),
            torneioNome: String(p.tournamentName ?? ""),
            categoria: String(p.category ?? ""),
            posicao: typeof p.rankPosition === "number" ? p.rankPosition : null,
            finalizado: p.status === "FINISHED" || typeof p.rankPosition === "number",
            data: String(p.createdAt ?? ""),
        }))
    },

    async inscritos(tournamentId: string): Promise<InscritoPublico[]> {
        const { data } = await api.get(`/api/tournaments/${tournamentId}/participants/public`)
        return (data as Raw[]).map((p) => ({
            userId: String(p.userId),
            nome: String(p.userName ?? "Participante"),
            avatarUrl: typeof p.userAvatarUrl === "string" && p.userAvatarUrl ? p.userAvatarUrl : null,
            numero: typeof p.bibNumber === "number" ? p.bibNumber : null,
            posicao: typeof p.rankPosition === "number" ? p.rankPosition : null,
            tempoMs: typeof p.finalTimeMs === "number" ? p.finalTimeMs : null,
            pontos: p.points === null || p.points === undefined ? null : Number(p.points),
            categoria: String(p.category ?? "Geral"),
        }))
    },

    /** Placar ao vivo (só o organizador): grava tempo ou pontos; o backend refaz a classificação. */
    async lancarMarca(participantId: string, marca: { tempoMs: number } | { pontos: number }): Promise<void> {
        await api.put(`/api/tournaments/participants/${participantId}/marca`, "tempoMs" in marca ? { time: tempoParaApi(marca.tempoMs) } : { points: marca.pontos })
    },

    async apagarMarca(participantId: string): Promise<void> {
        await api.delete(`/api/tournaments/participants/${participantId}/marca`)
    },

    async fotos(tournamentId: string): Promise<FotoEvento[]> {
        const { data } = await api.get(`/api/tournaments/${tournamentId}/fotos`)
        return (data as Raw[]).map((f) => ({ id: String(f.id), url: String(f.url), legenda: typeof f.legenda === "string" ? f.legenda : null }))
    },

    /** Só o organizador: sobe o arquivo (vai para o R2) e põe na galeria. */
    async adicionarFoto(tournamentId: string, arquivo: File, legenda?: string): Promise<void> {
        const form = new FormData()
        form.append("file", arquivo)
        const { data } = await api.post("/api/files/upload/image", form, { headers: { "Content-Type": undefined } })
        const url = data?.data?.publicUrl
        if (typeof url !== "string") throw new Error("O envio da foto não devolveu o endereço")
        await api.post(`/api/tournaments/${tournamentId}/fotos`, { url, legenda })
    },

    async removerFoto(tournamentId: string, fotoId: string): Promise<void> {
        await api.delete(`/api/tournaments/${tournamentId}/fotos/${fotoId}`)
    },

    /** Dá número de peito a todos os confirmados que ainda não têm. Devolve quantos numerou. */
    async numerarInscritos(tournamentId: string): Promise<number> {
        const { data } = await api.post(`/api/tournaments/${tournamentId}/numeros`)
        return Number(data?.numerados ?? 0)
    },

    /** Só o organizador. Dar colocação já marca presença (check-in). */
    async lancarColocacao(participantId: string, posicao: number): Promise<void> {
        await api.put(`/api/tournaments/participants/${participantId}/result`, {
            rank: posicao,
            reason: "Resultado lançado pelo organizador",
        })
    },

    async inscrever(tournamentId: string, categoria = "Geral"): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/join`, { category: categoria })
    },

    /** Percurso completo (pontos [lat, lon, alt]); null quando o evento não tem. */
    async rota(tournamentId: string): Promise<Rota | null> {
        const res = await api.get(`/api/tournaments/${tournamentId}/rota`)
        return res.status === 204 || !res.data ? null : (res.data as Rota)
    },

    async salvarRota(tournamentId: string, pontos: PontoRota[]): Promise<Rota> {
        return (await api.put(`/api/tournaments/${tournamentId}/rota`, { pontos })).data as Rota
    },

    async removerRota(tournamentId: string): Promise<void> {
        await api.delete(`/api/tournaments/${tournamentId}/rota`)
    },

    /** Inscrição solidária: o organizador marca quem entregou a doação. */
    async marcarDoacao(participantId: string, entregue: boolean): Promise<void> {
        await api.put(`/api/tournaments/participants/${participantId}/doacao`, { entregue })
    },

    /** Sai do evento antes do início. Inscrição paga é devolvida pelo Stripe na forma de pagamento original. */
    async sair(tournamentId: string): Promise<void> {
        await api.post(`/api/tournaments/${tournamentId}/leave`)
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
