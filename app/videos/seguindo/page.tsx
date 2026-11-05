"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { PlaySquare } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Loader } from "@/components/ui/loader";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

type VideoNovo = {
    id: string;
    title: string;
    message: string;
    actionUrl?: string;
    read: boolean;
    createdAt: string;
};

/**
 * Vídeos novos dos canais que a pessoa segue. Fica só aqui, na área de vídeos:
 * o sino principal é para vendas, pagamentos e avisos da plataforma.
 */
export default function SeguindoPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const [itens, setItens] = useState<VideoNovo[] | null>(null);
    const [falhou, setFalhou] = useState(false);

    useEffect(() => {
        if (!isSignedIn) return;
        api.get("/api/notifications/videos", { params: { size: 50 } })
            .then((r) => {
                setItens(r.data?.content ?? []);
                // Abriu a lista: os novos passam a vistos (o selo da aba some)
                void api.post("/api/notifications/videos/read-all").catch(() => {});
            })
            .catch(() => setFalhou(true));
    }, [isSignedIn]);

    if (!isLoaded) return <Loader />;
    if (!isSignedIn) {
        return (
            <EmptyState
                icon={PlaySquare}
                title="Entre para ver quem você segue"
                description="Os vídeos novos dos canais que você segue aparecem aqui."
                action={<Link href="/sign-in?redirect_url=/videos/seguindo" className="type-label text-primary underline">Entrar</Link>}
                className="py-16"
            />
        );
    }
    if (falhou) return <p role="alert" className="type-body-small px-4 py-10 text-center text-destructive">Não foi possível carregar. Tente de novo.</p>;
    if (itens === null) return <Loader />;
    if (itens.length === 0) {
        return (
            <EmptyState
                icon={PlaySquare}
                title="Nada novo por aqui"
                description="Siga os canais de que você gosta. Quando eles postarem, o vídeo aparece aqui, sem encher o seu sino."
                className="py-16"
            />
        );
    }

    return (
        <section className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
            <ul className="flex flex-col gap-2">
                {itens.map((item) => (
                    <li key={item.id}>
                        <Link
                            href={item.actionUrl ?? "/videos"}
                            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary/40"
                        >
                            <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", item.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                                <PlaySquare className="size-5" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="type-label block truncate text-foreground">{item.title}</span>
                                <span className="type-caption block truncate text-muted-foreground">{item.message}</span>
                            </span>
                            <span className="type-caption shrink-0 text-muted-foreground">
                                {new Date(item.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
