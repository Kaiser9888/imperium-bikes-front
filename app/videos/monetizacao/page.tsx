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
import { monetizacaoService, SAQUE_MINIMO, type MonetizacaoStatus } from "@/lib/ads"
import { formatarPreco } from "@/lib/format"
import { cn } from "@/lib/utils"
import { mensagemDaApi } from "@/services/tournamentService"

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
          Ganhe 55% do valor de cada anúncio exibido antes dos seus vídeos. Sem anúncio exibido, não há ganho.
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

      {cumpriu && !dados.isEnabled && <Ativar stripeReady={dados.stripeReady} onAtivado={recarregar} />}

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

function ContaStripe() {
  return (
    <p className="type-body-small mt-1 text-muted-foreground">
      Os ganhos são pagos pelo Stripe, na mesma conta de recebimentos das suas vendas.{" "}
      <Link href="/carteira" className="font-semibold text-primary underline underline-offset-2">
        Conectar conta na Carteira
      </Link>
    </p>
  )
}

function Ativar({ stripeReady, onAtivado }: { stripeReady: boolean; onAtivado: () => Promise<void> }) {
  const [salvando, setSalvando] = useState(false)

  async function ativar() {
    setSalvando(true)
    try {
      await monetizacaoService.ativar()
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
      {stripeReady ? (
        <p className="type-body-small mt-1 text-muted-foreground">Os saques vão para a sua conta de recebimentos (Stripe).</p>
      ) : (
        <ContaStripe />
      )}
      <Button className="mt-4" onClick={ativar} loading={salvando} disabled={!stripeReady}>
        Ativar
      </Button>
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
      toast.success("Saque enviado para a sua conta Stripe. O depósito no banco segue o prazo do Stripe.")
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
            disabled={dados.hasPendingWithdrawal || !dados.stripeReady}
          />
        </div>
        <Button type="submit" loading={sacando} disabled={dados.hasPendingWithdrawal || !dados.stripeReady || disponivel < SAQUE_MINIMO}>
          Solicitar saque
        </Button>
      </form>
      <p className="type-caption mt-2 text-muted-foreground">
        {dados.hasPendingWithdrawal
          ? "Você já tem um saque em andamento. Aguarde alguns instantes."
          : disponivel < SAQUE_MINIMO
            ? `O saque libera a partir de ${formatarPreco(SAQUE_MINIMO)} disponíveis.`
            : "O valor vai para a sua conta Stripe e de lá para o seu banco."}
      </p>
      {!dados.stripeReady && <ContaStripe />}
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
    "Ao bater 1.000 inscritos e 100 mil visualizações, conecte sua conta de recebimentos (Stripe) na Carteira e ative a monetização.",
    "Antes dos seus vídeos passa um vídeo curto de uma marca, revisado e aprovado pela equipe.",
    "Cada anúncio que fica 5 segundos na tela conta como uma exibição. Repetições da mesma pessoa no mesmo dia não contam.",
    "Você recebe 55% do valor de cada exibição, somado ao seu saldo de hora em hora. Só as exibições de anúncios geram ganho.",
    "Com R$ 50,00 ou mais disponíveis, peça o saque: o valor vai pelo Stripe para a sua conta bancária.",
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
