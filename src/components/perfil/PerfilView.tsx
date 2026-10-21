"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CalendarDays, Clapperboard, MapPin, Medal, Star, Trophy, type LucideIcon } from "lucide-react"

import { ProdutoGrid } from "@/components/perfil/ProdutoGrid"
import { SponsorBanners, type Sponsor } from "@/components/perfil/SponsorBanners"
import { DenunciarButton } from "@/components/ui/denunciar-button"
import { VideoCard } from "@/components/videos/VideoCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchUserVideos } from "@/lib/videos/api"
import type { VideoItem } from "@/lib/videos/types"
import { cn } from "@/lib/utils"
import type { ProdutoItem } from "@/services/publish/seller-products.service"
import { tournamentService, type Participacao } from "@/services/tournamentService"

export type PerfilResumo = {
    /** ID do usuário no backend (UUID). */
    id: string
    nome: string
    username?: string | null
    avatarUrl?: string | null
    bio?: string | null
    cidade?: string | null
    estado?: string | null
    nivel?: string | null
    membroDesde?: string | null
    reputacao?: number | null
    totalAvaliacoes?: number | null
    sponsors: Sponsor[]
}

type Atividade =
    | { status: "loading" }
    | { status: "ok"; participacoes: Participacao[]; videos: VideoItem[] }

// NOVATO não ganha selo: é o nível de todo mundo que acabou de entrar
const NIVEIS: Record<string, string> = {
    VERIFICADO: "Verificado",
    PREMIUM: "Premium",
}

const dataCurta = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" })

function formatarData(iso?: string | null): string {
    if (!iso) return ""
    const data = new Date(iso)
    return Number.isNaN(data.getTime()) ? "" : dataCurta.format(data).replace(".", "")
}

/** Ouro, prata e bronze com as cores do tema. */
const PODIO: Record<number, { rotulo: string; classe: string }> = {
    1: { rotulo: "Campeão", classe: "bg-warning/12 text-warning" },
    2: { rotulo: "2º lugar", classe: "bg-surface-muted text-foreground" },
    3: { rotulo: "3º lugar", classe: "bg-primary/10 text-primary" },
}

export function PerfilView({
    perfil,
    produtos,
    dono = false,
    acoes,
    avatarExtra,
    aviso,
}: {
    perfil: PerfilResumo
    produtos: ProdutoItem[]
    /** true no próprio perfil: atalhos de gestão e textos na segunda pessoa. */
    dono?: boolean
    /** Botões ao lado do avatar (ex.: Editar perfil). */
    acoes?: React.ReactNode
    /** Sobreposto ao avatar (ex.: botão de trocar foto). */
    avatarExtra?: React.ReactNode
    /** Mensagem logo abaixo da bio (ex.: erro ao trocar foto). */
    aviso?: React.ReactNode
}) {
    const [atividade, setAtividade] = useState<Atividade>({ status: "loading" })

    useEffect(() => {
        let cancelado = false
        // Cada lista falha sozinha: sem torneios ou vídeos, o perfil continua aparecendo
        void Promise.all([
            tournamentService.participacoesDe(perfil.id).catch(() => []),
            fetchUserVideos(perfil.id).then((p) => p.content).catch(() => []),
        ]).then(([participacoes, videos]) => {
            if (!cancelado) setAtividade({ status: "ok", participacoes, videos })
        })
        return () => {
            cancelado = true
        }
    }, [perfil.id])

    const participacoes = atividade.status === "ok" ? atividade.participacoes : []
    const videos = atividade.status === "ok" ? atividade.videos : []
    const podios = participacoes
        .filter((p) => p.posicao !== null && p.posicao <= 3)
        .sort((a, b) => a.posicao! - b.posicao!)
    const vitorias = podios.filter((p) => p.posicao === 1).length
    const carregando = atividade.status === "loading"

    // Perfil leve: número ou aba sem nada não aparece (enquanto carrega, só o que já se sabe)
    const numeros = [
        { rotulo: "Anúncios", valor: produtos.length },
        { rotulo: "Torneios", valor: participacoes.length },
        { rotulo: "Vitórias", valor: vitorias, destaque: true },
        { rotulo: "Vídeos", valor: videos.length },
    ].filter((n) => n.valor > 0)
    const abas = [
        produtos.length > 0 && "anuncios",
        participacoes.length > 0 && "torneios",
        videos.length > 0 && "videos",
    ].filter(Boolean) as string[]

    const local = [perfil.cidade, perfil.estado].filter(Boolean).join(", ")
    const membroDesde = formatarData(perfil.membroDesde)
    const nivel = perfil.nivel ? NIVEIS[perfil.nivel] : undefined

    return (
        <>
            <section aria-label="Perfil" className="overflow-hidden rounded-2xl border border-border bg-surface">
                {/* Capa: faixa com a cor da marca, sem imagem */}
                <div
                    aria-hidden="true"
                    className="h-28 bg-[radial-gradient(120%_140%_at_0%_0%,var(--primary)_0%,transparent_55%),linear-gradient(135deg,var(--surface-muted),var(--surface-secondary))] opacity-90 sm:h-36"
                />

                <div className="px-5 pb-6 sm:px-8">
                    <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                        <div className="relative size-24 shrink-0 sm:size-28">
                            {/* eslint-disable-next-line @next/next/no-img-element -- avatar do Clerk ou do backend, domínio variável */}
                            <img
                                src={perfil.avatarUrl || "/placeholder.svg"}
                                alt=""
                                className="size-full rounded-full bg-surface-muted object-cover ring-4 ring-surface"
                            />
                            {avatarExtra}
                        </div>
                        {acoes && <div className="flex flex-wrap gap-2 sm:pb-1">{acoes}</div>}
                    </div>

                    <div className="mt-4 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="type-h1 min-w-0 truncate text-foreground">{perfil.nome}</h1>
                            {nivel && <StatusBadge tone="info">{nivel}</StatusBadge>}
                        </div>
                        {perfil.username && <p className="type-body-small text-muted-foreground">@{perfil.username}</p>}

                        <ul className="type-body-small mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-muted-foreground">
                            {local && (
                                <li className="flex items-center gap-1.5">
                                    <MapPin className="size-4 shrink-0" aria-hidden="true" />
                                    {local}
                                </li>
                            )}
                            {membroDesde && (
                                <li className="flex items-center gap-1.5">
                                    <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
                                    No Imperium desde {membroDesde}
                                </li>
                            )}
                            {!!perfil.totalAvaliacoes && perfil.reputacao != null && (
                                <li className="flex items-center gap-1.5">
                                    <Star className="size-4 shrink-0 fill-warning text-warning" aria-hidden="true" />
                                    {Number(perfil.reputacao).toFixed(1)} ({perfil.totalAvaliacoes} avaliações)
                                </li>
                            )}
                        </ul>

                        {perfil.bio && (
                            <p className="type-body mt-4 max-w-prose whitespace-pre-line text-pretty text-foreground">{perfil.bio}</p>
                        )}
                        {aviso}
                    </div>
                </div>

                {/* gap-px sobre fundo de borda desenha as divisórias entre os números */}
                {numeros.length > 0 && (
                    <dl
                        className={cn(
                            "grid gap-px border-t border-border bg-border",
                            numeros.length === 1 ? "grid-cols-1" : numeros.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
                            numeros.length === 2 && "sm:grid-cols-2",
                        )}
                    >
                        {numeros.map((n) => (
                            <Numero key={n.rotulo} rotulo={n.rotulo} valor={n.valor} destaque={n.destaque} />
                        ))}
                    </dl>
                )}
            </section>

            <SponsorBanners sponsors={perfil.sponsors} gerenciarHref={dono ? "/configuracoes/patrocinadores" : undefined} />
            {!dono && <DenunciarButton tipo="USER" id={perfil.id} className="mt-3" />}

            {carregando && abas.length === 0 && <ListaCarregando />}
            {!carregando && abas.length === 0 && (
                <p className="type-body-small mt-10 text-muted-foreground">
                    {dono ? (
                        <>
                            Seu perfil ainda está vazio.{" "}
                            <Link href="/vendedor" className="font-semibold text-primary underline underline-offset-2">Anuncie</Link>,{" "}
                            <Link href="/torneios" className="font-semibold text-primary underline underline-offset-2">participe de um evento</Link> ou{" "}
                            <Link href="/videos/upload" className="font-semibold text-primary underline underline-offset-2">publique um vídeo</Link>.
                        </>
                    ) : (
                        "Ainda não há anúncios, eventos ou vídeos por aqui."
                    )}
                </p>
            )}

            {abas.length > 0 && (
            <Tabs key={abas.join()} defaultValue={abas[0]} className="mt-10">
                <TabsList className="h-auto w-full justify-start gap-6 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
                    {abas.includes("anuncios") && <Aba value="anuncios" rotulo="Anúncios" total={produtos.length} />}
                    {abas.includes("torneios") && <Aba value="torneios" rotulo="Torneios" total={participacoes.length} />}
                    {abas.includes("videos") && <Aba value="videos" rotulo="Vídeos" total={videos.length} />}
                </TabsList>

                <TabsContent value="anuncios" className="mt-6">
                    <ProdutoGrid produtos={produtos} dono={dono} />
                </TabsContent>

                <TabsContent value="torneios" className="mt-6">
                    {carregando ? (
                        <ListaCarregando />
                    ) : participacoes.length === 0 ? (
                        <Vazio
                            icon={Trophy}
                            texto={dono ? "Você ainda não participou de torneios" : "Nenhum torneio por aqui ainda"}
                            acao={dono ? { href: "/torneios", rotulo: "Ver torneios abertos" } : undefined}
                        />
                    ) : (
                        <div className="flex flex-col gap-8">
                            {podios.length > 0 && (
                                <section aria-labelledby="conquistas-title">
                                    <h3 id="conquistas-title" className="type-label uppercase tracking-wider text-muted-foreground">
                                        Conquistas
                                    </h3>
                                    <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                                        {podios.map((p) => (
                                            <li key={p.id}>
                                                <Link
                                                    href={`/torneios/${p.torneioId}`}
                                                    className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/40"
                                                >
                                                    <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", PODIO[p.posicao!].classe)}>
                                                        {p.posicao === 1 ? (
                                                            <Trophy className="size-6" aria-hidden="true" />
                                                        ) : (
                                                            <Medal className="size-6" aria-hidden="true" />
                                                        )}
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="type-label block truncate text-foreground">{p.torneioNome}</span>
                                                        <span className="type-caption text-muted-foreground">
                                                            {PODIO[p.posicao!].rotulo}
                                                            {p.categoria && ` · ${p.categoria}`}
                                                        </span>
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            <section aria-labelledby="historico-title">
                                <h3 id="historico-title" className="type-label uppercase tracking-wider text-muted-foreground">
                                    Histórico
                                </h3>
                                <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">
                                    {participacoes.map((p) => (
                                        <li key={p.id}>
                                            <Link
                                                href={`/torneios/${p.torneioId}`}
                                                className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted"
                                            >
                                                <Trophy className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                                                <span className="min-w-0 flex-1">
                                                    <span className="type-label block truncate text-foreground">{p.torneioNome}</span>
                                                    <span className="type-caption text-muted-foreground">
                                                        {[p.categoria, formatarData(p.data)].filter(Boolean).join(" · ")}
                                                    </span>
                                                </span>
                                                {p.posicao !== null ? (
                                                    <span className="type-label shrink-0 tabular-nums text-foreground">{p.posicao}º</span>
                                                ) : (
                                                    <StatusBadge tone={p.finalizado ? "neutral" : "success"}>
                                                        {p.finalizado ? "Concluído" : "Inscrito"}
                                                    </StatusBadge>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="videos" className="mt-6">
                    {carregando ? (
                        <ListaCarregando />
                    ) : videos.length === 0 ? (
                        <Vazio
                            icon={Clapperboard}
                            texto={dono ? "Você ainda não publicou vídeos" : "Nenhum vídeo publicado"}
                            acao={dono ? { href: "/videos/upload", rotulo: "Publicar vídeo" } : undefined}
                        />
                    ) : (
                        <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                            {videos.map((video) => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
            )}
        </>
    )
}

function Numero({ rotulo, valor, destaque }: { rotulo: string; valor: number; destaque?: boolean }) {
    return (
        <div className="flex flex-col items-center gap-0.5 bg-surface px-3 py-4 text-center">
            <dt className="type-caption order-2 uppercase tracking-wider text-muted-foreground">{rotulo}</dt>
            <dd className={cn("type-h2 order-1 tabular-nums", destaque ? "text-warning" : "text-foreground")}>
                {valor}
            </dd>
        </div>
    )
}

function Aba({ value, rotulo, total }: { value: string; rotulo: string; total?: number }) {
    return (
        <TabsTrigger
            value={value}
            className="type-label -mb-px gap-2 rounded-none border-b-2 border-transparent px-0 pb-3 pt-1 text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
            {rotulo}
            {total !== undefined && (
                <span className="type-caption rounded-full bg-surface-muted px-2 py-0.5 tabular-nums text-muted-foreground">{total}</span>
            )}
        </TabsTrigger>
    )
}

function Vazio({ icon: Icon, texto, acao }: { icon: LucideIcon; texto: string; acao?: { href: string; rotulo: string } }) {
    return (
        <div className="flex flex-col items-center py-16 text-center">
            <Icon className="size-14 text-muted-foreground/30" aria-hidden="true" />
            <p className="type-label mt-4 text-muted-foreground">{texto}</p>
            {acao && (
                <Button asChild variant="outline" className="mt-6">
                    <Link href={acao.href}>{acao.rotulo}</Link>
                </Button>
            )}
        </div>
    )
}

function ListaCarregando() {
    return (
        <div className="flex flex-col gap-3" aria-busy="true">
            {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
        </div>
    )
}

/** Esqueleto do cabeçalho enquanto o perfil carrega. */
export function PerfilViewSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface" aria-busy="true">
            <Skeleton className="h-28 rounded-none sm:h-36" />
            <div className="px-5 pb-6 sm:px-8">
                <Skeleton className="-mt-12 size-24 rounded-full ring-4 ring-surface sm:-mt-14 sm:size-28" />
                <Skeleton className="mt-4 h-8 w-1/2" />
                <Skeleton className="mt-2 h-4 w-1/3" />
                <Skeleton className="mt-4 h-4 w-2/3" />
            </div>
            <Skeleton className="h-20 rounded-none" />
        </div>
    )
}
