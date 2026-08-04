// src/components/videos/CategoryFilter.tsx
"use client";

interface CategoryFilterProps {
  value: string;
  onChange: (id: string) => void;
}

const CATEGORIES = [
  { id: "recomendados", label: "Recomendados" },
  { id: "recentes", label: "Mais recentes" },
  { id: "vistos", label: "Mais vistos" },
];

const TAGS = [
  { id: "mtb", label: "MTB" },
  { id: "speed", label: "Speed" },
  { id: "gravel", label: "Gravel" },
  { id: "bmx", label: "BMX" },
  { id: "eletrica", label: "Elétrica" },
  { id: "downhill", label: "Downhill" },
  { id: "urban", label: "Urban" },
  { id: "trilha", label: "Trilha" },
  { id: "manutencao", label: "Manutenção" },
  { id: "review", label: "Review" },
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="space-y-3">
      {/* Ordenação */}
      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
        {CATEGORIES.map((cat) => {
          const active = value === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              aria-pressed={active}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Tags/Hashtags */}
      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
        {TAGS.map((tag) => {
          const active = value === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onChange(tag.id)}
              aria-pressed={active}
              className={`shrink-0 rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              #{tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}