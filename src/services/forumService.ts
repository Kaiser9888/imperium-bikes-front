import api from "@/lib/api"

export interface ForumCategory {
    id: string
    name: string
    slug?: string
    description?: string | null
}

export interface ForumPost {
    id: string
    categoryId: string
    categoryName: string
    userId: string
    userName: string
    title: string
    content: string
    createdAt: string
    replyCount: number
    /** Quantidade de "Pedais" (só existe voto positivo). */
    karmaTotal: number
    /** Na resposta: é a que resolveu. Na pergunta: já foi resolvida. */
    isSolution?: boolean
}

/** Só existe o "Pedal" (positivo); "DOWN" fica no tipo por votos antigos. */
export type Voto = "UP" | "DOWN"

export const forumService = {
    async categorias(): Promise<ForumCategory[]> {
        return (await api.get("/api/forum/categories")).data
    },

    /** Publicações mais recentes; com categoria, só as dela. */
    async listar(categoryId?: string): Promise<ForumPost[]> {
        const path = categoryId ? `/api/forum/posts/category/${categoryId}` : "/api/forum/posts"
        return (await api.get(path, { params: { size: 30 } })).data.content
    },

    async publicar(post: { categoryId: string; title: string; content: string }): Promise<ForumPost> {
        return (await api.post("/api/forum/posts", post)).data
    },

    async respostas(postId: string): Promise<ForumPost[]> {
        return (await api.get(`/api/forum/posts/${postId}/replies`, { params: { size: 100 } })).data.content
    },

    async responder(post: ForumPost, content: string): Promise<ForumPost> {
        return (await api.post(`/api/forum/posts/${post.id}/reply`, { categoryId: post.categoryId, content })).data
    },

    /** Dá ou tira o Pedal (tocar de novo retira). Devolve o total e se o usuário pedalou. */
    async pedalar(postId: string): Promise<{ score: number; userVote: Voto | null }> {
        return (await api.post(`/api/forum/posts/${postId}/karma/up`)).data
    },

    /** Quem perguntou marca (ou desmarca) a resposta que resolveu. */
    async marcarResolveu(respostaId: string): Promise<void> {
        await api.post(`/api/forum/posts/${respostaId}/solution`)
    },

    /** Votos que o usuário logado já deu, por id de publicação ou resposta. */
    async meusVotos(): Promise<Record<string, Voto>> {
        return (await api.get("/api/forum/posts/my-votes")).data
    },

    /** Serve para publicação e para resposta (só o autor consegue). */
    async excluir(postId: string): Promise<void> {
        await api.delete(`/api/forum/posts/${postId}`)
    },
}
