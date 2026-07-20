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
            setVideoDuration(Math.round(video.duration));
        };
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    };

    const removeHashtag = (tag: string) => {
        setHashtags((prev) => prev.split(/\s+/).filter((t) => t !== tag).join(" "));
    };

    const handleUpload = async () => {
        if (!file) return;
        if (!title.trim()) {
            setError("Titulo obrigatorio");
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
                xhr.upload.onprogress = (e) => { if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100)); };
                xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve(xhr) : reject(new Error("Falha"));
                xhr.onerror = () => reject(new Error("Rede"));
                xhr.send(file);
            });

            setStatus("processing");
            let ready = false;
            let attempts = 0;
            while (!ready && attempts < 60) {
                await new Promise((r) => setTimeout(r, 3000));
                attempts++;
                const assetRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/asset-status?uploadId=${data.uploadId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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
                setError("Processamento demorou. O video ficara disponivel em breve.");
                setStatus("idle");
            }
        } catch (err) {
            setError("Erro no upload. Tente novamente.");
            setStatus("idle");
        }
    };

    const resetForm = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFile(null); setPreviewUrl(""); setTitle(""); setDescription(""); setHashtags(""); setError(""); setStatus("idle"); setProgress(0);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
            <h1 className="font-blackletter text-3xl text-primary mb-2">Publicar Video</h1>
            <p className="text-sm text-muted-foreground mb-6">Compartilhe sua experiencia sobre duas rodas</p>

            {error && <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}

            {!file ? (
                <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
                     className="border-2 border-dashed border-border rounded-2xl p-16 text-center cursor-pointer hover:border-primary/50 transition-colors bg-card">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </div>
                    <p className="text-foreground font-semibold mb-1">Selecionar video para upload</p>
                    <p className="text-muted-foreground text-sm">MP4, MOV ou WebM &middot; Ate {MAX_SIZE_MB}MB</p>
                    <input ref={fileInputRef} type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden bg-black">
                        <video src={previewUrl} className="w-full aspect-video object-contain" controls />
                        <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full">{Math.round(videoDuration)}s</span>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Titulo <span className="text-destructive">*</span></label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                               placeholder="Ex: Minha trilha de Downhill em Campos do Jordao"
                               className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" maxLength={100} />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{title.length}/100</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Descricao</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                  placeholder="Conte mais sobre seu video..." rows={4}
                                  className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none" maxLength={500} />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{description.length}/500</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Hashtags</label>
                        <input type="text" value={hashtags} onChange={(e) => setHashtags(e.target.value)}
                               placeholder="Digite e pressione espaco para adicionar"
                               className="w-full mt-2 bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
                        {hashtags.trim() && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {hashtags.split(/\s+/).filter(Boolean).map((tag) => (
                                    <button key={tag} onClick={() => removeHashtag(tag)}
                                            className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive">
                                        {tag.startsWith("#") ? tag : `#${tag}`}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {status === "uploading" && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Enviando...</span><span className="font-medium">{progress}%</span></div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-primary transition-all rounded-full" style={{ width: `${progress}%` }} /></div>
                        </div>
                    )}

                    {status === "processing" && (
                        <div className="flex items-center justify-center gap-3 py-4">
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm text-muted-foreground">Processando video...</p>
                        </div>
                    )}

                    {status === "idle" && (
                        <button onClick={handleUpload} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold hover:bg-primary/90">
                            Publicar Video
                        </button>
                    )}

                    {status === "idle" && (
                        <button onClick={resetForm} className="w-full text-muted-foreground text-sm py-2 hover:text-foreground">Cancelar</button>
                    )}
                </div>
            )}
        </div>
    );
}