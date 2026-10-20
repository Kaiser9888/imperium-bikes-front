export type ProductCondition =
  | 'NEW'
  | 'LIKE_NEW'
  | 'USED'
  | 'REFURBISHED'
  | 'FOR_PARTS'

/** Como o backend devolve (enum ProductStatus). SOLD inclui "esgotado". */
export type ProductStatus =
  | 'ACTIVE'
  | 'DISABLED'
  | 'SOLD'
  | 'DELETED'

export type ShippingType =
  | 'FREE'
  | 'CALCULATED'
  | 'PICKUP'

export interface ProductImage {
    id?: string
    url: string
    thumbnail?: string
    isMain: boolean
    displayOrder: number
    file?: File
}

export interface ProductFormData {
    categoryId: string
    subcategoryId: string
    title: string
    brand: string
    model: string
    description: string
    condition: ProductCondition | ''
    stock: number
    images: ProductImage[]
    price: number
    negotiable: boolean
    shippingType: ShippingType | ''
    city: string
    state: string
    hasSecurePayment: boolean
    featured: boolean
}

export interface Category {
    id: string
    name: string
    icon?: string
    subcategories: SubCategory[]
}

export interface SubCategory {
    id: string
    name: string
    categoryId: string
}

export interface ProductRequest {
    title: string
    description: string
    price: number
    condition: ProductCondition
    categoryId: string
    subcategoryId: string
    brand: string
    model: string
    stock: number
    negotiable: boolean
    city: string
    state: string
    originPostalCode: string
    weightKg: number
    heightCm: number
    widthCm: number
    lengthCm: number
    hasSecurePayment: boolean
    images: {
        url: string
        isMain: boolean
        displayOrder: number
    }[]
}

export interface ProductResponse {
    id: string
    title: string
    description: string
    price: number
    originalPrice?: number
    condition: ProductCondition
    status: ProductStatus
    brand: string
    model: string
    year?: number
    stock: number
    negotiable: boolean
    city: string
    state: string

    originPostalCode: string | null
    /** "Eu pago o frete até R$ X"; null quando o comprador paga tudo. */
    freeShippingLimit?: number | null
    weightKg: number | null
    heightCm: number | null
    widthCm: number | null
    lengthCm: number | null

    hasSecurePayment: boolean
    isHighlighted?: boolean
    highlightType?: string | null

    images: {
        id: string
        url: string
        isMain: boolean
        displayOrder: number
    }[]

    seller: {
        id: string
        name: string
        avatarUrl: string
    }

    category: string
    /** Slugs de identificação do anúncio (ver lib/publicar/taxonomia). */
    sport?: string | null
    modality?: string | null
    productType?: string | null
    createdAt: string
}

export interface ShippingQuote {
    id: string
    transportadora: string
    servico: string
    prazoDias: number
    /** O que o comprador paga. */
    valor: number
    valorOriginal: number
    /** Parte do frete coberta pelo vendedor. */
    pagoPeloVendedor?: number
}

export const PRODUCT_CONDITIONS: {
    value: ProductCondition
    label: string
    description: string
}[] = [
    {
        value: 'NEW',
        label: 'Novo',
        description: 'Nunca usado, na embalagem original',
    },
    {
        value: 'LIKE_NEW',
        label: 'Seminovo',
        description: 'Pouco uso, em perfeito estado',
    },
    {
        value: 'USED',
        label: 'Usado',
        description: 'Com marcas de uso, mas funcional',
    },
    {
        value: 'REFURBISHED',
        label: 'Recondicionado',
        description: 'Restaurado por profissional',
    },
    {
        value: 'FOR_PARTS',
        label: 'Para pecas',
        description: 'Nao funcional, para reaproveitamento',
    },
]

export const SHIPPING_TYPES: {
    value: ShippingType
    label: string
}[] = [
    {
        value: 'FREE',
        label: 'Frete gratis',
    },
    {
        value: 'CALCULATED',
        label: 'Calcular frete',
    },
    {
        value: 'PICKUP',
        label: 'Retirada no local',
    },
]