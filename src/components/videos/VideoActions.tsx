import { Heart, Share2, Bookmark } from "lucide-react";
import { formatViews } from "@/lib/videos/format";

interface VideoActionsProps {
    liked: boolean;
    likesCount: number;
    onToggleLike: () => void;
    compact?: boolean;
}

export function VideoActions({ liked, likesCount, onToggleLike, compact = false }: VideoActionsProps) {
    const base =
        "inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground";

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onToggleLike}
                aria-pressed={liked}
                className={`${base} ${liked ? "border-primary/60 text-primary" : ""}`}
            >
                <Heart className={`size-4 ${liked ? "fill-primary text-primary" : ""}`} aria-hidden="true" />
                {formatViews(likesCount)}
            </button>

            {!compact && (
                <>
                    <button
                        type="button"
                        className={base}
                        onClick={() => {
                            if (typeof navigator !== "undefined" && navigator.clipboard) {
                                void navigator.clipboard.writeText(window.location.href);
                            }
                        }}
                    >
                        <Share2 className="size-4" aria-hidden="true" />
                        Compartilhar
                    </button>
                    <button type="button" className={base}>
                        <Bookmark className="size-4" aria-hidden="true" />
                        Salvar
                    </button>
                </>
            )}
        </div>
    );
}
