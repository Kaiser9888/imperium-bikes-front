// app/produtos/[id]/comprar/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { apiFetch } from "@/lib/apiClient";
import type { PedidoResponse } from "@/types/pedido";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function ComprarPage() {
  const { id: produtoId } = useParams<{ id: string }>();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [pedido, setPedido] = useState<PedidoResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    apiFetch<PedidoResponse>("/api/pedidos", getToken, {
      method: "POST",
      body: JSON.stringify({ produtoId }),
    })
      .then(setPedido)
      .catch((e) => setErro(e.message || "Não foi possível iniciar a compra."))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, produtoId, getToken, router]);

  if (!isLoaded || loading) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-muted-foreground">Preparando pagamento...</div>;
  }
  if (erro) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-destructive">{erro}</div>;
  }
  if (!pedido?.clientSecret) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-destructive">Não foi possível carregar o pagamento.</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="font-heading text-2xl text-foreground mb-1">Finalizar compra</h1>
      <p className="text-lg text-muted-foreground mb-6">
        Total: {pedido.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>

      <Elements stripe={getStripe()} options={{ clientSecret: pedido.clientSecret, locale: "pt-BR" }}>
        <CheckoutForm pedidoId={pedido.id} />
      </Elements>
    </div>
  );
}