import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type UploadMode = "long" | "memento";

interface UploadSelectorProps {
    value: UploadMode;
    onChange: (mode: UploadMode) => void;
}

const OPTIONS = [
    {
        id: "long" as const,
        label: "Vídeo",
        hint: "Horizontal. Trilhas, tutoriais, reviews e provas, com título e hashtags.",
        // Moldura desenhada na proporção do formato
        frame: "aspect-video w-20",
    },
    {
        id: "memento" as const,
        label: "Memento",
        hint: "Vertical e curto, até 3 min. Um momento rápido para o feed.",
        frame: "aspect-[9/16] w-10",
    },
];

/** Escolha do formato: vídeo horizontal ou Memento vertical. */
export function UploadSelector({ value, onChange }: UploadSelectorProps) {
    return (
        <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Formato da publicação</legend>
            {OPTIONS.map((opt) => {
                const active = value === opt.id;
                return (
                    <label
                        key={opt.id}
                        className={cn(
                            "relative flex cursor-pointer items-center gap-4 rounded-2xl border bg-surface p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                            active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                        )}
                    >
                        <input
                            type="radio"
                            name="upload-mode"
                            value={opt.id}
                            checked={active}
                            onChange={() => onChange(opt.id)}
                            className="sr-only"
                        />
                        <span className="grid h-16 w-24 shrink-0 place-items-center rounded-xl bg-surface-muted">
                            <span
                                aria-hidden="true"
                                className={cn("rounded-[3px] border-2", opt.frame, active ? "border-primary bg-primary/15" : "border-muted-foreground/50")}
                            />
                        </span>
                        <span className="min-w-0">
                            <span className={cn("block text-base font-semibold", active ? "text-primary" : "text-foreground")}>{opt.label}</span>
                            <span className="type-caption mt-0.5 block text-muted-foreground">{opt.hint}</span>
                        </span>
                        {active && (
                            <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                                <Check className="size-3.5" aria-hidden="true" />
                            </span>
                        )}
                    </label>
                );
            })}
        </fieldset>
    );
}
