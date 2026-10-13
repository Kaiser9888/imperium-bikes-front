"use client"

import { UploadForm } from "@/components/videos/UploadForm"

/** Mesmo formulário de /videos/upload, já no formato vertical curto. */
export default function MementoUploadPage() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Publicar Memento</h1>
            <div className="mt-8">
                <UploadForm mode="memento" />
            </div>
        </div>
    )
}
