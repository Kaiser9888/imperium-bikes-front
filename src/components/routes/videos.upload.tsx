import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UploadSelector, type UploadMode } from "@/components/videos/UploadSelector";
import { UploadForm } from "@/components/videos/UploadForm";

export const Route = createFileRoute("/videos/upload")({
    head: () => ({
        meta: [
            { title: "Publicar — Imperium Bikes" },
            { name: "description", content: "Publique um vídeo longo ou um Memento na comunidade Imperium Bikes." },
            { property: "og:title", content: "Publicar — Imperium Bikes" },
            { property: "og:description", content: "Publique um vídeo longo ou um Memento na Imperium Bikes." },
        ],
    }),
    component: UploadPage,
});

function UploadPage() {
    const [mode, setMode] = useState<UploadMode>("long");

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Publicar</h1>
            <p className="mt-1 text-sm text-muted-foreground">Escolha o formato e envie seu vídeo.</p>

            <div className="mt-6">
                <UploadSelector value={mode} onChange={setMode} />
            </div>

            <div className="mt-8">
                <UploadForm key={mode} mode={mode} />
            </div>
        </div>
    );
}
