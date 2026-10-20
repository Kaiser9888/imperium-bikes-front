"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { UserRound } from "lucide-react"

import { AppShell } from "@/components/layout/app-shell"
import { PerfilView, PerfilViewSkeleton, type PerfilResumo } from "@/components/perfil/PerfilView"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import api from "@/lib/api"
import { sellerProductService, type ProdutoItem } from "@/services/publish/seller-products.service"

type Estado =
    | { status: "loading" }
    | { status: "nao-encontrado" }
    | { status: "error" }
    | { status: "ok"; perfil: PerfilResumo; produtos: ProdutoItem[] }

export default function PerfilPublicoPage() {
    const params = useParams<{ id: string }>()
    const id = params?.id
    const [estado, setEstado] = useState<Estado>({ status: "loading" })

    const carregar = useCallback(async (userId: string) => {
        setEstado({ status: "loading" })
        try {
            const [{ data }, produtos] = await Promise.all([
                api.get(`/api/users/${userId}`),
                // Anúncios falham sozinhos: o perfil continua aparecendo
                sellerProductService.listBySeller(userId).catch(() => []),
            ])
            setEstado({
                status: "ok",
                // O backend já devolve só anúncios ativos; o filtro protege contra mudanças
                produtos: produtos.filter((p) => (p.status ?? "ATIVO") === "ATIVO"),
                perfil: {
                    id: String(data.userId ?? userId),
                    nome: data.fullName || "Usuário",
                    avatarUrl: data.avatarUrl,
                    bio: data.bio,
                    cidade: data.city,
                    estado: data.state,
                    nivel: data.userLevel,
                    membroDesde: data.createdAt,
                    reputacao: data.reputationScore,
                    totalAvaliacoes: data.totalReviews,
                    sponsors: data.sponsors ?? [],
                },
            })
        } catch (cause) {
            const status = (cause as { response?: { status?: number } })?.response?.status
            setEstado({ status: status === 404 || status === 400 ? "nao-encontrado" : "error" })
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga ao abrir o perfil
        if (id) void carregar(id)
    }, [id, carregar])

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 lg:pt-10">
                {estado.status === "loading" && <PerfilViewSkeleton />}

                {estado.status === "nao-encontrado" && (
                    <EmptyState icon={UserRound} title="Usuário não encontrado" description="O perfil pode ter sido removido." />
                )}

                {estado.status === "error" && id && (
                    <ErrorState title="Não foi possível carregar este perfil" onRetry={() => carregar(id)} />
                )}

                {estado.status === "ok" && <PerfilView perfil={estado.perfil} produtos={estado.produtos} />}
            </main>
        </AppShell>
    )
}
