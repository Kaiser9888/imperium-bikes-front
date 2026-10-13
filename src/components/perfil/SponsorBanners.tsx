import { API_BASE_URL } from "@/lib/api-config"

export type Sponsor = { name?: string | null; imageUrl: string; linkUrl?: string | null }

/** Imagens enviadas ao backend voltam como caminho relativo (/api/files/...). */
export function sponsorImageUrl(imageUrl: string): string {
    return imageUrl.startsWith("/api/files/") ? `${API_BASE_URL}${imageUrl}` : imageUrl
}

/** Faixa de pequenos banners de patrocinadores no perfil. Não renderiza nada sem patrocinadores. */
export function SponsorBanners({ sponsors }: { sponsors: Sponsor[] }) {
    if (sponsors.length === 0) return null
    return (
        <section aria-labelledby="patrocinadores-title" className="mt-8">
            <h2 id="patrocinadores-title" className="type-label text-muted-foreground">
                Patrocinadores
            </h2>
            <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {sponsors.map((sponsor, index) => {
                    const banner = (
                        // eslint-disable-next-line @next/next/no-img-element -- imagem enviada pelo usuário, domínio variável
                        <img
                            src={sponsorImageUrl(sponsor.imageUrl)}
                            alt={sponsor.name || "Patrocinador"}
                            loading="lazy"
                            className="h-14 w-full rounded-lg border border-border bg-surface object-contain p-1.5"
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
        </section>
    )
}
