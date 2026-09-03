// app/onboarding/refresh/page.tsx
// A Stripe redireciona pra cá se o link de onboarding expirar no meio do processo
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { ContaConectadaResponse } from "@/types/contaConectada";

export default function OnboardingRefreshPage() {
  const { getToken, isLoaded } = useAuth();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    apiFetch<ContaConectadaResponse>("/api/conta-conectada/onboarding", getToken, {
      method: "POST",
    })
      .then((data) => {
        if (data.onboardingUrl) window.location.href = data.onboardingUrl;
      })
      .catch(() => setErro("Não foi possível gerar um novo link. Volte à carteira e tente de novo."));
  }, [isLoaded, getToken]);

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-muted-foreground">
      {erro ?? "Gerando um novo link de conexão..."}
    </div>
  );
}