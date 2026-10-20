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
    karmaTotal: number
}

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

    /** Votar de novo no mesmo sentido retira o voto. Devolve o saldo e o voto atual. */
    async votar(postId: string, voto: Voto): Promise<{ score: number; userVote: Voto | null }> {
        return (await api.post(`/api/forum/posts/${postId}/karma/${voto.toLowerCase()}`)).data
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
