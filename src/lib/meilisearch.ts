/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const API_URL = 'https://imperium-bikes.onrender.com'
    const url = `${API_URL}/api/users/search?q=${encodeURIComponent(query)}&size=20`
    console.log('🔍 Buscando usuários em:', url)

    try {
        const response = await fetch(url)
        if (!response.ok) {
            console.error('Erro ao buscar usuários:', response.status)
            return []
        }
        const data = await response.json()
        console.log('✅ Usuários encontrados:', data.totalElements)

        return data.content.map((user: any) => ({
            id: user.userId,
            nome: user.fullName || 'Usuário',
            username: user.email?.split('@')[0] || user.userId,
            avatar: user.avatarUrl || '/placeholder.svg',
            bio: user.bio || '',
            cidade: user.city,
            estado: user.state,
        }))
    } catch (error) {
        console.error('❌ Erro na busca:', error)
        return []
    }
}