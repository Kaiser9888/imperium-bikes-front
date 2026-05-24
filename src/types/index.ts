export interface Product {
    id: number
    title: string
    description: string
    price: number
    brand: string
    model: string
    year: number
    bikeType: string
    size: string
    condition: string
    location: string
    views: number
    status: string
    weight?: number  // ← Adicionar esta linha
    averageRating?: number
    reviewCount?: number
    seller?: User
    category?: Category
    images: ProductImage[]
    createdAt: string
}

export interface User {
    id: number
    name: string
    email: string
    avatar: string
    city: string
    state: string
    reputation: number
}

export interface Category {
    id: number
    name: string
    slug: string
    icon: string
}

export interface ProductImage {
    id: number
    url: string
    isMain: boolean
}

export interface PaginatedResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    number: number
    size: number
}

