"use client";

import { Bookmark } from "lucide-react";
import { useSavedVideos } from "@/hooks/useSavedVideos";

/** Salvar para ver depois. `iconOnly` é a versão redonda da barra do Memento. */
export function SaveButton({ videoId, iconOnly = false, className = "" }: { videoId: string; iconOnly?: boolean; className?: string }) {
    const { isSaved, toggle } = useSavedVideos();
    const saved = isSaved(videoId);
    const label = saved ? "Salvo" : "Salvar";

    return (
        <button
            type="button"
            onClick={(e) => {
                // dentro de cards com link: salva sem abrir o vídeo
                e.preventDefault();
                e.stopPropagation();
                toggle(videoId);
            }}
            aria-pressed={saved}
            aria-label={iconOnly ? label : undefined}
            className={`bookmark-btn ${iconOnly ? "bookmark-btn--icon" : ""} ${className}`}
        >
            <span className="bookmark-btn__icon">
                <Bookmark aria-hidden="true" />
            </span>
            {!iconOnly && <span className="bookmark-btn__text">{label}</span>}
        </button>
    );
}
