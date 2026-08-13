import { Film, Clapperboard } from "lucide-react";

export type UploadMode = "long" | "memento";

interface UploadSelectorProps {
    value: UploadMode;
    onChange: (mode: UploadMode) => void;
}

const OPTIONS = [
    {
        id: "long" as const,
        icon: Film,
        label: "Vídeo Longo",
        hint: "Trilhas, tutoriais e reviews com título e hashtags.",
    },
    {
        id: "memento" as const,
        icon: Clapperboard,
        label: "Memento",
        hint: "Clipe vertical rápido. Apenas descrição.",
    },
];

export function UploadSelector({ value, onChange }: UploadSelectorProps) {
    return (
        <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Tipo de publicação</legend>
            {OPTIONS.map((opt) => {
                const active = value === opt.id;
                return (
                    <label
                        key={opt.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                            active ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/40"
                        }`}
                    >
                        <input
                            type="radio"
                            name="upload-mode"
                            value={opt.id}
                            checked={active}
                            onChange={() => onChange(opt.id)}
                            className="sr-only"
                        />
                        <opt.icon className={`mt-0.5 size-5 ${active ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
                        <span>
              <span className="block text-sm font-medium text-foreground">{opt.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{opt.hint}</span>
            </span>
                    </label>
                );
            })}
        </fieldset>
    );
}
