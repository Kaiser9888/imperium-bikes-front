import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
    {
        variants: {
            tone: {
                success: "bg-success/12 text-success",
                warning: "bg-warning/12 text-warning",
                info: "bg-info/12 text-info",
                destructive: "bg-destructive/12 text-destructive",
                neutral: "bg-surface-muted text-muted-foreground",
                // Sólido: reservado para transmissões AO VIVO
                live: "bg-destructive text-destructive-foreground",
            },
        },
        defaultVariants: {
            tone: "neutral",
        },
    },
);

export interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {}

/** Status de pedido, anúncio, evento, pagamento ou transmissão. */
function StatusBadge({ className, tone, children, ...props }: StatusBadgeProps) {
    return (
        <span className={cn(statusBadgeVariants({ tone }), className)} {...props}>
            {tone === "live" && <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />}
            {children}
        </span>
    );
}

export { StatusBadge, statusBadgeVariants };
