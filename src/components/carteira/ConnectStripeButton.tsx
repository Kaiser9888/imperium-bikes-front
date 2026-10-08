// components/carteira/ConnectStripeButton.tsx
"use client";
import { Button } from "@/components/ui/button"

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { ContaConectadaResponse } from "@/types/contaConectada";

export default function ConnectStripeButton() {
  const { getToken } = useAuth();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleConectar() {
    setCarregando(true);
    setErro(null);
    try {
      const data = await apiFetch<ContaConectadaResponse>(
        "/api/conta-conectada/onboarding",
        getToken,
        { method: "POST" }
      );
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch {
      setErro("Não foi possível iniciar a conexão com a Stripe.");
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleConectar}
        disabled={carregando}
       
      >
        {carregando ? "Redirecionando..." : "Conectar conta para receber pagamentos"}
      </Button>
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </div>
  );
}