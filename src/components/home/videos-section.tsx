"use client"

import { Clapperboard } from "lucide-react"
import { useEffect, useState } from "react"

import { HomeSection } from "@/components/home/home-section"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoCard } from "@/components/videos/VideoCard"
import { fetchVideoPage } from "@/lib/videos/api"
import type { VideoItem } from "@/lib/videos/types"

const LIMITE = 4

type Estado = { status: "loading" } | { status: "error" } | { status: "ok"; videos: VideoItem[] }

export function VideosSection() {
    const [estado, setEstado] = useState<Estado>({ status: "loading" })

    const [tentativa, setTentativa] = useState(0)

    useEffect(() => {
        let ativo = true
        fetchVideoPage(0)
            .then((dados) => {
                if (ativo) setEstado({ status: "ok", videos: (dados.content ?? []).slice(0, LIMITE) })
            })
            .catch(() => {
                if (ativo) setEstado({ status: "error" })
            })
        return () => {
            ativo = false
        }
    }, [tentativa])

    const tentarNovamente = () => {
        setEstado({ status: "loading" })
        setTentativa((n) => n + 1)
    }

    return (
        <HomeSection id="videos" title="Vídeos" description="Publicados pela comunidade." href="/videos">
            {estado.status === "loading" && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
                    {Array.from({ length: LIMITE }, (_, i) => (
                        <div key={i} className={i > 1 ? "hidden flex-col gap-3 lg:flex" : "flex flex-col gap-3"}>
                            <Skeleton className="aspect-video" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-2/5" />
                        </div>
                    ))}
                </div>
            )}

            {estado.status === "error" && (
                <ErrorState
                    title="Não foi possível carregar os vídeos"
                    onRetry={tentarNovamente}
                    className="rounded-xl bg-surface-secondary"
                />
            )}

            {estado.status === "ok" && estado.videos.length === 0 && (
                <EmptyState
                    icon={Clapperboard}
                    title="Nenhum vídeo publicado ainda"
                    description="Os vídeos enviados pela comunidade aparecem aqui."
                    className="rounded-xl bg-surface-secondary"
                />
            )}

            {estado.status === "ok" && estado.videos.length > 0 && (
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {estado.videos.map((video, i) => (
                        <li key={video.id} className={i > 1 ? "hidden sm:block" : undefined}>
                            <VideoCard video={video} />
                        </li>
                    ))}
                </ul>
            )}
        </HomeSection>
    )
}
