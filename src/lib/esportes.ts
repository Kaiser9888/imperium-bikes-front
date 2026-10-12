export type Modalidade = { label: string; image: string; href: string }

export const modalidades: Modalidade[] = [
    { label: "Downhill", image: "/images/mod-downhill.png", href: "/modalidades/downhill" },
    { label: "BMX", image: "/images/mod-bmx.png", href: "/modalidades/bmx" },
    { label: "Mountain Bike", image: "/images/mod-mountain.png", href: "/modalidades/mountain" },
    { label: "Speed", image: "/images/mod-speed.png", href: "/modalidades/speed" },
    { label: "Urbana", image: "/images/mod-urbana.png", href: "/modalidades/urbana" },
    { label: "Outros", image: "/images/mod-outros.png", href: "/modalidades/outros" },
]

export type Esporte = { slug: string; nome: string }

// ponytail: lista fixa escolhida no frontend; trocar por endpoint de esportes quando o
// backend tiver um. A página de cada esporte mostra só produtos reais com esse termo.
export const esportes: Esporte[] = [
    { slug: "ciclismo", nome: "Ciclismo" },
    { slug: "corrida", nome: "Corrida" },
    { slug: "natacao", nome: "Natação" },
    { slug: "futebol", nome: "Futebol" },
    { slug: "musculacao", nome: "Musculação" },
    { slug: "lutas", nome: "Lutas" },
]
