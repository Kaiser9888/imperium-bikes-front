import { Search, X } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export function SearchBar({ value, onChange, placeholder = "Buscar vídeos, autores ou modalidades", autoFocus }: SearchBarProps) {
    return (
        <div className="relative">
            <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
            />
            <input
                type="search"
                value={value}
                autoFocus={autoFocus}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                aria-label="Buscar vídeos"
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange("")}
                    aria-label="Limpar busca"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}