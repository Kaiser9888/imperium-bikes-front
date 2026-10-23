"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Film,
  Hash,
  Lightbulb,
  Loader2,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBytes, formatDuration } from "@/lib/videos/format";
import { uploadVideo } from "@/lib/videos/upload";
import { cn } from "@/lib/utils";
import { tournamentService } from "@/services/tournamentService";
import { EventoPicker, type EventoEscolhido } from "./EventoPicker";
import type { UploadMode } from "./UploadSelector";

const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const MAX_MEMENTO_SECONDS = 180;
const MAX_TAGS = 8;

/** Sugestões de um toque: as categorias da página de vídeos. */
const SUGESTOES = ["MTB", "Downhill", "Speed", "BMX", "Trilha", "Gravel", "Manutenção", "Review", "Dicas", "Campeonato", "Treino", "Corrida"];

type Status = "idle" | "uploading" | "processing" | "done";

const limparTag = (tag: string) => tag.trim().replace(/^#+/, "").replace(/[^\p{L}0-9_]/gu, "").slice(0, 30);

const buscarEventos = (texto: string) => tournamentService.buscarPorNome(texto);

/** `torneioId`: vindo da página do evento, o vídeo já sai marcado com ele. */
export function UploadForm({ mode, torneioId }: { mode: UploadMode; torneioId?: string | null }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const isMemento = mode === "memento";
  const [evento, setEvento] = useState<EventoEscolhido | null>(null);

  useEffect(() => {
    if (!torneioId) return;
    let ativo = true;
    tournamentService
      .buscarPorId(torneioId)
      .then((t) => ativo && setEvento({ id: t.id, nome: t.nome }))
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [torneioId]);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<{ duration: number; vertical: boolean } | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = useCallback(
    (selected: File) => {
      setError("");
      if (!selected.type.startsWith("video/")) {
        setError("Esse arquivo não é um vídeo. Use MP4, MOV ou WebM.");
        return;
      }
      if (selected.size > MAX_SIZE_BYTES) {
        setError(`O arquivo tem ${formatBytes(selected.size)}. O máximo é ${MAX_SIZE_MB} MB.`);
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(selected);
      setMeta(null);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.onloadedmetadata = () =>
        setMeta({ duration: Math.round(video.duration), vertical: video.videoHeight > video.videoWidth });
      // Sugere o título pelo nome do arquivo (o criador ajusta)
      if (!isMemento && !title) {
        const base = selected.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
        if (base.length >= 3) setTitle(base.slice(0, 100));
      }
    },
    [previewUrl, isMemento, title],
  );

  function adicionarTag(bruta: string) {
    const tag = limparTag(bruta);
    if (!tag || tags.length >= MAX_TAGS) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    setTags([...tags, tag]);
  }

  const busy = status === "uploading" || status === "processing" || status === "done";
  const tituloOk = isMemento ? description.trim().length >= 3 : title.trim().length >= 3;
  const canPublish = !!file && tituloOk && !busy;
  const mementoLongo = isMemento && meta != null && meta.duration > MAX_MEMENTO_SECONDS;
  const orientacaoErrada = meta != null && (isMemento ? !meta.vertical : meta.vertical);
  const etapa = !file ? 1 : !tituloOk ? 2 : 3;

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setMeta(null);
    setError("");
    setStatus("idle");
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!tituloOk) {
      setError(isMemento ? "Escreva uma descrição: ela também é o título do Memento." : "O título precisa ter pelo menos 3 caracteres.");
      return;
    }
    if (mementoLongo) {
      setError("Memento tem até 3 minutos. Corte o vídeo ou publique como Vídeo.");
      return;
    }
    setError("");
    setStatus("uploading");
    setProgress(0);
    try {
      const token = await getToken();
      if (!token) {
        setError("Sua sessão expirou. Entre novamente para publicar.");
        setStatus("idle");
        return;
      }
      const saved = await uploadVideo(
        {
          file,
          title: isMemento ? description.trim().slice(0, 60) : title.trim(),
          description,
          // Com "#": é assim que o backend reconhece hashtag (antes ia sem e era ignorada)
          hashtags: tags.map((t) => `#${t}`).join(" "),
          isShort: isMemento,
          tournamentId: evento?.id,
          token,
        },
        { onProgress: setProgress, onProcessing: () => setStatus("processing") },
      );
      setStatus("done");
      router.push(`/videos/watch/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro no envio. Tente novamente.");
      setStatus("idle");
    }
  };

  const field =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

  return (
    <div className="flex flex-col gap-6">
      <Etapas atual={etapa} />

      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {!file ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Escolher vídeo"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFileSelect(dropped);
          }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
          className={cn(
            "group flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDragging ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/50 hover:bg-surface-muted/40",
          )}
        >
          <span
            className={cn(
              "grid size-16 place-items-center rounded-full transition-transform",
              isDragging ? "scale-110 bg-primary text-primary-foreground" : "bg-primary/10 text-primary group-hover:scale-105",
            )}
          >
            <UploadCloud className="size-7" aria-hidden="true" />
          </span>
          <p className="type-h3 mt-5 text-foreground">{isDragging ? "Solte para enviar" : isMemento ? "Escolha seu Memento" : "Escolha seu vídeo"}</p>
          <p className="type-body-small mt-1 text-muted-foreground">Arraste o arquivo até aqui ou clique para procurar.</p>
          <span className="type-label mt-6 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-background">Selecionar arquivo</span>
          <ul className="type-caption mt-6 flex flex-wrap justify-center gap-2 text-muted-foreground">
            <li className="rounded-full bg-surface-muted px-3 py-1">MP4 · MOV · WebM</li>
            <li className="rounded-full bg-surface-muted px-3 py-1">Até {MAX_SIZE_MB} MB</li>
            <li className="rounded-full bg-surface-muted px-3 py-1">{isMemento ? "Vertical · até 3 min" : "Horizontal · 16:9"}</li>
          </ul>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-8">
          {/* Prévia */}
          <div className="flex flex-col gap-3">
            <div className={cn("mx-auto w-full overflow-hidden rounded-2xl bg-black", isMemento ? "aspect-[9/16] max-w-[260px]" : "aspect-video")}>
              <video src={previewUrl} controls className="size-full object-contain" />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <Film className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="type-label truncate text-foreground">{file.name}</p>
                <p className="type-caption text-muted-foreground">
                  {formatBytes(file.size)}
                  {meta && ` · ${formatDuration(meta.duration)}`}
                </p>
              </div>
              {!busy && (
                <button type="button" onClick={reset} className="type-label inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground">
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Trocar
                </button>
              )}
            </div>

            {mementoLongo && (
              <Aviso>
                O Memento tem até 3 minutos e este vídeo tem {formatDuration(meta!.duration)}. Corte o vídeo ou publique como Vídeo.
              </Aviso>
            )}
            {orientacaoErrada && !mementoLongo && (
              <Aviso>
                {isMemento
                  ? "Este vídeo é horizontal. No feed do Memento ele vai aparecer cortado; o ideal é gravar na vertical."
                  : "Este vídeo é vertical. Ele combina mais com o Memento."}
              </Aviso>
            )}
          </div>

          {/* Detalhes */}
          <div className="flex flex-col gap-5">
            {!isMemento && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="title" className="type-label text-foreground">
                    Título <span className="text-primary">*</span>
                  </label>
                  <span className="type-caption tabular-nums text-muted-foreground">{title.length}/100</span>
                </div>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={busy}
                  maxLength={100}
                  placeholder="Ex.: Descida técnica na Serra do Rio do Rastro"
                  className={field}
                />
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="description" className="type-label text-foreground">
                  {isMemento ? (
                    <>
                      Legenda <span className="text-primary">*</span>
                    </>
                  ) : (
                    "Descrição"
                  )}
                </label>
                <span className="type-caption tabular-nums text-muted-foreground">{description.length}/500</span>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={busy}
                rows={isMemento ? 4 : 5}
                maxLength={500}
                placeholder={isMemento ? "O que está rolando neste momento? A legenda também vira o título." : "Conte onde foi, a bike, o equipamento e o que achou."}
                className={cn(field, "resize-none")}
              />
            </div>

            <div>
              <label htmlFor="tag-input" className="type-label mb-2 flex items-center gap-1.5 text-foreground">
                <Hash className="size-4 text-muted-foreground" aria-hidden="true" />
                Hashtags
                <span className="type-caption ml-auto font-normal text-muted-foreground">
                  {tags.length}/{MAX_TAGS}
                </span>
              </label>
              <div
                className={cn("flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20", busy && "opacity-60")}
              >
                {tags.map((tag) => (
                  <span key={tag} className="type-label inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 pl-3 pr-1 text-primary">
                    #{tag}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      aria-label={`Remover #${tag}`}
                      className="grid size-5 cursor-pointer place-items-center rounded-full hover:bg-primary/20"
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
                <input
                  id="tag-input"
                  value={tagInput}
                  disabled={busy || tags.length >= MAX_TAGS}
                  onChange={(e) => {
                    const valor = e.target.value;
                    // Espaço ou vírgula fecha a hashtag
                    if (/[\s,]$/.test(valor)) {
                      adicionarTag(valor);
                      setTagInput("");
                    } else setTagInput(valor);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      adicionarTag(tagInput);
                      setTagInput("");
                    } else if (e.key === "Backspace" && !tagInput && tags.length) {
                      setTags(tags.slice(0, -1));
                    }
                  }}
                  onBlur={() => {
                    if (tagInput) {
                      adicionarTag(tagInput);
                      setTagInput("");
                    }
                  }}
                  placeholder={tags.length ? "" : "Digite e aperte Enter"}
                  className="min-w-28 flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGESTOES.filter((s) => !tags.some((t) => t.toLowerCase() === limparTag(s).toLowerCase())).slice(0, 8).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy || tags.length >= MAX_TAGS}
                    onClick={() => adicionarTag(s)}
                    className="type-caption cursor-pointer rounded-full border border-border px-2.5 py-1 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-40"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <EventoPicker
              value={evento}
              onChange={setEvento}
              carregar={buscarEventos}
              disabled={busy}
              ajuda="Gravou num evento? Marque e o vídeo aparece na página dele."
            />

            <div className="flex gap-3 rounded-xl bg-surface-muted/60 p-4">
              <Lightbulb className="size-5 shrink-0 text-warning" aria-hidden="true" />
              <ul className="type-caption flex flex-col gap-1 text-muted-foreground">
                <li>Um título claro (lugar, trilha, peça) aparece melhor na busca.</li>
                <li>Use de 3 a 5 hashtags: elas levam seu vídeo para quem curte o assunto.</li>
                <li>A capa é gerada automaticamente a partir do vídeo.</li>
              </ul>
            </div>

            {/* Envio */}
            {status === "idle" ? (
              <div className="flex items-center gap-3">
                <Button type="button" onClick={reset} variant="outline" size="lg">
                  Descartar
                </Button>
                <Button type="button" onClick={handleUpload} disabled={!canPublish || mementoLongo} size="lg" className="flex-1">
                  {isMemento ? "Publicar Memento" : "Publicar vídeo"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-4" role="status" aria-live="polite">
                <div className="flex items-center justify-between gap-3">
                  <span className="type-label flex items-center gap-2 text-foreground">
                    {status === "done" ? (
                      <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
                    ) : status === "processing" ? (
                      <Clock className="size-5 text-primary" aria-hidden="true" />
                    ) : (
                      <Loader2 className="size-5 animate-spin text-primary" aria-hidden="true" />
                    )}
                    {status === "uploading" ? "Enviando o vídeo..." : status === "processing" ? "Enviado! Preparando para tocar..." : "Publicado! Abrindo o vídeo..."}
                  </span>
                  {status === "uploading" && <span className="type-label tabular-nums text-foreground">{progress}%</span>}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={cn("h-full rounded-full bg-primary transition-[width] duration-300", status !== "uploading" && "w-full")}
                    style={status === "uploading" ? { width: `${progress}%` } : undefined}
                  />
                </div>
                {status === "uploading" && (
                  <p className="type-caption mt-2 text-muted-foreground">Não feche esta página até o envio terminar.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return (
    <p className="type-caption flex gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5 text-foreground">
      <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden="true" />
      {children}
    </p>
  );
}

/** Indicador das etapas: arquivo, detalhes, publicar. */
function Etapas({ atual }: { atual: number }) {
  const etapas = ["Arquivo", "Detalhes", "Publicar"];
  return (
    <ol className="flex items-center gap-2" aria-label="Etapas">
      {etapas.map((nome, i) => {
        const n = i + 1;
        const feita = n < atual;
        const ativa = n === atual;
        return (
          <li key={nome} className="flex flex-1 items-center gap-2" aria-current={ativa ? "step" : undefined}>
            <span
              className={cn(
                "type-caption grid size-6 shrink-0 place-items-center rounded-full font-semibold",
                feita ? "bg-success text-success-foreground" : ativa ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground",
              )}
            >
              {feita ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : n}
            </span>
            <span className={cn("type-label hidden sm:inline", ativa ? "text-foreground" : "text-muted-foreground")}>{nome}</span>
            {n < etapas.length && <span aria-hidden="true" className={cn("h-px flex-1", feita ? "bg-success" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}
