import * as React from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Média real de 0 a 5 vinda da API. Sem avaliações, não renderize o componente. */
    media: number;
    /** Quantidade de avaliações, quando a API informar. */
    total?: number;
}

function Rating({ media, total, className, ...props }: RatingProps) {
    const cheias = Math.round(Math.min(5, Math.max(0, media)));
    const mediaTexto = media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const totalTexto = typeof total === "number" ? `, ${total} ${total === 1 ? "avaliação" : "avaliações"}` : "";
    return (
        <span
            role="img"
            aria-label={`Nota ${mediaTexto} de 5${totalTexto}`}
            className={cn("inline-flex items-center gap-1.5 text-sm", className)}
            {...props}
        >
            <span className="flex" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={cn("size-4", n <= cheias ? "fill-warning text-warning" : "text-border")} />
                ))}
            </span>
            <span className="font-semibold text-foreground" aria-hidden="true">{mediaTexto}</span>
            {typeof total === "number" && <span className="text-muted-foreground" aria-hidden="true">({total})</span>}
        </span>
    );
}

export { Rating };
