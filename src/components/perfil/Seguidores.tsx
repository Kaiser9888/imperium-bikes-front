"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatInscritos } from "@/components/videos/SubscribeButton"
import api from "@/lib/api"

type Lado = "seguidores" | "seguindo"
type Pessoa = { userId: string; fullName?: string | null; avatarUrl?: string | null; city?: string | null; state?: string | null }
type Lista = { pessoas: Pessoa[]; pagina: number; fim: boolean; carregando: boolean }

const POR_PAGINA = 30
const ROTA: Record<Lado, string> = { seguidores: "followers", seguindo: "following" }
const VAZIA: Lista = { pessoas: [], pagina: -1, fim: false, carregando: false }

/**
 * "N seguidores · N seguindo" no perfil; tocar abre as listas.
 * No próprio perfil (dono), a lista "Seguindo" tem "Deixar de seguir".
 * `ajuste` soma no total de seguidores quando o visitante segue pelo botão do perfil.
 */
export function Seguidores({ userId, dono, ajuste = 0 }: { userId: string; dono: boolean; ajuste?: number }) {
    const [totais, setTotais] = useState<Record<Lado, number | null>>({ seguidores: null, seguindo: null })
    const [aberto, setAberto] = useState<Lado | null>(null)
    const [listas, setListas] = useState<Record<Lado, Lista>>({ seguidores: VAZIA, seguindo: VAZIA })

    useEffect(() => {
        let ativo = true
        const contar = (lado: Lado) =>
            api
                .get(`/api/users/${userId}/${ROTA[lado]}/count`)
                .then((r) => ativo && setTotais((t) => ({ ...t, [lado]: Number(r.data.count) })))
                .catch(() => {})
        void contar("seguidores")
        void contar("seguindo")
        return () => {
            ativo = false
        }
    }, [userId])

    const carregar = useCallback(
        async (lado: Lado) => {
            const atual = listas[lado]
            if (atual.carregando || atual.fim) return
            const pagina = atual.pagina + 1
            setListas((l) => ({ ...l, [lado]: { ...l[lado], carregando: true } }))
            try {
                const { data } = await api.get(`/api/users/${userId}/${ROTA[lado]}`, { params: { page: pagina, size: POR_PAGINA } })
                const novas: Pessoa[] = data.content ?? []
                setListas((l) => ({
                    ...l,
                    [lado]: { pessoas: [...l[lado].pessoas, ...novas], pagina, fim: Boolean(data.last ?? novas.length < POR_PAGINA), carregando: false },
                }))
            } catch {
                setListas((l) => ({ ...l, [lado]: { ...l[lado], carregando: false } }))
                toast.error("Não foi possível carregar a lista.")
            }
        },
        [listas, userId],
    )

    function abrir(lado: Lado) {
        setAberto(lado)
        if (listas[lado].pagina < 0) void carregar(lado)
    }

    async function deixarDeSeguir(pessoa: Pessoa) {
        const antes = listas.seguindo
        // Some na hora; volta se o servidor recusar
        setListas((l) => ({ ...l, seguindo: { ...l.seguindo, pessoas: l.seguindo.pessoas.filter((p) => p.userId !== pessoa.userId) } }))
        setTotais((t) => ({ ...t, seguindo: t.seguindo == null ? t.seguindo : t.seguindo - 1 }))
        try {
            await api.delete(`/api/users/${pessoa.userId}/follow`)
        } catch {
            setListas((l) => ({ ...l, seguindo: antes }))
            setTotais((t) => ({ ...t, seguindo: t.seguindo == null ? t.seguindo : t.seguindo + 1 }))
            toast.error("Não foi possível deixar de seguir.")
        }
    }

    const seguidores = totais.seguidores == null ? null : Math.max(0, totais.seguidores + ajuste)
    if (seguidores == null && totais.seguindo == null) return null

    const numero = (lado: Lado, valor: number | null, um: string, varios: string) =>
        valor == null ? null : (
            <button type="button" onClick={() => abrir(lado)} className="cursor-pointer rounded hover:text-foreground">
                <b className="font-semibold tabular-nums text-foreground">{formatInscritos(valor)}</b> {valor === 1 ? um : varios}
            </button>
        )

    return (
        <>
            <p className="type-body-small mt-3 flex flex-wrap items-center gap-x-3 text-muted-foreground">
                {numero("seguidores", seguidores, "seguidor", "seguidores")}
                {seguidores != null && totais.seguindo != null && <span aria-hidden="true">·</span>}
                {numero("seguindo", totais.seguindo, "seguindo", "seguindo")}
            </p>

            <Dialog open={aberto !== null} onOpenChange={(open) => !open && setAberto(null)}>
                <DialogContent className="max-h-[85vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>{aberto === "seguindo" ? "Seguindo" : "Seguidores"}</DialogTitle>
                        <DialogDescription className="sr-only">Lista de pessoas</DialogDescription>
                    </DialogHeader>
                    {aberto && (
                        <Tabs value={aberto} onValueChange={(v) => abrir(v as Lado)} className="min-h-0">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="seguidores">Seguidores</TabsTrigger>
                                <TabsTrigger value="seguindo">Seguindo</TabsTrigger>
                            </TabsList>
                            {(["seguidores", "seguindo"] as Lado[]).map((lado) => (
                                <TabsContent key={lado} value={lado} className="max-h-[60vh] overflow-y-auto">
                                    <ListaPessoas
                                        lista={listas[lado]}
                                        vazio={
                                            lado === "seguidores"
                                                ? dono ? "Ninguém segue você ainda." : "Ninguém segue este perfil ainda."
                                                : dono ? "Você ainda não segue ninguém." : "Este perfil ainda não segue ninguém."
                                        }
                                        onMais={() => carregar(lado)}
                                        onFechar={() => setAberto(null)}
                                        onDeixar={dono && lado === "seguindo" ? deixarDeSeguir : undefined}
                                    />
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

function ListaPessoas({
    lista,
    vazio,
    onMais,
    onFechar,
    onDeixar,
}: {
    lista: Lista
    vazio: string
    onMais: () => void
    onFechar: () => void
    onDeixar?: (p: Pessoa) => void
}) {
    if (lista.pessoas.length === 0) {
        if (lista.carregando || lista.pagina < 0) {
            return (
                <div className="flex flex-col gap-3 py-3">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            )
        }
        return <p className="type-body-small py-8 text-center text-muted-foreground">{vazio}</p>
    }

    return (
        <ul className="flex flex-col divide-y divide-border">
            {lista.pessoas.map((p) => {
                const local = [p.city, p.state].filter(Boolean).join(", ")
                return (
                    <li key={p.userId} className="flex items-center gap-3 py-3">
                        <Link href={`/perfil/${p.userId}`} onClick={onFechar} className="flex min-w-0 flex-1 items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element -- avatar do Clerk ou do backend, domínio variável */}
                            <img src={p.avatarUrl || "/placeholder.svg"} alt="" className="size-10 shrink-0 rounded-full bg-surface-muted object-cover" />
                            <span className="min-w-0">
                                <span className="type-label block truncate text-foreground">{p.fullName || "Usuário"}</span>
                                {local && <span className="type-caption block truncate text-muted-foreground">{local}</span>}
                            </span>
                        </Link>
                        {onDeixar && (
                            <Button type="button" size="sm" variant="outline" onClick={() => onDeixar(p)}>
                                Deixar de seguir
                            </Button>
                        )}
                    </li>
                )
            })}
            {!lista.fim && (
                <li className="py-3">
                    <Button type="button" variant="ghost" className="w-full" loading={lista.carregando} onClick={onMais}>
                        Ver mais
                    </Button>
                </li>
            )}
        </ul>
    )
}
