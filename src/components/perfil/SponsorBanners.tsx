import Link from "next/link"
import { Megaphone, Plus } from "lucide-react"

import { API_BASE_URL } from "@/lib/api-config"

export type Sponsor = { name?: string | null; imageUrl: string; linkUrl?: string | null }

/** Imagens enviadas ao backend voltam como caminho relativo (/api/files/...). */
export function sponsorImageUrl(imageUrl: string): string {
    return imageUrl.startsWith("/api/files/") ? `${API_BASE_URL}${imageUrl}` : imageUrl
}

/**
 * Marcas que patrocinam o usuário. Para visitantes, não renderiza nada sem patrocinadores.
 * Com `gerenciarHref` (perfil do dono), mostra o atalho de edição e um convite quando está vazio.
 */
export function SponsorBanners({ sponsors, gerenciarHref }: { sponsors: Sponsor[]; gerenciarHref?: string }) {
    if (sponsors.length === 0 && !gerenciarHref) return null
    return (
        <section aria-labelledby="patrocinadores-title" className="mt-8">
            <div className="flex items-center justify-between gap-3">
                <h2 id="patrocinadores-title" className="type-label uppercase tracking-wider text-muted-foreground">
                    Marcas parceiras
                </h2>
                {gerenciarHref && sponsors.length > 0 && (
                    <Link href={gerenciarHref} className="type-label text-primary hover:underline">
                        Gerenciar
                    </Link>
                )}
            </div>

            {sponsors.length === 0 ? (
                <Link
                    href={gerenciarHref!}
                    className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-4 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                >
                    <Megaphone className="size-5 shrink-0" aria-hidden="true" />
                    <span className="type-body-small flex-1">Mostre no seu perfil as marcas que te patrocinam.</span>
                    <Plus className="size-4 shrink-0" aria-hidden="true" />
                </Link>
            ) : (
                <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {sponsors.map((sponsor, index) => {
                        const banner = (
                            // eslint-disable-next-line @next/next/no-img-element -- imagem enviada pelo usuário, domínio variável
                            <img
                                src={sponsorImageUrl(sponsor.imageUrl)}
                                alt={sponsor.name || "Patrocinador"}
                                loading="lazy"
                                className="h-16 w-full rounded-xl border border-border bg-surface object-contain p-2 transition-colors hover:border-primary/40"
                            />
                        )
                        return (
                            <li key={`${sponsor.imageUrl}-${index}`}>
                                {sponsor.linkUrl ? (
                                    <a href={sponsor.linkUrl} target="_blank" rel="noopener noreferrer sponsored" title={sponsor.name ?? undefined}>
                                        {banner}
                                    </a>
                                ) : (
                                    banner
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </section>
    )
}
