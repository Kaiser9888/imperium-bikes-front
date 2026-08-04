import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { formatViews } from "@/lib/videos/format";

interface VideoActionsProps {
  liked: boolean;
  disliked: boolean;
  likesCount: number;
  dislikesCount: number;
  onToggleLike: () => void;
  onToggleDislike: () => void;
  compact?: boolean;
}

export function VideoActions({
                               liked,
                               disliked,
                               likesCount,
                               dislikesCount,
                               onToggleLike,
                               onToggleDislike,
                               compact = false,
                             }: VideoActionsProps) {
  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // usuário cancelou o share nativo — cai no fallback de copiar link
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex overflow-hidden rounded-md border border-border bg-card">
        <button
          type="button"
          onClick={onToggleLike}
          aria-pressed={liked}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground ${liked ? "text-primary" : ""}`}
        >
          <ThumbsUp className={`size-4 ${liked ? "fill-primary text-primary" : ""}`} aria-hidden="true" />
          {formatViews(likesCount)}
        </button>
        <span className="w-px bg-border" aria-hidden="true" />
        <button
          type="button"
          onClick={onToggleDislike}
          aria-pressed={disliked}
          className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground ${disliked ? "text-primary" : ""}`}
        >
          <ThumbsDown className={`size-4 ${disliked ? "fill-primary text-primary" : ""}`} aria-hidden="true" />
          {!compact && formatViews(dislikesCount)}
        </button>
      </div>

      {!compact && (
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Share2 className="size-4" aria-hidden="true" />
          Compartilhar
        </button>
      )}
    </div>
  );
}