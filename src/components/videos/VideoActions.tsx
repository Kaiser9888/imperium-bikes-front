// src/components/videos/VideoActions.tsx
"use client";

import { ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { formatViews } from "@/lib/videos/format";
import { toast } from "sonner";

interface VideoActionsProps {
  liked: boolean;
  disliked: boolean;
  likesCount: number;
  dislikesCount: number;
  onToggleLike: () => void;
  onToggleDislike: () => void;
}

export function VideoActions({
                               liked,
                               disliked,
                               likesCount,
                               dislikesCount,
                               onToggleLike,
                               onToggleDislike,
                             }: VideoActionsProps) {
  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // Usuário cancelou
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast?.("Link copiado!", { description: "Compartilhe com seus amigos" });
    }
  }

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="flex items-center rounded-full bg-muted/50 border border-border overflow-hidden">
        <button
          type="button"
          onClick={onToggleLike}
          aria-pressed={liked}
          className={`
                        flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                        transition-all duration-200 hover:bg-muted/80
                        ${liked ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}
                    `}
        >
          <ThumbsUp
            className={`size-5 transition-transform ${liked ? "fill-blue-600 dark:fill-blue-400 scale-110" : ""}`}
            aria-hidden="true"
          />
          <span className="tabular-nums">{formatViews(likesCount)}</span>
        </button>

        <span className="w-px h-6 bg-border" aria-hidden="true" />

        <button
          type="button"
          onClick={onToggleDislike}
          aria-pressed={disliked}
          className={`
                        flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                        transition-all duration-200 hover:bg-muted/80
                        ${disliked ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}
                    `}
        >
          <ThumbsDown
            className={`size-5 transition-transform ${disliked ? "fill-blue-600 dark:fill-blue-400 scale-110" : ""}`}
            aria-hidden="true"
          />
          <span className="tabular-nums hidden sm:inline">{formatViews(dislikesCount)}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="
                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                    rounded-full bg-muted/50 border border-border
                    text-muted-foreground transition-all duration-200
                    hover:bg-muted/80 hover:text-foreground
                "
      >
        <Share2 className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">Compartilhar</span>
      </button>
    </div>
  );
}