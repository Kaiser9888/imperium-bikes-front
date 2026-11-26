import Link from "next/link";
import { Film, Radio, Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";

export type UploadMode = "long" | "memento";

interface UploadSelectorProps {
    value: UploadMode;
    onChange: (mode: UploadMode) => void;
}

const OPTIONS = [
    { id: "long" as const, label: "Vídeo", hint: "Horizontal, com título e hashtags.", icon: Film },
    { id: "memento" as const, label: "Memento", hint: "Vertical e curto, até 3 min.", icon: Smartphone },
];

const item =
    "type-label inline-flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Formato da publicação: Vídeo, Memento ou Live (a live tem tela própria, então é um link). */
export function UploadSelector({ value, onChange }: UploadSelectorProps) {
    const atual = OPTIONS.find((o) => o.id === value)!;
    return (
        <div>
            <fieldset className="flex gap-1 rounded-xl bg-surface-muted p-1">
                <legend className="sr-only">Formato da publicação</legend>
                {OPTIONS.map(({ id, label, icon: Icone }) => {
                    const ativo = value === id;
                    return (
                        <label
                            key={id}
                            className={cn(item, ativo ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                        >
                            <input
                                type="radio"
                                name="upload-mode"
                                value={id}
                                checked={ativo}
                                onChange={() => onChange(id)}
                                className="sr-only"
                            />
                            <Icone className="size-4" aria-hidden="true" />
                            {label}
                        </label>
                    );
                })}
                <Link href="/videos/live" className={cn(item, "text-muted-foreground hover:text-foreground")}>
                    <Radio className="size-4" aria-hidden="true" />
                    Live
                </Link>
            </fieldset>
            <p className="type-caption mt-2 text-muted-foreground">{atual.hint}</p>
        </div>
    );
}
