"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { UploadCloud, X, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Film } from "lucide-react";
import { formatBytes, formatDuration } from "@/lib/videos/format";
import { uploadVideo } from "@/lib/videos/upload";
import type { UploadMode } from "./UploadSelector";

const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type Status = "idle" | "uploading" | "processing" | "done";

export function UploadForm({ mode }: { mode: UploadMode }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const isMemento = mode === "memento";

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [error, setError] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = useCallback(
    (selected: File) => {
      setError("");
      if (selected.size > MAX_SIZE_BYTES) {
        setError(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB`);
        return;
      }
      if (!selected.type.startsWith("video/")) {
        setError("Selecione um arquivo de vídeo válido");
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.onloadedmetadata = () => setVideoDuration(Math.round(video.duration));
    },
    [previewUrl],
  );

  const tagList = hashtags.split(/\s+/).filter(Boolean);
  const busy = status === "uploading" || status === "processing";
  const canPublish = !!file && (isMemento ? !!description.trim() : !!title.trim()) && !busy;

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setTitle("");
    setDescription("");
    setHashtags("");
    setError("");
    setStatus("idle");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!isMemento && !title.trim()) {
      setError("Título obrigatório");
      return;
    }
    if (isMemento && !description.trim()) {
      setError("Escreva uma descrição — ela também é usada como título do Memento");
      return;
    }
    setError("");
    setStatus("uploading");
    setProgress(0);
    try {
      const token = await getToken();
      if (!token) {
        setError("Sua sessão expirou. Faça login novamente para publicar.");
        setStatus("idle");
        return;
      }

      const saved = await uploadVideo(
        {
          file,
          title: isMemento ? description.slice(0, 60) : title,
          description,
          hashtags: isMemento ? "" : hashtags,
          isShort: isMemento,
          token,
        },
        { onProgress: setProgress, onProcessing: () => setStatus("processing") },
      );
      setStatus("done");
      router.push(`/videos/watch/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no upload. Tente novamente.");
      setStatus("idle");
    }
  };

  const fieldClass =
    "w-full rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

  return (
    <div className="space-y-5">
      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFileSelect(dropped);
          }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center transition-colors ${
            isDragging ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/50"
          }`}
        >
                    <span className="flex size-12 items-center justify-center rounded-full border border-border bg-secondary">
                        <UploadCloud className="size-5 text-primary" aria-hidden="true" />
                    </span>
          <p className="mt-4 text-sm font-medium text-foreground">
            {isDragging ? "Solte o vídeo" : "Selecione um vídeo"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Arraste até aqui ou clique para escolher.</p>
          <p className="mt-4 text-xs text-muted-foreground">MP4 · MOV · WebM · até {MAX_SIZE_MB}MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className={`overflow-hidden rounded-lg border border-border bg-black ${isMemento ? "aspect-[9/16]" : "aspect-video"}`}>
              <video src={previewUrl} controls className="size-full object-contain" />
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <Film className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                  {videoDuration > 0 && ` · ${formatDuration(videoDuration)}`}
                </p>
              </div>
              {!busy && (
                <button type="button" onClick={reset} aria-label="Remover arquivo" className="text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              )}
            </div>

            {status === "uploading" && (
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="size-3.5 animate-spin" /> Enviando…
                                    </span>
                  <span className="tabular-nums">{progress}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            {status === "processing" && (
              <p className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Processando vídeo…
              </p>
            )}
            {status === "done" && (
              <p className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-xs text-primary">
                <CheckCircle2 className="size-3.5" /> Publicado! Redirecionando…
              </p>
            )}
          </div>

          <div className="space-y-5">
            {!isMemento && (
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <label htmlFor="title" className="font-medium text-foreground">
                    Título *
                  </label>
                  <span className="text-muted-foreground">{title.length}/100</span>
                </div>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={busy}
                  maxLength={100}
                  placeholder="Um título que descreva o pedal"
                  className={fieldClass}
                />
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <label htmlFor="description" className="font-medium text-foreground">
                  {isMemento ? "Descrição *" : "Descrição"}
                </label>
                <span className="text-muted-foreground">{description.length}/500</span>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
                rows={isMemento ? 5 : 4}
                maxLength={500}
                placeholder={isMemento ? "Essa descrição também vira o título do Memento…" : "Conte mais sobre o vídeo…"}
                className={`${fieldClass} resize-none`}
              />
            </div>

            {!isMemento && (
              <div>
                <label htmlFor="hashtags" className="mb-2 block text-xs font-medium text-foreground">
                  Hashtags
                </label>
                <input
                  id="hashtags"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  disabled={busy}
                  placeholder="MTB Downhill Trilha"
                  className={fieldClass}
                />
                {tagList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagList.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        disabled={busy}
                        onClick={() => setHashtags((p) => p.split(/\s+/).filter((t) => t !== tag).join(" "))}
                        className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-secondary px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:border-destructive/50 hover:text-destructive"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                        <X className="size-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={reset}
                disabled={busy}
                className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!canPublish}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Publicar
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
