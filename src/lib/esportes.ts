export type Modalidade = {
    slug: string
    label: string
    image: string
    href: string
    /** Termo usado para encontrar os produtos da modalidade. */
    categoria: string
    /** Tipos de produto oferecidos no filtro. */
    tipos: string[]
}

const modalidade = (slug: string, label: string, categoria: string, tipos: string[]): Modalidade => ({
    slug,
    label,
    categoria,
    tipos,
    image: `/images/mod-${slug}.png`,
    href: `/modalidades/${slug}`,
})

export const modalidades: Modalidade[] = [
    modalidade("downhill", "Downhill", "Downhill", ["Bike Completa", "Quadro", "Suspensão", "Freios", "Rodas", "Guidão", "Pedais", "Capacete", "Luva", "Joelheira", "Camisa", "Calça", "Sapato", "Óculos"]),
    modalidade("bmx", "BMX", "BMX", ["Bike Completa", "Quadro", "Guidão", "Pedais", "Cubos", "Freios", "Rodas", "Pneus", "Capacete", "Luva", "Cotoveleira", "Camisa", "Calça", "Sapato"]),
    modalidade("mountain", "Mountain Bike", "Mountain", ["Bike Completa", "Quadro", "Suspensão Dianteira", "Suspensão Traseira", "Freios", "Rodas", "Pneus", "Guidão", "Pedais", "Capacete", "Luva", "Joelheira", "Camisa", "Bermuda", "Sapato", "Óculos"]),
    modalidade("speed", "Speed", "Speed", ["Bike Completa", "Quadro", "Rodas", "Pneus", "Guidão", "Selim", "Pedais", "Grupo de Transmissão", "Freios", "Capacete", "Luva", "Camisa", "Bermuda", "Sapato", "Óculos"]),
    modalidade("urbana", "Urbana", "Urbana", ["Bike Completa", "Quadro", "Rodas", "Pneus", "Guidão", "Selim", "Pedais", "Freios", "Cestinha", "Bagageiro", "Para-lama", "Cadeado", "Luzes", "Capacete", "Capa de Chuva"]),
    modalidade("outros", "Outros", "Outros", ["Capacete", "Luva", "Óculos", "Joelheira", "Cotoveleira", "Sapato", "Camisa", "Calça", "Bermuda", "Cadeado", "Luzes", "Bomba de Ar", "Ferramentas", "Suporte", "Bolsa", "Garrafa", "Ciclocomputador", "Outros"]),
]

export type Esporte = { slug: string; nome: string }

// ponytail: lista fixa escolhida no frontend; trocar por endpoint de esportes quando o
// backend tiver um. A página de cada esporte mostra só produtos reais com esse termo.
// Ciclismo fica de fora: as modalidades acima já cobrem as bikes.
export const esportes: Esporte[] = [
    { slug: "corrida", nome: "Corrida" },
    { slug: "natacao", nome: "Natação" },
    { slug: "futebol", nome: "Futebol" },
    { slug: "musculacao", nome: "Musculação" },
    { slug: "lutas", nome: "Lutas" },
]
