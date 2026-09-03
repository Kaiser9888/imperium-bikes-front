// app/onboarding/completo/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";
import type { ContaConectadaResponse } from "@/types/contaConectada";

export default function OnboardingCompletoPage() {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<ContaConectadaResponse | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    apiFetch<ContaConectadaResponse>("/api/conta-conectada/atualizar-status", getToken, {
      method: "POST",
    }).then(setStatus);
  }, [isLoaded, getToken]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {status === null ? (
        <p className="text-sm text-muted-foreground">Confirmando seus dados com a Stripe...</p>
      ) : status.onboardingCompleto ? (
        <>
          <h1 className="font-heading text-2xl text-primary mb-2">Conta conectada!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Você já pode vender e receber pagamentos na plataforma.
          </p>
          <button
            onClick={() => router.push("/carteira")}
            className="px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Ir para minha carteira
          </button>
        </>
      ) : (
        <>
          <h1 className="font-heading text-2xl text-foreground mb-2">Cadastro ainda incompleto</h1>
          <p className="text-sm text-muted-foreground mb-6">
            A Stripe ainda precisa de algumas informações. Volte à carteira para continuar.
          </p>
          <button
            onClick={() => router.push("/carteira")}
            className="px-4 py-2.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
          >
            Voltar à carteira
          </button>
        </>
      )}
    </div>
  );
}