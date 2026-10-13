import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "type-button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-[background-color,border-color,color,transform,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                // Estilo Gumroad (Uiverse.io, satyamchaudharydev): no hover o botão sobe,
                // fica vermelho e deixa uma sombra sólida no lugar.
                default:
                    "border border-foreground bg-foreground text-background hover:-translate-x-1 hover:-translate-y-1 hover:bg-accent hover:text-accent-foreground hover:shadow-[0.25rem_0.25rem_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none",
                accent:
                    "border border-foreground bg-accent text-accent-foreground hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[0.25rem_0.25rem_var(--foreground)] active:translate-x-0 active:translate-y-0 active:shadow-none",
                secondary: "bg-secondary text-secondary-foreground hover:bg-border",
                outline: "border border-input bg-surface text-foreground hover:bg-surface-muted",
                ghost: "text-foreground hover:bg-surface-muted",
                destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4",
                sm: "h-9 px-3",
                lg: "h-12 px-6 text-base",
                icon: "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    /** Mostra o indicador de progresso e bloqueia novos cliques. */
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
        const classes = cn(buttonVariants({ variant, size, className }));
        if (asChild) {
            return (
                <Slot className={classes} ref={ref} {...props}>
                    {children}
                </Slot>
            );
        }
        return (
            <button
                className={classes}
                ref={ref}
                disabled={disabled || loading}
                aria-busy={loading || undefined}
                {...props}
            >
                {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
                {children}
            </button>
        );
    },
);
Button.displayName = "Button";

export { Button, buttonVariants };
