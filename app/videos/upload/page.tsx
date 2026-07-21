"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
    UploadCloud,
    Film,
    Hash,
    X,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Sparkles,
} from "lucide-react"

const MAX_SIZE_MB = 500
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
}

export default function UploadPage() {
    const { getToken } = useAuth()
    const router = useRouter()

    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [hashtags, setHashtags] = useState("")
    const [error, setError] = useState("")
    const [videoDuration, setVideoDuration] = useState(0)
    const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done">("idle")
    const [progress, setProgress] = useState(0)
    const [isDragging, setIsDragging] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = useCallback(
        (selectedFile: File) => {
            setError("")

            if (selectedFile.size > MAX_SIZE_BYTES) {
                setError(`Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB`)
                return
            }
            if (!selectedFile.type.startsWith("video/")) {
                setError("Selecione um arquivo de vídeo válido")
                return
            }

            if (previewUrl) URL.revokeObjectURL(previewUrl)

            setFile(selectedFile)
            const url = URL.createObjectURL(selectedFile)
            setPreviewUrl(url)

            const video = document.createElement("video")
            video.preload = "metadata"
            video.src = url
            video.onloadedmetadata = () => setVideoDuration(Math.round(video.duration))
        },
        [previewUrl],
    )

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) handleFileSelect(droppedFile)
    }

    const removeHashtag = (tag: string) => {
        setHashtags((prev) =>
            prev
                .split(/\s+/)
                .filter((t) => t !== tag)
                .join(" "),
        )
    }

    const tagList = hashtags.split(/\s+/).filter(Boolean)

    const handleUpload = async () => {
        if (!file) return
        if (!title.trim()) {
            setError("Título obrigatório")
            return
        }

        setError("")
        setStatus("uploading")
        setProgress(0)

        try {
            const token = await getToken()
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/videos/upload-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error("Erro ao criar upload")
            const data = await res.json()

            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.open("PUT", data.uploadUrl)
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
                }
                xhr.onload = () =>
                    xhr.status >= 200 && xhr.status < 300 ? resolve(xhr) : reject(new Error("Falha"))
                xhr.onerror = () => reject(new Error("Rede"))
                xhr.send(file)
            })

            setStatus("processing")
            let ready = false
            let attempts = 0
            while (!ready && attempts < 60) {
                await new Promise((r) => setTimeout(r, 3000))
                attempts++
                const assetRes = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/videos/asset-status?uploadId=${data.uploadId}`,
                    { headers: { Authorization: `Bearer ${token}` } },
                )
                const assetData = await assetRes.json()
                if (assetData.status === "ready") {
                    ready = true
                    const thumbUrl = `https://image.mux.com/${assetData.playbackId}/thumbnail.jpg`
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
                    })
                    const savedVideo = await callbackRes.json()
                    setStatus("done")
                    router.push(`/videos/watch/${savedVideo.id}`)
                }
            }
            if (!ready) {
                setError("Processamento demorou. O vídeo ficará disponível em breve.")
                setStatus("idle")
            }
        } catch (err) {
            setError("Erro no upload. Tente novamente.")
            setStatus("idle")
        }
    }

    const resetForm = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setFile(null)
        setPreviewUrl("")
        setTitle("")
        setDescription("")
        setHashtags("")
        setError("")
        setStatus("idle")
        setProgress(0)
    }

    const busy = status === "uploading" || status === "processing"

    return (
        <div className="min-h-screen bg-background">
            {/* Ambient glow */}
            <div className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 to-transparent" />

            <div className="relative mx-auto max-w-3xl px-4 py-10 pb-28">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/25">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-blackletter text-3xl leading-none text-primary text-balance">Publicar Vídeo</h1>
                        <p className="mt-1.5 text-sm text-muted-foreground">Compartilhe sua experiência sobre duas rodas</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {!file ? (
                    <button
                        type="button"
                        onDrop={handleDrop}
                        onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onClick={() => fileInputRef.current?.click()}
                        className={`group flex w-full flex-col items-center rounded-3xl border-2 border-dashed p-14 text-center transition-all duration-300 ${
                            isDragging
                                ? "border-primary bg-primary/10 scale-[1.01]"
                                : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
                        }`}
                    >
                        <div
                            className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 transition-transform duration-300 ${
                                isDragging ? "scale-110" : "group-hover:scale-105"
                            }`}
                        >
                            <UploadCloud className="h-9 w-9 text-primary" />
                        </div>
                        <p className="mb-1.5 text-lg font-semibold text-foreground">
                            {isDragging ? "Solte o vídeo aqui" : "Arraste ou clique para enviar"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            MP4, MOV ou WebM &middot; Até {MAX_SIZE_MB}MB
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            className="hidden"
                        />
                    </button>
                ) : (
                    <div className="space-y-6">
                        {/* Video preview */}
                        <div className="overflow-hidden rounded-3xl border border-border bg-card">
                            <div className="relative bg-black">
                                <video src={previewUrl} className="aspect-video w-full object-contain" controls />
                                {videoDuration > 0 && (
                                    <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                                        {formatDuration(videoDuration)}
                  </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 px-4 py-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                    <Film className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
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
                        </div>

                        {/* Title */}
                        <div>
                            <label className="mb-2 flex items-center justify-between text-sm font-medium text-foreground">
                <span>
                  Título <span className="text-destructive">*</span>
                </span>
                                <span className="text-xs font-normal text-muted-foreground">{title.length}/100</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={busy}
                                placeholder="Ex: Minha trilha de Downhill em Campos do Jordão"
                                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                                maxLength={100}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 flex items-center justify-between text-sm font-medium text-foreground">
                                <span>Descrição</span>
                                <span className="text-xs font-normal text-muted-foreground">{description.length}/500</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={busy}
                                placeholder="Conte mais sobre seu vídeo, o local, o percurso..."
                                rows={4}
                                className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                                maxLength={500}
                            />
                        </div>

                        {/* Hashtags */}
                        <div>
                            <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
                                <Hash className="h-3.5 w-3.5 text-primary" />
                                Hashtags
                            </label>
                            <input
                                type="text"
                                value={hashtags}
                                onChange={(e) => setHashtags(e.target.value)}
                                disabled={busy}
                                placeholder="downhill trilha mtb enduro..."
                                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
                            />
                            {tagList.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {tagList.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => removeHashtag(tag)}
                                            disabled={busy}
                                            className="group flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-destructive/15 hover:text-destructive"
                                        >
                                            {tag.startsWith("#") ? tag : `#${tag}`}
                                            <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Upload progress */}
                        {status === "uploading" && (
                            <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Enviando vídeo...
                  </span>
                                    <span className="font-semibold text-foreground">{progress}%</span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {status === "processing" && (
                            <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Processando vídeo... isso pode levar alguns instantes</p>
                            </div>
                        )}

                        {status === "done" && (
                            <div className="flex items-center justify-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 py-6">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <p className="text-sm font-medium text-primary">Publicado! Redirecionando...</p>
                            </div>
                        )}

                        {/* Actions */}
                        {status === "idle" && (
                            <div className="flex flex-col gap-3 pt-1 sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleUpload}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 active:scale-[0.99]"
                                >
                                    <UploadCloud className="h-4 w-4" />
                                    Publicar Vídeo
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-border py-3.5 font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:px-8"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}