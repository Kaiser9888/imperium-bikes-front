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
    const results = await usersIndex.search(query, {
        limit: 20,
        attributesToHighlight: ['nome', 'username'],
    })
    return results.hits
}