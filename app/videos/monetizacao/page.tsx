"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { BadgeCheck, CircleDollarSign, Eye, Users } from "lucide-react"
import { toast } from "sonner"

import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import { ErrorState } from "@/components/ui/error-state"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { monetizacaoService, type MonetizacaoStatus } from "@/lib/ads"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"
import { mensagemDaApi } from "@/services/tournamentService"

const SAQUE_MINIMO = 50

type Estado = { status: "loading" } | { status: "error" } | { status: "ok"; dados: MonetizacaoStatus }

export default function MonetizacaoPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const [estado, setEstado] = useState<Estado>({ status: "loading" })

  const carregar = useCallback(async () => {
    try {
      setEstado({ status: "ok", dados: await monetizacaoService.status() })
    } catch {
      setEstado({ status: "error" })
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial
    if (isSignedIn) void carregar()
  }, [isSignedIn, carregar])

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 lg:pt-10">
        <BackButton href="/videos/meus-videos" label="Central de Vídeos" className="-ml-2.5" />
        <h1 className="type-h1 mt-2 text-foreground">Monetização</h1>
        <p className="type-body-small mt-1 text-muted-foreground">
          Ganhe 55% do valor de cada anúncio exibido antes dos seus vídeos.
        </p>

        <div className="mt-8 flex flex-col gap-6">
          {isLoaded && !isSignedIn && (
            <Button asChild className="self-start">
              <Link href="/sign-in?redirect_url=%2Fvideos%2Fmonetizacao">Entrar para ver sua monetização</Link>
            </Button>
          )}

          {isSignedIn && estado.status === "loading" && (
            <>
              <Skeleton className="h-44 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </>
          )}

          {estado.status === "error" && <ErrorState title="Não foi possível carregar a monetização" onRetry={carregar} />}

          {estado.status === "ok" && <Painel dados={estado.dados} recarregar={carregar} />}

          <ComoFunciona />
        </div>
      </main>
    </div>
  )
}

function Painel({ dados, recarregar }: { dados: MonetizacaoStatus; recarregar: () => Promise<void> }) {
  const requisitos = dados.nextTierRequirements
  const cumpriu = dados.isEligible

  return (
    <>
      <section aria-labelledby="requisitos-title" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="requisitos-title" className="type-h3 text-foreground">
              Requisitos
            </h2>
            <p className="type-body-small mt-1 text-muted-foreground">
              {cumpriu ? `Nível ${dados.currentTierLabel}: você já pode ganhar com anúncios.` : "Alcance os dois para liberar os anúncios nos seus vídeos."}
            </p>
          </div>
          {cumpriu && <BadgeCheck className="size-7 shrink-0 text-success" aria-label="Requisitos cumpridos" />}
        </div>

        {!cumpriu && requisitos && (
          <div className="mt-5 flex flex-col gap-5">
            <Requisito icon={Users} rotulo="Inscritos" atual={dados.stats.followers} meta={requisitos.followers} />
            <Requisito icon={Eye} rotulo="Visualizações" atual={dados.stats.totalViews} meta={requisitos.totalViews} />
          </div>
        )}
      </section>

      {cumpriu && !dados.isEnabled && <Ativar onAtivado={recarregar} />}

      {dados.isEnabled && <Ganhos dados={dados} onSaque={recarregar} />}
    </>
  )
}

function Requisito({ icon: Icon, rotulo, atual, meta }: { icon: typeof Users; rotulo: string; atual: number; meta: number }) {
  const pct = meta > 0 ? Math.min(100, (atual / meta) * 100) : 100
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="type-label flex items-center gap-2 text-foreground">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {rotulo}
        </span>
        <span className="type-body-small tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">{atual.toLocaleString("pt-BR")}</span> / {meta.toLocaleString("pt-BR")}
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-label={rotulo}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn("h-full rounded-full", pct >= 100 ? "bg-success" : "bg-primary")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Ativar({ onAtivado }: { onAtivado: () => Promise<void> }) {
  const [pix, setPix] = useState("")
  const [salvando, setSalvando] = useState(false)

  async function ativar(event: React.FormEvent) {
    event.preventDefault()
    setSalvando(true)
    try {
      await monetizacaoService.ativar(pix.trim())
      toast.success("Monetização ativada. Os anúncios começam a aparecer nos seus vídeos.")
      await onAtivado()
    } catch (cause) {
      toast.error(mensagemDaApi(cause, "Não foi possível ativar a monetização."))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section aria-labelledby="ativar-title" className="rounded-2xl border border-primary/40 bg-surface p-5 sm:p-6">
      <h2 id="ativar-title" className="type-h3 text-foreground">
        Ative a monetização
      </h2>
      <p className="type-body-small mt-1 text-muted-foreground">Informe a chave Pix que vai receber os saques.</p>
      <form onSubmit={ativar} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="pix">Chave Pix</Label>
          <Input id="pix" required maxLength={140} value={pix} onChange={(e) => setPix(e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" />
        </div>
        <Button type="submit" loading={salvando} disabled={!pix.trim()}>
          Ativar
        </Button>
      </form>
    </section>
  )
}

function Ganhos({ dados, onSaque }: { dados: MonetizacaoStatus; onSaque: () => Promise<void> }) {
  const e = dados.earnings
  const disponivel = Number(e.available ?? 0)
  const [valor, setValor] = useState("")
  const [sacando, setSacando] = useState(false)

  async function sacar(event: React.FormEvent) {
    event.preventDefault()
    const quantia = Number(valor.replace(/\./g, "").replace(",", "."))
    if (!Number.isFinite(quantia) || quantia < SAQUE_MINIMO) {
      toast.error(`O saque mínimo é ${formatarPreco(SAQUE_MINIMO)}.`)
      return
    }
    setSacando(true)
    try {
      await monetizacaoService.sacar(Math.round(quantia * 100) / 100)
      toast.success("Saque solicitado. Ele é conferido e pago via Pix.")
      setValor("")
      await onSaque()
    } catch (cause) {
      toast.error(mensagemDaApi(cause, "Não foi possível solicitar o saque."))
    } finally {
      setSacando(false)
    }
  }

  return (
    <section aria-labelledby="ganhos-title" className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 id="ganhos-title" className="type-h3 flex items-center gap-2 text-foreground">
        <CircleDollarSign className="size-5 text-primary" aria-hidden="true" />
        Seus ganhos
      </h2>

      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        <Numero rotulo="Disponível" valor={disponivel} destaque />
        <Numero rotulo="Este mês" valor={Number(e.thisMonth ?? 0)} />
        <Numero rotulo="Em saque" valor={Number(e.pending ?? 0)} />
        <Numero rotulo="Total ganho" valor={Number(e.total ?? 0)} />
      </dl>

      <form onSubmit={sacar} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="valor-saque">Valor do saque (R$)</Label>
          <Input
            id="valor-saque"
            inputMode="decimal"
            placeholder={`Mínimo ${SAQUE_MINIMO},00`}
            value={valor}
            onChange={(ev) => setValor(ev.target.value.replace(/[^\d.,]/g, ""))}
            disabled={dados.hasPendingWithdrawal}
          />
        </div>
        <Button type="submit" loading={sacando} disabled={dados.hasPendingWithdrawal || disponivel < SAQUE_MINIMO}>
          Solicitar saque
        </Button>
      </form>
      <p className="type-caption mt-2 text-muted-foreground">
        {dados.hasPendingWithdrawal
          ? "Você já tem um saque em análise. Espere ele ser pago para pedir outro."
          : disponivel < SAQUE_MINIMO
            ? `O saque libera a partir de ${formatarPreco(SAQUE_MINIMO)} disponíveis.`
            : "O saque é conferido e pago via Pix na chave cadastrada."}
      </p>
    </section>
  )
}

function Numero({ rotulo, valor, destaque }: { rotulo: string; valor: number; destaque?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 bg-surface px-4 py-4">
      <dt className="type-caption uppercase tracking-wider text-muted-foreground">{rotulo}</dt>
      <dd className={cn("type-h3 tabular-nums", destaque ? "text-success" : "text-foreground")}>{formatarPreco(valor)}</dd>
    </div>
  )
}

function ComoFunciona() {
  const passos = [
    "Ao bater 1.000 inscritos e 100 mil visualizações, ative a monetização com sua chave Pix.",
    "Antes dos seus vídeos aparece um anúncio de uma marca parceira.",
    "Cada anúncio que fica 5 segundos na tela conta como uma exibição. Repetições da mesma pessoa no mesmo dia não contam.",
    "Você recebe 55% do valor de cada exibição, somado ao seu saldo de hora em hora.",
    "Com R$ 50,00 ou mais disponíveis, peça o saque via Pix.",
  ]
  return (
    <section aria-labelledby="como-title">
      <h2 id="como-title" className="type-h3 border-b border-border pb-3 text-foreground">
        Como funciona
      </h2>
      <ol className="mt-4 flex flex-col gap-3">
        {passos.map((passo, i) => (
          <li key={i} className="type-body-small flex gap-3 text-muted-foreground">
            <span className="type-caption grid size-6 shrink-0 place-items-center rounded-full bg-surface-muted font-semibold text-foreground">
              {i + 1}
            </span>
            {passo}
          </li>
        ))}
      </ol>
    </section>
  )
}
