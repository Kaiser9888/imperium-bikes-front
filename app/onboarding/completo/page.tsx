// app/onboarding/completo/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";
import { useUserSync } from "@/lib/UserSyncContext";
import type { ContaConectadaResponse } from "@/types/contaConectada";

export default function OnboardingCompletoPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { isSynced } = useUserSync();
  const router = useRouter();

  const [status, setStatus] = useState<ContaConectadaResponse | null>(null);
  const [erro, setErro] = useState(false);
  const [segundosEsperando, setSegundosEsperando] = useState(0);

  // Mostra quanto tempo já se passou, para deixar claro que não travou —
  // só está esperando o backend (que pode estar "acordando" do cold start
  // do Render, o que já observamos levar até ~3-4 minutos na pior hipótese).
  useEffect(() => {
    const timer = setInterval(() => setSegundosEsperando((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !isSynced) return;

    apiFetch<ContaConectadaResponse>("/api/conta-conectada/atualizar-status", getToken, {
      method: "POST",
    })
      .then(setStatus)
      .catch((err) => {
        console.error("[OnboardingCompleto] Erro ao atualizar status:", err);
        setErro(true);
      });
  }, [isLoaded, isSignedIn, isSynced, getToken]);

  if (erro) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-2xl text-foreground mb-2">Não foi possível confirmar</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Tivemos um problema ao confirmar seus dados com a Stripe. Tente novamente pela carteira.
        </p>
        <button
          onClick={() => router.push("/carteira")}
          className="px-4 py-2.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
        >
          Voltar à carteira
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {status === null ? (
        <>
          <p className="text-sm text-muted-foreground">Confirmando seus dados com a Stripe...</p>
          {segundosEsperando > 15 && (
            <p className="text-xs text-muted-foreground mt-3">
              Isso pode levar até alguns minutos na primeira vez (nosso servidor
              às vezes precisa "acordar"). Aguarde...
              {segundosEsperando > 60 && ` (${Math.floor(segundosEsperando / 60)} min esperando)`}
            </p>
          )}
        </>
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