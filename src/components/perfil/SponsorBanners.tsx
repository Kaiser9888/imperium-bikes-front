import type { ReactNode } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { API_BASE_URL } from "@/lib/api-config"

export type Sponsor = { name?: string | null; imageUrl: string; linkUrl?: string | null }

/** Imagens enviadas ao backend voltam como caminho relativo (/api/files/...). */
export function sponsorImageUrl(imageUrl: string): string {
    return imageUrl.startsWith("/api/files/") ? `${API_BASE_URL}${imageUrl}` : imageUrl
}

/**
 * Marcas que patrocinam o usuário, dentro do cartão do perfil (logo abaixo do nome).
 * Para visitantes, não renderiza nada sem patrocinadores.
 * Com `gerenciarHref` (perfil do dono), mostra o atalho de edição e um convite quando está vazio.
 */
export function SponsorBanners({ sponsors, gerenciarHref }: { sponsors: Sponsor[]; gerenciarHref?: string }) {
    if (sponsors.length === 0 && !gerenciarHref) return null
    // Dono sem patrocinador: só um atalho discreto, sem ocupar uma seção vazia
    if (sponsors.length === 0) {
        return (
            <Link href={gerenciarHref!} className="type-caption mt-3 inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Plus className="size-3.5" aria-hidden="true" />
                Adicionar marcas que te patrocinam
            </Link>
        )
    }
    // O primeiro é o patrocinador principal: banner largo; os outros viram logos numa faixa abaixo
    const [principal, ...outros] = sponsors
    return (
        <section aria-labelledby="patrocinadores-title" className="mt-5">
            <div className="flex items-center gap-3">
                <h2 id="patrocinadores-title" className="type-label text-foreground">
                    Patrocinado por
                </h2>
                {gerenciarHref && (
                    <Link href={gerenciarHref} className="type-caption ml-auto text-primary hover:underline">
                        Gerenciar
                    </Link>
                )}
            </div>

            <SponsorLink sponsor={principal} className="mt-2 block max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element -- imagem enviada pelo usuário, domínio variável */}
                <img
                    src={sponsorImageUrl(principal.imageUrl)}
                    alt={principal.name || "Patrocinador"}
                    loading="lazy"
                    className="h-20 w-full rounded-lg bg-background object-cover ring-1 ring-border transition-shadow hover:ring-primary/50"
                />
            </SponsorLink>

            {outros.length > 0 && (
                <ul className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
                    {outros.map((sponsor, index) => (
                        <li key={`${sponsor.imageUrl}-${index}`} className="shrink-0">
                            <SponsorLink sponsor={sponsor} className="block">
                                {/* eslint-disable-next-line @next/next/no-img-element -- imagem enviada pelo usuário, domínio variável */}
                                <img
                                    src={sponsorImageUrl(sponsor.imageUrl)}
                                    alt={sponsor.name || "Patrocinador"}
                                    loading="lazy"
                                    className="h-14 w-32 rounded-lg bg-background object-contain p-1.5 ring-1 ring-border transition-shadow hover:ring-primary/50"
                                />
                            </SponsorLink>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

function SponsorLink({ sponsor, className, children }: { sponsor: Sponsor; className?: string; children: ReactNode }) {
    if (!sponsor.linkUrl) return <div className={className}>{children}</div>
    return (
        <a href={sponsor.linkUrl} target="_blank" rel="noopener noreferrer sponsored" title={sponsor.name ?? undefined} className={className}>
            {children}
        </a>
    )
}
