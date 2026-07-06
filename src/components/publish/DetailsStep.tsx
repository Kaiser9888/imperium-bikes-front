// components/publish/DetailsStep.tsx
"use client"

import { ProductCondition, PRODUCT_CONDITIONS } from "@/types/publish/product"

interface Props {
    title: string
    brand: string
    model: string
    description: string
    condition: ProductCondition | ""
    stock: number
    onChange: (fields: Record<string, any>) => void
}

export function DetailsStep({ title, brand, model, description, condition, stock, onChange }: Props) {
    return (
        <div className="space-y-5">
            <h2 className="font-heading text-lg font-bold">Informacoes do produto</h2>

            <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome do anuncio *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Ex: Bicicleta MTB Aro 29"
                    minLength={10}
                    maxLength={120}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm mt-1 outline-none focus:border-primary/30"
                />
                <p className="text-[10px] text-muted-foreground mt-1">{title.length}/120 caracteres (minimo 10)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Marca</label>
                    <input
                        type="text"
                        value={brand}
                        onChange={(e) => onChange({ brand: e.target.value })}
                        placeholder="Ex: Trek"
                        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Modelo</label>
                    <input
                        type="text"
                        value={model}
                        onChange={(e) => onChange({ model: e.target.value })}
                        placeholder="Ex: Marlin 7"
                        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30"
                    />
                </div>
            </div>

            <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Quantidade</label>
                <input
                    type="number"
                    value={stock}
                    onChange={(e) => onChange({ stock: Math.max(1, parseInt(e.target.value) || 1) })}
                    min={1}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30"
                />
            </div>

            <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado do produto *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {PRODUCT_CONDITIONS.map(cond => (
                        <button
                            key={cond.value}
                            onClick={() => onChange({ condition: cond.value })}
                            className={`rounded-xl border p-3 text-left transition-all hover:border-primary/30 ${
                                condition === cond.value ? 'border-primary bg-primary/5' : 'border-border bg-card'
                            }`}
                        >
                            <p className="text-sm font-semibold">{cond.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{cond.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Descricao *</label>
                <textarea
                    value={description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Descreva o produto em detalhes: tamanho, cor, aro, uso, avarias..."
                    rows={5}
                    minLength={40}
                    maxLength={5000}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm mt-1 outline-none focus:border-primary/30 resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">{description.length}/5000 caracteres (minimo 40)</p>
            </div>
        </div>
    )
}