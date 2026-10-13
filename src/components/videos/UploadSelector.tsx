import { Film, Clapperboard } from "lucide-react";
import { RadioCard } from "@/components/ui/radio-group";

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
                    <RadioCard
                        key={opt.id}
                        name="upload-mode"
                        value={opt.id}
                        checked={active}
                        onChange={() => onChange(opt.id)}
                        className="p-4"
                    >
                      <span className="flex items-start gap-3">
                        <opt.icon className={`mt-0.5 size-5 ${active ? "text-accent" : "text-muted-foreground"}`} aria-hidden="true" />
                        <span>
              <span className="block text-sm font-medium text-foreground">{opt.label}</span>
              <span className="mt-1 block text-xs font-normal text-muted-foreground">{opt.hint}</span>
            </span>
                      </span>
                    </RadioCard>
                );
            })}
        </fieldset>
    );
}
