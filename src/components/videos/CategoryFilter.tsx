"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import { fetchPopularHashtags } from "@/lib/videos/api";
import { aoMudarGosto, interesses, PESO, registrarInteresse } from "@/lib/videos/gosto";

interface CategoryFilterProps {
  value: string;
  onChange: (id: string) => void;
}

type Tag = { id: string; label: string };

/** Valor padrão da página ("Para você"): não vira chip, é o que fica quando nada está marcado. */
export const PADRAO = "recomendados";

/** Ordenações: as únicas fixas. Todas as outras categorias são hashtags reais dos vídeos. */
const ORDENS: Tag[] = [
  { id: "recentes", label: "Recentes" },
  { id: "vistos", label: "Mais vistos" },
];

/** Só nomes bonitos (acento, sigla) para hashtags comuns; não decide o que aparece. */
const NOMES: Record<string, string> = {
  mtb: "MTB",
  bmx: "BMX",
  urban: "Urbana",
  eletrica: "Elétrica",
  manutencao: "Manutenção",
  historia: "História",
  tecnica: "Técnica",
  acessorio: "Acessório",
  alimentacao: "Alimentação",
  saude: "Saúde",
  seguranca: "Segurança",
  inovacao: "Inovação",
  natacao: "Natação",
  musculacao: "Musculação",
};
const rotulo = (id: string) =>
  ORDENS.find((o) => o.id === id)?.label ?? NOMES[id] ?? id.charAt(0).toUpperCase() + id.slice(1);

/**
 * Para você = hashtags que existem nos vídeos E que a pessoa já assistiu/curtiu/tocou,
 * na ordem do gosto. O resto segue pela quantidade de vídeos de cada uma.
 */
export function montarCategorias(reais: string[], gosto: string[]): { paraVoce: string[]; outras: string[] } {
  const existe = new Set(reais);
  const paraVoce = gosto.filter((t) => existe.has(t)).slice(0, 8);
  const ja = new Set(paraVoce);
  return { paraVoce, outras: reais.filter((t) => !ja.has(t)) };
}

function Chip({ tag, ativo, onClick }: { tag: Tag; ativo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={ativo}
      // Ativo em branco/preto: vermelho só para marca, ao vivo e avisos
      className={`type-label inline-flex h-[2.125rem] shrink-0 cursor-pointer items-center rounded-full border px-3.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        ativo
          ? "border-foreground bg-foreground text-background"
          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
      }`}
    >
      {tag.label}
    </button>
  );
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const [reais, setReais] = useState<string[]>([]);
  const [gosto, setGosto] = useState<string[]>([]);

  useEffect(() => {
    let cancelado = false;
    fetchPopularHashtags().then((lista) => !cancelado && setReais(lista.map((h) => h.tag)));
    const atualizar = () => setGosto(interesses());
    atualizar();
    const parar = aoMudarGosto(atualizar);
    return () => {
      cancelado = true;
      parar();
    };
  }, []);

  const trilho = useRef<HTMLDivElement>(null);
  const arraste = useRef({ x: 0, scroll: 0, moveu: false, ativo: false });

  function escolher(id: string) {
    if (arraste.current.moveu) return; // foi arraste, não clique
    // Tocar de novo na ativa desmarca e volta ao "Para você"
    if (id === value) return onChange(PADRAO);
    if (!ORDENS.some((o) => o.id === id)) registrarInteresse([id], PESO.filtro);
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

  const { paraVoce, outras } = montarCategorias(reais, gosto);
  const todas = new Set([...ORDENS.map((o) => o.id), ...reais, PADRAO]);
  // Categoria ativa que não está na fileira (ex.: veio de uma hashtag sem vídeo público)
  const extra = todas.has(value) ? null : value;
  const chip = (id: string) => (
    <Chip key={id} tag={{ id, label: rotulo(id) }} ativo={value === id} onClick={() => escolher(id)} />
  );
  const divisor = <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border" />;

  return (
    <nav aria-label="Filtros de vídeos">
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
        {ORDENS.map((o) => chip(o.id))}
        {extra && chip(extra)}
        {paraVoce.length > 0 && (
          <>
            {divisor}
            <Sparkles className="size-4 shrink-0 text-primary" aria-label="Para você" />
            {paraVoce.map(chip)}
          </>
        )}
        {outras.length > 0 && divisor}
        {outras.map(chip)}
      </div>
    </nav>
  );
}
