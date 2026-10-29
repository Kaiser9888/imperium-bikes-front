import type { Metadata } from "next"
import { buscarPublico, imagemAbsoluta, previa, resumo } from "@/lib/seo"

type Video = {
    title: string
    description?: string | null
    userName?: string | null
    thumbnailUrl?: string | null
    visibility?: string
}

type Props = { params: Promise<{ id: string }>; children: React.ReactNode }

/** Prévia do vídeo ao compartilhar o link: miniatura (ou capa), título e autor. */
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
    const { id } = await params
    const v = await buscarPublico<Video>(`/api/videos/${encodeURIComponent(id)}`)
    if (!v) return { title: "Vídeo | Imperium Bikes" }

    return {
        ...previa({
            titulo: v.title || "Vídeo",
            descricao: [v.userName && `Por ${v.userName}`, resumo(v.description, 130)].filter(Boolean).join(" — ") || undefined,
            imagem: imagemAbsoluta(v.thumbnailUrl),
            caminho: `/videos/watch/${id}`,
            tipo: "video.other",
        }),
        // Não listado continua abrindo pelo link, mas fora do Google
        robots: v.visibility && v.visibility !== "PUBLIC" ? { index: false } : undefined,
    }
}

export default function VideoLayout({ children }: Props) {
    return children
}
