import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

/** Telas de conta, pagamento e painel não interessam ao Google. */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/admin",
                "/carrinho",
                "/carteira",
                "/chat",
                "/checkout",
                "/configuracoes",
                "/notificacoes",
                "/onboarding",
                "/pedido",
                "/pedidos",
                "/perfil$",
                "/publicar",
                "/vendedor",
                "/videos/meus-videos",
                "/videos/monetizacao",
                "/videos/upload",
                "/videos/memento/upload",
                "/videos/live",
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
