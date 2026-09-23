"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  User,
} from "lucide-react";

export default function ProdutoPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* GALERIA */}
          <section>
            <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Imagem do produto
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    ID do produto: {id}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((numero) => (
                <div
                  key={numero}
                  className="aspect-square rounded-xl border border-border bg-muted"
                />
              ))}
            </div>
          </section>

          {/* INFORMAÇÕES */}
          <section>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Bicicletas
                </p>

                <h1 className="mt-1 font-heading text-3xl font-semibold">
                  Bicicleta de teste Imperium Bikes
                </h1>
              </div>

              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border transition hover:bg-muted"
                aria-label="Favoritar produto"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6">
              <p className="text-3xl font-semibold">
                R$ 5.000,00
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Produto de teste
              </p>
            </div>

            <div className="my-6 h-px bg-border" />

            {/* LOCALIZAÇÃO */}
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Localização
                </p>

                <p className="text-sm text-muted-foreground">
                  Cidade / Estado do vendedor
                </p>
              </div>
            </div>

            {/* COMPRA */}
            <div className="mt-6 space-y-3">
              <Link
                href={`/produtos/${id}/comprar`}
className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
  >
  <ShoppingCart className="h-5 w-5" />
  Comprar
  </Link>

<button
  type="button"
  className="w-full rounded-xl border border-border px-5 py-3.5 text-sm font-medium transition hover:bg-muted"
>
  Fazer uma pergunta
</button>
</div>

{/* SEGURANÇA */}
<div className="mt-6 rounded-2xl border border-border p-4">
  <div className="flex items-start gap-3">
    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

    <div>
      <p className="text-sm font-medium">
        Compra protegida
      </p>

      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Informações sobre pagamento, entrega e proteção
        da compra aparecerão aqui.
      </p>
    </div>
  </div>
</div>

{/* VENDEDOR */}
<div className="mt-4 rounded-2xl border border-border p-4">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
      <User className="h-5 w-5" />
    </div>

    <div>
      <p className="text-sm font-medium">
        Vendedor de teste
      </p>

      <p className="text-xs text-muted-foreground">
        Membro do Imperium Bikes
      </p>
    </div>
  </div>
</div>
</section>
</div>

{/* DESCRIÇÃO */}
<section className="mt-10 border-t border-border pt-8">
  <h2 className="font-heading text-2xl font-semibold">
    Descrição
  </h2>

  <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
    Esta é uma página de produto de teste do Imperium Bikes.

    O objetivo desta página é verificar se a rota dinâmica,
    o ID do produto e o fluxo até a página de compra estão
    funcionando corretamente.

    Depois que a rota estiver funcionando, substituiremos
    estes dados pelos dados reais vindos do backend.
  </p>
</section>

{/* ID PARA DEBUG */}
<section className="mt-8 rounded-2xl border border-dashed border-border p-4">
  <p className="text-xs text-muted-foreground">
    DEBUG
  </p>

  <p className="mt-1 font-mono text-sm">
    Produto ID: {id}
  </p>
</section>
</div>
</main>
);
}

