import { Logo } from "@/components/layout/logo"
import { BackButton } from "@/components/ui/back-button"
import { cn } from "@/lib/utils"

/**
 * Cabeçalho das páginas de tela cheia (Meus anúncios, Minhas vendas, Novo evento, Admin, Novo anúncio):
 * Voltar | título | orca. Um só para todas, em vez de cada página montar o seu.
 */
export function TopoFocado({ titulo, voltarPara, largura = "max-w-5xl" }: {
    titulo: string
    /** Destino do Voltar quando a página foi aberta direto (sem página anterior no site). */
    voltarPara: string
    largura?: string
}) {
    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
            <div className={cn("mx-auto flex items-center gap-2 px-3 py-2.5 md:px-6", largura)}>
                <BackButton href={voltarPara} />
                <h1 className="font-heading truncate text-lg font-bold">{titulo}</h1>
                <Logo compact className="ml-auto" />
            </div>
        </header>
    )
}
