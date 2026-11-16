import { Bike, Cog, Droplets, Mountain, Shirt, Wrench, type LucideIcon } from "lucide-react"

import { ESPORTES_ABERTOS } from "@/lib/esportes"

/**
 * Categorias da loja = as mesmas da publicação (slug da categoria no backend). Quem procura vê os
 * mesmos nomes de quem anuncia. Navegar é por tipo; a modalidade (MTB, Speed...) vira filtro dentro.
 */
export type CategoriaLoja = {
    slug: string
    /** Nome curto: pílulas da Home e filtros. */
    curto: string
    /** Nome completo: cartões da página Categorias. */
    nome: string
    descricao: string
    icone: LucideIcon
    href: string
}

const categoria = (slug: string, curto: string, nome: string, descricao: string, icone: LucideIcon): CategoriaLoja => ({
    slug,
    curto,
    nome,
    descricao,
    icone,
    href: `/buscar?category=${slug}`,
})

export const categoriasLoja: CategoriaLoja[] = [
    categoria("bikes", "Bikes", "Bikes", "Completas, quadros e e-bikes", Bike),
    categoria("pecas", "Peças", "Peças e acessórios", "Componentes, capacetes, luvas", Cog),
    categoria("produtos", "Roupas", "Roupas e calçados", "Vestuário, sapatilhas, mochilas", Shirt),
    categoria("consumiveis", "Nutrição", "Nutrição e hidratação", "Suplementos, géis, isotônicos", Droplets),
    categoria("servicos", "Serviços", "Oficina e serviços", "Manutenção, aulas, aluguel", Wrench),
    ...(ESPORTES_ABERTOS ? [categoria("esportes", "Outros esportes", "Outros esportes", "Montanha, corrida, água e quadra", Mountain)] : []),
]

export function nomeDaCategoria(slug: string): string | undefined {
    return categoriasLoja.find((c) => c.slug === slug)?.nome
}
