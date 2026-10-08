import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { formatarPreco } from "@/lib/format";

const priceVariants = cva("font-bold tracking-tight text-foreground tabular-nums", {
    variants: {
        size: {
            sm: "text-sm",
            md: "text-base",
            lg: "text-2xl",
            xl: "text-3xl",
        },
    },
    defaultVariants: { size: "md" },
});

interface PriceProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof priceVariants> {
    /** Valor em reais. */
    valor: number;
    /** Preço anterior real vindo da API; só aparece se for maior que o atual. */
    valorAntigo?: number | null;
}

function Price({ valor, valorAntigo, size, className, ...props }: PriceProps) {
    const temAntigo = typeof valorAntigo === "number" && valorAntigo > valor;
    return (
        <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)} {...props}>
            <span className={priceVariants({ size })}>{formatarPreco(valor)}</span>
            {temAntigo && (
                <s className="text-xs text-muted-foreground tabular-nums">
                    <span className="sr-only">Preço anterior: </span>
                    {formatarPreco(valorAntigo)}
                </s>
            )}
        </span>
    );
}

export { Price };
