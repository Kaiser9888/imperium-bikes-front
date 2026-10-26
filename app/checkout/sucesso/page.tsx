"use client"

import { Suspense, useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Loader } from "@/components/ui/loader"
import { apiFetch } from "@/lib/apiClient"

type Status = "LOADING" | "PAGO" | "FAILED" | "PENDING"
type Consulta = { status: string; type?: string; referenceId?: string }

const TEXTOS: Record<Exclude<Status, "LOADING">, { titulo: string; descricao: string }> = {
  PAGO: { titulo: "Pagamento confirmado", descricao: "Recebemos seu pagamento." },
  PENDING: { titulo: "Pagamento em confirmação", descricao: "Ainda não recebemos a confirmação. Atualize esta página em alguns instantes." },
  FAILED: { titulo: "Não foi possível confirmar", descricao: "Não conseguimos confirmar este pagamento agora. Se o valor foi cobrado, a compra aparece em Pedidos em alguns minutos; se não aparecer, fale com o suporte." },
}

function SuccessContent() {
  const params = useSearchParams()
  const orderId = params.get("orderId")
  // O Checkout do Stripe volta com session_id e o id é de um pagamento; sem ele, é um pedido
  const path = orderId && `/api/${params.get("session_id") ? "payments" : "pedidos"}/${encodeURIComponent(orderId)}`
  const { getToken, isLoaded } = useAuth()
  const [status, setStatus] = useState<Status>(path ? "LOADING" : "FAILED")
  const [voltar, setVoltar] = useState({ href: "/", label: "Voltar ao início" })

  useEffect(() => {
    if (!isLoaded || !path) return
    let active = true
    let attempts = 0
    let timer: ReturnType<typeof setTimeout>
    const check = async () => {
      try {
        const result = await apiFetch<Consulta>(path, getToken)
        if (!active) return
        if (result.type === "TOURNAMENT_INSCRIPTION" && result.referenceId) {
          setVoltar({ href: `/torneios/${result.referenceId}`, label: "Voltar ao evento" })
        }
        if (result.type === "AD_CAMPAIGN") {
          setVoltar({ href: "/anunciar", label: "Ver minhas campanhas" })
        }
        const atual = result.status.toUpperCase()
        if (atual === "PAGO" || atual === "PAID") return setStatus("PAGO")
        if (["FAILED", "FALHOU", "CANCELADO", "CANCELED", "CANCELLED", "EXPIRED"].includes(atual)) return setStatus("FAILED")
        attempts += 1
        if (attempts >= 10) return setStatus("PENDING")
        timer = setTimeout(check, 2000)
      } catch {
        // Na volta do Stripe o login às vezes ainda não está pronto (401): tenta de novo antes de desistir
        if (!active) return
        attempts += 1
        if (attempts >= 6) return setStatus("FAILED")
        timer = setTimeout(check, 2000)
      }
    }
    void check()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [getToken, isLoaded, path])

  if (status === "LOADING") return <Loader fullPage label="Confirmando pagamento" />

  const Icon = status === "PAGO" ? CheckCircle2 : status === "PENDING" ? Clock : XCircle
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div className="max-w-md">
        <Icon className={`mx-auto size-12 ${status === "PAGO" ? "text-success" : status === "PENDING" ? "text-muted-foreground" : "text-destructive"}`} aria-hidden="true" />
        <h1 className="type-h1 mt-5 text-foreground">{TEXTOS[status].titulo}</h1>
        <p className="type-body-small mt-2 text-muted-foreground">{TEXTOS[status].descricao}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href={voltar.href}>{voltar.label}</Link>
        </Button>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <SuccessContent />
    </Suspense>
  )
}
