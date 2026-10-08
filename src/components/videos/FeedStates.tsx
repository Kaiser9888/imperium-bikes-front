import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState as BaseEmptyState } from "@/components/ui/empty-state";
import { ErrorState as BaseErrorState } from "@/components/ui/error-state";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
    return <BaseErrorState title="Não foi possível carregar os vídeos" onRetry={onRetry} />;
}

export function EmptyState({
    title = "Nenhum vídeo publicado",
    description = "Seja o primeiro a publicar.",
}: {
    title?: string;
    description?: string;
}) {
    return (
        <BaseEmptyState
            title={title}
            description={description}
            action={
                <Button asChild>
                    <Link href="/videos/upload">
                        Publicar vídeo
                        <ArrowRight aria-hidden="true" />
                    </Link>
                </Button>
            }
        />
    );
}
