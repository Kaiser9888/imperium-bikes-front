"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const HASHTAGS_SUGERIDAS = [
    "MTB", "Speed", "BMX", "Downhill", "MountainBike",
    "Ciclismo", "Trilha", "Competicao", "Tutorial", "Review",
    "Manutencao", "Pedal", "BikeLife", "Ciclista", "Estrada"
];

export default function UploadPage() {
    const { getToken } = useAuth();
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [isMemento, setIsMemento] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [error, setError] = useState("");
    const [videoDuration, setVideoDuration] = useState(0);
    const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done">("idle");
    const [progress, setProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        setError("");

        if (selectedFile.size > MAX_SIZE_BYTES) {
            setError(`Arquivo muito grande. Maximo: ${MAX_SIZE_MB}MB`);
            return;
        }

        if (!selectedFile.type.startsWith("video/")) {
            setError("Selecione um arquivo de video valido");
            return;
        }

        setFile(selectedFile);

        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(selectedFile);
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

    const handleHashtagClick = (tag: string) => {
        const currentTags = hashtags.split(/\s+/).filter(Boolean);
        if (!currentTags.includes(`#${tag}`)) {
            setHashtags((prev) => (prev ? `${prev} #${tag}` : `#${tag}`));
        }
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

            // 1. Pegar URL de upload do backend
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload-url`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) throw new Error("Erro ao criar upload");

            const data = await res.json();
            const uploadUrl = data.uploadUrl;
            const uploadId = data.uploadId;

            // 2. Upload direto para Mux
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", uploadUrl);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        setProgress(Math.round((event.loaded / event.total) * 100));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr);
                    } else {
                        reject(new Error("Falha no upload"));
                    }
                };

                xhr.onerror = () => reject(new Error("Erro de rede"));
                xhr.send(file);
            });

            // 3. Aguardar processamento
            setStatus("processing");

            let assetReady = false;
            let attempts = 0;

            while (!assetReady && attempts < 60) {
                await new Promise((r) => setTimeout(r, 3000));
                attempts++;

                const assetRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/videos/asset-status?uploadId=${uploadId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const assetData = await assetRes.json();

                if (assetData.status === "ready") {
                    assetReady = true;
                    const thumbUrl = `https://image.mux.com/${assetData.playbackId}/thumbnail.jpg`;

                    // 4. Salvar no backend
                    await fetch(
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
                                description: description + (hashtags ? " " + hashtags : ""),
                                durationSeconds: Math.round(videoDuration),
                                thumbnailUrl: thumbUrl,
                                isShort: isMemento,
                                originalFilename: file.name,
                                fileSize: file.size,
                                mimeType: file.type,
                            }),
                        }
                    );

                    setStatus("done");
                    router.push("/videos");
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

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h1 className="font-blackletter text-3xl text-primary mb-6">
                {file && isMemento ? "Novo Memento" : "Publicar Video"}
            </h1>

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
                    className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors bg-card"
                >
                    <svg
                        width="48" height="48" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="1.5"
                        className="mx-auto text-muted-foreground mb-4"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-foreground font-medium mb-1">
                        Arraste seu video aqui ou clique para selecionar
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
                    {/* Preview com objectURL estável */}
                    <div className="relative rounded-2xl overflow-hidden bg-black">
                        <video
                            ref={videoRef}
                            src={file ? URL.createObjectURL(file) : ""}
                            className={`w-full ${isMemento ? "max-h-[70vh] object-contain" : "aspect-video object-contain"}`}
                            controls
                        />
                        {isMemento && (
                            <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                                Memento
                            </div>
                        )}
                    </div>

                    {!isMemento && (
                        <div>
                            <label className="text-sm font-medium">Titulo *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Digite o titulo do video"
                                className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3"
                                maxLength={100}
                            />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium">
                            {isMemento ? "Frase" : "Descricao"}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={isMemento ? "Escreva uma frase..." : "Descreva seu video"}
                            rows={isMemento ? 2 : 4}
                            className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 resize-none"
                            maxLength={isMemento ? 150 : 500}
                        />
                    </div>

                    {!isMemento && (
                        <div>
                            <label className="text-sm font-medium">Hashtags</label>
                            <input
                                type="text"
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                                placeholder="#MTB #Downhill"
                                className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {HASHTAGS_SUGERIDAS.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleHashtagClick(tag)}
                                        className="text-xs bg-secondary px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground"
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {status === "uploading" && (
                        <div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-sm text-center mt-2">Enviando... {progress}%</p>
                        </div>
                    )}

                    {status === "processing" && (
                        <div className="text-center py-4">
                            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Processando video...</p>
                        </div>
                    )}

                    {status === "idle" && (
                        <button onClick={handleUpload} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold">
                            {isMemento ? "Publicar Memento" : "Publicar Video"}
                        </button>
                    )}

                    <button
                        onClick={() => { setFile(null); setTitle(""); setDescription(""); setHashtags(""); setError(""); }}
                        className="w-full text-muted-foreground text-sm py-2"
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
}