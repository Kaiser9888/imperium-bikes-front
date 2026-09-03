// components/carteira/StripeStatusBanner.tsx
"use client";

import type { ContaConectadaResponse } from "@/types/contaConectada";
import ConnectStripeButton from "./ConnectStripeButton";

export default function StripeStatusBanner({ status }: { status: ContaConectadaResponse }) {
  if (status.onboardingCompleto) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-verdigris/30 bg-verdigris/5 px-4 py-3">
        <span className="wax-seal flex h-6 w-6 items-center justify-center rounded-full bg-verdigris text-[11px] font-bold text-white">
          ✓
        </span>
        <span className="text-sm text-foreground">
          Sua conta está conectada e pronta para receber pagamentos.
        </span>
      </div>
    );
  }

  if (status.temConta && !status.onboardingCompleto) {
    return (
      <div className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-4">
        <p className="text-sm text-foreground mb-3">
          Seu cadastro na Stripe está incompleto. Finalize para poder receber
          os valores das suas vendas.
        </p>
        <ConnectStripeButton />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted px-4 py-4">
      <p className="text-sm text-foreground mb-3">
        Para vender e receber pagamentos, você precisa conectar uma conta na
        Stripe. Leva poucos minutos.
      </p>
      <ConnectStripeButton />
    </div>
  );
}