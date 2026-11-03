// components/carteira/ConnectStripeButton.tsx
"use client";
import { Button } from "@/components/ui/button"

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { ContaConectadaResponse } from "@/types/contaConectada";

/** Página para onde /onboarding/completo leva de volta depois do cadastro no Stripe. */
export const CHAVE_VOLTAR_ONBOARDING = "onboarding-voltar";

export default function ConnectStripeButton({
  voltarPara,
  texto = "Conectar conta para receber pagamentos",
  novaAba = false,
}: {
  voltarPara?: string;
  texto?: string;
  /** Abre o Stripe em outra aba, para não perder um formulário já preenchido nesta. */
  novaAba?: boolean;
}) {
  const { getToken } = useAuth();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleConectar() {
    setCarregando(true);
    setErro(null);
    // A aba nova precisa abrir no clique; depois do await o navegador bloquearia como pop-up
    const aba = novaAba ? window.open("", "_blank") : null;
    try {
      const data = await apiFetch<ContaConectadaResponse>(
        "/api/conta-conectada/onboarding",
        getToken,
        { method: "POST" }
      );
      if (data.onboardingUrl) {
        if (aba) {
          aba.location.href = data.onboardingUrl;
          setCarregando(false);
          return;
        }
        try {
          if (voltarPara) sessionStorage.setItem(CHAVE_VOLTAR_ONBOARDING, voltarPara);
        } catch {
          // sem armazenamento a volta cai na Carteira, como antes
        }
        window.location.href = data.onboardingUrl;
      }
    } catch (cause) {
      aba?.close();
      // 503: o backend já manda o motivo em português (ex.: recebimentos ainda em configuração)
      const motivo = cause instanceof Error ? cause.message.match(/^Erro 503: (.+)$/)?.[1] : undefined;
      setErro(motivo ?? "Não foi possível iniciar a conexão com a Stripe.");
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleConectar}
        disabled={carregando}

      >
        {carregando ? "Abrindo o Stripe..." : texto}
      </Button>
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </div>
  );
}
