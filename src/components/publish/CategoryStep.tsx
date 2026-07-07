// components/publish/CategoryStep.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronRight, ChevronLeft, Search } from "lucide-react"

// ============================================================
// TIPOS
// ============================================================

interface Attribute {
    id: string
    label: string
}

interface CategoryDefinition {
    id: string
    label: string
    modalities: Attribute[]
    attributes: Attribute[]
}

// ============================================================
// DADOS - Todas as categorias do marketplace de bikes
// ============================================================

const CATEGORIES: CategoryDefinition[] = [
    {
        id: "bicicletas",
        label: "Bicicletas Completas",
        modalities: [
            { id: "mtb", label: "Mountain Bike (MTB)" },
            { id: "downhill", label: "Downhill" },
            { id: "enduro", label: "Enduro" },
            { id: "trail", label: "Trail" },
            { id: "xc", label: "Cross Country (XC)" },
            { id: "gravel", label: "Gravel" },
            { id: "speed", label: "Estrada (Speed)" },
            { id: "bmx", label: "BMX" },
            { id: "eletrica", label: "Elétrica (E-Bike)" },
            { id: "urbana", label: "Urbana / Lazer" },
            { id: "infantil", label: "Infantil" },
            { id: "dobravel", label: "Dobrável" },
        ],
        attributes: [
            { id: "aro-26", label: "Aro 26" },
            { id: "aro-275", label: "Aro 27.5" },
            { id: "aro-29", label: "Aro 29" },
            { id: "carbono", label: "Carbono" },
            { id: "aluminio", label: "Alumínio" },
            { id: "aco", label: "Aço" },
            { id: "titanio", label: "Titânio" },
        ],
    },
    {
        id: "quadros",
        label: "Quadros",
        modalities: [
            { id: "mtb", label: "Mountain Bike (MTB)" },
            { id: "downhill", label: "Downhill" },
            { id: "enduro", label: "Enduro" },
            { id: "trail", label: "Trail" },
            { id: "xc", label: "Cross Country (XC)" },
            { id: "gravel", label: "Gravel" },
            { id: "speed", label: "Estrada (Speed)" },
            { id: "bmx", label: "BMX" },
            { id: "eletrica", label: "Elétrica" },
            { id: "urbana", label: "Urbana / Lazer" },
        ],
        attributes: [
            { id: "carbono", label: "Carbono" },
            { id: "aluminio", label: "Alumínio" },
            { id: "aco", label: "Aço" },
            { id: "titanio", label: "Titânio" },
            { id: "full-suspension", label: "Full Suspension" },
            { id: "hardtail", label: "Hardtail" },
            { id: "rigida", label: "Rígida" },
            { id: "aro-26", label: "Aro 26" },
            { id: "aro-275", label: "Aro 27.5" },
            { id: "aro-29", label: "Aro 29" },
        ],
    },
    {
        id: "garfos-suspensoes",
        label: "Garfos e Suspensões",
        modalities: [
            { id: "mtb", label: "Mountain Bike (MTB)" },
            { id: "downhill", label: "Downhill" },
            { id: "enduro", label: "Enduro" },
            { id: "trail", label: "Trail" },
            { id: "xc", label: "Cross Country (XC)" },
            { id: "gravel", label: "Gravel" },
            { id: "speed", label: "Estrada (Speed)" },
        ],
        attributes: [
            { id: "dianteiro", label: "Dianteiro" },
            { id: "traseiro", label: "Traseiro" },
            { id: "ar", label: "A Ar" },
            { id: "mola", label: "Mola" },
            { id: "hidraulico", label: "Hidráulico" },
            { id: "eletronico", label: "Eletrônico" },
            { id: "curso-100", label: "Curso até 100mm" },
            { id: "curso-150", label: "Curso 100-150mm" },
            { id: "curso-200", label: "Curso 150-200mm" },
        ],
    },
    {
        id: "transmissao",
        label: "Transmissão",
        modalities: [
            { id: "mtb", label: "Mountain Bike (MTB)" },
            { id: "speed", label: "Estrada (Speed)" },
            { id: "gravel", label: "Gravel" },
        ],
        attributes: [
            { id: "cambio-dianteiro", label: "Câmbio Dianteiro" },
            { id: "cambio-traseiro", label: "Câmbio Traseiro" },
            { id: "passador", label: "Passador / Alavanca" },
            { id: "cassete", label: "Cassete / K7" },
            { id: "corrente", label: "Corrente" },
            { id: "pedivela", label: "Pedivela" },
            { id: "mov-central", label: "Movimento Central" },
            { id: "shimano", label: "Shimano" },
            { id: "sram", label: "SRAM" },
            { id: "campagnolo", label: "Campagnolo" },
            { id: "microshift", label: "MicroSHIFT" },
            { id: "12v", label: "12 velocidades" },
            { id: "11v", label: "11 velocidades" },
            { id: "10v", label: "10 velocidades" },
            { id: "9v", label: "9 velocidades" },
            { id: "eletronico", label: "Eletrônico" },
            { id: "mecanico", label: "Mecânico" },
        ],
    },
    {
        id: "freios",
        label: "Freios",
        modalities: [
            { id: "mtb", label: "Mountain Bike (MTB)" },
            { id: "speed", label: "Estrada (Speed)" },
            { id: "gravel", label: "Gravel" },
        ],
        attributes: [
            { id: "disco-hidraulico", label: "Disco Hidráulico" },
            { id: "disco-mecanico", label: "Disco Mecânico" },
            { id: "ferradura", label: "Ferradura" },
            { id: "pastilhas", label: "Pastilhas" },
            { id: "rotor", label: "Discos / Rotores" },
            { id: "manete", label: "Manetes" },
            { id: "shimano", label: "Shimano" },
            { id: "sram", label: "SRAM" },
            { id: "magura", label: "Magura" },
            { id: "hope", label: "Hope" },
        ],
    },
    {
        id: "rodas-pneus",
        label: "Rodas e Pneus",
        modalities: [
            { id: "mtb", label: "Mountain Bike (MTB)" },
            { id: "speed", label: "Estrada (Speed)" },
            { id: "gravel", label: "Gravel" },
            { id: "bmx", label: "BMX" },
            { id: "eletrica", label: "Elétrica" },
        ],
        attributes: [
            { id: "pneu", label: "Pneu" },
            { id: "camara", label: "Câmara de Ar" },
            { id: "roda-completa", label: "Roda Completa" },
            { id: "cubo", label: "Cubo" },
            { id: "raio", label: "Raio" },
            { id: "aro-26", label: "Aro 26" },
            { id: "aro-275", label: "Aro 27.5" },
            { id: "aro-29", label: "Aro 29" },
            { id: "aro-700", label: "Aro 700" },
            { id: "tubeless", label: "Tubeless" },
            { id: "com-camara", label: "Com Câmara" },
        ],
    },
    {
        id: "cockpit",
        label: "Cockpit e Selim",
        modalities: [
            { id: "mtb", label: "Mountain Bike (MTB)" },
            { id: "speed", label: "Estrada (Speed)" },
            { id: "gravel", label: "Gravel" },
        ],
        attributes: [
            { id: "guidao", label: "Guidão" },
            { id: "mesa", label: "Mesa / Avanço" },
            { id: "selim", label: "Selim" },
            { id: "canote", label: "Canote" },
            { id: "fita", label: "Fita de Guidão" },
            { id: "manopla", label: "Manopla" },
            { id: "carbono", label: "Carbono" },
            { id: "aluminio", label: "Alumínio" },
        ],
    },
    {
        id: "pedais",
        label: "Pedais",
        modalities: [
            { id: "mtb", label: "Mountain Bike (MTB)" },
            { id: "speed", label: "Estrada (Speed)" },
            { id: "gravel", label: "Gravel" },
            { id: "bmx", label: "BMX" },
            { id: "urbana", label: "Urbana / Lazer" },
        ],
        attributes: [
            { id: "clip", label: "Encaixe (Clip)" },
            { id: "plataforma", label: "Plataforma" },
            { id: "misto", label: "Misto (Clip + Plataforma)" },
            { id: "shimano-spd", label: "Shimano SPD" },
            { id: "look", label: "Look" },
            { id: "crankbrothers", label: "Crankbrothers" },
        ],
    },
    {
        id: "equipamentos",
        label: "Equipamentos e Acessórios",
        modalities: [],
        attributes: [
            { id: "capacete", label: "Capacete" },
            { id: "lanterna", label: "Lanterna / Farol" },
            { id: "sinalizador", label: "Sinalizador" },
            { id: "cadeado", label: "Cadeado" },
            { id: "garrafa", label: "Caramanhola (Garrafa)" },
            { id: "suporte-garrafa", label: "Suporte de Garrafa" },
            { id: "bolsa-selim", label: "Bolsa de Selim" },
            { id: "bolsa-quadro", label: "Bolsa de Quadro" },
            { id: "mochila", label: "Mochila de Hidratação" },
            { id: "transbike", label: "Transbike (Suporte para Carro)" },
            { id: "gps", label: "GPS" },
            { id: "ciclocomputador", label: "Ciclocomputador" },
            { id: "sensor", label: "Sensor de Cadência / Cardíaco" },
            { id: "camera-acao", label: "Câmera de Ação" },
        ],
    },
    {
        id: "vestuario",
        label: "Vestuário e Proteção",
        modalities: [],
        attributes: [
            { id: "bermuda", label: "Bermuda / Bretelle" },
            { id: "camisa", label: "Camisa de Ciclismo" },
            { id: "jaqueta", label: "Jaqueta Corta-Vento" },
            { id: "meia", label: "Meia" },
            { id: "sapatilha", label: "Sapatilha" },
            { id: "luva", label: "Luva" },
            { id: "oculos", label: "Óculos de Sol" },
            { id: "manguito", label: "Manguito / Pernito" },
        ],
    },
    {
        id: "ferramentas",
        label: "Ferramentas e Manutenção",
        modalities: [],
        attributes: [
            { id: "multiferramenta", label: "Canivete Multi-ferramenta" },
            { id: "chave-corrente", label: "Chave de Corrente" },
            { id: "chave-raio", label: "Chave de Raio" },
            { id: "bomba-chao", label: "Bomba de Chão" },
            { id: "bomba-mao", label: "Bomba de Mão" },
            { id: "lubrificante", label: "Lubrificante de Corrente" },
            { id: "desengraxante", label: "Desengraxante" },
            { id: "selante", label: "Selante para Tubeless" },
            { id: "kit-reparo", label: "Kit de Reparo de Pneu" },
        ],
    },
]

// ============================================================
// INTERFACE DO COMPONENTE
// ============================================================

interface SelectionState {
    categoryId: string
    modalities: string[]
    attributes: string[]
}

interface Props {
    categoryId: string
    subcategoryId: string
    onCategoryChange: (categoryId: string, subcategoryId: string) => void
}

export function CategoryStep({ categoryId, subcategoryId, onCategoryChange }: Props) {
    const initializedRef = useRef(false)

    const parseSelection = (): SelectionState => {
        try {
            if (subcategoryId && subcategoryId.startsWith("{")) {
                return JSON.parse(subcategoryId)
            }
        } catch { /* ignora */ }
        return { categoryId: categoryId || "", modalities: [], attributes: [] }
    }

    const [selection, setSelection] = useState<SelectionState>(parseSelection)
    const [viewingCategoryId, setViewingCategoryId] = useState<string>(categoryId || "")
    const [searchTerm, setSearchTerm] = useState("")

    // Sincroniza apenas na primeira carga
    useEffect(() => {
        if (initializedRef.current) return
        initializedRef.current = true
        const parsed = parseSelection()
        setSelection(parsed)
        setViewingCategoryId(parsed.categoryId || "")
    }, [])

    const emit = (newSelection: SelectionState) => {
        setSelection(newSelection)
        const json = JSON.stringify(newSelection)
        onCategoryChange(newSelection.categoryId, json)
    }

    const viewingCategory = CATEGORIES.find(c => c.id === viewingCategoryId)
    const isViewingDetails = viewingCategoryId !== ""

    const handleSelectCategory = (catId: string) => {
        const newSelection: SelectionState = {
            categoryId: catId,
            modalities: [],
            attributes: [],
        }
        emit(newSelection)
        setViewingCategoryId(catId)
    }

    const toggleModality = (modId: string) => {
        if (!viewingCategory) return
        const newModalities = selection.modalities.includes(modId)
            ? selection.modalities.filter(m => m !== modId)
            : [...selection.modalities, modId]
        emit({ ...selection, categoryId: viewingCategoryId, modalities: newModalities })
    }

    const toggleAttribute = (attrId: string) => {
        if (!viewingCategory) return
        const newAttributes = selection.attributes.includes(attrId)
            ? selection.attributes.filter(a => a !== attrId)
            : [...selection.attributes, attrId]
        emit({ ...selection, categoryId: viewingCategoryId, attributes: newAttributes })
    }

    const handleBack = () => {
        setViewingCategoryId("")
    }

    const filteredCategories = CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isViewingDetails && viewingCategory) {
        const hasModalities = viewingCategory.modalities.length > 0
        const hasAttributes = viewingCategory.attributes.length > 0

        return (
            <div className="space-y-6">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="size-4" />
                    Voltar para categorias
                </button>

                <h2 className="font-heading text-lg font-bold text-foreground">{viewingCategory.label}</h2>

                {hasModalities && (
                    <div>
                        <p className="text-sm font-semibold text-foreground mb-2">
                            Modalidade (selecione uma ou mais)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {viewingCategory.modalities.map(mod => {
                                const isSelected = selection.modalities.includes(mod.id)
                                return (
                                    <button
                                        key={mod.id}
                                        onClick={() => toggleModality(mod.id)}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                            isSelected
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-card border border-border text-foreground hover:border-primary/40"
                                        }`}
                                    >
                                        {mod.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {hasAttributes && (
                    <div>
                        <p className="text-sm font-semibold text-foreground mb-2">
                            Características (selecione uma ou mais)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {viewingCategory.attributes.map(attr => {
                                const isSelected = selection.attributes.includes(attr.id)
                                return (
                                    <button
                                        key={attr.id}
                                        onClick={() => toggleAttribute(attr.id)}
                                        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                            isSelected
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "bg-card border border-border text-foreground hover:border-primary/40"
                                        }`}
                                    >
                                        {attr.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {(selection.modalities.length > 0 || selection.attributes.length > 0) && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                        <p className="text-sm font-semibold text-emerald-800 mb-2">Selecionado nesta categoria:</p>
                        {selection.modalities.length > 0 && (
                            <div className="mb-1">
                                <span className="text-xs text-emerald-700 font-medium">Modalidades: </span>
                                {selection.modalities.map(mId => {
                                    const mod = viewingCategory.modalities.find(m => m.id === mId)
                                    return (
                                        <span key={mId} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mr-1">
                                            {mod?.label || mId}
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                        {selection.attributes.length > 0 && (
                            <div>
                                <span className="text-xs text-emerald-700 font-medium">Características: </span>
                                {selection.attributes.map(aId => {
                                    const attr = viewingCategory.attributes.find(a => a.id === aId)
                                    return (
                                        <span key={aId} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full mr-1">
                                            {attr?.label || aId}
                                        </span>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="font-heading text-lg font-bold text-foreground">
                    Em qual categoria seu produto se encaixa?
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Escolha a categoria para definir modalidade e características
                </p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar categoria..."
                    className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/30"
                />
            </div>

            <div className="space-y-2">
                {filteredCategories.map(cat => {
                    const isSelected = selection.categoryId === cat.id
                    const totalSelected = selection.modalities.length + selection.attributes.length

                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleSelectCategory(cat.id)}
                            className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                            }`}
                        >
                            <div>
                                <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                                {isSelected && totalSelected > 0 && (
                                    <p className="text-xs text-primary mt-0.5">
                                        {totalSelected} item(ns) selecionado(s)
                                    </p>
                                )}
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                        </button>
                    )
                })}
            </div>

            {filteredCategories.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma categoria encontrada para &ldquo;{searchTerm}&rdquo;
                </p>
            )}
        </div>
    )
}