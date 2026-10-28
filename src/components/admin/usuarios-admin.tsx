"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Loader2, User } from "lucide-react"

import { DialogoMotivo, type PedidoMotivo } from "@/components/admin/dialogo-motivo"
import { usuarioAdminService, type StatusUsuario, type UsuarioAdmin } from "@/services/adminService"
import { mensagemDaApi } from "@/services/tournamentService"

const FILTROS: { id: StatusUsuario | "TODOS"; label: string }[] = [
    { id: "TODOS", label: "Todos" },
    { id: "SUSPENDED", label: "Suspensos" },
    { id: "BANNED", label: "Banidos" },
]

const STATUS: Record<StatusUsuario, { texto: string; cor: string }> = {
    ACTIVE: { texto: "Ativo", cor: "bg-success" },
    SUSPENDED: { texto: "Suspenso", cor: "bg-warning" },
    BANNED: { texto: "Banido", cor: "bg-destructive" },
    INACTIVE: { texto: "Inativo", cor: "bg-muted-foreground" },
}

/** Contas: suspender, banir e desbanir. */
export function UsuariosAdmin() {
    const [filtro, setFiltro] = useState<StatusUsuario | "TODOS">("TODOS")
    const [lista, setLista] = useState<UsuarioAdmin[] | null>(null)
    const [pagina, setPagina] = useState({ atual: 0, total: 0, elementos: 0 })
    const [erro, setErro] = useState<string | null>(null)
    const [pedido, setPedido] = useState<PedidoMotivo | null>(null)

    const carregar = useCallback(async (status: StatusUsuario | "TODOS", page: number) => {
        setErro(null)
        try {
            const r = await usuarioAdminService.listar(page, status === "TODOS" ? undefined : status)
            setLista((l) => (page === 0 ? r.content : [...(l ?? []), ...r.content]))
            setPagina({ atual: r.number, total: r.totalPages, elementos: r.totalElements })
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível carregar os usuários."))
            setLista((l) => l ?? [])
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- recarrega ao trocar o filtro
        setLista(null)
        void carregar(filtro, 0)
    }, [filtro, carregar])

    const mudarStatus = (id: string, status: StatusUsuario) =>
        setLista((l) => l?.map((u) => (u.userId === id ? { ...u, status } : u)) ?? null)

    function suspender(u: UsuarioAdmin) {
        setPedido({
            titulo: `Suspender ${u.fullName ?? "usuário"}?`,
            descricao: "A conta fica sem acesso pelo período escolhido.",
            rotulo: "Motivo",
            acao: "Suspender",
            perigo: true,
            comDias: true,
            confirmar: async (motivo, dias) => {
                await usuarioAdminService.suspender(u.userId, motivo, dias)
                mudarStatus(u.userId, "SUSPENDED")
            },
        })
    }

    function banir(u: UsuarioAdmin) {
        setPedido({
            titulo: `Banir ${u.fullName ?? "usuário"}?`,
            descricao: "A conta perde o acesso até ser desbanida.",
            rotulo: "Motivo",
            acao: "Banir",
            perigo: true,
            confirmar: async (motivo) => {
                await usuarioAdminService.banir(u.userId, motivo)
                mudarStatus(u.userId, "BANNED")
            },
        })
    }

    async function desbanir(u: UsuarioAdmin) {
        setErro(null)
        try {
            await usuarioAdminService.desbanir(u.userId)
            mudarStatus(u.userId, "ACTIVE")
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível reativar a conta."))
        }
    }

    async function descongelar(u: UsuarioAdmin) {
        setErro(null)
        try {
            await usuarioAdminService.descongelar(u.userId)
            setLista((l) => l?.map((x) => (x.userId === u.userId ? { ...x, congelada: false } : x)) ?? null)
        } catch (cause) {
            setErro(mensagemDaApi(cause, "Não foi possível descongelar a conta."))
        }
    }

    return (
        <section>
            <div className="flex flex-wrap items-center gap-6">
                {FILTROS.map((f) => (
                    <button key={f.id} type="button" onClick={() => setFiltro(f.id)} aria-pressed={filtro === f.id} className="line-btn line-btn--sm line-btn--muted">
                        {f.label}
                    </button>
                ))}
                {lista && <span className="ml-auto text-xs tabular-nums text-muted-foreground">{pagina.elementos} contas</span>}
            </div>

            {erro && <p role="alert" className="type-body-small mt-4 border-l-2 border-destructive pl-3 text-destructive">{erro}</p>}

            {lista === null ? (
                <Loader2 className="mt-8 size-5 animate-spin text-muted-foreground" />
            ) : lista.length === 0 ? (
                <p className="type-body-small mt-8 text-muted-foreground">Nenhuma conta com esse filtro.</p>
            ) : (
                <ul className="mt-5 divide-y divide-border border-y border-border">
                    {lista.map((u) => {
                        const st = STATUS[u.status] ?? STATUS.INACTIVE
                        return (
                            <li key={u.userId} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-muted">
                                    {u.avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element -- avatar do Clerk
                                        <img src={u.avatarUrl} alt="" className="size-full object-cover" />
                                    ) : (
                                        <User className="size-4 text-muted-foreground" aria-hidden="true" />
                                    )}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="flex items-center gap-2 truncate text-sm font-semibold">
                                        <Link href={`/perfil/${u.userId}`} className="truncate hover:underline">{u.fullName || "Sem nome"}</Link>
                                        {u.admin && <span className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-accent">admin</span>}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                                </div>
                                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className={`size-1.5 rounded-full ${st.cor}`} aria-hidden="true" />
                                    {st.texto}
                                </span>
                                {u.congelada && (
                                    <button
                                        type="button"
                                        onClick={() => descongelar(u)}
                                        title="Congelada pelo dono. Libere só depois de confirmar a identidade (documento, pedidos, cartão usado)."
                                        className="line-btn line-btn--sm"
                                    >
                                        Congelada · descongelar
                                    </button>
                                )}
                                {!u.admin && (
                                    <div className="flex gap-5">
                                        {u.status === "ACTIVE" ? (
                                            <>
                                                <button type="button" onClick={() => suspender(u)} className="line-btn line-btn--sm line-btn--muted">
                                                    Suspender
                                                </button>
                                                <button type="button" onClick={() => banir(u)} className="line-btn line-btn--sm line-btn--danger">
                                                    Banir
                                                </button>
                                            </>
                                        ) : (
                                            <button type="button" onClick={() => desbanir(u)} className="line-btn line-btn--sm">
                                                Reativar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}

            {lista && pagina.atual + 1 < pagina.total && (
                <button type="button" onClick={() => carregar(filtro, pagina.atual + 1)} className="line-btn line-btn--sm mt-6">
                    Carregar mais
                </button>
            )}

            <DialogoMotivo pedido={pedido} onFechar={() => setPedido(null)} />
        </section>
    )
}
