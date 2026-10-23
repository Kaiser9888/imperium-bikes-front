"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, Trophy, X } from "lucide-react";

import type { Tournament } from "@/services/tournamentService";

export interface EventoEscolhido {
  id: string;
  nome: string;
}

interface EventoPickerProps {
  value: EventoEscolhido | null;
  onChange: (evento: EventoEscolhido | null) => void;
  /** Busca no servidor pelo texto digitado (vídeos) ou devolve uma lista fixa (live do organizador). */
  carregar: (texto: string) => Promise<Tournament[]>;
  /** Com lista fixa, mostra as opções antes de digitar. */
  listaFixa?: boolean;
  disabled?: boolean;
  ajuda?: string;
}

/** Marca um evento: busca por nome e mostra o escolhido como uma etiqueta removível. */
export function EventoPicker({ value, onChange, carregar, listaFixa = false, disabled = false, ajuda }: EventoPickerProps) {
  const [texto, setTexto] = useState("");
  const [opcoes, setOpcoes] = useState<Tournament[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    if (value || !aberto) return;
    const q = texto.trim();
    if (!listaFixa && q.length < 2) return;
    let ativo = true;
    // Espera a pessoa parar de digitar antes de buscar
    const timer = setTimeout(() => {
      setCarregando(true);
      carregar(q)
        .then((lista) => {
          if (!ativo) return;
          const filtro = q.toLowerCase();
          setOpcoes(lista.filter((t) => !t.cancelado && (!filtro || t.nome.toLowerCase().includes(filtro))).slice(0, 8));
        })
        .catch(() => ativo && setOpcoes([]))
        .finally(() => ativo && setCarregando(false));
    }, listaFixa ? 0 : 300);
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [texto, aberto, value, carregar, listaFixa]);

  if (value) {
    return (
      <div>
        <p className="type-label mb-2 flex items-center gap-1.5 text-foreground">
          <Trophy className="size-4 text-muted-foreground" aria-hidden="true" />
          Evento
        </p>
        <span className="type-label inline-flex max-w-full items-center gap-2 rounded-full bg-primary/10 py-1.5 pl-3 pr-1.5 text-primary">
          <span className="truncate">{value.nome}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label={`Tirar o evento ${value.nome}`}
              className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-primary/20"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </span>
        {ajuda && <p className="type-caption mt-2 text-muted-foreground">{ajuda}</p>}
      </div>
    );
  }

  const q = texto.trim();
  const mostrarLista = aberto && (listaFixa || q.length >= 2);

  return (
    <div>
      <label htmlFor="evento-busca" className="type-label mb-2 flex items-center gap-1.5 text-foreground">
        <Trophy className="size-4 text-muted-foreground" aria-hidden="true" />
        Evento
        <span className="type-caption ml-auto font-normal text-muted-foreground">opcional</span>
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id="evento-busca"
          value={texto}
          disabled={disabled}
          onChange={(e) => setTexto(e.target.value)}
          onFocus={() => setAberto(true)}
          // Atraso para o clique na opção acontecer antes de fechar
          onBlur={() => setTimeout(() => setAberto(false), 150)}
          placeholder={listaFixa ? "Escolha um dos seus eventos" : "Procure o evento pelo nome"}
          autoComplete="off"
          role="combobox"
          aria-expanded={mostrarLista}
          aria-controls="evento-opcoes"
          className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        {carregando && <Loader2 className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />}
        {mostrarLista && !carregando && (
          <ul id="evento-opcoes" role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-lg">
            {opcoes.length === 0 ? (
              <li className="type-caption px-3 py-2.5 text-muted-foreground">
                {listaFixa ? "Você ainda não organiza nenhum evento." : "Nenhum evento com esse nome."}
              </li>
            ) : (
              opcoes.map((t) => (
                <li key={t.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange({ id: t.id, nome: t.nome });
                      setTexto("");
                      setAberto(false);
                    }}
                    className="flex w-full cursor-pointer flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-surface-muted"
                  >
                    <span className="type-label text-foreground">{t.nome}</span>
                    {t.local && <span className="type-caption text-muted-foreground">{t.local}</span>}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {ajuda && <p className="type-caption mt-2 text-muted-foreground">{ajuda}</p>}
    </div>
  );
}
