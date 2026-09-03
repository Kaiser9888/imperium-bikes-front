// components/carteira/ConnectStripeButton.tsx
"use client";

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
      <button
        onClick={handleConectar}
        disabled={carregando}
        className="px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {carregando ? "Redirecionando..." : "Conectar conta para receber pagamentos"}
      </button>
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </div>
  );
}