// components/publish/SaveDraftIndicator.tsx
interface Props {
    isSaving: boolean
    lastSaved: Date | null
}

export function SaveDraftIndicator({ isSaving, lastSaved }: Props) {
    if (!isSaving && !lastSaved) return null

    return (
        <div className="flex justify-center py-1.5">
            <span className="text-[10px] text-muted-foreground bg-secondary/50 px-3 py-0.5 rounded-full">
                {isSaving ? 'Salvando rascunho...' : 'Rascunho salvo ' + (lastSaved ? lastSaved.toLocaleTimeString('pt-BR') : '')}
            </span>
        </div>
    )
}