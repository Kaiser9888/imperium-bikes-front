import { Link } from "@tanstack/react-router";
import { RotateCcw, ArrowRight } from "lucide-react";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card px-8 py-14 text-center">
            <p className="text-lg font-semibold text-foreground">Não foi possível carregar os vídeos</p>
            <p className="mt-2 text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
            <button
                onClick={onRetry}
                className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/60"
            >
                <RotateCcw className="size-4" />
                Tentar novamente
            </button>
        </div>
    );
}

export function EmptyState({
                               title = "Nenhum vídeo publicado",
                               description = "Seja o primeiro a publicar.",
                           }: {
    title?: string;
    description?: string;
}) {
    return (
        <div className="mx-auto max-w-md rounded-lg border border-border bg-card px-8 py-14 text-center">
            <p className="text-lg font-semibold text-foreground">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <Link
                to="/videos/upload"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
                Publicar vídeo
                <ArrowRight className="size-4" />
            </Link>
        </div>
    );
}