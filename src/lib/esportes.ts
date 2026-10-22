export type Modalidade = {
    slug: string
    label: string
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

/** Grupos só organizam a tela (Categorias e publicação); não vão para o backend. */
export const GRUPOS_DE_ESPORTE = [
    "Montanha e aventura",
    "Corrida e fitness",
    "Água",
    "Quadra e campo",
] as const

export type GrupoDeEsporte = (typeof GRUPOS_DE_ESPORTE)[number]

export type Esporte = { slug: string; nome: string; grupo: GrupoDeEsporte }

// ponytail: lista fixa escolhida no frontend; trocar por endpoint de esportes quando o
// backend tiver um. A página de cada esporte mostra só produtos reais com esse termo.
// Ciclismo fica de fora: as modalidades acima já cobrem as bikes.
// Slug novo aqui precisa entrar também em ProductTaxonomy.SPORTS no backend.
export const esportes: Esporte[] = [
    { slug: "alta-montanha", nome: "Alta montanha", grupo: "Montanha e aventura" },
    { slug: "escalada", nome: "Escalada", grupo: "Montanha e aventura" },
    { slug: "trilha", nome: "Trilha e camping", grupo: "Montanha e aventura" },
    { slug: "esqui", nome: "Esqui e snowboard", grupo: "Montanha e aventura" },
    { slug: "skate", nome: "Skate e patins", grupo: "Montanha e aventura" },
    { slug: "corrida", nome: "Corrida", grupo: "Corrida e fitness" },
    { slug: "musculacao", nome: "Musculação", grupo: "Corrida e fitness" },
    { slug: "yoga", nome: "Yoga e pilates", grupo: "Corrida e fitness" },
    { slug: "lutas", nome: "Lutas", grupo: "Corrida e fitness" },
    { slug: "natacao", nome: "Natação", grupo: "Água" },
    { slug: "surf", nome: "Surf", grupo: "Água" },
    { slug: "canoagem", nome: "Stand up e canoagem", grupo: "Água" },
    { slug: "pesca", nome: "Pesca", grupo: "Água" },
    { slug: "futebol", nome: "Futebol", grupo: "Quadra e campo" },
    { slug: "basquete", nome: "Basquete", grupo: "Quadra e campo" },
    { slug: "volei", nome: "Vôlei", grupo: "Quadra e campo" },
    { slug: "tenis", nome: "Tênis e raquetes", grupo: "Quadra e campo" },
]

export const esportesPorGrupo = GRUPOS_DE_ESPORTE.map((grupo) => ({
    grupo,
    esportes: esportes.filter((esporte) => esporte.grupo === grupo),
}))

export type Categoria = { label: string; href: string }

const linkDoEsporte = ({ slug, nome }: Esporte): Categoria => ({ label: nome, href: `/esportes/${slug}` })

/** Página Categorias: ciclismo primeiro, depois cada grupo de esportes. */
export const categoriasPorGrupo: { titulo: string; itens: Categoria[] }[] = [
    { titulo: "Ciclismo", itens: modalidades.map(({ label, href }) => ({ label, href })) },
    ...esportesPorGrupo.map(({ grupo, esportes }) => ({ titulo: grupo, itens: esportes.map(linkDoEsporte) })),
]

const DESTAQUES_DA_HOME = ["mountain", "speed", "downhill", "bmx", "corrida", "alta-montanha", "trilha", "natacao", "futebol"]

/** Atalhos da Home: o essencial da bike e dos outros esportes, na ordem acima. */
export const categoriasDestaque: Categoria[] = DESTAQUES_DA_HOME.flatMap((slug) => {
    const modalidade = modalidades.find((item) => item.slug === slug)
    if (modalidade) return [{ label: modalidade.label, href: modalidade.href }]
    const esporte = esportes.find((item) => item.slug === slug)
    return esporte ? [linkDoEsporte(esporte)] : []
})
