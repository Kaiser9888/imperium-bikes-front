"use client";

interface CategoryFilterProps {
  value: string;
  onChange: (id: string) => void;
}

const TAGS = [
  { id: "recomendados", label: "Recomendados" },
  { id: "recentes", label: "Recentes" },
  { id: "vistos", label: "Mais vistos" },
  { id: "downhill", label: "Downhill" },
  { id: "mtb", label: "MTB" },
  { id: "speed", label: "Speed" },
  { id: "gravel", label: "Gravel" },
  { id: "bmx", label: "BMX" },
  { id: "eletrica", label: "Elétrica" },
  { id: "urban", label: "Urban" },
  { id: "trilha", label: "Trilha" },
  { id: "manutencao", label: "Manutenção" },
  { id: "review", label: "Review" },
  { id: "campeonato", label: "Campeonato" },
  { id: "dicas", label: "Dicas" },
  { id: "upgrade", label: "Upgrade" },
  { id: "custom", label: "Custom" },
  { id: "freestyle", label: "Freestyle" },
  { id: "novidade", label: "Novidade" },
  { id: "evento", label: "Evento" },
  { id: "historia", label: "História" },
  { id: "entrevista", label: "Entrevista" },
  { id: "curiosidade", label: "Curiosidade" },
  { id: "tecnica", label: "Técnica" },
  { id: "treino", label: "Treino" },
  { id: "equipamento", label: "Equipamento" },
  { id: "acessorio", label: "Acessório" },
  { id: "comunidade", label: "Comunidade" },
  { id: "viagem", label: "Viagem" },
  { id: "aventura", label: "Aventura" },
  { id: "alimentacao", label: "Alimentação" },
  { id: "saude", label: "Saúde" },
  { id: "seguranca", label: "Segurança" },
  { id: "sustentabilidade", label: "Sustentabilidade" },
  { id: "tecnologia", label: "Tecnologia" },
  { id: "inovacao", label: "Inovação" },
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <nav className="space-y-3" aria-label="Filtros de vídeos">
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
              className={`shrink-0 rounded-md border px-3 py-1 font-caesar text-base tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
              style={{ fontFamily: 'var(--font-caesar)' }}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}