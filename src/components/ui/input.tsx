import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // text-base no celular evita o zoom automático do iOS ao focar
                    "flex h-11 w-full rounded-lg border-[1.5px] border-foreground bg-surface px-3 text-base text-foreground shadow-[2.5px_3px_0_var(--foreground)] transition-shadow duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:shadow-[5.5px_7px_0_var(--foreground)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive/30 md:text-sm",
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Input.displayName = "Input";

export { Input };
