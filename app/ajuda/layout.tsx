import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Central de Ajuda | Imperium Bikes",
    description: "Respostas sobre compras, vendas, eventos, vídeos, anúncios e pagamentos, e contato com o suporte.",
}

export default function AjudaLayout({ children }: { children: React.ReactNode }) {
    return children
}
