// components/carteira/ExtratoList.tsx
import type { TransacaoResponse } from "@/types/carteira";

const LABELS_TIPO: Record<TransacaoResponse["tipo"], string> = {
  VENDA_PENDENTE: "Venda (aguardando liberação)",
  VENDA_LIBERADA: "Venda liberada",
  ESTORNO: "Estorno",
  SAQUE: "Saque",
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ExtratoList({ transacoes }: { transacoes: TransacaoResponse[] }) {
  if (transacoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Nenhuma transação ainda.
      </p>
    );
  }

  return (
    <ul className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
      {transacoes.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-medium text-foreground">
              {LABELS_TIPO[t.tipo]}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {t.descricao}
            </span>
            <span className="text-xs text-muted-foreground/70">
              {formatarData(t.criadoEm)}
            </span>
          </div>
          <span
            className={`text-sm font-semibold whitespace-nowrap ${
              t.valor < 0 ? "text-destructive" : "text-verdigris"
            }`}
          >
            {t.valor < 0 ? "-" : "+"} {formatarMoeda(Math.abs(t.valor))}
          </span>
        </li>
      ))}
    </ul>
  );
}