import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
    return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            className={cn(
                "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className,
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <Circle className="h-3.5 w-3.5 fill-primary" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

/**
 * Opção em cartão (Uiverse.io, ImQwertyOk): um rádio nativo dentro do <label>,
 * e o :has(:checked) pinta o cartão. Use type="checkbox" para seleção múltipla.
 */
function RadioCard({ className, children, type = "radio", ...props }: React.ComponentProps<"input">) {
    return (
        <label
            className={cn(
                "relative flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3 transition-all duration-300 hover:bg-surface-muted has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:font-bold has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
                className,
            )}
        >
            <span className="min-w-0 flex-1">{children}</span>
            <input type={type} className="size-4 shrink-0 accent-[var(--accent)]" {...props} />
        </label>
    );
}

export { RadioGroup, RadioGroupItem, RadioCard };
