import * as React from "react";
import { CircleAlert, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    title?: string;
    description?: string;
    onRetry?: () => void;
}

function ErrorState({
    title = "Não foi possível carregar",
    description = "Verifique sua conexão e tente novamente.",
    onRetry,
    className,
    ...props
}: ErrorStateProps) {
    return (
        <div role="alert" className={cn("mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center", className)} {...props}>
            <CircleAlert className="mb-4 size-10 text-destructive" strokeWidth={1.5} aria-hidden="true" />
            <p className="type-h3 text-foreground">{title}</p>
            <p className="type-body-small mt-1.5 text-muted-foreground">{description}</p>
            {onRetry && (
                <Button variant="outline" className="mt-6" onClick={onRetry}>
                    <RotateCcw aria-hidden="true" />
                    Tentar novamente
                </Button>
            )}
        </div>
    );
}

export { ErrorState };
