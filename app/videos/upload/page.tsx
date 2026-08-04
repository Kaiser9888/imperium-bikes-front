"use client";

import { useState } from "react";
import { UploadSelector, type UploadMode } from "@/components/videos/UploadSelector";
import { UploadForm } from "@/components/videos/UploadForm";

export default function UploadPage() {
    const [mode, setMode] = useState<UploadMode>("long");

    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Publicar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
              Escolha o formato e envie seu vídeo.
          </p>

          <div className="mt-6">
              <UploadSelector value={mode} onChange={setMode} />
          </div>

          <div className="mt-8">
              <UploadForm key={mode} mode={mode} />
          </div>
      </div>
    );
}