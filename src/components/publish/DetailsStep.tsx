"use client"

import { cn } from "@/lib/utils"

interface DetailsStepProps {
  title: string
  description: string
  condition?: "new" | "used"
  stock?: string
  frameSize?: string
  wheelSize?: string
  size?: string
  estimatedTime?: string
  conditionalFields: {
    showCondition: boolean
    showStock: boolean
    showFrameSize: boolean
    showWheelSize: boolean
    showSize: boolean
    showEstimatedTime: boolean
  }
  onChange: (fields: Record<string, any>) => void
}

const FRAME_SIZES = ["S (15\")", "M (17\")", "L (19\")", "XL (21\")", "XXL (23\")"]
const WHEEL_SIZES = ["24\"", "26\"", "27.5\"", "29\"", "700c", "Mullet"]
const CLOTHING_SIZES = ["P", "M", "G", "GG", "XG", "Único"]

export function DetailsStep({
                              title, description, condition, stock, frameSize, wheelSize, size, estimatedTime,
                              conditionalFields, onChange
                            }: DetailsStepProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-lg font-bold">Detalhes do Anúncio</h2>

      {/* Título */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Título do anúncio *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Ex: Pneu Maxxis Assegai Downhill 29x2.5"
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary/40"
        />
      </div>

      {/* Preço */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Preço (R$) *</label>
        <input
          type="number"
          placeholder="0,00"
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary/40"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Descrição *</label>
        <textarea
          value={description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Descreva seu item em detalhes..."
          rows={4}
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary/40 resize-none"
        />
      </div>

      {/* ===== CAMPOS CONDICIONAIS ===== */}

      {/* Condição (Novo/Usado) */}
      {conditionalFields.showCondition && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Estado do Item *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange({ condition: "new" })}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                condition === "new"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              )}
            >
              🏷️ Novo
            </button>
            <button
              onClick={() => onChange({ condition: "used" })}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                condition === "used"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              )}
            >
              🔄 Usado
            </button>
          </div>
        </div>
      )}

      {/* Tamanho do Quadro */}
      {conditionalFields.showFrameSize && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Tamanho do Quadro</label>
          <select
            value={frameSize || ""}
            onChange={(e) => onChange({ frameSize: e.target.value })}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary/40"
          >
            <option value="">Selecione...</option>
            {FRAME_SIZES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Tamanho do Aro */}
      {conditionalFields.showWheelSize && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Tamanho do Aro</label>
          <div className="flex flex-wrap gap-2">
            {WHEEL_SIZES.map(s => (
              <button
                key={s}
                onClick={() => onChange({ wheelSize: s })}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  wheelSize === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tamanho (P/M/G) */}
      {conditionalFields.showSize && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Tamanho</label>
          <div className="flex flex-wrap gap-2">
            {CLOTHING_SIZES.map(s => (
              <button
                key={s}
                onClick={() => onChange({ size: s })}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  size === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estoque */}
      {conditionalFields.showStock && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Quantidade em Estoque</label>
          <input
            type="number"
            value={stock || ""}
            onChange={(e) => onChange({ stock: e.target.value })}
            placeholder="Ex: 5"
            min="1"
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary/40"
          />
        </div>
      )}

      {/* Tempo Estimado (Serviços) */}
      {conditionalFields.showEstimatedTime && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Tempo Estimado do Serviço</label>
          <input
            type="text"
            value={estimatedTime || ""}
            onChange={(e) => onChange({ estimatedTime: e.target.value })}
            placeholder="Ex: 2 horas / 1 dia"
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary/40"
          />
        </div>
      )}
    </div>
  )
}