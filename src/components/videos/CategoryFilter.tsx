import { CATEGORY_GROUPS } from "@/lib/videos/categories";

interface CategoryFilterProps {
    value: string;
    onChange: (id: string) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
    return (
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <div className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap">
                {CATEGORY_GROUPS.map((group, gi) => (
                    <div key={group.id} className="flex items-center gap-2">
                        {gi > 0 && <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />}
                        {group.options.map((opt) => {
                            const active = value === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => onChange(opt.id)}
                                    aria-pressed={active}
                                    className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                                        active
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}