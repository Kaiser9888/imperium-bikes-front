// components/publish/PricingStep.tsx
"use client"

import { ShippingType, SHIPPING_TYPES } from "@/types/publish/product"
import { DollarSign, Truck, MapPin, Shield, TrendingUp } from "lucide-react"

interface Props {
    price: number
    negotiable: boolean
    shippingType: ShippingType | ""
    city: string
    state: string
    hasSecurePayment: boolean
    featured: boolean
    onChange: (fields: Record<string, string | number | boolean>) => void
}

export function PricingStep({ price, negotiable, shippingType, city, state, hasSecurePayment, featured, onChange }: Props) {
    const formatPrice = (value: number) => {
        return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
    }

    return (
        <div className="space-y-5">
            <h2 className="font-heading text-lg font-bold">Preco e entrega</h2>

            <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Preco *</label>
                <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        type="number"
                        value={price || ""}
                        onChange={(e) => onChange({ price: Math.max(0, parseFloat(e.target.value) || 0) })}
                        placeholder="0,00"
                        min={0.01}
                        step={0.01}
                        className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/30"
                    />
                </div>
                {price > 0 && (
                    <p className="text-sm font-bold text-foreground mt-1">{formatPrice(price)}</p>
                )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={negotiable}
                    onChange={(e) => onChange({ negotiable: e.target.checked })}
                    className="size-4 rounded border-border"
                />
                <span className="text-sm">Aceita negociacao de preco</span>
            </label>

            <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Tipo de frete *</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                    {SHIPPING_TYPES.map(st => (
                        <button
                            key={st.value}
                            onClick={() => onChange({ shippingType: st.value })}
                            className={`rounded-xl border p-3 text-center text-sm font-medium transition-all hover:border-primary/30 ${
                                shippingType === st.value ? 'border-primary bg-primary/5' : 'border-border bg-card'
                            }`}
                        >
                            {st.value === 'FREE' && <Truck className="size-5 mx-auto mb-1" />}
                            {st.value === 'CALCULATED' && <MapPin className="size-5 mx-auto mb-1" />}
                            {st.value === 'PICKUP' && <MapPin className="size-5 mx-auto mb-1" />}
                            {st.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Cidade</label>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => onChange({ city: e.target.value })}
                        placeholder="Sao Paulo"
                        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Estado</label>
                    <input
                        type="text"
                        value={state}
                        onChange={(e) => onChange({ state: e.target.value })}
                        placeholder="SP"
                        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm mt-1 outline-none focus:border-primary/30"
                    />
                </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={hasSecurePayment}
                    onChange={(e) => onChange({ hasSecurePayment: e.target.checked })}
                    className="size-4 rounded border-border"
                />
                <span className="text-sm flex items-center gap-1"><Shield className="size-4" /> Pagamento seguro Imperium</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => onChange({ featured: e.target.checked })}
                    className="size-4 rounded border-border"
                />
                <span className="text-sm flex items-center gap-1"><TrendingUp className="size-4" /> Destacar anuncio (mais visibilidade)</span>
            </label>
        </div>
    )
}