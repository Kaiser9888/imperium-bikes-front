"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { BellRing, Check, Plus } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/api";
import { useUserSync } from "@/lib/UserSyncContext";
import { cn } from "@/lib/utils";

type Props = {
  /** Id do criador no backend. */
  userId?: string;
  /** "dark": sobre vídeo (Memento); "compact": só o ícone de +. */
  variant?: "default" | "dark" | "compact";
  /** Mostra "N inscritos" ao lado. */
  showCount?: boolean;
  className?: string;
};

export function formatInscritos(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(".", ",")} mil`;
  return String(n);
}

/** Inscrever-se no canal (seguir o criador). Some no próprio canal. */
export function SubscribeButton({ userId, variant = "default", showCount = false, className }: Props) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const { backendUserId } = useUserSync();
  const [inscrito, setInscrito] = useState(false);
  const [total, setTotal] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    api.get(`/api/users/${userId}/followers/count`).then((r) => ativo && setTotal(r.data.count)).catch(() => {});
    if (isSignedIn) {
      api.get(`/api/users/${userId}/is-following`).then((r) => ativo && setInscrito(Boolean(r.data.isFollowing))).catch(() => {});
    }
    return () => {
      ativo = false;
    };
  }, [userId, isSignedIn]);

  if (!userId || (backendUserId && backendUserId === userId)) return null;

  async function alternar() {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setOcupado(true);
    const antes = inscrito;
    // Otimista: muda já e desfaz se o servidor recusar
    setInscrito(!antes);
    setTotal((t) => (t == null ? t : t + (antes ? -1 : 1)));
    try {
      if (antes) await api.delete(`/api/users/${userId}/follow`);
      else await api.post(`/api/users/${userId}/follow`);
      if (!antes) toast("Inscrição feita. Você vai ver mais deste canal.");
    } catch {
      setInscrito(antes);
      setTotal((t) => (t == null ? t : t + (antes ? 1 : -1)));
      toast.error("Não foi possível atualizar a inscrição.");
    } finally {
      setOcupado(false);
    }
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={alternar}
        disabled={ocupado}
        aria-pressed={inscrito}
        aria-label={inscrito ? "Cancelar inscrição" : "Inscrever-se"}
        className={cn(
          "grid size-5 cursor-pointer place-items-center rounded-full text-white shadow ring-2 ring-black/40 transition",
          inscrito ? "bg-white text-black" : "bg-primary",
          className,
        )}
      >
        {inscrito ? <Check className="size-3" aria-hidden="true" /> : <Plus className="size-3" aria-hidden="true" />}
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showCount && total != null && (
        <span className={cn("type-caption tabular-nums", variant === "dark" ? "text-white/70" : "text-muted-foreground")}>
          {formatInscritos(total)} {total === 1 ? "inscrito" : "inscritos"}
        </span>
      )}
      <button
        type="button"
        onClick={alternar}
        disabled={ocupado}
        aria-pressed={inscrito}
        className={cn(
          "type-label inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-4 transition-colors disabled:opacity-60",
          inscrito
            ? variant === "dark"
              ? "bg-white/15 text-white hover:bg-white/25"
              : "bg-surface-muted text-foreground hover:bg-border"
            : variant === "dark"
              ? "bg-white text-black hover:bg-white/90"
              : "bg-foreground text-background hover:bg-foreground/85",
        )}
      >
        {inscrito ? <BellRing className="size-4" aria-hidden="true" /> : null}
        {inscrito ? "Inscrito" : "Inscrever-se"}
      </button>
    </div>
  );
}
