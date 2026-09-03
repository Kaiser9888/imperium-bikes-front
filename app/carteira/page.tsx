// app/carteira/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { CarteiraResponse, TransacaoResponse, PageResponse } from "@/types/carteira";
import SaldoCard from "@/components/carteira/SaldoCard";
import ExtratoList from "@/components/carteira/ExtratoList";

export default function CarteiraPage() {
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const [carteira, setCarteira] = useState<CarteiraResponse | null>(null);
    const [extrato, setExtrato] = useState<TransacaoResponse[]>([]);
    const [pagina, setPagina] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregarCarteira = useCallback(async () => {
        const data = await apiFetch<CarteiraResponse>("/api/carteira", getToken);
        setCarteira(data);
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
        if (!isLoaded || !isSignedIn) return;
        setLoading(true);
        Promise.all([carregarCarteira(), carregarExtrato(pagina)])
          .catch(() => setErro("Não foi possível carregar sua carteira."))
          .finally(() => setLoading(false));
    }, [isLoaded, isSignedIn, pagina, carregarCarteira, carregarExtrato]);

    if (!isLoaded) return <StatusMessage>Carregando...</StatusMessage>;
    if (!isSignedIn) return <StatusMessage>Você precisa estar logado.</StatusMessage>;
    if (loading) return <StatusMessage>Carregando carteira...</StatusMessage>;
    if (erro) return <StatusMessage error>{erro}</StatusMessage>;

    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="font-heading text-3xl text-foreground mb-1">Minha Carteira</h1>
          <div className="rule-gold my-6" />

          {carteira && <SaldoCard carteira={carteira} />}

          <div className="mt-10">
              <h2 className="font-heading text-lg text-foreground mb-3">Extrato</h2>
              <ExtratoList transacoes={extrato} />

              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                  <button
                    disabled={pagina === 0}
                    onClick={() => setPagina((p) => Math.max(0, p - 1))}
                    className="px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
                  >
                      Anterior
                  </button>
                  <span>
            Página {pagina + 1} de {totalPaginas || 1}
          </span>
                  <button
                    disabled={pagina + 1 >= totalPaginas}
                    onClick={() => setPagina((p) => p + 1)}
                    className="px-3 py-1.5 rounded-md border border-border bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
                  >
                      Próxima
                  </button>
              </div>
          </div>
      </div>
    );
}

function StatusMessage({ children, error }: { children: React.ReactNode; error?: boolean }) {
    return (
      <div className={`max-w-2xl mx-auto px-4 py-16 text-center text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}>
          {children}
      </div>
    );
}