"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { UploadSelector, type UploadMode } from "@/components/videos/UploadSelector";
import { UploadForm } from "@/components/videos/UploadForm";

export default function UploadPage() {
    return (
      <Suspense fallback={null}>
          <Upload />
      </Suspense>
    );
}

function Upload() {
    const [mode, setMode] = useState<UploadMode>("long");
    // Vindo da página do evento (?torneio=): o vídeo já sai marcado com ele
    const torneioId = useSearchParams().get("torneio");

    return (
      // Mais estreita e sem textos de apresentação: o formulário é o conteúdo
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 lg:pt-8">
          <BackButton href="/videos/meus-videos" label="Meus vídeos" className="-ml-2.5" />
          <h1 className="type-h2 mt-2 text-foreground">Publicar</h1>

          <div className="mt-5">
              <UploadSelector value={mode} onChange={setMode} />
          </div>

          <div className="mt-6">
              <UploadForm key={mode} mode={mode} torneioId={torneioId} />
          </div>
      </div>
    );
}
