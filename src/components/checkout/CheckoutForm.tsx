// components/checkout/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";

export default function CheckoutForm({ pedidoId }: { pedidoId: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessando(true);
    setErro(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pedidos/${pedidoId}/confirmado`,
      },
    });

    if (error) {
      setErro(error.message ?? "Não foi possível processar o pagamento.");
      setProcessando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="rounded-lg border border-border bg-card p-5">
        <PaymentElement />
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      <button
        type="submit"
        disabled={!stripe || processando}
        className="w-full py-3 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {processando ? "Processando..." : "Pagar agora"}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        O valor fica retido com segurança e só é liberado ao vendedor 7 dias
        após a confirmação de entrega.
      </p>
    </form>
  );
}