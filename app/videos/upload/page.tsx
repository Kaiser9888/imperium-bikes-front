"use client";

import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { UploadSelector, type UploadMode } from "@/components/videos/UploadSelector";
import { UploadForm } from "@/components/videos/UploadForm";

export default function UploadPage() {
    const [mode, setMode] = useState<UploadMode>("long");

    return (
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10">
          <BackButton href="/videos/meus-videos" label="Central de Vídeos" className="-ml-2.5" />
          <p className="type-caption mt-3 font-semibold uppercase tracking-[0.16em] text-primary">Publicar</p>
          <h1 className="type-h1 mt-1 text-foreground">Compartilhe seu pedal</h1>
          <p className="type-body-small mt-1 text-muted-foreground">Escolha o formato, envie o arquivo e conte o que rolou.</p>

          <div className="mt-8">
              <UploadSelector value={mode} onChange={setMode} />
          </div>

          <div className="mt-8">
              <UploadForm key={mode} mode={mode} />
          </div>
      </div>
    );
}
