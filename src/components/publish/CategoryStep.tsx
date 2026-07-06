// components/publish/CategoryStep.tsx
"use client"

import { useState } from "react"
import { Package, ChevronRight, Search } from "lucide-react"

interface Category {
    id: string
    name: string
}

interface SubCategory {
    id: string
    name: string
}

const CATEGORIES: Category[] = [
    { id: "cat-1", name: "Bike" },
    { id: "cat-2", name: "Quadro" },
    { id: "cat-3", name: "Suspensao" },
    { id: "cat-4", name: "Freios" },
    { id: "cat-5", name: "Rodas" },
    { id: "cat-6", name: "Pneus" },
    { id: "cat-7", name: "Transmissao" },
    { id: "cat-8", name: "Cockpit" },
    { id: "cat-9", name: "Pecas" },
    { id: "cat-10", name: "Equipamentos" },
    { id: "cat-11", name: "Ferramentas" },
    { id: "cat-12", name: "Vestuario" },
    { id: "cat-13", name: "Eletronicos" },
    { id: "cat-14", name: "Outros" },
]

const SUBCATEGORIES: Record<string, SubCategory[]> = {
    "cat-1": [
        { id: "sub-1-1", name: "MTB" }, { id: "sub-1-2", name: "Downhill" },
        { id: "sub-1-3", name: "Enduro" }, { id: "sub-1-4", name: "Trail" },
        { id: "sub-1-5", name: "XC" }, { id: "sub-1-6", name: "Gravel" },
        { id: "sub-1-7", name: "Speed" }, { id: "sub-1-8", name: "BMX" },
        { id: "sub-1-9", name: "Infantil" }, { id: "sub-1-10", name: "Eletrica" },
    ],
    "cat-2": [{ id: "sub-2-1", name: "Carbono" }, { id: "sub-2-2", name: "Aluminio" }, { id: "sub-2-3", name: "Aco" }, { id: "sub-2-4", name: "Titanio" }],
    "cat-3": [{ id: "sub-3-1", name: "Dianteira" }, { id: "sub-3-2", name: "Traseira" }, { id: "sub-3-3", name: "Canote retratil" }],
    "cat-4": [{ id: "sub-4-1", name: "Hidraulico" }, { id: "sub-4-2", name: "Mecanico" }, { id: "sub-4-3", name: "Pastilhas" }],
    "cat-5": [{ id: "sub-5-1", name: "Aro 26" }, { id: "sub-5-2", name: "Aro 27.5" }, { id: "sub-5-3", name: "Aro 29" }, { id: "sub-5-4", name: "Cubo" }],
    "cat-6": [{ id: "sub-6-1", name: "Tubeless" }, { id: "sub-6-2", name: "Com camara" }, { id: "sub-6-3", name: "Estrada" }],
    "cat-7": [{ id: "sub-7-1", name: "Grupo completo" }, { id: "sub-7-2", name: "Cambio" }, { id: "sub-7-3", name: "Corrente" }],
    "cat-8": [{ id: "sub-8-1", name: "Guidao" }, { id: "sub-8-2", name: "Mesa" }, { id: "sub-8-3", name: "Selim" }],
    "cat-9": [{ id: "sub-9-1", name: "Motor" }, { id: "sub-9-2", name: "Eletrica" }, { id: "sub-9-3", name: "Variada" }],
    "cat-10": [{ id: "sub-10-1", name: "Capacete" }, { id: "sub-10-2", name: "Luva" }, { id: "sub-10-3", name: "Oculos" }],
    "cat-11": [{ id: "sub-11-1", name: "Chaves" }, { id: "sub-11-2", name: "Bombas" }, { id: "sub-11-3", name: "Suportes" }],
    "cat-12": [{ id: "sub-12-1", name: "Camisa" }, { id: "sub-12-2", name: "Bermuda" }, { id: "sub-12-3", name: "Sapatilha" }],
    "cat-13": [{ id: "sub-13-1", name: "Ciclocomputador" }, { id: "sub-13-2", name: "Lanternas" }, { id: "sub-13-3", name: "Sensores" }],
    "cat-14": [{ id: "sub-14-1", name: "Diversos" }],
}

interface Props {
    categoryId: string
    subcategoryId: string
    onCategoryChange: (categoryId: string, subcategoryId: string) => void
}

export function CategoryStep({ categoryId, subcategoryId, onCategoryChange }: Props) {
    const [search, setSearch] = useState("")
    const [showSubs, setShowSubs] = useState(false)

    const filteredCategories = CATEGORIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    )

    const selectedCategory = CATEGORIES.find(c => c.id === categoryId)
    const subs = categoryId ? SUBCATEGORIES[categoryId] || [] : []

    const handleSelectCategory = (catId: string) => {
        onCategoryChange(catId, "")
        setShowSubs(true)
    }

    const handleSelectSub = (subId: string) => {
        onCategoryChange(categoryId, subId)
    }

    const handleBack = () => {
        setShowSubs(false)
        onCategoryChange("", "")
    }

    if (showSubs && selectedCategory) {
        return (
            <div>
                <button onClick={handleBack} className="text-sm text-primary mb-4 flex items-center gap-1">
                    Voltar
                </button>
                <h2 className="font-heading text-lg font-bold mb-4">{selectedCategory.name} - Subcategoria</h2>
                <div className="grid grid-cols-2 gap-2">
                    {subs.map(sub => (
                        <button
                            key={sub.id}
                            onClick={() => handleSelectSub(sub.id)}
                            className={`rounded-xl border p-4 text-left text-sm font-medium transition-all hover:border-primary/30 ${
                                subcategoryId === sub.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                            }`}
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            <h2 className="font-heading text-lg font-bold mb-4">Escolha a categoria</h2>
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar categoria..."
                    className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/30"
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {filteredCategories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`rounded-xl border p-4 text-left text-sm font-medium transition-all hover:border-primary/30 flex items-center justify-between ${
                            categoryId === cat.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                        }`}
                    >
                        <span>{cat.name}</span>
                        <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                ))}
            </div>
        </div>
    )
}