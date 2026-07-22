"use client";

import type React from "react";
import { useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
    UploadCloud,
    Film,
    X,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Clock,
    ArrowRight,
    Trophy,
} from "lucide-react";

const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function UploadPage() {
    const { getToken } = useAuth();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [error, setError] = useState("");
    const [videoDuration, setVideoDuration] = useState(0);
    const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done">("idle");
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(
        (selectedFile: File) => {
            setError("");

            if (selectedFile.size > MAX_SIZE_BYTES) {
                setError(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB`);
                return;
            }
            if (!selectedFile.type.startsWith("video/")) {
                setError("Selecione um arquivo de vídeo válido");
                return;
            }

            if (previewUrl) URL.revokeObjectURL(previewUrl);

            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);

            const video = document.createElement("video");
            video.preload = "metadata";
            video.src = url;
            video.onloadedmetadata = () => setVideoDuration(Math.round(video.duration));
        },
        [previewUrl],
    );

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const removeHashtag = (tag: string) => {
        setHashtags((prev) =>
            prev
                .split(/\s+/)
                .filter((t) => t !== tag)
                .join(" "),
        );
    };

    const tagList = hashtags.split(/\s+/).filter(Boolean);

    const handleUpload = async () => {
        if (!file) return;
        if (!title.trim()) {
            setError("Título obrigatório");
            return;
        }

        setError("");
        setStatus("uploading");
        setProgress(0);

        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Erro ao criar upload");
            const data = await res.json();

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", data.uploadUrl);
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
                };
                xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(xhr) : reject(new Error("Falha")));
                xhr.onerror = () => reject(new Error("Rede"));
                xhr.send(file);
            });

            setStatus("processing");
            let ready = false;
            let attempts = 0;
            while (!ready && attempts < 60) {
                await new Promise((r) => setTimeout(r, 3000));
                attempts++;
                const assetRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/videos/asset-status?uploadId=${data.uploadId}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                const assetData = await assetRes.json();
                if (assetData.status === "ready") {
                    ready = true;
                    const thumbUrl = `https://image.mux.com/${assetData.playbackId}/thumbnail.jpg`;
                    const callbackRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/mux-callback`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                            muxAssetId: assetData.assetId,
                            muxPlaybackId: assetData.playbackId,
                            title: title,
                            description: `${description} ${hashtags}`.trim(),
                            durationSeconds: Math.round(videoDuration),
                            thumbnailUrl: thumbUrl,
                            isShort: false,
                            originalFilename: file.name,
                            fileSize: file.size,
                            mimeType: file.type,
                        }),
                    });
                    const savedVideo = await callbackRes.json();
                    setStatus("done");
                    router.push(`/videos/watch/${savedVideo.id}`);
                }
            }
            if (!ready) {
                setError("Processamento demorou. O vídeo ficará disponível em breve.");
                setStatus("idle");
            }
        } catch (err) {
            setError("Erro no upload. Tente novamente.");
            setStatus("idle");
        }
    };

    const resetForm = () => {
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

    const busy = status === "uploading" || status === "processing";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto grid min-h-screen max-w-[1400px] lg:grid-cols-[minmax(320px,420px)_1fr]">
                {/* ===================== LEFT — PANEL ===================== */}
                <aside className="relative flex flex-col justify-between overflow-hidden border-b border-border bg-card px-8 py-10 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage:
                                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                            backgroundSize: "44px 44px",
                        }}
                    />
                    <div
                        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[120px]"
                        aria-hidden
                    />

                    <div className="relative">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                            <span className="h-px w-8 bg-primary" />
                            Imperium
                        </div>

                        <h1 className="mt-8 font-blackletter text-6xl leading-[0.85] text-balance lg:text-7xl">
                            Grave sua
                            <span className="block text-primary">Jornada</span>
                        </h1>

                        <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            Compartilhe trilhas, tutoriais, reviews e conquistas sobre duas rodas. Cada pedal conta uma história.
                        </p>
                    </div>

                    <ol className="relative mt-10 space-y-1">
                        {[
                            { n: "I", label: "Escolha seu vídeo", done: !!file },
                            { n: "II", label: "Dê um título", done: !!title.trim() },
                            { n: "III", label: "Publique", done: status === "done" },
                        ].map((step, i) => {
                            const active =
                                (i === 0 && !file) || (i === 1 && file && !title.trim()) || (i === 2 && !!title.trim());
                            return (
                                <li
                                    key={step.n}
                                    className={`flex items-center gap-4 rounded-xl px-3 py-3 transition-colors ${
                                        active ? "bg-primary/10" : ""
                                    }`}
                                >
                  <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-blackletter text-lg ${
                          step.done
                              ? "border-primary bg-primary text-primary-foreground"
                              : active
                                  ? "border-primary text-primary"
                                  : "border-border text-muted-foreground"
                      }`}
                  >
                    {step.done ? <CheckCircle2 className="h-5 w-5" /> : step.n}
                  </span>
                                    <span
                                        className={`text-sm font-medium ${step.done || active ? "text-foreground" : "text-muted-foreground"}`}
                                    >
                    {step.label}
                  </span>
                                </li>
                            );
                        })}
                    </ol>
                </aside>

                {/* ===================== RIGHT — FORM ===================== */}
                <main className="relative px-6 py-10 pb-32 sm:px-10 lg:px-16 lg:py-14">
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!file ? (
                        /* ---------- DROPZONE ---------- */
                        <button
                            type="button"
                            onDrop={handleDrop}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onClick={() => fileInputRef.current?.click()}
                            className={`group relative flex min-h-[60vh] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border bg-card/40 p-10 text-center transition-all duration-300 ${
                                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                            }`}
                        >
                            {["left-4 top-4 border-l-2 border-t-2", "right-4 top-4 border-r-2 border-t-2", "left-4 bottom-4 border-l-2 border-b-2", "right-4 bottom-4 border-r-2 border-b-2"].map(
                                (pos) => (
                                    <span
                                        key={pos}
                                        className={`absolute h-8 w-8 rounded-sm transition-colors ${pos} ${
                                            isDragging ? "border-primary" : "border-border group-hover:border-primary/60"
                                        }`}
                                        aria-hidden
                                    />
                                ),
                            )}

                            <div
                                className={`flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 transition-transform duration-300 ${
                                    isDragging ? "scale-110" : "group-hover:scale-105"
                                }`}
                            >
                                <UploadCloud className="h-11 w-11 text-primary" />
                            </div>

                            <p className="mt-7 font-blackletter text-4xl text-balance">
                                {isDragging ? "Solte o vídeo" : "Selecione um vídeo"}
                            </p>
                            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                                Arraste seu vídeo até aqui ou clique para escolher no seu dispositivo.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                                {["MP4", "MOV", "WebM"].map((f) => (
                                    <span
                                        key={f}
                                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground"
                                    >
                    {f}
                  </span>
                                ))}
                                <span className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  até {MAX_SIZE_MB}MB
                </span>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                className="hidden"
                            />
                        </button>
                    ) : (
                        /* ---------- REVIEW + FORM ---------- */
                        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                            {/* preview column */}
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-2xl border border-border bg-black">
                                    <div className="relative">
                                        <video src={previewUrl} className="aspect-video w-full object-contain" controls />
                                        {videoDuration > 0 && (
                                            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <Clock className="h-3 w-3" />
                                                {formatDuration(videoDuration)}
                      </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <Film className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                    </div>
                                    {!busy && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                                            aria-label="Remover vídeo"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                {status === "uploading" && (
                                    <div className="rounded-xl border border-border bg-card p-4">
                                        <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Enviando...
                      </span>
                                            <span className="font-blackletter text-lg text-primary">{progress}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {status === "processing" && (
                                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4">
                                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Processando vídeo...</p>
                                    </div>
                                )}
                                {status === "done" && (
                                    <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-4">
                                        <Trophy className="h-5 w-5 shrink-0 text-primary" />
                                        <p className="text-sm font-medium text-primary">Publicado! Redirecionando...</p>
                                    </div>
                                )}
                            </div>

                            {/* fields column */}
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 flex items-center justify-between text-sm font-semibold">
                    <span>
                      Título do vídeo <span className="text-primary">*</span>
                    </span>
                                        <span className="text-xs font-normal text-muted-foreground">{title.length}/100</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={busy}
                                        placeholder="Adicione um título que descreva seu vídeo"
                                        className="w-full rounded-lg border border-border bg-card px-4 py-3 transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                                        maxLength={100}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center justify-between text-sm font-semibold">
                                        <span>Descrição</span>
                                        <span className="text-xs font-normal text-muted-foreground">{description.length}/500</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={busy}
                                        placeholder="Conte mais sobre seu vídeo..."
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                                        maxLength={500}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 text-sm font-semibold">Hashtags</label>
                                    <input
                                        type="text"
                                        value={hashtags}
                                        onChange={(e) => setHashtags(e.target.value)}
                                        disabled={busy}
                                        placeholder="MTB Downhill Trilha Tutorial"
                                        className="w-full rounded-lg border border-border bg-card px-4 py-3 transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                                    />
                                    {tagList.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {tagList.map((tag) => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => removeHashtag(tag)}
                                                    disabled={busy}
                                                    className="group flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:border-destructive/40 hover:bg-destructive/15 hover:text-destructive"
                                                >
                                                    {tag.startsWith("#") ? tag : `#${tag}`}
                                                    <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Botão Publicar dentro do formulário */}
                                <button
                                    type="button"
                                    onClick={handleUpload}
                                    disabled={!title.trim()}
                                    className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                                >
                                    Publicar
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ===================== STICKY ACTION BAR ===================== */}
            {file && status === "idle" && (
                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/85 backdrop-blur-md lg:hidden">
                    <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4 sm:px-10">
                        <div className="hidden text-sm text-muted-foreground sm:block">
                            {title.trim() ? (
                                <span className="text-foreground">Pronto para publicar.</span>
                            ) : (
                                "Adicione um título para publicar."
                            )}
                        </div>
                        <div className="flex flex-1 items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                                Descartar
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={!title.trim()}
                                className="group flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                            >
                                Publicar
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}