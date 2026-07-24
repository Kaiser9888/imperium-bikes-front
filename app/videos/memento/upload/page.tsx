"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
    UploadCloud, Film, X, Loader2, CheckCircle2, AlertTriangle,
    Clock, ArrowRight, Sparkles
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

export default function MementoUploadPage() {
    const { getToken } = useAuth();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [videoDuration, setVideoDuration] = useState(0);
    const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done">("idle");
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((selectedFile: File) => {
        setError("");
        setDescription("");
        if (selectedFile.size > MAX_SIZE_BYTES) { setError(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB`); return; }
        if (!selectedFile.type.startsWith("video/")) { setError("Selecione um arquivo de vídeo válido"); return; }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        video.onloadedmetadata = () => setVideoDuration(Math.round(video.duration));
    }, [previewUrl]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const handleUpload = async () => {
        if (!file) return;
        setError("");
        setStatus("uploading");
        setProgress(0);
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload-url`, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Erro ao criar upload");
            const data = await res.json();

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", data.uploadUrl);
                xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
                xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(xhr) : reject(new Error("Falha")));
                xhr.onerror = () => reject(new Error("Rede"));
                xhr.send(file);
            });

            setStatus("processing");
            let ready = false, attempts = 0;
            while (!ready && attempts < 60) {
                await new Promise((r) => setTimeout(r, 3000)); attempts++;
                const assetRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/asset-status?uploadId=${data.uploadId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const assetData = await assetRes.json();
                if (assetData.status === "ready") {
                    ready = true;
                    const thumbUrl = `https://image.mux.com/${assetData.playbackId}/thumbnail.jpg`;
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/mux-callback`, {
                        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                            muxAssetId: assetData.assetId, muxPlaybackId: assetData.playbackId,
                            title: description.slice(0, 100) || "Memento", description: description,
                            durationSeconds: Math.round(videoDuration), thumbnailUrl: thumbUrl, isShort: true,
                            originalFilename: file.name, fileSize: file.size, mimeType: file.type,
                        }),
                    });
                    setStatus("done");
                    router.push("/videos/memento");
                }
            }
            if (!ready) { setError("Processamento demorou. O vídeo ficará disponível em breve."); setStatus("idle"); }
        } catch (err) { setError("Erro no upload. Tente novamente."); setStatus("idle"); }
    };

    const resetForm = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null); setPreviewUrl(""); setDescription(""); setError(""); setStatus("idle"); setProgress(0);
    };

    const busy = status === "uploading" || status === "processing";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto grid min-h-screen max-w-[1400px] lg:grid-cols-[minmax(300px,380px)_1fr]">

                {/* ============ LEFT PANEL ============ */}
                <aside className="relative flex flex-col justify-between overflow-hidden border-b border-border bg-card px-8 py-10 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-10 lg:py-14">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
                         style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
                    <div className="pointer-events-none absolute -left-20 top-1/3 h-56 w-56 rounded-full bg-primary/20 blur-[100px]" aria-hidden />

                    <div className="relative">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                            <span className="h-px w-8 bg-primary" /> Memento
                        </div>
                        <h1 className="mt-6 font-blackletter text-5xl leading-[0.9] text-balance lg:text-6xl">
                            Ecos do
                            <span className="block text-primary">Instante</span>
                        </h1>
                        <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            Um fragmento. Uma memória. Um sopro de velocidade que merece ser eternizado.
                        </p>
                    </div>

                    <ol className="relative mt-8 space-y-1">
                        {[
                            { n: "I", label: "Escolha o momento", done: !!file },
                            { n: "II", label: "Deixe sua marca", done: status === "done" },
                        ].map((step, i) => {
                            const active = (i === 0 && !file) || (i === 1 && file);
                            return (
                                <li key={step.n} className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${active ? "bg-primary/10" : ""}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-blackletter text-base ${
                      step.done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                    {step.done ? <CheckCircle2 className="h-4 w-4" /> : step.n}
                  </span>
                                    <span className={`text-sm font-medium ${step.done || active ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                                </li>
                            );
                        })}
                    </ol>
                </aside>

                {/* ============ RIGHT PANEL ============ */}
                <main className="relative px-6 py-10 pb-32 sm:px-10 lg:px-14 lg:py-14">
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
                        </div>
                    )}

                    {!file ? (
                        <button type="button" onDrop={handleDrop}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onClick={() => fileInputRef.current?.click()}
                                className={`group relative flex min-h-[55vh] w-full flex-col items-center justify-center rounded-2xl border bg-card/40 p-10 text-center transition-all duration-300 ${
                                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                            {["left-4 top-4 border-l-2 border-t-2", "right-4 top-4 border-r-2 border-t-2", "left-4 bottom-4 border-l-2 border-b-2", "right-4 bottom-4 border-r-2 border-b-2"].map((pos) => (
                                <span key={pos} className={`absolute h-8 w-8 rounded-sm transition-colors ${pos} ${isDragging ? "border-primary" : "border-border group-hover:border-primary/60"}`} aria-hidden />
                            ))}
                            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 transition-transform duration-300 ${isDragging ? "scale-110" : "group-hover:scale-105"}`}>
                                <Sparkles className="h-10 w-10 text-primary" />
                            </div>
                            <p className="mt-6 font-blackletter text-3xl text-balance">{isDragging ? "Solte o instante" : "Capture o instante"}</p>
                            <p className="mt-3 max-w-sm text-sm text-muted-foreground">Arraste seu vídeo ou clique para eternizar um momento.</p>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                {["MP4", "MOV", "WebM"].map((f) => (
                                    <span key={f} className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">{f}</span>
                                ))}
                                <span className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">até {MAX_SIZE_MB}MB</span>
                            </div>
                            <input ref={fileInputRef} type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
                        </button>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                            <div className="space-y-4">
                                <div className="overflow-hidden rounded-2xl border border-border bg-black">
                                    <div className="relative">
                                        <video src={previewUrl} className="aspect-video w-full object-contain" controls />
                                        {videoDuration > 0 && (
                                            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        <Clock className="h-3 w-3" /> {formatDuration(videoDuration)}
                      </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Film className="h-4 w-4 text-primary" /></div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                    </div>
                                    {!busy && <button onClick={resetForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="h-4 w-4" /></button>}
                                </div>
                                {status === "uploading" && (
                                    <div className="rounded-xl border border-border bg-card p-4">
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Enviando...</span>
                                            <span className="font-blackletter text-lg text-primary">{progress}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} /></div>
                                    </div>
                                )}
                                {status === "processing" && (
                                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Processando...</p></div>
                                )}
                                {status === "done" && (
                                    <div className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-4"><CheckCircle2 className="h-5 w-5 text-primary" /><p className="text-sm font-medium text-primary">Publicado!</p></div>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 flex items-center justify-between text-sm font-semibold">
                                        <span>Frase</span>
                                        <span className="text-xs font-normal text-muted-foreground">{description.length}/150</span>
                                    </label>
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} disabled={busy}
                                              placeholder="Uma frase que marcará este instante..." rows={3}
                                              className="w-full resize-none rounded-lg border border-border bg-card px-4 py-3 transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60" maxLength={150} />
                                </div>
                                {status === "idle" && (
                                    <button onClick={handleUpload} className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]">
                                        Publicar Memento <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                )}
                                {status === "idle" && (
                                    <button onClick={resetForm} className="w-full rounded-lg border border-border py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Cancelar</button>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}