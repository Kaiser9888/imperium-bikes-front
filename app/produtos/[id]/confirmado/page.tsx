// app/pedidos/[id]/confirmado/page.tsx
"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";
import type { PedidoResponse } from "@/types/pedido";

export default function PedidoConfirmadoPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken, isLoaded } = useAuth();
  const [pedido, setPedido] = useState<PedidoResponse | null>(null);
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(async () => {
      try {
        const data = await apiFetch<PedidoResponse>(`/api/pedidos/${id}`, getToken);
        setPedido(data);
        if (data.status === "PAGO" || tentativas >= 10) {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
      setTentativas((t) => t + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLoaded, id, getToken, tentativas]);

  if (!pedido) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-muted-foreground">
        Confirmando pagamento...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {pedido.status === "PAGO" ? (
        <>
          <h1 className="font-heading text-2xl text-primary mb-2">Pagamento confirmado</h1>
          <p className="text-sm text-muted-foreground">
            Seu pedido foi pago e o vendedor já foi notificado.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-heading text-2xl text-foreground mb-2">Aguardando confirmação...</h1>
          <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos.</p>
        </>
      )}
    </div>
  );
}