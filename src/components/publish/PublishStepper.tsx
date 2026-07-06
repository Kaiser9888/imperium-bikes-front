// components/publish/PublishStepper.tsx
"use client"

import { Check } from "lucide-react"

const STEPS = ["Categoria", "Informacoes", "Fotos", "Venda", "Revisao"]

interface Props {
    currentStep: number
    totalSteps: number
    onStepClick: (step: number) => void
}

export function PublishStepper({ currentStep, totalSteps, onStepClick }: Props) {
    return (
        <div className="border-b border-border bg-card/50">
            <div className="mx-auto max-w-2xl px-4 py-3">
                <div className="flex items-center justify-between">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center">
                            <button
                                onClick={() => onStepClick(i)}
                                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${i === currentStep ? 'text-primary' : i < currentStep ? 'text-green-500' : 'text-muted-foreground'}`}
                            >
                                <span className={`flex size-5 items-center justify-center rounded-full text-[10px] ${i === currentStep ? 'bg-primary text-primary-foreground' : i < currentStep ? 'bg-green-500 text-white' : 'bg-secondary text-muted-foreground'}`}>
                                    {i < currentStep ? <Check className="size-3" /> : i + 1}
                                </span>
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                            {i < STEPS.length - 1 && (
                                <div className={`w-6 sm:w-10 h-px mx-1 ${i < currentStep ? 'bg-green-500' : 'bg-border'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}