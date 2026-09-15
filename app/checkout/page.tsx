// app/checkout/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { apiFetch } from "@/lib/apiClient";
import { useUserSync } from "@/lib/UserSyncContext";
import CheckoutForm from "@/components/checkout/CheckoutForm";

interface CheckoutResponse {
  orderId: string;
  clientSecret: string;
  valorProduto: number;
}

export default function CheckoutPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { isSynced } = useUserSync();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("productId");

  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isSynced) return;

    if (!productId) {
      setErro("Produto não especificado.");
      return;
    }

    apiFetch<CheckoutResponse>("/api/orders", getToken, {
      method: "POST",
      body: JSON.stringify({ productId }),
    })
      .then(setCheckout)
      .catch((err) => {
        console.error("[Checkout] Erro ao criar pedido:", err);
        setErro("Não foi possível iniciar o pagamento. Tente novamente.");
      });
  }, [isLoaded, isSignedIn, isSynced, productId, getToken]);

  if (!isLoaded || !isSignedIn || !isSynced) {
    return <StatusMessage>Preparando checkout...</StatusMessage>;
  }

  if (erro) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm text-destructive mb-6">{erro}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!checkout) {
    return <StatusMessage>Preparando checkout...</StatusMessage>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-heading text-2xl text-foreground mb-1">Finalizar compra</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Pagamento processado com segurança pela Stripe.
      </p>

      <Elements
        stripe={getStripe()}
        options={{
          clientSecret: checkout.clientSecret,
          locale: "pt-BR",
        }}
      >
        <CheckoutForm orderId={checkout.orderId} valorProduto={checkout.valorProduto} />
      </Elements>
    </div>
  );
}

function StatusMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}