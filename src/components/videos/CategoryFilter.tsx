"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { aoMudarGosto, interesses, PESO, registrarInteresse } from "@/lib/videos/gosto";

interface CategoryFilterProps {
  value: string;
  onChange: (id: string) => void;
}

type Tag = { id: string; label: string };

/** Sempre visíveis: ordenações, o essencial da bike e os outros esportes. */
const FIXAS: Tag[] = [
  { id: "recomendados", label: "Recomendados" },
  { id: "recentes", label: "Recentes" },
  { id: "vistos", label: "Mais vistos" },
];
const ESSENCIAIS: Tag[] = [
  { id: "mtb", label: "MTB" },
  { id: "downhill", label: "Downhill" },
  { id: "speed", label: "Speed" },
  { id: "bmx", label: "BMX" },
  { id: "corrida", label: "Corrida" },
  { id: "natacao", label: "Natação" },
  { id: "futebol", label: "Futebol" },
  { id: "musculacao", label: "Musculação" },
  { id: "lutas", label: "Lutas" },
];

/** Catálogo para o "Para você": nomes bonitos para as hashtags conhecidas. */
const CATALOGO: Tag[] = [
  { id: "gravel", label: "Gravel" },
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

/** Sem histórico ainda: uma vitrine para começar a descobrir. */
const DESCOBERTA = ["trilha", "manutencao", "review", "dicas", "campeonato", "treino", "equipamento", "gravel"];

const QUANTOS_PARA_VOCE = 8;
const FIXOS_IDS = new Set([...FIXAS, ...ESSENCIAIS].map((t) => t.id));
const rotulo = (id: string) =>
  CATALOGO.find((t) => t.id === id)?.label ?? id.charAt(0).toUpperCase() + id.slice(1);

function paraVoce(): { tags: Tag[]; personalizado: boolean } {
  const gosto = interesses().filter((id) => !FIXOS_IDS.has(id));
  const personalizado = gosto.length > 0;
  // Completa com a vitrine quando o gosto ainda tem poucas tags
  const ids = [...new Set([...gosto, ...DESCOBERTA])].filter((id) => !FIXOS_IDS.has(id)).slice(0, QUANTOS_PARA_VOCE);
  return { tags: ids.map((id) => ({ id, label: rotulo(id) })), personalizado };
}

function Chip({ tag, ativo, onClick, destaque }: { tag: Tag; ativo: boolean; onClick: () => void; destaque?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={ativo}
      className={`inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-md border px-3 py-1 text-base tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        ativo
          ? "border-primary bg-primary/10 text-primary"
          : destaque
            ? "border-primary/30 text-foreground hover:border-primary/60"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
      style={{ fontFamily: "var(--font-caesar)" }}
    >
      {tag.label}
    </button>
  );
}

function Grupo({ titulo, tags, value, onEscolher }: { titulo: string; tags: Tag[]; value: string; onEscolher: (id: string) => void }) {
  if (tags.length === 0) return null;
  return (
    <section className="mt-5">
      <h3 className="type-caption mb-2.5 font-semibold uppercase tracking-wider text-muted-foreground">{titulo}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => onEscolher(tag.id)} />
        ))}
      </div>
    </section>
  );
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  // Começa com a vitrine (igual no servidor) e troca pelo gosto salvo no aparelho
  const [sugestoes, setSugestoes] = useState<{ tags: Tag[]; personalizado: boolean }>({
    tags: DESCOBERTA.slice(0, QUANTOS_PARA_VOCE).map((id) => ({ id, label: rotulo(id) })),
    personalizado: false,
  });

  useEffect(() => {
    const atualizar = () => setSugestoes(paraVoce());
    atualizar();
    return aoMudarGosto(atualizar);
  }, []);

  const [gavetaAberta, setGavetaAberta] = useState(false);

  function escolher(id: string) {
    if (!["recomendados", "recentes", "vistos"].includes(id)) registrarInteresse([id], PESO.filtro);
    onChange(id);
    setGavetaAberta(false);
  }

  // Categoria ativa que não está em nenhum grupo visível (ex.: veio de uma hashtag)
  const visiveis = new Set([...FIXAS, ...ESSENCIAIS, ...sugestoes.tags].map((t) => t.id));
  const extra = visiveis.has(value) ? null : { id: value, label: rotulo(value) };

  const divisor = <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border" />;
  const resto = CATALOGO.filter((t) => !sugestoes.tags.some((s) => s.id === t.id));

  return (
    <nav aria-label="Filtros de vídeos">
      {/* Celular: linha curta + gaveta com todas (a fileira inteira ocupava a tela) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:hidden" role="tablist" aria-label="Filtrar por categoria">
        <Sheet open={gavetaAberta} onOpenChange={setGavetaAberta}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="type-label inline-flex h-[2.125rem] shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-foreground"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Categorias
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80dvh] overflow-y-auto rounded-t-3xl px-4 pb-8 pt-6">
            <SheetHeader className="px-0">
              <SheetTitle>Categorias</SheetTitle>
            </SheetHeader>
            <Grupo titulo={sugestoes.personalizado ? "Para você" : "Descubra"} tags={sugestoes.tags} value={value} onEscolher={escolher} />
            <Grupo titulo="Bike e outros esportes" tags={ESSENCIAIS} value={value} onEscolher={escolher} />
            <Grupo titulo="Mais categorias" tags={resto} value={value} onEscolher={escolher} />
          </SheetContent>
        </Sheet>
        {FIXAS.map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => escolher(tag.id)} />
        ))}
        {extra && <Chip tag={extra} ativo onClick={() => escolher(extra.id)} />}
        {sugestoes.tags.slice(0, 3).map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => escolher(tag.id)} destaque />
        ))}
      </div>

      {/* Computador: tudo numa fileira */}
      <div className="hidden items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex" role="tablist" aria-label="Filtrar por categoria">
        {FIXAS.map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => escolher(tag.id)} />
        ))}
        {extra && <Chip tag={extra} ativo onClick={() => escolher(extra.id)} />}
        {divisor}
        {ESSENCIAIS.map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => escolher(tag.id)} />
        ))}
        {divisor}
        <span className="type-caption inline-flex shrink-0 items-center gap-1 font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {sugestoes.personalizado ? "Para você" : "Descubra"}
        </span>
        {sugestoes.tags.map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => escolher(tag.id)} destaque />
        ))}
      </div>
    </nav>
  );
}
