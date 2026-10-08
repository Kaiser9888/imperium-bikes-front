import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    icon?: LucideIcon;
    title: string;
    description?: string;
    /** Ação opcional, normalmente um <Button>. */
    action?: React.ReactNode;
}

/** Use somente quando a busca deu certo e não há dados. Para falhas, use ErrorState. */
function EmptyState({ icon: Icon, title, description, action, className, ...props }: EmptyStateProps) {
    return (
        <div className={cn("mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center", className)} {...props}>
            {Icon && <Icon className="mb-4 size-10 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />}
            <p className="type-h3 text-foreground">{title}</p>
            {description && <p className="type-body-small mt-1.5 text-muted-foreground">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export { EmptyState };
