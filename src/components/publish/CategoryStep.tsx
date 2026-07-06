// components/publish/CategoryStep.tsx
"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"

const CATEGORIES = [
    {
        id: "bicicletas",
        name: "Bicicletas",
        subcategories: [
            { id: "bicicletas-mtb", name: "Mountain Bike (MTB)" },
            { id: "bicicletas-speed", name: "Estrada (Speed)" },
            { id: "bicicletas-urbana", name: "Urbana / Lazer" },
            { id: "bicicletas-eletrica", name: "Eletrica (E-Bike)" },
            { id: "bicicletas-gravel", name: "Gravel" },
            { id: "bicicletas-bmx", name: "BMX" },
            { id: "bicicletas-infantil", name: "Infantil" },
        ]
    },
    {
        id: "componentes",
        name: "Componentes",
        subcategories: [
            { id: "comp-quadros", name: "Quadros e Suspensoes" },
            { id: "comp-transmissao", name: "Transmissao" },
            { id: "comp-freios", name: "Freios" },
            { id: "comp-rodas", name: "Rodas e Pneus" },
            { id: "comp-cockpit", name: "Cockpit e Selim" },
            { id: "comp-pedais", name: "Pedais e Outros" },
        ]
    },
    {
        id: "equipamentos",
        name: "Equipamentos e Acessorios",
        subcategories: [
            { id: "equip-seguranca", name: "Seguranca e Iluminacao" },
            { id: "equip-transporte", name: "Transporte e Hidratacao" },
            { id: "equip-eletronicos", name: "Ciclocomputadores e Eletronicos" },
        ]
    },
    {
        id: "vestuario",
        name: "Vestuario e Protecao",
        subcategories: [
            { id: "vest-roupas", name: "Roupas" },
            { id: "vest-acessorios", name: "Acessorios de Vestuario" },
        ]
    },
    {
        id: "ferramentas",
        name: "Ferramentas e Manutencao",
        subcategories: [
            { id: "ferr-ferramentas", name: "Ferramentas" },
            { id: "ferr-manutencao", name: "Manutencao e Limpeza" },
        ]
    },
]

interface Props {
    categoryId: string
    subcategoryId: string
    onCategoryChange: (categoryId: string, subcategoryId: string) => void
}

export function CategoryStep({ categoryId, subcategoryId, onCategoryChange }: Props) {
    // Usar categoryId existente para determinar qual categoria esta selecionada
    const [viewingCategoryId, setViewingCategoryId] = useState<string>(categoryId || "")

    const viewingCategory = CATEGORIES.find(c => c.id === viewingCategoryId)
    const isViewingSubs = viewingCategoryId !== ""

    const selectedCatName = CATEGORIES.find(c => c.id === categoryId)?.name
    const selectedSubName = CATEGORIES.find(c => c.id === categoryId)?.subcategories.find(s => s.id === subcategoryId)?.name

    const handleSelectCategory = (catId: string) => {
        setViewingCategoryId(catId)
        // Ao selecionar categoria, limpa subcategoria anterior
        onCategoryChange(catId, "")
    }

    const handleSelectSub = (subId: string) => {
        onCategoryChange(viewingCategoryId, subId)
    }

    const handleBackToCategories = () => {
        setViewingCategoryId("")
    }

    // Mostrar subcategorias
    if (isViewingSubs && viewingCategory) {
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
                    <p className="text-sm text-muted-foreground mt-1">Escolha a modalidade ou tipo especifico</p>
                </div>

                <div className="space-y-2">
                    {viewingCategory.subcategories.map(sub => {
                        const isSelected = categoryId === viewingCategory.id && subcategoryId === sub.id
                        return (
                            <button
                                key={sub.id}
                                onClick={() => handleSelectSub(sub.id)}
                                className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
                                }`}
                            >
                                <span className="text-sm font-medium">{sub.name}</span>
                                <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                                }`}>
                                    {isSelected && <Check className="size-3 text-white" />}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {categoryId && subcategoryId && (
                    <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                        <p className="text-sm font-medium text-green-800">Selecionado:</p>
                        <p className="text-sm text-green-700">{selectedCatName} &gt; {selectedSubName}</p>
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
                <p className="text-sm text-muted-foreground mt-1">Escolha uma categoria principal para continuar</p>
            </div>

            <div className="space-y-2">
                {CATEGORIES.map(cat => {
                    const isSelected = categoryId === cat.id
                    const catSubName = isSelected && subcategoryId
                        ? CATEGORIES.find(c => c.id === categoryId)?.subcategories.find(s => s.id === subcategoryId)?.name
                        : null
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
                                {catSubName && (
                                    <p className="text-xs text-primary mt-0.5">{catSubName}</p>
                                )}
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground" />
                        </button>
                    )
                })}
            </div>

            {categoryId && subcategoryId && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                    <p className="text-sm font-medium text-green-800">Selecionado:</p>
                    <p className="text-sm text-green-700">{selectedCatName} &gt; {selectedSubName}</p>
                </div>
            )}
        </div>
    )
}