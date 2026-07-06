// components/publish/PhotosStep.tsx
"use client"

import { useRef, useState } from "react"
import { Upload, X, Image, Star, GripVertical } from "lucide-react"
import { ProductImage } from "@/types/publish/product"

interface Props {
    images: ProductImage[]
    onAdd: (image: ProductImage) => void
    onRemove: (index: number) => void
    onSetMain: (index: number) => void
    onReorder: (from: number, to: number) => void
}

export function PhotosStep({ images, onAdd, onRemove, onSetMain, onReorder }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return
        const remaining = 15 - images.length
        const selected = Array.from(files).slice(0, remaining)

        selected.forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`Imagem ${file.name} excede 10MB`)
                return
            }
            const url = URL.createObjectURL(file)
            onAdd({
                url,
                isMain: images.length === 0,
                displayOrder: images.length,
                file,
            })
        })
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        handleFileSelect(e.dataTransfer.files)
    }

    return (
        <div className="space-y-5">
            <h2 className="font-heading text-lg font-bold">Fotos do produto</h2>
            <p className="text-sm text-muted-foreground">
                Adicione de 3 a 15 fotos. A primeira sera a imagem principal. Formatos: JPEG, PNG, WEBP. Maximo 10MB por imagem.
            </p>

            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-secondary group">
                            <img src={img.url} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-start justify-between p-1.5 opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={() => onSetMain(i)}
                                    className={`size-6 rounded-full flex items-center justify-center ${img.isMain ? 'bg-yellow-500 text-white' : 'bg-white/80 text-gray-600'}`}
                                >
                                    <Star className="size-3" />
                                </button>
                                <button
                                    onClick={() => onRemove(i)}
                                    className="size-6 rounded-full bg-red-500/80 text-white flex items-center justify-center"
                                >
                                    <X className="size-3" />
                                </button>
                            </div>
                            {img.isMain && (
                                <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                                    Principal
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {images.length < 15 && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                        dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                    }`}
                >
                    <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Arraste as fotos aqui</p>
                    <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
                    <p className="text-xs text-muted-foreground mt-2">{images.length}/15 fotos</p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
            />

            {images.length < 3 && (
                <p className="text-xs text-amber-500">Minimo de 3 fotos necessarias ({images.length}/3)</p>
            )}
        </div>
    )
}