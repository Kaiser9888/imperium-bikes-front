"use client";

import { useState, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function UploadPage() {
    const { getToken } = useAuth();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [isMemento, setIsMemento] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [error, setError] = useState("");
    const [videoDuration, setVideoDuration] = useState(0);
    const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done">("idle");
    const [progress, setProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        setError("");
        setTitle("");
        setDescription("");
        setHashtags("");

        if (selectedFile.size > MAX_SIZE_BYTES) {
            setError(`Arquivo muito grande. Maximo: ${MAX_SIZE_MB}MB`);
            return;
        }

        if (!selectedFile.type.startsWith("video/")) {
            setError("Selecione um arquivo de video valido");
            return;
        }

        setFile(selectedFile);
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        video.onloadedmetadata = () => {
            const duration = Math.round(video.duration);
            const isVertical = video.videoHeight > video.videoWidth;
            const isShort = duration <= 60;

            setVideoDuration(duration);
            setIsMemento(isVertical && isShort);
        };
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const removeHashtag = (tag: string) => {
        setHashtags((prev) =>
            prev
                .split(/\s+/)
                .filter((t) => t !== tag)
                .join(" ")
        );
    };

    const handleUpload = async () => {
        if (!file) return;
        if (!isMemento && !title.trim()) {
            setError("Titulo obrigatorio para video normal");
            return;
        }

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
                                title: isMemento ? description.slice(0, 100) || "Memento" : title,
                                description: description,
                                durationSeconds: Math.round(videoDuration),
                                thumbnailUrl: thumbUrl,
                                isShort: isMemento,
                                originalFilename: file.name,
                                fileSize: file.size,
                                mimeType: file.type,
                            }),
                        }
                    );

                    const savedVideo = await callbackRes.json();
                    setStatus("done");
                    router.push(`/videos/watch/${savedVideo.id}`);
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
        setTitle("");
        setDescription("");
        setHashtags("");
        setError("");
        setStatus("idle");
        setProgress(0);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
            <h1 className="font-blackletter text-3xl text-primary mb-2">
                {file && isMemento ? "Novo Memento" : "Publicar Video"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
                {isMemento
                    ? "Videos verticais ate 60 segundos"
                    : "Compartilhe sua experiencia sobre duas rodas"}
            </p>

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
                        <svg
                            width="28" height="28" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="1.5"
                            className="text-primary"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <p className="text-foreground font-semibold mb-1">
                        Selecionar video para upload
                    </p>
                    <p className="text-muted-foreground text-sm">
                        MP4, MOV ou WebM &middot; Ate {MAX_SIZE_MB}MB
                    </p>
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
                    {/* Preview */}
                    <div className="relative rounded-2xl overflow-hidden bg-black">
                        <video
                            src={previewUrl}
                            className={`w-full ${isMemento ? "max-h-[70vh] object-contain" : "aspect-video object-contain"}`}
                            controls
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                            {isMemento && (
                                <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Memento
                </span>
                            )}
                            <span className="bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full">
                {Math.round(videoDuration)}s
              </span>
                        </div>
                    </div>

                    {/* Campos */}
                    {!isMemento && (
                        <div>
                            <label className="text-sm font-medium text-foreground">
                                Titulo <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Minha trilha de Downhill em Campos do Jordao"
                                className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                maxLength={100}
                            />
                            <p className="text-xs text-muted-foreground mt-1 text-right">{title.length}/100</p>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-foreground">
                            {isMemento ? "Frase" : "Descricao"}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={
                                isMemento
                                    ? "Uma frase que aparecera sobre seu Memento..."
                                    : "Conte mais sobre seu video..."
                            }
                            rows={isMemento ? 2 : 4}
                            className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                            maxLength={isMemento ? 150 : 500}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                            {description.length}/{isMemento ? 150 : 500}
                        </p>
                    </div>

                    {/* Hashtags */}
                    <div>
                        <label className="text-sm font-medium text-foreground">Hashtags</label>
                        <input
                            type="text"
                            value={hashtags}
                            onChange={(e) => setHashtags(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === " " || e.key === "Enter") {
                                    const val = e.currentTarget.value.trim();
                                    if (val && !val.startsWith("#")) {
                                        e.preventDefault();
                                        setHashtags((prev) => prev + " #" + val.replace(/\s+/g, ""));
                                    }
                                }
                            }}
                            placeholder="Digite e pressione espaco para adicionar"
                            className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                        {hashtags.trim() && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {hashtags
                                    .split(/\s+/)
                                    .filter(Boolean)
                                    .map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => removeHashtag(tag)}
                                            className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        >
                                            {tag.startsWith("#") ? tag : `#${tag}`}
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Progresso */}
                    {status === "uploading" && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Enviando...</span>
                                <span className="text-foreground font-medium">{progress}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {status === "processing" && (
                        <div className="flex items-center justify-center gap-3 py-4">
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Processando video...</p>
                        </div>
                    )}

                    {/* Botoes */}
                    {status === "idle" && (
                        <button
                            onClick={handleUpload}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                        >
                            {isMemento ? "Publicar Memento" : "Publicar Video"}
                        </button>
                    )}

                    {status === "idle" && (
                        <button
                            onClick={resetForm}
                            className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
                        >
                            Cancelar e selecionar outro video
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}