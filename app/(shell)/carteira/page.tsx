// app/carteira/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/apiClient";
import { useUserSync } from "@/lib/UserSyncContext";
import type { CarteiraResponse, TransacaoResponse, PageResponse } from "@/types/carteira";
import type { ContaConectadaResponse } from "@/types/contaConectada";
import SaldoCard from "@/components/carteira/SaldoCard";
import ExtratoList from "@/components/carteira/ExtratoList";
import StripeStatusBanner from "@/components/carteira/StripeStatusBanner";
import { Loader } from "@/components/ui/loader";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { PageHeading } from "@/components/layout/page-heading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CarteiraPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  // Espera o POST /api/users/sync terminar antes de disparar qualquer
  // chamada autenticada. Isso garante que exista no máximo UMA tentativa
  // de criar o usuário no banco por login (a do /users/sync), em vez de
  // quatro requisições concorrentes brigando para criar o mesmo registro.
  const { isSynced, syncError } = useUserSync();

  const [carteira, setCarteira] = useState<CarteiraResponse | null>(null);
  const [statusConta, setStatusConta] = useState<ContaConectadaResponse | null>(null);
  const [extrato, setExtrato] = useState<TransacaoResponse[]>([]);
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarCarteira = useCallback(async () => {
    const data = await apiFetch<CarteiraResponse>("/api/carteira", getToken);
    setCarteira(data);
  }, [getToken]);

  const carregarStatusConta = useCallback(async () => {
    const data = await apiFetch<ContaConectadaResponse>("/api/conta-conectada/status", getToken);
    setStatusConta(data);
  }, [getToken]);

  const carregarExtrato = useCallback(async (page: number) => {
    const data = await apiFetch<PageResponse<TransacaoResponse>>(
      `/api/carteira/extrato?page=${page}&size=10`,
      getToken
    );
    setExtrato(data.content);
    setTotalPaginas(data.totalPages);
  }, [getToken]);

  useEffect(() => {
    // Além de logado, agora também esperamos o sync inicial terminar.
    if (!isLoaded || !isSignedIn || !isSynced) return;
    setLoading(true);
    Promise.all([carregarCarteira(), carregarStatusConta(), carregarExtrato(pagina)])
      .catch(() => setErro("Não foi possível carregar sua carteira."))
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, isSynced, pagina, carregarCarteira, carregarStatusConta, carregarExtrato]);

  if (!isLoaded) return <Loader className="py-24" />;
  if (!isSignedIn) {
    return (
      <EmptyState
        icon={Wallet}
        title="Entre para ver sua carteira"
        description="Saldo das vendas e inscrições, e o extrato."
        action={<Button asChild size="lg"><Link href="/sign-in?redirect_url=%2Fcarteira">Entrar</Link></Button>}
      />
    );
  }
  // Sem o sync a carteira nunca carrega: avisa em vez de ficar em "Preparando" para sempre
  if (syncError) return <StatusMessage error>Não foi possível preparar sua conta. Recarregue a página.</StatusMessage>;
  if (!isSynced) return <Loader className="py-24" />;
  if (loading) return <Loader className="py-24" />;
  if (erro) return <StatusMessage error>{erro}</StatusMessage>;

  return (
    <main className="max-w-2xl mx-auto px-4 pb-10 pt-4">
      <PageHeading title="Carteira" description="Saldo das vendas e inscrições, e o extrato." back={{ href: "/vendedor", label: "Central do vendedor" }} />

      {statusConta && (
        <div className="mt-6">
          <StripeStatusBanner status={statusConta} />
        </div>
      )}

      {carteira && <div className="mt-6"><SaldoCard carteira={carteira} /></div>}

      <div className="mt-10">
        <h2 className="font-heading text-lg text-foreground mb-3">Extrato</h2>
        <ExtratoList transacoes={extrato} />

        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <button
              disabled={pagina === 0}
              onClick={() => setPagina((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
            >
              Anterior
            </button>
            <span>
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button
              disabled={pagina + 1 >= totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
              className="px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function StatusMessage({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <div className={`max-w-2xl mx-auto px-4 py-16 text-center text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}>
      {children}
    </div>
  );
}
