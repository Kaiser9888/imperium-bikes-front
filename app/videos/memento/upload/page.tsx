"use client"

import { BackButton } from "@/components/ui/back-button"
import { UploadForm } from "@/components/videos/UploadForm"

/** Mesmo formulário de /videos/upload, já no formato vertical curto. */
export default function MementoUploadPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
            <BackButton href="/videos/memento" label="Memento" className="-ml-2.5" />
            <p className="type-caption mt-3 font-semibold uppercase tracking-[0.35em] text-primary">Memento</p>
            <h1 className="type-h1 mt-1 text-foreground">Publique um momento</h1>
            <p className="type-body-small mt-1 text-muted-foreground">Vídeo vertical e curto, de até 3 minutos, direto para o feed.</p>
            <div className="mt-8">
                <UploadForm mode="memento" />
            </div>
        </div>
    )
}
