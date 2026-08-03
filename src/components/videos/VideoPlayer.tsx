import { Play } from "lucide-react";

interface VideoPlayerProps {
    playbackId: string;
    title?: string;
    vertical?: boolean;
}

/**
 * Player desacoplado: recebe apenas o playbackId (Mux) e renderiza o stream.
 * A lógica de origem do vídeo permanece nos serviços.
 */
export function VideoPlayer({ playbackId, title, vertical = false }: VideoPlayerProps) {
    const ratio = vertical ? "aspect-[9/16]" : "aspect-video";

    if (!playbackId) {
        return (
            <div className={`flex ${ratio} w-full items-center justify-center rounded-lg border border-border bg-card`}>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Play className="size-4" aria-hidden="true" />
                    Processando vídeo…
                </p>
            </div>
        );
    }

    return (
        <div className={`${ratio} w-full overflow-hidden rounded-lg border border-border bg-black`}>
            <iframe
                title={title ?? "Player de vídeo"}
                src={`https://stream.mux.com/${playbackId}`}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="size-full"
            />
        </div>
    );
}