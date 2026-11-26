"use client"

import { BackButton } from "@/components/ui/back-button"
import { UploadForm } from "@/components/videos/UploadForm"

/** Mesmo formulário de /videos/upload, já no formato vertical curto. */
export default function MementoUploadPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 lg:pt-8">
            <BackButton href="/videos/memento" label="Memento" className="-ml-2.5" />
            <h1 className="type-h2 mt-2 text-foreground">Publicar Memento</h1>
            <p className="type-caption mt-1 text-muted-foreground">Vertical e curto, até 3 min.</p>
            <div className="mt-6">
                <UploadForm mode="memento" />
            </div>
        </div>
    )
}
