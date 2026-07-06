// components/publish/PublishNavigation.tsx
"use client"

import { ChevronLeft, ChevronRight, Send } from "lucide-react"

interface Props {
    step: number
    totalSteps: number
    onNext: () => void
    onPrev: () => void
}

export function PublishNavigation({ step, totalSteps, onNext, onPrev }: Props) {
    const isLastStep = step === totalSteps - 1
    const isFirstStep = step === 0

    const nextButtonClass = isLastStep
        ? 'bg-green-500 text-white hover:bg-green-600'
        : 'bg-primary text-primary-foreground hover:bg-primary/90'

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
                <button
                    onClick={onPrev}
                    disabled={isFirstStep}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="size-4" />
                    Voltar
                </button>

                <span className="text-xs text-muted-foreground">
                    {step + 1} de {totalSteps}
                </span>

                <button
                    onClick={onNext}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${nextButtonClass}`}
                >
                    {isLastStep ? (
                        <>Publicar <Send className="size-4" /></>
                    ) : (
                        <>Proximo <ChevronRight className="size-4" /></>
                    )}
                </button>
            </div>
        </div>
    )
}