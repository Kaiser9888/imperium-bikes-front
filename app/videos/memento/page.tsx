"use client";

import { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        setError("");
        setDescription("");

        if (selectedFile.size > MAX_SIZE_BYTES) {
            setError(`Arquivo muito grande. Maximo: ${MAX_SIZE_MB}MB`);
            return;
        }

        if (!selectedFile.type.startsWith("video/")) {
            setError("Selecione um arquivo de video valido");
            return;
        }

        const url = URL.createObjectURL(selectedFile);

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        video.onloadedmetadata = () => {
            const duration = Math.round(video.duration);
            const isVertical = video.videoHeight > video.videoWidth;

            setVideoDuration(duration);

            if (!isVertical) {
                setError("O Memento aceita apenas videos verticais");
                setPreviewUrl("");
                return;
            }

            setFile(selectedFile);
            setPreviewUrl(url);
        };
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
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
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Erro ao criar upload");

            const data = await res.json();

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", data.uploadUrl);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        setProgress(Math.round((event.loaded / event.total) * 100));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve(xhr);
                    else reject(new Error("Falha no upload"));
                };

                xhr.onerror = () => reject(new Error("Erro de rede"));
                xhr.send(file);
            });

            setStatus("processing");

            let assetReady = false;
            let attempts = 0;

            while (!assetReady && attempts < 60) {
                await new Promise((r) => setTimeout(r, 3000));
                attempts++;

                const assetRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/videos/asset-status?uploadId=${data.uploadId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const assetData = await assetRes.json();

                if (assetData.status === "ready") {
                    assetReady = true;
                    const thumbUrl = `https://image.mux.com/${assetData.playbackId}/thumbnail.jpg`;

                    const callbackRes = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/videos/mux-callback`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                muxAssetId: assetData.assetId,
                                muxPlaybackId: assetData.playbackId,
                                title: description.slice(0, 100) || "Memento",
                                description: description,
                                durationSeconds: Math.round(videoDuration),
                                thumbnailUrl: thumbUrl,
                                isShort: true,
                                originalFilename: file.name,
                                fileSize: file.size,
                                mimeType: file.type,
                            }),
                        }
                    );

                    setStatus("done");
                    router.push("/videos/memento");
                }
            }

            if (!assetReady) {
                setError("Processamento demorou. O video ficara disponivel em breve.");
                setStatus("idle");
            }
        } catch (err) {
            setError("Erro no upload. Tente novamente.");
            setStatus("idle");
            console.error(err);
        }
    };

    const resetForm = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null);
        setPreviewUrl("");
        setDescription("");
        setError("");
        setStatus("idle");
        setProgress(0);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="font-blackletter text-3xl text-primary mb-2">Novo Memento</h1>
            <p className="text-sm text-muted-foreground mb-6">Lembre-se de viver.</p>

            {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3 text-sm mb-4">
                    {error}
                </div>
            )}

            {!file ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-16 text-center cursor-pointer hover:border-primary/50 transition-colors bg-card"
                >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <p className="text-foreground font-semibold mb-1">Selecionar video para Memento</p>
                    <p className="text-muted-foreground text-sm">Vertical &middot; Ate {MAX_SIZE_MB}MB</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden bg-black">
                        <video src={previewUrl} className="w-full max-h-[70vh] object-contain" controls />
                        <div className="absolute top-3 left-3 flex gap-2">
                            <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Memento</span>
                            <span className="bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full">{Math.round(videoDuration)}s</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground">Frase</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Uma frase que aparecera sobre seu Memento..."
                            rows={2}
                            className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                            maxLength={150}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/150</p>
                    </div>

                    {status === "uploading" && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Enviando...</span>
                                <span className="text-foreground font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    )}

                    {status === "processing" && (
                        <div className="flex items-center justify-center gap-3 py-4">
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Processando video...</p>
                        </div>
                    )}

                    {status === "idle" && (
                        <button onClick={handleUpload} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                            Publicar Memento
                        </button>
                    )}

                    {status === "idle" && (
                        <button onClick={resetForm} className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors">
                            Cancelar e selecionar outro video
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}