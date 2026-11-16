// components/carteira/SaldoCard.tsx
import type { CarteiraResponse } from "@/types/carteira";
import { formatarPreco } from "@/lib/format";


export default function SaldoCard({ carteira }: { carteira: CarteiraResponse }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Disponível
        </span>
        {/* Verde: dinheiro que já é seu (vermelho passava a ideia de dívida) */}
        <span className="font-heading text-3xl text-success">
          {formatarPreco(carteira.saldoDisponivel)}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          Já é seu. O Stripe deposita no seu banco sozinho: venda paga com Pix leva
          uns 2 dias úteis, com cartão pode levar até 30 dias.
        </span>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Pendente
        </span>
        <span className="font-heading text-3xl text-foreground">
          {formatarPreco(carteira.saldoPendente)}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          Liberado quando o comprador confirma a entrega ou o prazo para reclamar acaba
        </span>
      </div>
    </div>
  );
}