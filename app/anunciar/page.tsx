"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { ImagePlus, Megaphone, Pause, Play } from "lucide-react"
import { toast } from "sonner"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeading } from "@/components/layout/page-heading"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/ui/status-badge"
import { adsService, STATUS_CAMPANHA, urlDaArte, type Campaign, type Pricing } from "@/lib/ads"
import api from "@/lib/api"
import { formatarPreco } from "@/lib/format"
import { mensagemDaApi } from "@/services/tournamentService"

const MAX_BYTES = 2 * 1024 * 1024

export default function AnunciarPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const [precos, setPrecos] = useState<Pricing | null>(null)
  const [campanhas, setCampanhas] = useState<Campaign[] | null>(null)

  const carregar = useCallback(async () => {
    try {
      setCampanhas(await adsService.minhas())
    } catch {
      setCampanhas([])
    }
  }, [])

  useEffect(() => {
    adsService.precos().then(setPrecos).catch(() => setPrecos(null))
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    if (isSignedIn) void carregar()
  }, [isSignedIn, carregar])

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-4 sm:px-6">
        <PageHeading
          title="Anunciar nos vídeos"
          description="Sua marca aparece antes dos vídeos da comunidade. Você paga só pelas exibições."
          back={{ href: "/", label: "Início" }}
        />

        {precos && (
          <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
            <Info rotulo="Por mil exibições" valor={formatarPreco(Number(precos.cpm))} />
            <Info rotulo="Orçamento mínimo" valor={formatarPreco(Number(precos.minBudget))} />
            <Info rotulo="Tempo na tela" valor={`${precos.minSeconds} segundos`} />
          </dl>
        )}

        {isLoaded && !isSignedIn ? (
          <EmptyState
            className="mt-10"
            icon={Megaphone}
            title="Entre para anunciar"
            description="Crie campanhas, pague pelo orçamento e acompanhe as exibições."
            action={
              <Button asChild>
                <Link href="/sign-in?redirect_url=%2Fanunciar">Entrar</Link>
              </Button>
            }
          />
        ) : (
          <>
            <NovaCampanha precos={precos} onCriada={carregar} />
            <MinhasCampanhas campanhas={campanhas} onMudou={carregar} />
          </>
        )}
      </main>
    </AppShell>
  )
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="bg-surface px-4 py-4 text-center">
      <dd className="type-h3 tabular-nums text-foreground">{valor}</dd>
      <dt className="type-caption mt-0.5 text-muted-foreground">{rotulo}</dt>
    </div>
  )
}

function NovaCampanha({ precos, onCriada }: { precos: Pricing | null; onCriada: () => Promise<void> }) {
  const [titulo, setTitulo] = useState("")
  const [link, setLink] = useState("https://")
  const [orcamento, setOrcamento] = useState("")
  const [arte, setArte] = useState<string | null>(null)
  const [enviandoArte, setEnviandoArte] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const arquivo = useRef<HTMLInputElement>(null)

  const valor = Number(orcamento.replace(/\./g, "").replace(",", "."))
  const exibicoes = precos && valor > 0 ? Math.floor((valor / Number(precos.cpm)) * 1000) : 0

  async function enviarArte(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (file.size > MAX_BYTES) {
      toast.error("A arte deve ter no máximo 2 MB.")
      return
    }
    setEnviandoArte(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const { data } = await api.post("/api/files/upload/image", form, { headers: { "Content-Type": undefined } })
      const url = data?.data?.publicUrl
      if (typeof url !== "string") throw new Error("upload sem URL")
      setArte(url)
    } catch (cause) {
      toast.error(mensagemDaApi(cause, "Não foi possível enviar a arte."))
    } finally {
      setEnviandoArte(false)
    }
  }

  async function criar(event: React.FormEvent) {
    event.preventDefault()
    if (!arte) {
      toast.error("Envie a arte do anúncio.")
      return
    }
    setSalvando(true)
    try {
      const campanha = await adsService.criar({ title: titulo.trim(), imageUrl: arte, clickUrl: link.trim(), budget: Math.round(valor * 100) / 100 })
      await onCriada()
      // Já leva para o pagamento; se fechar o checkout, dá para pagar depois pela lista
      window.location.assign(await adsService.pagar(campanha))
    } catch (cause) {
      toast.error(mensagemDaApi(cause, "Não foi possível criar a campanha."))
      setSalvando(false)
    }
  }

  return (
    <section aria-labelledby="nova-title" className="mt-8 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="nova-title" className="type-h3 text-foreground">
        Nova campanha
      </h2>
      <form onSubmit={criar} className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="titulo">Nome da campanha</Label>
            <Input id="titulo" required minLength={3} maxLength={120} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Pneus Speed Pro — lançamento" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link">Link de destino</Label>
            <Input id="link" type="url" required pattern="https://.*" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="orcamento">Orçamento (R$)</Label>
            <Input
              id="orcamento"
              inputMode="decimal"
              required
              value={orcamento}
              onChange={(e) => setOrcamento(e.target.value.replace(/[^\d.,]/g, ""))}
              placeholder={precos ? `Mínimo ${Number(precos.minBudget).toLocaleString("pt-BR")}` : ""}
            />
            {exibicoes > 0 && (
              <p className="type-caption text-muted-foreground">≈ {exibicoes.toLocaleString("pt-BR")} exibições</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="type-label text-foreground">Arte (16:9)</span>
          <button
            type="button"
            onClick={() => arquivo.current?.click()}
            className="grid aspect-video w-full cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-surface-muted text-muted-foreground transition-colors hover:border-primary/50"
            aria-label={arte ? "Trocar a arte" : "Enviar a arte"}
          >
            {arte ? (
              // eslint-disable-next-line @next/next/no-img-element -- arte enviada agora, domínio da API
              <img src={urlDaArte(arte)} alt="" className="size-full object-cover" />
            ) : enviandoArte ? (
              <span className="type-caption">Enviando...</span>
            ) : (
              <span className="flex flex-col items-center gap-1">
                <ImagePlus className="size-6" aria-hidden="true" />
                <span className="type-caption">1600×900, até 2 MB</span>
              </span>
            )}
          </button>
          <input ref={arquivo} type="file" accept="image/png,image/jpeg,image/webp" onChange={enviarArte} className="sr-only" tabIndex={-1} aria-hidden="true" />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" loading={salvando} disabled={enviandoArte}>
            Criar e pagar
          </Button>
          <p className="type-caption mt-2 text-muted-foreground">
            Depois do pagamento a arte passa por aprovação antes de ir ao ar. Você paga só pelo que for exibido até o orçamento acabar.
          </p>
        </div>
      </form>
    </section>
  )
}

function MinhasCampanhas({ campanhas, onMudou }: { campanhas: Campaign[] | null; onMudou: () => Promise<void> }) {
  const [ocupado, setOcupado] = useState<string | null>(null)

  async function acao(c: Campaign, fazer: () => Promise<unknown>) {
    setOcupado(c.id)
    try {
      await fazer()
      await onMudou()
    } catch (cause) {
      toast.error(mensagemDaApi(cause, "Não foi possível concluir."))
    } finally {
      setOcupado(null)
    }
  }

  async function pagar(c: Campaign) {
    setOcupado(c.id)
    try {
      window.location.assign(await adsService.pagar(c))
    } catch (cause) {
      toast.error(mensagemDaApi(cause, "Não foi possível abrir o pagamento."))
      setOcupado(null)
    }
  }

  return (
    <section aria-labelledby="minhas-title" className="mt-10">
      <h2 id="minhas-title" className="type-h2 border-b border-border pb-3 text-foreground">
        Minhas campanhas
      </h2>

      {campanhas === null ? (
        <div className="mt-4 flex flex-col gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : campanhas.length === 0 ? (
        <p className="type-body-small mt-4 text-muted-foreground">Você ainda não criou campanhas.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {campanhas.map((c) => {
            const status = STATUS_CAMPANHA[c.status]
            const gasto = Number(c.spent)
            const pct = Math.min(100, (gasto / Number(c.budget)) * 100)
            return (
              <li key={c.id} className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- arte do anunciante */}
                <img src={urlDaArte(c.imageUrl)} alt="" className="aspect-video w-full shrink-0 rounded-lg object-cover sm:w-36" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="type-label truncate text-foreground">{c.title}</p>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </div>
                  <p className="type-caption mt-1 text-muted-foreground">
                    {Number(c.impressions).toLocaleString("pt-BR")} exibições · {formatarPreco(gasto)} de {formatarPreco(Number(c.budget))}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  {c.status === "REJECTED" && c.rejectionReason && (
                    <p className="type-caption mt-2 text-destructive">Motivo: {c.rejectionReason}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {c.status === "PENDING_PAYMENT" && (
                    <Button size="sm" loading={ocupado === c.id} onClick={() => pagar(c)}>
                      Pagar
                    </Button>
                  )}
                  {c.status === "ACTIVE" && (
                    <Button size="sm" variant="outline" loading={ocupado === c.id} onClick={() => acao(c, () => adsService.pausar(c.id, true))}>
                      <Pause aria-hidden="true" />
                      Pausar
                    </Button>
                  )}
                  {c.status === "PAUSED" && (
                    <Button size="sm" variant="outline" loading={ocupado === c.id} onClick={() => acao(c, () => adsService.pausar(c.id, false))}>
                      <Play aria-hidden="true" />
                      Retomar
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
