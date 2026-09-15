// app/checkout/sucesso/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CheckoutSucessoPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-muted-foreground">Carregando...</div>}>
      <CheckoutSucessoContent />
    </Suspense>
  );
}

function CheckoutSucessoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const paymentIntentStatus = searchParams.get("redirect_status"); // vem do Stripe

  const sucesso = paymentIntentStatus === "succeeded" || paymentIntentStatus === null;

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {sucesso ? (
        <>
          <h1 className="font-heading text-2xl text-primary mb-2">Pagamento confirmado!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Seu pedido {orderId ? `#${orderId.slice(0, 8)}` : ""} foi recebido. O vendedor será notificado
            para enviar o produto.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-heading text-2xl text-foreground mb-2">Pagamento não concluído</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Algo deu errado ao confirmar o pagamento. Nenhum valor foi cobrado com sucesso.
          </p>
        </>
      )}
      <button
        onClick={() => router.push("/")}
        className="px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium"
      >
        Voltar ao início
      </button>
    </div>
  );
}