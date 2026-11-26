"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import { ESPORTES_ABERTOS } from "@/lib/esportes";
import { aoMudarGosto, interesses, PESO, registrarInteresse } from "@/lib/videos/gosto";

interface CategoryFilterProps {
  value: string;
  onChange: (id: string) => void;
}

type Tag = { id: string; label: string };

/** Sempre visíveis: ordenações e o essencial da bike (outros esportes só com ESPORTES_ABERTOS). */
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
  { id: "urban", label: "Urbana" },
  ...(ESPORTES_ABERTOS
    ? [
        { id: "corrida", label: "Corrida" },
        { id: "natacao", label: "Natação" },
        { id: "futebol", label: "Futebol" },
        { id: "musculacao", label: "Musculação" },
        { id: "lutas", label: "Lutas" },
      ]
    : []),
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
      // Mesma letra e altura do botão Categorias e das abas de cima (antes era maior e de outra fonte)
      className={`type-label inline-flex h-[2.125rem] shrink-0 cursor-pointer items-center gap-1 rounded-md border px-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        ativo
          ? "border-primary bg-primary/10 text-primary"
          : destaque
            ? "border-primary/30 text-foreground hover:border-primary/60"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {tag.label}
    </button>
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

  const trilho = useRef<HTMLDivElement>(null);
  const arraste = useRef({ x: 0, scroll: 0, moveu: false, ativo: false });

  function escolher(id: string) {
    if (arraste.current.moveu) return; // foi arraste, não clique
    if (!["recomendados", "recentes", "vistos"].includes(id)) registrarInteresse([id], PESO.filtro);
    onChange(id);
  }

  // Mouse: arrastar a fileira para o lado (no toque o navegador já faz sozinho)
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !trilho.current) return;
    arraste.current = { x: e.clientX, scroll: trilho.current.scrollLeft, moveu: false, ativo: true };
  }
  function onPointerMove(e: React.PointerEvent) {
    const a = arraste.current;
    if (!a.ativo || !trilho.current) return;
    const dx = e.clientX - a.x;
    if (Math.abs(dx) > 5) a.moveu = true;
    trilho.current.scrollLeft = a.scroll - dx;
  }
  function onPointerUp() {
    arraste.current.ativo = false;
    // O click chega logo depois do pointerup: ignora esse e libera em seguida
    setTimeout(() => (arraste.current.moveu = false), 0);
  }

  // Categoria ativa que não está em nenhum chip (ex.: veio de uma hashtag)
  const visiveis = new Set([...FIXAS, ...ESSENCIAIS, ...sugestoes.tags, ...CATALOGO].map((t) => t.id));
  const extra = visiveis.has(value) ? null : { id: value, label: rotulo(value) };

  const divisor = <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border" />;
  const resto = CATALOGO.filter((t) => !FIXOS_IDS.has(t.id) && !sugestoes.tags.some((s) => s.id === t.id));

  return (
    <nav aria-label="Filtros de vídeos">
      {/* Uma fileira só, arrastando para o lado (antes: linha fixa + gaveta de filtro) */}
      <div
        ref={trilho}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="flex cursor-grab select-none items-center gap-2 overflow-x-auto pb-1 scrollbar-none active:cursor-grabbing"
        role="tablist"
        aria-label="Filtrar por categoria"
      >
        {FIXAS.map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => escolher(tag.id)} />
        ))}
        {extra && <Chip tag={extra} ativo onClick={() => escolher(extra.id)} />}
        {divisor}
        <span className="type-caption inline-flex shrink-0 items-center gap-1 font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
          {sugestoes.personalizado ? "Para você" : "Descubra"}
        </span>
        {sugestoes.tags.map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => escolher(tag.id)} destaque />
        ))}
        {divisor}
        {ESSENCIAIS.map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => escolher(tag.id)} />
        ))}
        {divisor}
        {resto.map((tag) => (
          <Chip key={tag.id} tag={tag} ativo={value === tag.id} onClick={() => escolher(tag.id)} />
        ))}
      </div>
    </nav>
  );
}
