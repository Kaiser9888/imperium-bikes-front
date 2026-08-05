"use client";

interface CategoryFilterProps {
  value: string;
  onChange: (id: string) => void;
}

const CATEGORIES = [
  { id: "recomendados", label: "Recomendados" },
  { id: "recentes", label: "Mais recentes" },
  { id: "vistos", label: "Mais vistos" },
  { id: "live", label: "Live" },
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
  { id: "campeonato", label: "Campeonato" },
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <nav className="space-y-3" aria-label="Filtros de vídeos">
      {/* Ordenação */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Ordenar por"
      >
        {CATEGORIES.map((cat) => {
          const isActive = value === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              role="tab"
              aria-selected={isActive}
              className={`shrink-0 rounded-full px-4 py-1.5 font-blackletter text-xl tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "bg-red-700 text-white"
                  : "bg-red-200 text-white hover:bg-red-700 hover:text-white"
              }`}
              style={{ fontFamily: 'var(--font-blackletter)' }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Tags/Hashtags */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Filtrar por categoria"
      >
        {TAGS.map((tag) => {
          const isActive = value === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onChange(tag.id)}
              role="tab"
              aria-selected={isActive}
              className={`shrink-0 rounded-md border px-3 py-1 font-blackletter text-base tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-red-300 hover:text-foreground"
              }`}
              style={{ fontFamily: 'var(--font-blackletter)' }}
            >
              #{tag.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}