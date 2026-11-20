// src/components/videos/VideoActions.tsx
"use client";
import { CopyLinkButton } from "./CopyLinkButton"
import { SaveButton } from "./SaveButton"

import type { ReactNode } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { formatViews } from "@/lib/videos/format";

interface VideoActionsProps {
  videoId: string;
  liked: boolean;
  disliked: boolean;
  likesCount: number;
  dislikesCount: number;
  onToggleLike: () => void;
  onToggleDislike: () => void;
  /** Ações extras no fim da mesma linha (ex.: Denunciar) */
  children?: ReactNode;
}

export function VideoActions({
                               videoId,
                               liked,
                               disliked,
                               likesCount,
                               dislikesCount,
                               onToggleLike,
                               onToggleDislike,
                               children,
                             }: VideoActionsProps) {
  return (
    // Uma linha só: no celular rola para o lado em vez de quebrar
    <div className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&>*]:shrink-0">
      <div className="flex items-center rounded-full bg-muted/50 border border-border overflow-hidden">
        <button
          type="button"
          onClick={onToggleLike}
          aria-pressed={liked}
          aria-label={`Curtir, ${likesCount} curtidas`}
          className={`
                        flex items-center gap-2 px-3 py-2.5 text-sm font-medium sm:px-4
                        transition-all duration-200 hover:bg-muted/80
                        ${liked ? "text-accent" : "text-muted-foreground"}
                    `}
        >
          <ThumbsUp
            className={`size-5 transition-transform ${liked ? "fill-accent scale-110" : ""}`}
            aria-hidden="true"
          />
          <span className="tabular-nums">{formatViews(likesCount)}</span>
        </button>

        <span className="w-px h-6 bg-border" aria-hidden="true" />

        <button
          type="button"
          onClick={onToggleDislike}
          aria-pressed={disliked}
          aria-label="Não curtir"
          className={`
                        flex items-center gap-2 px-3 py-2.5 text-sm font-medium sm:px-4
                        transition-all duration-200 hover:bg-muted/80
                        ${disliked ? "text-accent" : "text-muted-foreground"}
                    `}
        >
          <ThumbsDown
            className={`size-5 transition-transform ${disliked ? "fill-accent scale-110" : ""}`}
            aria-hidden="true"
          />
          <span className="tabular-nums hidden sm:inline">{formatViews(dislikesCount)}</span>
        </button>
      </div>

      <CopyLinkButton path={`/videos/watch/${videoId}`} />
      <SaveButton videoId={videoId} />
      {children}
    </div>
  );
}