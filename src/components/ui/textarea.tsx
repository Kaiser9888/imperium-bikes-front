import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[60px] w-full rounded-lg border-[1.5px] border-foreground bg-surface px-3 py-2 text-base text-foreground shadow-[2.5px_3px_0_var(--foreground)] transition-shadow duration-200 placeholder:text-muted-foreground focus-visible:shadow-[5.5px_7px_0_var(--foreground)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Textarea.displayName = "Textarea";

export { Textarea };
