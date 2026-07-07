// components/publish/CategoryStep.tsx
"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft, X, Plus } from "lucide-react"

interface Tag {
    id: string
    name: string
}

interface Category {
    id: string
    name: string
    subcategories: { id: string; name: string }[]
    tags: Tag[]
}

const CATEGORIES: Category[] = [
    {
        id: "bicicletas",
        name: "Bicicletas",
        subcategories: [],
        tags: [
            { id: "mtb", name: "Mountain Bike (MTB)" },
            { id: "speed", name: "Estrada (Speed)" },
            { id: "urbana", name: "Urbana / Lazer" },
            { id: "eletrica", name: "Eletrica (E-Bike)" },
            { id: "gravel", name: "Gravel" },
            { id: "bmx", name: "BMX" },
            { id: "infantil", name: "Infantil" },
            { id: "dobravel", name: "Dobravel" },
        ]
    },
    {
        id: "quadros-suspensoes",
        name: "Quadros e Suspensoes",
        subcategories: [],
        tags: [
            { id: "carbono", name: "Carbono" },
            { id: "aluminio", name: "Aluminio" },
            { id: "aco", name: "Aco" },
            { id: "titanio", name: "Titanio" },
            { id: "full-suspension", name: "Full Suspension" },
            { id: "hardtail", name: "Hardtail" },
            { id: "rigida", name: "Rigida" },
            { id: "mtb", name: "MTB" },
            { id: "speed", name: "Speed" },
            { id: "gravel", name: "Gravel" },
            { id: "downhill", name: "Downhill" },
            { id: "enduro", name: "Enduro" },
        ]
    },
    {
        id: "transmissao",
        name: "Transmissao",
        subcategories: [],
        tags: [
            { id: "cambio", name: "Cambio" },
            { id: "passador", name: "Passador" },
            { id: "cassete", name: "Cassete" },
            { id: "corrente", name: "Corrente" },
            { id: "pedivela", name: "Pedivela" },
            { id: "mov-central", name: "Movimento Central" },
            { id: "shimano", name: "Shimano" },
            { id: "sram", name: "SRAM" },
            { id: "12v", name: "12 velocidades" },
            { id: "11v", name: "11 velocidades" },
            { id: "10v", name: "10 velocidades" },
        ]
    },
    {
        id: "freios",
        name: "Freios",
        subcategories: [],
        tags: [
            { id: "disco-hidraulico", name: "Disco Hidraulico" },
            { id: "disco-mecanico", name: "Disco Mecanico" },
            { id: "pastilhas", name: "Pastilhas" },
            { id: "discos-rotores", name: "Discos / Rotores" },
            { id: "manetes", name: "Manetes" },
            { id: "shimano", name: "Shimano" },
            { id: "sram", name: "SRAM" },
            { id: "magura", name: "Magura" },
        ]
    },
    {
        id: "rodas-pneus",
        name: "Rodas e Pneus",
        subcategories: [],
        tags: [
            { id: "pneus", name: "Pneus" },
            { id: "camaras", name: "Camaras de Ar" },
            { id: "rodas-completas", name: "Rodas Completas" },
            { id: "cubos", name: "Cubos" },
            { id: "raios", name: "Raios" },
            { id: "aro-26", name: "Aro 26" },
            { id: "aro-275", name: "Aro 27.5" },
            { id: "aro-29", name: "Aro 29" },
            { id: "tubeless", name: "Tubeless" },
        ]
    },
    {
        id: "cockpit-selim",
        name: "Cockpit e Selim",
        subcategories: [],
        tags: [
            { id: "guidao", name: "Guidao" },
            { id: "avancos", name: "Avancos / Mesas" },
            { id: "selins", name: "Selins" },
            { id: "canotes", name: "Canotes" },
            { id: "fitas", name: "Fitas e Manoplas" },
            { id: "carbono", name: "Carbono" },
            { id: "aluminio", name: "Aluminio" },
        ]
    },
    {
        id: "pedais-outros",
        name: "Pedais e Outros",
        subcategories: [],
        tags: [
            { id: "pedal-clip", name: "Pedais de Encaixe (Clip)" },
            { id: "pedal-plataforma", name: "Pedais Plataforma" },
            { id: "caixa-direcao", name: "Caixas de Direcao" },
        ]
    },
    {
        id: "equipamentos",
        name: "Equipamentos e Acessorios",
        subcategories: [],
        tags: [
            { id: "capacetes", name: "Capacetes" },
            { id: "lanternas", name: "Lanternas" },
            { id: "farois", name: "Farois" },
            { id: "sinalizadores", name: "Sinalizadores" },
            { id: "cadeados", name: "Cadeados" },
            { id: "garrafas", name: "Caramanholas" },
            { id: "suportes", name: "Suportes de Garrafa" },
            { id: "bolsas", name: "Bolsas de Selim / Quadro" },
            { id: "mochilas", name: "Mochilas de Hidratacao" },
            { id: "transbikes", name: "Transbikes" },
            { id: "gps", name: "GPS" },
            { id: "ciclocomputadores", name: "Ciclocomputadores" },
            { id: "sensores", name: "Sensores" },
            { id: "cameras", name: "Cameras de Acao" },
        ]
    },
    {
        id: "vestuario",
        name: "Vestuario e Protecao",
        subcategories: [],
        tags: [
            { id: "bermudas", name: "Bermudas e Bretelles" },
            { id: "camisas", name: "Camisas de Ciclismo" },
            { id: "jaquetas", name: "Jaquetas Corta-Vento" },
            { id: "meias", name: "Meias" },
            { id: "sapatilhas", name: "Sapatilhas" },
            { id: "luvas", name: "Luvas" },
            { id: "oculos", name: "Oculos de Sol" },
            { id: "manguitos", name: "Manguitos e Pernitos" },
        ]
    },
    {
        id: "ferramentas",
        name: "Ferramentas e Manutencao",
        subcategories: [],
        tags: [
            { id: "multiferramentas", name: "Canivetes Multi-ferramentas" },
            { id: "chaves-corrente", name: "Chaves de Corrente" },
            { id: "chaves-raio", name: "Chaves de Raio" },
            { id: "bombas", name: "Bombas de Ar" },
            { id: "lubrificantes", name: "Lubrificantes de Corrente" },
            { id: "desengraxantes", name: "Desengraxantes" },
            { id: "selantes", name: "Selantes para Tubeless" },
            { id: "kits-reparo", name: "Kits de Reparo de Pneu" },
        ]
    },
]

interface Props {
    categoryId: string
    subcategoryId: string
    onCategoryChange: (categoryId: string, subcategoryId: string) => void
}

export function CategoryStep({ categoryId, subcategoryId, onCategoryChange }: Props) {
    const [viewingCategoryId, setViewingCategoryId] = useState<string>(categoryId || "")
    const [selectedTags, setSelectedTags] = useState<string[]>(() => {
        if (subcategoryId) {
            return subcategoryId.split(",").filter(Boolean)
        }
        return []
    })

    const viewingCategory = CATEGORIES.find(c => c.id === viewingCategoryId)
    const isViewingTags = viewingCategoryId !== ""

    const selectedCatName = CATEGORIES.find(c => c.id === categoryId)?.name

    const handleSelectCategory = (catId: string) => {
        setViewingCategoryId(catId)
        if (catId !== categoryId) {
            // Nova categoria, limpa tags
            setSelectedTags([])
            onCategoryChange(catId, "")
        }
    }

    const toggleTag = (tagId: string) => {
        const newTags = selectedTags.includes(tagId)
            ? selectedTags.filter(t => t !== tagId)
            : [...selectedTags, tagId]
        setSelectedTags(newTags)
        onCategoryChange(viewingCategoryId, newTags.join(","))
    }

    const handleBackToCategories = () => {
        setViewingCategoryId("")
    }

    // Mostrar tags da categoria
    if (isViewingTags && viewingCategory) {
        return (
            <div className="space-y-4">
                <button
                    onClick={handleBackToCategories}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="size-4" />
                    Voltar para categorias
                </button>

                <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">{viewingCategory.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Selecione uma ou mais caracteristicas do produto
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {viewingCategory.tags.map(tag => {
                        const isSelected = selectedTags.includes(tag.id)
                        return (
                            <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                    isSelected
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'bg-card border border-border text-foreground hover:border-primary/30'
                                }`}
                            >
                                {tag.name}
                                {isSelected && <X className="size-3 inline ml-1" />}
                            </button>
                        )
                    })}
                </div>

                {selectedTags.length > 0 && (
                    <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                        <p className="text-sm font-medium text-green-800">Selecionado ({selectedTags.length}):</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {selectedTags.map(tagId => {
                                const tag = viewingCategory.tags.find(t => t.id === tagId)
                                return tag ? (
                                    <span key={tagId} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                        {tag.name}
                                    </span>
                                ) : null
                            })}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Mostrar categorias principais
    return (
        <div className="space-y-4">
            <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Qual categoria melhor descreve seu produto?</h2>
                <p className="text-sm text-muted-foreground mt-1">Escolha uma categoria e depois selecione as caracteristicas</p>
            </div>

            <div className="space-y-2">
                {CATEGORIES.map(cat => {
                    const isSelected = categoryId === cat.id
                    const tagCount = selectedTags.length
                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleSelectCategory(cat.id)}
                            className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                            }`}
                        >
                            <div>
                                <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                                {isSelected && tagCount > 0 && (
                                    <p className="text-xs text-primary mt-0.5">{tagCount} caracteristica(s) selecionada(s)</p>
                                )}
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground" />
                        </button>
                    )
                })}
            </div>

            {categoryId && selectedTags.length > 0 && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                    <p className="text-sm font-medium text-green-800">{selectedCatName}:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTags.map(tagId => {
                            const cat = CATEGORIES.find(c => c.id === categoryId)
                            const tag = cat?.tags.find(t => t.id === tagId)
                            return tag ? (
                                <span key={tagId} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                    {tag.name}
                                </span>
                            ) : null
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}