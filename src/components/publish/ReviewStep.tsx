// components/publish/ReviewStep.tsx
"use client"

import { ProductFormData } from "@/types/publish/product"
import { MapPin, Package, Truck, Shield, TrendingUp, Pencil } from "lucide-react"

const CATEGORY_NAMES: Record<string, string> = {
    "cat-1": "Bike", "cat-2": "Quadro", "cat-3": "Suspensao", "cat-4": "Freios",
    "cat-5": "Rodas", "cat-6": "Pneus", "cat-7": "Transmissao", "cat-8": "Cockpit",
    "cat-9": "Pecas", "cat-10": "Equipamentos", "cat-11": "Ferramentas",
    "cat-12": "Vestuario", "cat-13": "Eletronicos", "cat-14": "Outros",
}

const CONDITION_LABELS: Record<string, string> = {
    NEW: "Novo", LIKE_NEW: "Seminovo", USED: "Usado",
    REFURBISHED: "Recondicionado", FOR_PARTS: "Para pecas",
}

interface Props {
    formData: ProductFormData
    onEdit: (step: number) => void
}

export function ReviewStep({ formData, onEdit }: Props) {
    const formatPrice = (value: number) => {
        return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
    }

    return (
        <div className="space-y-5">
            <h2 className="font-heading text-lg font-bold">Revisar anuncio</h2>
            <p className="text-sm text-muted-foreground">Confira todas as informacoes antes de publicar.</p>

            {/* Fotos */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fotos ({formData.images.length})</span>
                    <button onClick={() => onEdit(2)} className="text-xs text-primary"><Pencil className="size-3 inline" /> Editar</button>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {formData.images.map((img, i) => (
                        <img key={i} src={img.url} alt={`Foto ${i + 1}`} className="size-16 rounded-lg object-cover border border-border" />
                    ))}
                </div>
            </div>

            {/* Informacoes */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informacoes</span>
                    <button onClick={() => onEdit(1)} className="text-xs text-primary"><Pencil className="size-3 inline" /> Editar</button>
                </div>
                <h3 className="font-heading text-lg font-bold">{formData.title}</h3>
                {formData.brand && <p className="text-sm text-muted-foreground">Marca: {formData.brand}</p>}
                {formData.model && <p className="text-sm text-muted-foreground">Modelo: {formData.model}</p>}
                <p className="text-sm">{formData.description}</p>
                <div className="flex gap-2">
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{CONDITION_LABELS[formData.condition] || formData.condition}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{CATEGORY_NAMES[formData.categoryId] || "Categoria"}</span>
                    <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">Qtd: {formData.stock}</span>
                </div>
            </div>

            {/* Preco e entrega */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preco e entrega</span>
                    <button onClick={() => onEdit(3)} className="text-xs text-primary"><Pencil className="size-3 inline" /> Editar</button>
                </div>
                <p className="font-heading text-2xl font-bold text-foreground">{formatPrice(formData.price)}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {formData.negotiable && <span className="flex items-center gap-1">Preco negociavel</span>}
                    {formData.shippingType === 'FREE' && <span className="flex items-center gap-1"><Truck className="size-3" /> Frete gratis</span>}
                    {formData.shippingType === 'PICKUP' && <span className="flex items-center gap-1"><MapPin className="size-3" /> Retirada no local</span>}
                    {formData.city && <span>{formData.city}, {formData.state}</span>}
                    {formData.hasSecurePayment && <span className="flex items-center gap-1"><Shield className="size-3" /> Pagamento seguro</span>}
                    {formData.featured && <span className="flex items-center gap-1"><TrendingUp className="size-3" /> Destaque</span>}
                </div>
            </div>
        </div>
    )
}