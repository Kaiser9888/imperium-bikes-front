/**
 * Anunciar nos vídeos e monetização ficam fora do ar para o público: um depende do outro e
 * só voltam quando houver criadores ativos perto da meta. Liga com NEXT_PUBLIC_ANUNCIOS=1 na Vercel.
 */
export const ANUNCIOS_ABERTOS = process.env.NEXT_PUBLIC_ANUNCIOS === "1"
