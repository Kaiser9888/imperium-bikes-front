"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";

/** Copia o link do vídeo. Sem `path`, usa a página atual. */
export function CopyLinkButton({ path, className = "" }: { path?: string; className?: string }) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timer = setTimeout(() => setCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [copied]);

    async function copy() {
        const url = path ? `${window.location.origin}${path}` : window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
        } catch {
            toast.error("Não foi possível copiar o link");
        }
    }

    return (
        <button
            type="button"
            onClick={copy}
            data-copied={copied}
            aria-label={copied ? "Link copiado" : "Copiar link"}
            className={`copy-link-btn ${className}`}
        >
            <span aria-hidden="true">
                <Link2 />
                Copiar link
            </span>
            <span aria-hidden="true">
                <Check />
                Copiado!
            </span>
        </button>
    );
}
