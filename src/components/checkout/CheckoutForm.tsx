// components/checkout/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

interface CheckoutFormProps {
  orderId: string;
  valorProduto: number;
}

export default function CheckoutForm({ orderId, valorProduto }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErro(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe redireciona pra cá se o método de pagamento exigir uma
        // etapa extra (ex: 3D Secure). Se não exigir, o confirmPayment já
        // resolve aqui mesmo, sem redirecionar.
        return_url: `${window.location.origin}/checkout/sucesso?orderId=${orderId}`,
      },
    });

    // Só chega aqui se der erro ANTES do redirect (ex: cartão recusado na
    // hora). Se confirmar sem precisar de etapa extra, o Stripe também
    // pode resolver sem navegar — nesse caso, mostramos sucesso direto.
    if (error) {
      setErro(error.message || "Não foi possível processar o pagamento.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {erro && (
        <p className="text-sm text-destructive" role="alert">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-4 py-3 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processando..." : `Pagar R$ ${valorProduto.toFixed(2).replace(".", ",")}`}
      </button>
    </form>
  );
}