import { Meilisearch } from 'meilisearch'

const client = new Meilisearch({
    host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'https://ms-82de3d01a11d-50441.sao.meilisearch.io',
    apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_KEY || '',
})

export const searchIndex = client.index('produtos')
export const usersIndex = client.index('usuarios')

export async function searchProducts(query: string) {
    const results = await searchIndex.search(query, {
        limit: 20,
        attributesToHighlight: ['title', 'nome', 'description'],
    })
    return results.hits
}

export async function searchUsers(query: string) {
    // Buscar usuários da API do backend em vez do Meilisearch
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://imperium-bikes-production.up.railway.app'
    const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}&size=20`)
    if (!response.ok) {
        console.error('Erro ao buscar usuários:', response.status)
        return []
    }
    const data = await response.json()
    return data.content.map((user: any) => ({
        id: user.userId,
        nome: user.fullName || 'Usuário',
        username: user.email?.split('@')[0] || user.userId,
        avatar: user.avatarUrl || '/placeholder.svg',
        bio: user.bio || '',
        seguidores: 0,
        cidade: user.city,
        estado: user.state,
    }))
}